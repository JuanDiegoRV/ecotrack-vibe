"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { EmissionsTracker } from "../emissions/components/EmissionsTracker.tsx";
import { getSupabaseClient, supabase } from "../../lib/supabase/client.ts";
import { AuthPanel } from "./AuthPanel.tsx";

export function AuthenticatedEmissions() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(supabase));
  const [configurationError, setConfigurationError] = useState<string | null>(
    () => supabase ? null : "Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para activar el acceso.",
  );

  useEffect(() => {
    let isActive = true;

    if (!supabase) {
      return () => { isActive = false; };
    }

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!isActive) return;
      if (error) setConfigurationError(`No se pudo recuperar la sesión: ${error.message}`);
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isActive) return;
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isActive = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    try {
      await getSupabaseClient().auth.signOut();
    } catch (signOutError: unknown) {
      setConfigurationError(signOutError instanceof Error ? signOutError.message : "No se pudo cerrar la sesión.");
    }
  }

  if (isLoading) {
    return <div role="status" className="mx-auto max-w-[1050px] px-5 pb-12 text-sm text-[var(--muted)] sm:px-7">Comprobando sesión…</div>;
  }

  if (configurationError) {
    return <div role="alert" className="mx-auto max-w-[1050px] px-5 pb-12 text-sm text-red-700 sm:px-7">{configurationError}</div>;
  }

  if (!session) return <AuthPanel />;

  return (
    <>
      <div className="mx-auto flex max-w-[1050px] items-center justify-between gap-4 px-5 pb-6 sm:px-7">
        <p className="min-w-0 truncate text-sm text-[var(--muted)]">Sesión: {session.user.email ?? "usuario autenticado"}</p>
        <button type="button" onClick={() => void signOut()} className="shrink-0 rounded-xl border border-[var(--line)] px-4 py-2 text-sm font-bold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:ring-offset-2">Cerrar sesión</button>
      </div>
      <EmissionsTracker key={session.user.id} />
    </>
  );
}
