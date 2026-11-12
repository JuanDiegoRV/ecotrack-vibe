import assert from "node:assert/strict";
import test from "node:test";

const { EMISSION_CATEGORIES, validateCreateEmissionInput } = await import(
  "../app/features/emissions/types/emissions.types.ts"
);

test("acepta una medición válida", () => {
  const result = validateCreateEmissionInput({
    sourceName: "Flota corporativa",
    category: "transporte",
    co2AmountKg: 12.5,
  });

  assert.deepEqual(EMISSION_CATEGORIES, ["transporte", "energia", "residuos"]);
  assert.deepEqual(result, { valid: true, errors: {} });
});

test("rechaza un nombre de fuente vacío", () => {
  const result = validateCreateEmissionInput({
    sourceName: "   ",
    category: "energia",
    co2AmountKg: 3,
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.sourceName);
});

test("rechaza una categoría inexistente", () => {
  const result = validateCreateEmissionInput({
    sourceName: "Planta solar",
    category: "agricultura",
    co2AmountKg: 3,
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.category);
});

test("rechaza cantidades no numéricas, infinitas o no positivas", () => {
  for (const co2AmountKg of ["3", Number.NaN, Number.POSITIVE_INFINITY, 0, -1]) {
    const result = validateCreateEmissionInput({
      sourceName: "Centro de datos",
      category: "energia",
      co2AmountKg,
    });

    assert.equal(result.valid, false);
    assert.ok(result.errors.co2AmountKg);
  }
});
