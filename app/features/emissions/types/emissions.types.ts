/**
 * Categories supported by the emissions measurement module.
 */
export const EMISSION_CATEGORIES = ["transporte", "energia", "residuos"] as const;

export type EmissionCategory = (typeof EMISSION_CATEGORIES)[number];

/**
 * All CO₂ quantities in this module are expressed in kilograms of CO₂ (kg CO₂).
 * Dates are ISO 8601 strings so they can be serialized through APIs such as Supabase.
 */
export interface EmissionMeasurement {
  id: string;
  sourceName: string;
  category: EmissionCategory;
  co2AmountKg: number;
  measuredAt: string;
  createdAt: string;
}

export interface CreateEmissionInput {
  sourceName: string;
  category: EmissionCategory;
  co2AmountKg: number;
  measuredAt: string;
}

export type EmissionValidationField = "sourceName" | "category" | "co2AmountKg";

export interface EmissionValidationResult {
  valid: boolean;
  errors: Partial<Record<EmissionValidationField, string>>;
}

function isEmissionCategory(value: unknown): value is EmissionCategory {
  return typeof value === "string" && EMISSION_CATEGORIES.includes(value as EmissionCategory);
}

/**
 * Validates the user-controlled fields needed to create an emission measurement.
 * The function is pure and does not normalize or mutate the provided input.
 */
export function validateCreateEmissionInput(input: {
  sourceName: unknown;
  category: unknown;
  co2AmountKg: unknown;
}): EmissionValidationResult {
  const errors: Partial<Record<EmissionValidationField, string>> = {};

  if (typeof input.sourceName !== "string" || input.sourceName.trim().length === 0) {
    errors.sourceName = "El nombre de la fuente es obligatorio.";
  }

  if (!isEmissionCategory(input.category)) {
    errors.category = "La categoría de emisión no es válida.";
  }

  if (
    typeof input.co2AmountKg !== "number" ||
    !Number.isFinite(input.co2AmountKg) ||
    input.co2AmountKg <= 0
  ) {
    errors.co2AmountKg = "La cantidad de CO₂ debe ser un número finito mayor que cero.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
