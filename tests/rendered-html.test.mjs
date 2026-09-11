import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("renderiza la experiencia principal de EcoTrack", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<html[^>]+lang="es"/i);
  assert.match(html, /<title>EcoTrack \| Tu huella, en palabras simples<\/title>/i);
  assert.match(html, /¿Qué hiciste hoy\?/);
  assert.match(html, /Calcular impacto/);
  assert.match(html, /Estimaciones educativas/);
  assert.doesNotMatch(html, /Your site is taking shape/i);
});
