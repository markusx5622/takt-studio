# Takt Studio

Herramienta de simulación y análisis de líneas de producción industrializada. Diseñada para modelar estaciones, detectar cuellos de botella y comparar escenarios *what-if* sin tocar la línea real.

Desarrollada como proyecto de **Ingeniería de Organización Industrial** en la Universidad Europea de Valencia.

---

## Features

- **Simulador de líneas** — define estaciones con tiempo de ciclo, operarios y tasa de fallo
- **Cálculo en tiempo real** — takt time, throughput, lead time y eficiencia de balanceo se recalculan al instante
- **Detección de cuellos de botella** — identificación automática de la estación limitante con sugerencias de mejora
- **Diagrama de línea** — visualización del flujo Entrada → Estaciones → Salida con estado por estación
- **Gráfico de ciclos vs Takt Time** — barras de ciclo efectivo con línea de referencia del takt
- **Comparador what-if** — dos escenarios lado a lado con tabla de deltas (Δ B−A) coloreada
- **Análisis automático** — hasta 5 insights generados: producción, balance, fallos y capacidad teórica
- **Exportación PDF** — informe A4 con parámetros, KPIs, tabla de estaciones y análisis (jsPDF, sin html2canvas)
- **Persistencia local** — estado guardado en localStorage, sin cuenta ni servidor
- **Plantilla Monobath** — preset precargado de una línea de baños modulares (7 estaciones realistas)

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 + shadcn/ui |
| Estado | Zustand v5 con `persist` (localStorage) |
| Gráficos | Recharts v3 |
| PDF | jsPDF v4 (generación programática) |
| Tests | Vitest + Testing Library |
| Tipado | TypeScript estricto (sin `any`) |

---

## Instalación y desarrollo

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

### Otros scripts

```bash
npm run build        # Build de producción
npm run type-check   # Verificación de tipos sin compilar
npm run test         # Tests unitarios (Vitest)
npm run test:watch   # Tests en modo watch
```

---

## Estructura del proyecto

```
app/
  page.tsx           # Landing page
  simulador/         # Vista principal del simulador
  comparar/          # Vista comparativa de escenarios
components/
  ScenarioControls   # Parámetros del escenario (demanda, turnos, horas)
  StationEditor      # Tabla editable de estaciones (desktop) + tarjetas (móvil)
  KpiPanel           # 4 KPI cards: takt time, cuello, throughput, balanceo
  TaktChart          # Gráfico de barras ciclo vs takt time (Recharts)
  LineDiagram        # Diagrama de flujo de la línea
  InsightsPanel      # Análisis automático con insights priorizados
  ExportPdfButton    # Generación y descarga de informe PDF
lib/
  calculations.ts    # Funciones puras de cálculo IOE
  store.ts           # Zustand store con persist middleware
  presets.ts         # Plantilla Monobath (7 estaciones)
  insights.ts        # Generación de insights automáticos
types/
  index.ts           # Station, Scenario, KPIs, StationWithEffective, AppState
```

---

## Decisiones técnicas

### Por qué Zustand en lugar de Context API o Redux

Zustand ofrece una API mínima que permite selectores granulares sin rerenders innecesarios. Con Context API, cualquier cambio en el estado global provoca un rerender de todos los consumidores. Redux añade boilerplate innecesario para este tamaño de proyecto. El patrón clave: selectores directos `(state) => state.scenarios.find(...)` en lugar de getters `state.getActive()`, porque Zustand compara la referencia del valor devuelto, no del getter.

### Por qué cálculos analíticos en lugar de simulación discreta de eventos (DES)

Los modelos de Ingeniería de Organización Industrial para líneas de producción en flujo continuo son analíticamente tratables: el throughput viene dado por el cuello de botella, el takt time es una división simple y la eficiencia de balanceo es la ratio suma/máximo. Una simulación DES añadiría varianza estocástica y requeriría parámetros de distribución que el usuario no tiene. Para el objetivo de comparar escenarios what-if, el modelo analítico es más directo y reproducible.

### Por qué localStorage en lugar de base de datos

El objetivo es una herramienta de análisis rápido sin fricción de registro. Con `zustand/middleware/persist`, el estado se serializa a JSON en localStorage automáticamente. Las limitaciones (~5 MB) son irrelevantes para el volumen de datos de una línea de producción. Esta decisión implica que los datos no se sincronizan entre dispositivos, lo que es aceptable para el caso de uso.
