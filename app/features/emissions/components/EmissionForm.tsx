"use client";

import { useId, useState, type FormEvent } from "react";
import {
  EMISSION_CATEGORIES,
  type CreateEmissionInput,
  type EmissionCategory,
  type EmissionMeasurement,
  type EmissionValidationField,
  validateCreateEmissionInput,
} from "../types/emissions.types.ts";

const categoryOptions: ReadonlyArray<{ value: EmissionCategory; label: string }> = [
  { value: "transporte", label: "Transporte" },
  { value: "energia", label: "Energía" },
  { value: "residuos", label: "Residuos" },
];

type FieldErrors = Partial<Record<EmissionValidationField, string>>;

interface EmissionFormProps {
  onSubmit: (input: CreateEmissionInput) => Promise<EmissionMeasurement | null>;
  isSubmitting: boolean;
  submitError: string | null;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} role="alert" className="mt-1 text-sm text-red-700">
      {message}
    </p>
  );
}

export function EmissionForm({ onSubmit, isSubmitting, submitError }: EmissionFormProps) {
  const sourceNameId = useId();
  const categoryId = useId();
  const amountId = useId();
  const [sourceName, setSourceName] = useState("");
  const [category, setCategory] = useState<EmissionCategory | "">("");
  const [co2Amount, setCo2Amount] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = co2Amount.trim() === "" ? Number.NaN : Number(co2Amount);
    const validation = validateCreateEmissionInput({
      sourceName,
      category,
      co2AmountKg: parsedAmount,
    });

    setFieldErrors(validation.errors);
    if (!validation.valid || isSubmitting) return;

    const input: CreateEmissionInput = {
      sourceName,
      category: category as EmissionCategory,
      co2AmountKg: parsedAmount,
      measuredAt: new Date().toISOString(),
    };

    const createdMeasurement = await onSubmit(input);
    if (!createdMeasurement) return;

    setSourceName("");
    setCategory("");
    setCo2Amount("");
    setFieldErrors({});
  }

  const sourceNameErrorId = `${sourceNameId}-error`;
  const categoryErrorId = `${categoryId}-error`;
  const amountErrorId = `${amountId}-error`;

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_12px_30px_rgba(28,55,45,0.06)] sm:p-6">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Nueva medición</p>
        <h3 className="mt-2 text-xl font-bold tracking-tight text-[var(--ink)]">Registra una fuente</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Usa kg CO₂ para mantener todas las mediciones comparables.</p>
      </div>

      {submitError && (
        <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {submitError}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label htmlFor={sourceNameId} className="block text-sm font-bold text-[var(--ink)]">
            Nombre de la fuente
          </label>
          <input
            id={sourceNameId}
            name="sourceName"
            type="text"
            value={sourceName}
            onChange={(event) => setSourceName(event.target.value)}
            aria-invalid={Boolean(fieldErrors.sourceName)}
            aria-describedby={fieldErrors.sourceName ? sourceNameErrorId : undefined}
            className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-[var(--ink)] outline-none transition focus:border-[var(--ink)] focus:ring-2 focus:ring-[var(--green)]"
            placeholder="Ej. Flota corporativa"
          />
          <FieldError id={sourceNameErrorId} message={fieldErrors.sourceName} />
        </div>

        <div>
          <label htmlFor={categoryId} className="block text-sm font-bold text-[var(--ink)]">
            Categoría
          </label>
          <select
            id={categoryId}
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value as EmissionCategory | "")}
            aria-invalid={Boolean(fieldErrors.category)}
            aria-describedby={fieldErrors.category ? categoryErrorId : undefined}
            className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-[var(--ink)] outline-none transition focus:border-[var(--ink)] focus:ring-2 focus:ring-[var(--green)]"
          >
            <option value="">Selecciona una categoría</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError id={categoryErrorId} message={fieldErrors.category} />
        </div>

        <div>
          <label htmlFor={amountId} className="block text-sm font-bold text-[var(--ink)]">
            Cantidad de CO₂ (kg)
          </label>
          <input
            id={amountId}
            name="co2AmountKg"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={co2Amount}
            onChange={(event) => setCo2Amount(event.target.value)}
            aria-invalid={Boolean(fieldErrors.co2AmountKg)}
            aria-describedby={fieldErrors.co2AmountKg ? amountErrorId : undefined}
            className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-[var(--ink)] outline-none transition focus:border-[var(--ink)] focus:ring-2 focus:ring-[var(--green)]"
            placeholder="Ej. 12.5"
          />
          <FieldError id={amountErrorId} message={fieldErrors.co2AmountKg} />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 flex w-full items-center justify-between rounded-xl bg-[var(--ink)] px-4 py-3 font-bold text-white transition hover:bg-[#285344] focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        <span>{isSubmitting ? "Guardando…" : "Agregar medición"}</span>
        <span aria-hidden="true">→</span>
      </button>
      <p className="mt-3 text-xs leading-5 text-[var(--muted)]">Las categorías disponibles son {EMISSION_CATEGORIES.length} y la fecha se registra automáticamente.</p>
    </form>
  );
}
