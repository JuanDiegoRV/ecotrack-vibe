"use client";

import { EmissionCard } from "./EmissionCard.tsx";
import { EmissionForm } from "./EmissionForm.tsx";
import { useEmissions } from "../hooks/useEmissions.ts";

export function EmissionsTracker() {
  const { data, isLoading, isSubmitting, error, addEmission } = useEmissions();

  return (
    <section id="emisiones" aria-labelledby="emissions-title" className="mx-auto max-w-[1050px] px-5 pb-24 sm:px-7">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#75b91d]">Dashboard de emisiones</p>
          <h2 id="emissions-title" className="mt-2 text-3xl font-bold tracking-tight text-[var(--ink)] sm:text-4xl">
            Mediciones registradas
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Consulta y registra fuentes de impacto en kg CO₂ para complementar tu estimación diaria.
          </p>
        </div>
        <span className="w-fit rounded-full border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--muted)]">
          {data.length} {data.length === 1 ? "medición" : "mediciones"}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
        <EmissionForm onSubmit={addEmission} isSubmitting={isSubmitting} submitError={error} />

        <div aria-live="polite">
          {isLoading && (
            <div role="status" className="rounded-2xl border border-[var(--line)] bg-white p-8 text-center text-sm text-[var(--muted)]">
              Cargando mediciones…
            </div>
          )}

          {!isLoading && error && data.length === 0 && (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm leading-6 text-red-800">
              No pudimos cargar las mediciones. Puedes intentar registrar una nueva.
            </div>
          )}

          {!isLoading && !error && data.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white p-8 text-center">
              <p className="text-lg font-bold text-[var(--ink)]">Todavía no hay mediciones</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
                Registra la primera fuente para verla aparecer en este dashboard.
              </p>
            </div>
          )}

          {!isLoading && data.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.map((measurement) => (
                <EmissionCard key={measurement.id} measurement={measurement} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
