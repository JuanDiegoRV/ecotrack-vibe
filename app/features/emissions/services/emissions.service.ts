import { getSupabaseClient } from "../../../lib/supabase/client.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type CreateEmissionInput,
  type EmissionCategory,
  type EmissionMeasurement,
  validateCreateEmissionInput,
} from "../types/emissions.types.ts";

const EMISSIONS_TABLE = "emission_measurements";
const EMISSION_COLUMNS =
  "id, source_name, category, co2_amount, measured_at, created_at";

interface EmissionRow {
  id: string;
  source_name: string;
  category: EmissionCategory;
  co2_amount: number | string;
  measured_at: string;
  created_at: string;
}

function mapEmissionRow(row: EmissionRow): EmissionMeasurement {
  const co2AmountKg = typeof row.co2_amount === "number" ? row.co2_amount : Number(row.co2_amount);

  if (!Number.isFinite(co2AmountKg)) {
    throw new Error("Supabase devolvió una cantidad de CO₂ inválida.");
  }

  return {
    id: row.id,
    sourceName: row.source_name,
    category: row.category,
    co2AmountKg,
    measuredAt: row.measured_at,
    createdAt: row.created_at,
  };
}

async function requireAuthenticatedUserId(client: SupabaseClient): Promise<string> {
  const { data, error } = await client.auth.getUser();

  if (error) {
    throw new Error(`No se pudo verificar la sesión: ${error.message}`);
  }

  if (!data.user) {
    throw new Error("Debes iniciar sesión para gestionar mediciones.");
  }

  return data.user.id;
}

function normalizeMeasuredAt(measuredAt: string): string {
  const parsedDate = new Date(measuredAt);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("La fecha de medición no es válida.");
  }

  return parsedDate.toISOString();
}

export function createEmissionsService(client: SupabaseClient) {
  async function listEmissions(): Promise<EmissionMeasurement[]> {
    const userId = await requireAuthenticatedUserId(client);
    const { data, error } = await client
      .from(EMISSIONS_TABLE)
      .select(EMISSION_COLUMNS)
      .eq("user_id", userId)
      .order("measured_at", { ascending: false });

    if (error) {
      throw new Error(`No se pudieron cargar las mediciones: ${error.message}`);
    }

    return (data as EmissionRow[]).map(mapEmissionRow);
  }

  async function addEmission(input: CreateEmissionInput): Promise<EmissionMeasurement> {
    const validation = validateCreateEmissionInput(input);

    if (!validation.valid) {
      const validationMessage = Object.values(validation.errors)
        .filter((message): message is string => typeof message === "string")
        .join(" ");
      throw new Error(validationMessage || "La medición no es válida.");
    }

    const userId = await requireAuthenticatedUserId(client);
    const { data, error } = await client
      .from(EMISSIONS_TABLE)
      .insert({
        user_id: userId,
        source_name: input.sourceName.trim(),
        category: input.category,
        co2_amount: input.co2AmountKg,
        measured_at: normalizeMeasuredAt(input.measuredAt),
      })
      .select(EMISSION_COLUMNS)
      .single();

    if (error) {
      throw new Error(`No se pudo guardar la medición: ${error.message}`);
    }

    return mapEmissionRow(data as EmissionRow);
  }

  return { listEmissions, addEmission };
}

export async function listEmissions(): Promise<EmissionMeasurement[]> {
  return createEmissionsService(getSupabaseClient()).listEmissions();
}

export async function addEmission(input: CreateEmissionInput): Promise<EmissionMeasurement> {
  return createEmissionsService(getSupabaseClient()).addEmission(input);
}

export function getEmissionErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = error.message;
    if (typeof message === "string") return message;
  }

  return "No fue posible completar la operación de mediciones.";
}
