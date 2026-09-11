# EcoTrack

MVP web que estima la huella de carbono diaria desde una descripción en lenguaje natural.

## Incluye

- Transporte, kilómetros, alimentación y consumo eléctrico.
- Total estimado de CO₂e, desglose y meta diaria orientativa.
- Historial de los tres cálculos recientes durante la sesión.
- Funcionamiento local sin API keys.

## Uso local

Requiere Node.js 22 o superior.

```bash
npm install
npm run dev
```

## Replit

Importa el repositorio desde GitHub. Usa `npm install` para instalar y `npm run dev -- --host 0.0.0.0` para desarrollar. Para producción usa `npm run build && npm run start` desde Deployments.

## Entregables

- Reglas del agente: `AGENTS.md` y compatibilidad con Cursor en `.cursorrules`.
- Reflexión del proceso: `VIBE_REPORT.md` (menos de 500 palabras).
- URL del repositorio o Repl: se obtiene al subir o importar este proyecto.
- Captura de Cursor y Replit: debe tomarse cuando el Repl esté ejecutándose.

La ejecución del MVP en Replit está documentada en
[`evidencia-ecotrack-replit.png`](./evidencia-ecotrack-replit.png).

Los resultados usan factores promedio y no sustituyen una auditoría ambiental.
