import assert from "node:assert/strict";
import test from "node:test";

const { createEmissionsService } = await import(
  "../app/features/emissions/services/emissions.service.ts"
);

function createFakeClient(store, userId) {
  return {
    auth: {
      async getUser() {
        return { data: { user: { id: userId } }, error: null };
      },
    },
    from(table) {
      assert.equal(table, "emission_measurements");

      return {
        select() {
          return {
            eq(_column, ownerId) {
              return {
                async order() {
                  return {
                    data: store.filter((row) => row.user_id === ownerId),
                    error: null,
                  };
                },
              };
            },
          };
        },
        insert(values) {
          return {
            select() {
              return {
                async single() {
                  const row = {
                    id: `id-${store.length + 1}`,
                    created_at: "2026-11-12T12:00:00.000Z",
                    ...values,
                  };
                  store.push(row);
                  return { data: row, error: null };
                },
              };
            },
          };
        },
      };
    },
  };
}

function validInput(sourceName = "Flota corporativa") {
  return {
    sourceName,
    category: "transporte",
    co2AmountKg: 12.5,
    measuredAt: "2026-11-12T12:00:00.000Z",
  };
}

test("agrega y lista mediciones usando el usuario autenticado", async () => {
  const store = [];
  const service = createEmissionsService(createFakeClient(store, "user-a"));

  const created = await service.addEmission(validInput());
  const listed = await service.listEmissions();

  assert.equal(created.sourceName, "Flota corporativa");
  assert.equal(created.co2AmountKg, 12.5);
  assert.equal(listed.length, 1);
  assert.equal(store[0].user_id, "user-a");
});

test("aísla la lectura entre dos usuarios", async () => {
  const store = [];
  const userAService = createEmissionsService(createFakeClient(store, "user-a"));
  const userBService = createEmissionsService(createFakeClient(store, "user-b"));

  await userAService.addEmission(validInput("Medición privada A"));

  assert.equal((await userAService.listEmissions()).length, 1);
  assert.equal((await userBService.listEmissions()).length, 0);
});

test("rechaza entradas inválidas antes de insertar", async () => {
  const store = [];
  const service = createEmissionsService(createFakeClient(store, "user-a"));

  await assert.rejects(
    service.addEmission({ ...validInput(), sourceName: "", co2AmountKg: 0 }),
    /obligatorio.*mayor que cero/i,
  );
  assert.equal(store.length, 0);
});

test("propaga errores de lectura del backend", async () => {
  const client = createFakeClient([], "user-a");
  client.from = () => ({
    select: () => ({
      eq: () => ({
        order: async () => ({ data: null, error: { message: "RLS denied" } }),
      }),
    }),
  });

  await assert.rejects(
    createEmissionsService(client).listEmissions(),
    /RLS denied/,
  );
});
