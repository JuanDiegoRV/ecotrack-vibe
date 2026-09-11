# Vibe Report — EcoTrack

## Configuración del agente

Reemplacé la configuración específica de Cursor por `AGENTS.md`, un archivo útil para distintos agentes. Allí definí el rol, reglas técnicas y criterios del producto: TypeScript, componentes claros, interfaz accesible en español, pocas dependencias y validación mediante compilación. También quedó explícito que los resultados de CO₂ son aproximados y educativos.

## Dificultades al delegar

El reto principal fue traducir una intención amplia —“calcular la huella usando lenguaje natural”— en reglas verificables. Una IA produce una interfaz rápido, pero necesita límites: qué actividades reconocer, qué factores usar y cómo reaccionar si faltan datos. También quise evitar una API paga. Para este MVP elegí un analizador local y transparente que reconoce transporte, distancia, alimentación y electricidad, y presenta el cálculo desglosado.

Otra dificultad fue equilibrar velocidad y calidad. Delegar no significa aceptar la primera salida: pedí una experiencia responsive, estados vacíos, mensajes comprensibles y una compilación sin errores. La orquestación funciona mejor cuando cada instrucción incluye un resultado observable.

## De escribir código a orquestar una visión

Se siente como pasar de construir cada pieza a dirigir el producto. La atención se mueve de la sintaxis hacia las decisiones: qué problema resolvemos, qué debe sentir el usuario y cómo comprobamos que sirve. La IA acelera la ejecución, pero mantener coherencia, cuestionar supuestos y definir la calidad sigue siendo responsabilidad humana. El “vibe” no reemplaza el criterio técnico; lo convierte en una conversación iterativa con objetivos concretos.
