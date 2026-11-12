-- Manual/local RLS verification.
-- Run with two authenticated users created in the local Supabase Auth UI.
-- Supply the UUIDs through psql variables: user_a_id and user_b_id.
-- This script is intentionally not executed by the application build.

begin;

set local role authenticated;
select set_config('request.jwt.claim.sub', :'user_a_id', true);

insert into public.emission_measurements (
  user_id, source_name, category, co2_amount, measured_at
)
values (
  :'user_a_id'::uuid, 'Usuario A', 'transporte', 4.25, now()
);

create or replace function pg_temp.assert_cannot_insert_for_other_user(
  target_user_id uuid
)
returns void
language plpgsql
as $$
begin
  begin
    insert into public.emission_measurements (
      user_id, source_name, category, co2_amount, measured_at
    )
    values (
      target_user_id, 'Suplantación', 'energia', 1.00, now()
    );
    raise exception 'RLS permitió insertar una medición de otro usuario';
  exception
    when insufficient_privilege then null;
  end;
end
$$;

select pg_temp.assert_cannot_insert_for_other_user(:'user_b_id'::uuid);

select count(*) as user_a_visible_rows
from public.emission_measurements;

select set_config('request.jwt.claim.sub', :'user_b_id', true);

select count(*) as user_b_visible_rows
from public.emission_measurements;

rollback;
