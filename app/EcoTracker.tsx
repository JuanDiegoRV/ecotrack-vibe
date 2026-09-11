"use client";

import { FormEvent, useMemo, useState } from "react";

type Impact = { label: string; detail: string; kilograms: number; icon: string };
type Estimate = { total: number; impacts: Impact[]; message: string };

const examples = ["Hoy comí carne y viajé 20 km en bus", "Manejé 12 km en carro y cené pollo", "Fui 8 km en bicicleta y comí vegetariano"];
const transport = [
  { pattern: /(?:carro|auto|coche|automóvil)/i, label: "Carro", factor: .192 },
  { pattern: /(?:bus|autobús|transmilenio)/i, label: "Bus", factor: .105 },
  { pattern: /(?:moto|motocicleta)/i, label: "Moto", factor: .103 },
  { pattern: /(?:metro|tren)/i, label: "Metro o tren", factor: .035 },
  { pattern: /(?:avión|avion|vuelo)/i, label: "Avión", factor: .255 },
];
const foods = [
  { pattern: /(?:carne de res|res|hamburguesa|bistec)/i, label: "Comida con res", amount: 6.5 },
  { pattern: /(?:carne|cerdo)/i, label: "Comida con carne", amount: 2.5 },
  { pattern: /(?:pollo|gallina)/i, label: "Comida con pollo", amount: 1.8 },
  { pattern: /(?:vegetariano|vegetariana|verduras|ensalada)/i, label: "Comida vegetariana", amount: .5 },
];

function estimateCarbon(text: string): Estimate {
  const impacts: Impact[] = [];
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*(?:km|kilómetros|kilometros)/i);
  const distance = match ? Number(match[1].replace(",", ".")) : 0;
  const mode = transport.find((item) => item.pattern.test(text));
  if (mode) {
    const km = distance || 10;
    impacts.push({ label: mode.label, detail: `${km} km × ${mode.factor} kg`, kilograms: km * mode.factor, icon: "↗" });
  }
  if (/(?:bicicleta|bici|caminé|camine|caminando|a pie)/i.test(text)) impacts.push({ label: "Movilidad activa", detail: `${distance || 0} km sin emisiones directas`, kilograms: 0, icon: "✓" });
  const food = foods.find((item) => item.pattern.test(text));
  if (food) impacts.push({ label: food.label, detail: "1 porción estimada", kilograms: food.amount, icon: "+" });
  const energy = text.match(/(\d+(?:[.,]\d+)?)\s*kwh/i);
  if (energy) {
    const kwh = Number(energy[1].replace(",", "."));
    impacts.push({ label: "Electricidad", detail: `${kwh} kWh × 0.126 kg`, kilograms: kwh * .126, icon: "+" });
  }
  const total = impacts.reduce((sum, item) => sum + item.kilograms, 0);
  const message = !impacts.length ? "No pude identificar una actividad. Incluye un alimento, transporte y distancia." : total < 3 ? "¡Buen día para el planeta! Tu impacto estimado es bajo." : total < 7 ? "Vas cerca de una meta diaria sostenible." : "Hay espacio para reducir: prueba transporte público o una comida vegetal.";
  return { total, impacts, message };
}

export function EcoTracker() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<Estimate | null>(null);
  const [history, setHistory] = useState<Array<{ text: string; total: number }>>([]);
  const goal = 5;
  const percentage = useMemo(() => Math.min(((result?.total ?? 0) / goal) * 100, 100), [result]);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    const next = estimateCarbon(text);
    setResult(next);
    if (next.impacts.length) setHistory((current) => [{ text: text.trim(), total: next.total }, ...current].slice(0, 3));
  }
  return <main>
    <nav className="nav" aria-label="Navegación principal"><a className="brand" href="#top"><span>e</span> ecotrack</a><div className="nav-links"><a href="#calcular">Calcular</a><a href="#como-funciona">Cómo funciona</a></div><span className="status"><i /> Estimador activo</span></nav>
    <section className="hero" id="top"><div className="eyebrow"><span>●</span> Pequeñas decisiones. Un impacto real.</div><h1>Entiende tu huella.<br/><em>Cambia el mañana.</em></h1><p>Cuéntanos cómo fue tu día, con tus propias palabras. EcoTrack convierte tus actividades en una estimación clara de CO₂.</p></section>
    <section className="calculator" id="calcular">
      <form onSubmit={submit}><label htmlFor="activity">¿Qué hiciste hoy?</label><div className="input-wrap"><textarea id="activity" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ej: Hoy comí carne y viajé 20 km en bus" rows={3}/><button type="submit" disabled={!text.trim()}>Calcular impacto <span>→</span></button></div><div className="examples"><span>Prueba con:</span>{examples.map((example, i) => <button type="button" key={example} onClick={() => setText(example)}>0{i + 1}</button>)}</div></form>
      <div className="result" aria-live="polite">{!result ? <div className="empty-result"><div className="rings"><span>CO₂</span></div><p>Tu estimación aparecerá aquí</p></div> : !result.impacts.length ? <div className="empty-result"><strong>No encontramos datos suficientes</strong><p>{result.message}</p></div> : <><div className="result-heading"><span>Impacto estimado</span><small>HOY</small></div><div className="number"><strong>{result.total.toFixed(1)}</strong><div><b>kg</b><span>CO₂e</span></div></div><div className="goal"><div><span>Meta diaria</span><b>{result.total.toFixed(1)} / {goal} kg</b></div><div className="track"><i style={{width:`${percentage}%`}}/></div></div><div className="breakdown">{result.impacts.map((impact) => <div key={impact.label}><span className="impact-icon">{impact.icon}</span><p><b>{impact.label}</b><small>{impact.detail}</small></p><strong>{impact.kilograms.toFixed(1)} kg</strong></div>)}</div><p className="tip">{result.message}</p></>}</div>
    </section>
    <section className="steps" id="como-funciona"><p className="section-label">ASÍ DE SIMPLE</p><div className="steps-grid"><article><span>01</span><h2>Escribe natural</h2><p>Describe tu día como se lo contarías a alguien.</p></article><article><span>02</span><h2>Estimamos</h2><p>Identificamos transporte, comida y energía para aplicar factores promedio.</p></article><article><span>03</span><h2>Actúa mejor</h2><p>Descubre dónde una decisión pequeña puede ayudar.</p></article></div></section>
    {history.length > 0 && <section className="history"><p className="section-label">ÚLTIMOS CÁLCULOS</p>{history.map((entry, i) => <div key={`${entry.text}-${i}`}><span>{entry.text}</span><b>{entry.total.toFixed(1)} kg CO₂e</b></div>)}</section>}
    <footer><a className="brand" href="#top"><span>e</span> ecotrack</a><p>Estimaciones educativas basadas en factores promedio. No sustituyen una auditoría ambiental.</p><small>Hecho con intención · 2026</small></footer>
  </main>;
}
