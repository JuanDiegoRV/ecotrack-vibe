create extension if not exists "pgcrypto";

do $$
begin
  create type public.emission_category as enum ('transporte', 'energia', 'residuos');
exception
  when duplicate_object then null;
end
$$;

create table public.emission_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_name text not null,
  category public.emission_category not null,
  co2_amount numeric(12, 3) not null,
  measured_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint emission_source_name_valid
    check (char_length(btrim(source_name)) between 1 and 120),
  constraint emission_co2_amount_positive
    check (co2_amount > 0)
);

create index emission_measurements_user_measured_at_idx
  on public.emission_measurements (user_id, measured_at desc);

alter table public.emission_measurements enable row level security;

revoke all on public.emission_measurements from anon, authenticated;
grant select, insert on public.emission_measurements to authenticated;

create policy emission_measurements_select_own
  on public.emission_measurements
  for select
  to authenticated
  using (user_id = auth.uid());

create policy emission_measurements_insert_own
  on public.emission_measurements
  for insert
  to authenticated
  with check (user_id = auth.uid());
