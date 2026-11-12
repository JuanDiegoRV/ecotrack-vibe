"use client";

import { useState, type FormEvent } from "react";
import { getSupabaseClient } from "../../lib/supabase/client.ts";

type AuthMode = "login" | "register";

export function AuthPanel() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const client = getSupabaseClient();
      const result =
        mode === "login"
          ? await client.auth.signInWithPassword({ email: email.trim(), password })
          : await client.auth.signUp({ email: email.trim(), password });

      if (result.error) throw new Error(result.error.message);

      if (mode === "register" && !result.data.session) {
        setMessage("Registro creado. Revisa tu correo para confirmar la cuenta antes de iniciar sesión.");
      } else {
        setMessage("Sesión iniciada correctamente.");
      }

      setPassword("");
    } catch (authError: unknown) {
      setError(authError instanceof Error ? authError.message : "No se pudo completar la autenticación.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="auth-title" className="mx-auto max-w-[1050px] px-5 pb-12 sm:px-7">
      <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_12px_30px_rgba(28,55,45,0.06)] sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#75b91d]">Acceso privado</p>
        <h2 id="auth-title" className="mt-2 text-2xl font-bold tracking-tight text-[var(--ink)]">
          {mode === "login" ? "Inicia sesión para ver tus mediciones" : "Crea tu cuenta de EcoTrack"}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Las mediciones quedan aisladas por usuario autenticado.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2 sm:items-end">
          <div>
            <label htmlFor="auth-email" className="block text-sm font-bold text-[var(--ink)]">Correo electrónico</label>
            <input id="auth-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-[var(--ink)] outline-none focus:border-[var(--ink)] focus:ring-2 focus:ring-[var(--green)]" />
          </div>
          <div>
            <label htmlFor="auth-password" className="block text-sm font-bold text-[var(--ink)]">Contraseña</label>
            <input id="auth-password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-[var(--ink)] outline-none focus:border-[var(--ink)] focus:ring-2 focus:ring-[var(--green)]" />
          </div>
          <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="submit" disabled={isSubmitting} className="rounded-xl bg-[var(--ink)] px-5 py-3 font-bold text-white transition hover:bg-[#285344] focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
              {isSubmitting ? "Procesando…" : mode === "login" ? "Iniciar sesión" : "Registrarme"}
            </button>
            <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); setMessage(null); }} className="rounded-xl border border-[var(--line)] px-5 py-3 text-sm font-bold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:ring-offset-2">
              {mode === "login" ? "Crear una cuenta" : "Ya tengo una cuenta"}
            </button>
          </div>
        </form>

        {message && <p role="status" className="mt-4 text-sm text-[var(--ink)]">{message}</p>}
        {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      </div>
    </section>
  );
}
