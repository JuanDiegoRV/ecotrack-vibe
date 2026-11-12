import type { EmissionMeasurement } from "../types/emissions.types.ts";

const categoryLabels: Record<EmissionMeasurement["category"], string> = {
  transporte: "Transporte",
  energia: "Energía",
  residuos: "Residuos",
};

const amountFormatter = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatMeasurementDate(date: string): string {
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime()) ? "Fecha no disponible" : dateFormatter.format(parsedDate);
}

interface EmissionCardProps {
  measurement: EmissionMeasurement;
}

export function EmissionCard({ measurement }: EmissionCardProps) {
  const titleId = `emission-${measurement.id}`;

  return (
    <article
      aria-labelledby={titleId}
      className="flex h-full flex-col justify-between rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_12px_30px_rgba(28,55,45,0.06)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
            Fuente de emisión
          </p>
          <h3 id={titleId} className="break-words text-lg font-bold tracking-tight text-[var(--ink)]">
            {measurement.sourceName}
          </h3>
        </div>
        <span className="shrink-0 rounded-full bg-[#e9f7c9] px-3 py-1 text-xs font-bold text-[var(--ink)]">
          {categoryLabels[measurement.category]}
        </span>
      </div>

      <dl className="mt-7 grid grid-cols-2 gap-4 border-t border-[var(--line)] pt-4">
        <div>
          <dt className="text-xs text-[var(--muted)]">Cantidad</dt>
          <dd className="mt-1 text-xl font-bold tracking-tight text-[var(--ink)]">
            {amountFormatter.format(measurement.co2AmountKg)}
            <span className="ml-1 text-sm font-medium text-[var(--muted)]">kg CO₂</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--muted)]">Medición</dt>
          <dd className="mt-1 text-sm font-medium text-[var(--ink)]">
            <time dateTime={measurement.measuredAt}>{formatMeasurementDate(measurement.measuredAt)}</time>
          </dd>
        </div>
      </dl>
    </article>
  );
}
