<p align="center">
  <img src="public/favicon.svg" alt="Takt Studio Favicon" width="96" height="96" />
</p>

<h1 align="center">Takt Studio</h1>

<p align="center">
  <strong>Simulador y Analizador de Líneas de Producción Industrializada</strong>
</p>

<p align="center">
  Plataforma web de ingeniería de organización industrial para el modelado de estaciones, optimización de tiempos de ciclo, detección automática de cuellos de botella, análisis económico de impacto y evaluación de escenarios <em>What-If</em>.
</p>

---

## 🎓 Contexto Académico

**Takt Studio** ha sido concebido y desarrollado como herramienta de simulación analítica para la disciplina de **Ingeniería de Organización Industrial** en la **Universidad Europea de Valencia**.

Su objetivo fundamental es democratizar el análisis de balanceo de líneas en procesos de producción industrializada (tales como la construcción off-site y la fabricación modular), permitiendo a ingenieros y directores de planta tomar decisiones fundamentadas sobre capacidad, asignación de recursos y costes de no-calidad sin interrumpir el flujo productivo real.

---

## 🚀 Características Principales

### ⚡ Simulador de Líneas en Tiempo Real
- **Modelado Flexible de Estaciones**: Define estaciones con tiempo de ciclo base (minutos), operarios asignados y tasa de fallo o reproceso (0-100%).
- **Cálculo Reactivo de Tiempos Efectivos**: Ajuste automático del tiempo de ciclo en función del número de operarios ($T_{base} / \text{ops}$) y penalización por scrap/reproceso ($1 / (1 - p)$).
- **Preset Industrial Precargado ("Monobath")**: Plantilla real preconfigurada de una línea de fabricación de módulos de baño industrializados (7 estaciones: desde estructura base hasta limpieza final).

### 📊 Panel de KPIs Industriales y Balanceo
- **Takt Time ($T_t$)**: Ritmo objetivo de producción calculado a partir del tiempo disponible y la demanda requerida.
- **Identificación del Cuello de Botella**: Detección automática y resaltado de la estación limitante que condiciona el ritmo de la línea.
- **Throughput Diario**: Cálculo determinista del número de unidades reales finalizadas por jornada.
- **Lead Time Total**: Suma acumulada de los tiempos de ciclo efectivos de todo el recorrido de la línea.
- **Eficiencia de Balanceo de Línea ($E_b$)**: Ratio de utilización de capacidad instalada respecto al tiempo del cuello de botella.

### 💰 Análisis Económico & Impacto Financiero (Cost Impact)
- **Costes Laborales Directos**: Cálculo de coste de mano de obra por hora, día y mes según plantilla total de operarios.
- **Coste de No-Calidad (Reproceso)**: Evaluación del impacto monetario derivado de la tasa de fallos de cada estación.
- **Margen de Contribución & Opportunity Gap**: Valoración de ingresos diarios por unidades entregadas y cuantificación del margen perdido debido a déficit de capacidad frente a la demanda.
- **Beneficio Operativo Estimado (Profit Proxy)**: Cálculo de margen neto diario/mensual deduciendo costes de personal, costes fijos por turno y reproceso.

### 🔬 Laboratorio de Sensibilidad (Sensitivity Lab)
- **Análisis Paramétrico Multidimensional**: Simulación en vivo para evaluar cómo varía la capacidad y la eficiencia al modificar operarios, turnos por día, horas efectivas o tasas de defecto.
- **Elasticidad de Línea**: Gráficos dinámicos e indicadores de sensibilidad para identificar palancas de mejora de alto impacto con mínima inversión.

### 💡 Motor de Recomendaciones y Plan de Mejora Automatizado
- **Diagnóstico Algorítmico**: Priorización de acciones de optimización (**Alta**, **Media**, **Baja**) basadas en las restricciones operativas detectadas.
- **Impacto Proyectado & Payback**: Cálculo en tiempo real del incremento de throughput, ganancia en eficiencia de balanceo y días de amortización (Payback) de la inversión one-off requerida.
- **Aplicación con Un Clic**: Incorporación instantánea de cualquier recomendación seleccionada al escenario activo.

### ⚖️ Comparador de Escenarios *What-If*
- **Matriz Comparativa Lado a Lado**: Visualización simultánea de dos configuraciones (Escenario A vs. Escenario B).
- **Deltas Operativos y Financieros ($\Delta B - A$)**: Resaltado con código de colores (verde/rojo) del impacto diferencial en throughput, lead time, costes y margen.
- **Análisis Cualitativo de Capacidad**: Evaluación comparativa frente al cumplimiento de la demanda diaria.

### 📸 Historial de Snapshots & Gestión de Estado
- **Puntos de Restauración Inmutables**: Guardado de snapshots del estado de la línea para realizar auditorías, trazabilidad y control de versiones.
- **Marcado de Baseline**: Posibilidad de fijar un escenario base de referencia para comparaciones futuras.

### 📤 Importación y Exportación JSON
- **Portabilidad Total**: Exportación de escenarios individuales o snapshots completos a JSON.
- **Validación de Esquema**: Motor de importación con validación estricta de estructura y compatibilidad de versiones.

### 📄 Generador de Informes Ejecutivos en PDF
- **Generación Vectorial nativa (jsPDF)**: Renderizado limpio en formato A4 sin depender de captura de pantalla (*html2canvas*).
- **Estructura Profesional**: Portada de informe, parámetros de demanda, tabla detallada de estaciones, KPIs de balanceo, análisis de costes y resumen del plan de mejora.

---

## 🧮 Fundamentos Teóricos y Formulación Matemática

El motor de cálculo de **Takt Studio** implementa las fórmulas estándar de la **Ingeniería de Organización Industrial** para líneas de producción en flujo continuo:

### 1. Tiempo Disponible ($T_{disp}$)
$$T_{disp} = \text{horasTurno} \times 60 \times \text{turnosDía}$$

### 2. Takt Time ($T_t$)
$$T_t = \frac{T_{disp}}{\text{demandaDía}}$$

### 3. Tiempo de Ciclo Efectivo ($T_{ef, i}$)
Para cada estación $i$, ajustado por operarios asignados ($O_i$) y tasa de fallo ($p_i$):
$$T_{ef, i} = \left( \frac{T_{base, i}}{O_i} \right) \times \left( \frac{1}{1 - p_i} \right)$$

### 4. Tiempo del Cuello de Botella ($T_{bottleneck}$)
$$T_{bottleneck} = \max_{i} \left( T_{ef, i} \right)$$

### 5. Throughput Real Diario ($TP$)
$$TP = \left\lfloor \frac{T_{disp}}{T_{bottleneck}} \right\rfloor$$

### 6. Lead Time Total ($LT$)
$$LT = \sum_{i=1}^{N} T_{ef, i}$$

### 7. Eficiencia de Balanceo de Línea ($E_b$)
$$E_b = \frac{\sum_{i=1}^{N} T_{ef, i}}{N \times T_{bottleneck}}$$

---

## 🛠️ Stack Técnico

| Capa | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) | Renderizado optimizado y arquitectura de componentes de React. |
| **Interfaz & UI** | React 19 + [Tailwind CSS v4](https://tailwindcss.com/) | Diseño moderno, responsivo y adaptado a estándares UI/UX. |
| **Componentes UI** | [shadcn/ui](https://ui.shadcn.com/) + Lucide Icons | Sistema de diseño accesible y modular. |
| **Gestión de Estado** | [Zustand v5](https://zustand-demo.pmnd.rs/) + `persist` | Estado global reactivo con almacenamiento automático en `localStorage`. |
| **Visualización de Datos** | [Recharts v3](https://recharts.org/) | Gráficos interactivos de barras de ciclo vs Takt Time. |
| **Generación de Documentos** | [jsPDF v4](https://github.com/parallax/jsPDF) | Generación vectorial de informes ejecutivos en PDF. |
| **Testing & Calidad** | [Vitest](https://vitest.dev/) | Suite de pruebas unitarias puras y de alta velocidad. |
| **Tipado** | TypeScript Estricto | Tipado completo sin uso de `any`. |

---

## 🧠 Decisiones Técnicas de Arquitectura

### 1. ¿Por qué Zustand en lugar de Context API o Redux?
Zustand ofrece una API ligera basada en suscripciones que permite selectores granulares `(state) => state.scenarios.find(...)`. Esto evita re-renders innecesarios en la UI a diferencia de la Context API de React, la cual fuerza la re-evaluación del árbol ante cualquier mutación. Además, el middleware `persist` garantiza sincronización instantánea con `localStorage` sin requerir infraestructura de servidor.

### 2. ¿Por qué Cálculo Analítico en lugar de Simulación Estocástica (DES)?
En líneas de producción industrializadas en flujo continuo, las restricciones de capacidad vienen determinadas determinísticamente por el cuello de botella. Una simulación de eventos discretos (DES) introduciría variabilidad estocástica y requeriría distribuciones estadísticas de probabilidad que raramente están disponibles en fases tempranas de diseño. El modelo analítico ofrece respuestas instantáneas, reproducibles y directamente aplicables al balanceo de línea.

### 3. Exportación PDF Vectorial Nactiva vs. Rasterización (html2canvas)
Muchas herramientas web convierten la interfaz en imagen mediante `html2canvas` antes de incrustarla en un PDF, lo que produce archivos pesados, desenfocados e inaccesibles. **Takt Studio** utiliza `jsPDF` construyendo el layout vectorialmente (líneas, rectángulos, tipografías y tablas de datos), garantizando textos nítidos, búsquedas internas y tamaños de archivo mínimos.

---

## 📁 Estructura del Proyecto

```text
takt-studio/
├── app/
│   ├── layout.tsx              # Root Layout (Metadata, Providers, Header)
│   ├── page.tsx                # Landing page principal
│   ├── simulador/page.tsx      # Centro de mando del simulador de línea
│   ├── comparar/page.tsx       # Matriz de comparación What-If
│   ├── historial/page.tsx      # Registro y gestión de snapshots
│   ├── importar-exportar/      # Centro de migración de datos JSON
│   ├── metodologia/page.tsx    # Fundamentos teóricos e industriales
│   ├── legal/page.tsx          # Términos y aviso legal
│   └── privacidad/page.tsx     # Política de privacidad y datos locales
├── components/
│   ├── Header.tsx              # Navegación principal con indicador de escenario
│   ├── StationEditor.tsx       # Tabla editable de estaciones (Desktop/Mobile)
│   ├── ScenarioControls.tsx    # Parámetros de jornada, turnos y demanda
│   ├── KpiPanel.tsx            # Tarjetas de KPIs (Takt, Cuello, Throughput, Balanceo)
│   ├── LineDiagram.tsx         # Diagrama visual de flujo de producción
│   ├── TaktChart.tsx           # Gráfico interactivo Ciclos vs. Takt Time
│   ├── CostImpactPanel.tsx     # Análisis económico y costes de no-calidad
│   ├── SensitivityLab.tsx      # Laboratorio de análisis de sensibilidad
│   ├── ImprovementPlan.tsx     # Plan de recomendación de mejoras y ROI
│   ├── InsightsPanel.tsx       # Diagnóstico automático priorizado
│   ├── ExportPdfButton.tsx     # Motor de generación de informes PDF
│   └── ui/                     # UI Primitives (Button, Dialog, Card, Input, etc.)
├── lib/
│   ├── calculations.ts         # Motor analítico puro de fórmulas de organización industrial
│   ├── calculations.test.ts    # Pruebas unitarias de cálculos de balanceo e impacto
│   ├── store.ts                # Store global Zustand con persistencia en localStorage
│   ├── presets.ts              # Plantilla precargada de línea Monobath (7 estaciones)
│   ├── insights.ts             # Algoritmos de generación de diagnósticos
│   └── import-export.ts        # Validadores e importadores/exportadores JSON
├── types/
│   └── index.ts                # Definiciones de tipos TypeScript (Station, Scenario, KPIs, etc.)
└── public/
    └── favicon.svg             # Favicon SVG corporativo
```

---

## ⚡ Instalación y Desarrollo Local

### Prerrequisitos
- **Node.js**: v18.0.0 o superior
- **npm**: v9.0.0 o superior

### Pasos de Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/markusx5622/takt-studio.git
   cd takt-studio
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Acceder a la aplicación:**
   Abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

## 🧪 Scripts y Calidad de Código

El repositorio incluye comandos para verificar la calidad del código, el estado de los tipos y ejecutar la suite de pruebas unitarias:

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local en `localhost:3000`. |
| `npm run build` | Compila y optimiza la aplicación para entorno de producción. |
| `npm run start` | Inicia el servidor de producción tras ejecutar el build. |
| `npm run type-check` | Ejecuta la verificación estricta del compilador de TypeScript (`tsc --noEmit`). |
| `npm run test` | Ejecuta la suite completa de pruebas unitarias con Vitest. |
| `npm run test:watch` | Ejecuta las pruebas unitarias en modo reactivo (watch mode). |

---

## 🔬 Pruebas Unitarias

El motor de cálculo cuenta con cobertura de pruebas automatizadas en `lib/calculations.test.ts` y `lib/import-export.test.ts` evaluando:

- Cálculo exacto de **Takt Time** ante diferentes escenarios de demanda y jornada.
- Identificación precisa del **Cuello de Botella** y cálculo de tiempos efectivos con operarios y scrap.
- Comprobación de límites en la **Eficiencia de Balanceo** ($0 \le E_b \le 1$).
- Verificación del **Profit Proxy** y amortización (Payback) de inversiones de mejora.
- Resistencia ante colecciones vacías o parámetros nulos (evitando fallos en tiempo de ejecución).

Para ejecutar los tests:
```bash
npm run test
```

---

## 🤝 Créditos y Licencia

Desarrollado como proyecto para el área de **Ingeniería de Organización Industrial** de la **Universidad Europea de Valencia**.

**Copyright © 2026 Marc Cubero Cantavella — Todos los derechos reservados.**

Este proyecto, incluyendo su código fuente, diseño, algoritmos y documentación, es propiedad intelectual exclusiva de su autor. No se concede ningún derecho de uso, copia, modificación, distribución o explotación sin autorización previa y por escrito. La presencia de este código en un repositorio público cumple una función estrictamente demostrativa y de portafolio profesional.

Consulta el archivo [`LICENSE`](./LICENSE) para más información.
