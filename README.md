<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/logo-horizontal-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="public/logo-horizontal.svg">
    <img alt="Takt Studio" src="public/logo-horizontal-dark.svg" width="700" />
  </picture>
</p>

<p align="center">
  <strong>Simulador y Analizador de Líneas de Producción Industrializada</strong>
</p>

<p align="center">
  Plataforma web de ingeniería de organización industrial para el modelado de estaciones, optimización de tiempos de ciclo, detección automática de cuellos de botella, análisis económico de impacto y evaluación de escenarios <em>What-If</em>.
</p>

<p align="center">
  <a href="https://takt-studio.vercel.app"><strong>▶ Demo en producción</strong></a> ·
  <a href="https://github.com/markusx5622/takt-studio/issues">Reportar un issue</a>
</p>

<p align="center">
  <a href="https://github.com/markusx5622/takt-studio/actions/workflows/ci.yml"><img src="https://github.com/markusx5622/takt-studio/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <img src="https://img.shields.io/badge/NEXT.JS-16.2.4-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16.2.4" />
  <img src="https://img.shields.io/badge/REACT-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19.2.4" />
  <img src="https://img.shields.io/badge/TYPESCRIPT-5.X-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5.X" />
  <img src="https://img.shields.io/badge/TAILWIND_CSS-V4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4.0" />
  <br />
  <img src="https://img.shields.io/badge/ZUSTAND-V5.0-443E38?style=for-the-badge&logo=react&logoColor=white" alt="Zustand v5.0" />
  <img src="https://img.shields.io/badge/VITEST-V4.1-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest v4.1" />
  <img src="https://img.shields.io/badge/PLAYWRIGHT-E2E-2EAD33?style=for-the-badge&logo=playwright&logoColor=white" alt="Playwright E2E" />
  <img src="https://img.shields.io/badge/JSPDF-V4.2-FF6F00?style=for-the-badge&logo=adobeacrobatreader&logoColor=white" alt="jsPDF v4.2" />
</p>

<p align="center">
  <a href="#-contexto-académico">Contexto Académico</a> •
  <a href="#-características-principales">Características</a> •
  <a href="#-fundamentos-teóricos-y-formulación-matemática">Formulación Matemática</a> •
  <a href="#️-stack-técnico">Stack Técnico</a> •
  <a href="#-internacionalización-pwa-y-plataforma">Plataforma</a> •
  <a href="#-estructura-del-proyecto">Estructura</a> •
  <a href="#-instalación-y-desarrollo-local">Instalación</a> •
  <a href="#-testing-y-calidad">Testing</a>
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

### 🎲 Simulación Monte Carlo
- **Análisis Estocástico del Throughput**: Muestreo de tiempos de ciclo desde distribuciones lognormales (mediana = tiempo nominal, coeficiente de variación configurable) para estimar la distribución de capacidad real de la línea.
- **Motor Determinista y Reproducible**: PRNG propio (mulberry32) con semilla fija — misma semilla, mismos resultados, lo que hace el análisis auditable y testeable.
- **Histograma de Resultados**: Visualización de la distribución de throughput con 2.000 ejecuciones por defecto.

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

### 📤 Importación, Exportación y Compartición
- **Portabilidad Total**: Exportación de escenarios individuales o snapshots completos a JSON.
- **Validación de Esquema**: Motor de importación con validación estricta de estructura y compatibilidad de versiones, con errores localizados ES/EN.
- **Compartir por URL**: Serialización de escenarios en el hash de la URL (base64url) para compartir configuraciones sin backend ni cuentas — el receptor abre el enlace y carga el escenario validado al instante.

### 📄 Generador de Informes Ejecutivos en PDF
- **Generación Vectorial nativa (jsPDF)**: Renderizado limpio en formato A4 sin depender de captura de pantalla.
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
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) | Renderizado optimizado y arquitectura de componentes de React. |
| **Interfaz & UI** | React 19 + [Tailwind CSS v4](https://tailwindcss.com/) | Diseño moderno, responsivo y adaptado a estándares UI/UX. |
| **Componentes UI** | [shadcn/ui](https://ui.shadcn.com/) + Lucide Icons | Sistema de diseño accesible y modular. |
| **Gestión de Estado** | [Zustand v5](https://zustand-demo.pmnd.rs/) + `persist` | Estado global reactivo con almacenamiento automático en `localStorage`. |
| **Internacionalización** | [next-intl v4](https://next-intl.dev/) | ES/EN completos (560 claves por idioma), rutas localizadas y middleware de detección. |
| **Visualización de Datos** | [Recharts v3](https://recharts.org/) | Gráficos interactivos de barras de ciclo vs Takt Time. |
| **Generación de Documentos** | [jsPDF v4](https://github.com/parallax/jsPDF) | Generación vectorial de informes ejecutivos en PDF. |
| **Testing Unitario** | [Vitest v4](https://vitest.dev/) + coverage v8 | 103 pruebas con umbrales de cobertura obligatorios. |
| **Testing E2E** | [Playwright](https://playwright.dev/) | Smoke tests bilingües ejecutados en CI sobre build de producción. |
| **Analítica** | [Vercel Analytics](https://vercel.com/analytics) | Métricas de uso y Web Vitals sin cookies ni datos personales. |
| **Tipado** | TypeScript Estricto | Tipado completo sin uso de `any`. |

---

## 🌍 Internacionalización, PWA y Plataforma

### i18n (Español / English)
- **Cobertura total**: toda la aplicación —landing, simulador, comparador, historial, importar/exportar, páginas legales y mensajes del motor de validación— está traducida al español y al inglés (`messages/es.json`, `messages/en.json`, 560 claves por idioma).
- **Enrutado localizado**: español canónico sin prefijo (`/simulador`) e inglés bajo `/en` (`/en/simulator` no aplica: las rutas se mantienen, el idioma cambia vía `/en` + cookie `NEXT_LOCALE`).
- **Middleware de detección**: redirección automática según `Accept-Language` y cookie de preferencia.

### PWA & Offline
- **Service Worker propio** (`public/sw.js`): precache de assets críticos, cache-first para estáticos, network-first para navegaciones y fallback offline bilingüe (`offline.html`) cuando la ruta no está cacheada.
- **Instalable**: `manifest.webmanifest` con iconos PNG y maskable, theme color y compatibilidad con pantalla de inicio.
- **Cache consciente del i18n**: las entradas de caché se normalizan frente a las redirecciones de idioma del middleware.

### SEO & Metadatos
- `sitemap.xml` y `robots.txt` generados, metadata y Open Graph por página en ambos idiomas, imagen social dedicada.

### CI/CD (GitHub Actions)
- **Job `verify`**: ESLint → `tsc --noEmit` → tests unitarios con cobertura (umbrales obligatorios) → build de producción → `tsc` final.
- **Job `e2e`**: build de producción + suite Playwright sobre Chromium.
- Ambos jobs son **bloqueantes**: ningún commit entra en `main` sin pipeline verde.

---

## 🧠 Decisiones Técnicas de Arquitectura

### 1. ¿Por qué Zustand en lugar de Context API o Redux?
Zustand ofrece una API ligera basada en suscripciones que permite selectores granulares `(state) => state.scenarios.find(...)`. Esto evita re-renders innecesarios en la UI a diferencia de la Context API de React, la cual fuerza la re-evaluación del árbol ante cualquier mutación. Además, el middleware `persist` garantiza sincronización instantánea con `localStorage` sin requerir infraestructura de servidor.

### 2. Motor analítico determinista + Monte Carlo opcional
El núcleo de Takt Studio es analítico: en líneas de producción industrializadas en flujo continuo, las restricciones de capacidad vienen determinadas por el cuello de botella, y el modelo determinista ofrece respuestas instantáneas, reproducibles y directamente aplicables al balanceo. Para escenarios donde la variabilidad importa, la capa de **Monte Carlo** añade análisis estocástico sin renunciar a la reproducibilidad (PRNG con semilla fija), evitando la opacidad de una simulación de eventos discretos completa.

### 3. Exportación PDF Vectorial Nativa vs. Rasterización
Muchas herramientas web convierten la interfaz en imagen antes de incrustarla en un PDF, lo que produce archivos pesados, desenfocados e inaccesibles. **Takt Studio** utiliza `jsPDF` construyendo el layout vectorialmente (líneas, rectángulos, tipografías y tablas de datos), garantizando textos nítidos, búsquedas internas y tamaños de archivo mínimos.

### 4. Sin backend: privacidad por arquitectura
No hay servidor de aplicación, base de datos ni cuentas de usuario. Todos los datos de simulación viven en el `localStorage` del navegador del usuario, la compartición funciona serializando el escenario en la propia URL, y la analítica (Vercel Analytics) no usa cookies ni identifica personas. La privacidad no es una promesa contractual: es una consecuencia de la arquitectura.

---

## 📁 Estructura del Proyecto

```text
takt-studio/
├── .github/workflows/
│   └── ci.yml                  # Pipeline bloqueante: verify (lint+tipos+tests+build) + e2e
├── app/
│   └── [locale]/               # App Router con segmento de idioma (next-intl)
│       ├── layout.tsx          # Layout localizado (providers, Analytics, registro del SW)
│       ├── page.tsx            # Landing page
│       ├── simulador/          # Centro de mando del simulador de línea
│       ├── comparar/           # Matriz de comparación What-If
│       ├── historial/          # Registro y gestión de snapshots
│       ├── importar-exportar/  # Centro de migración de datos JSON
│       ├── metodologia/        # Fundamentos teóricos e industriales
│       ├── legal/              # Aviso legal y términos de uso
│       └── privacidad/         # Política de privacidad y datos locales
├── components/
│   ├── landing/                # Secciones de la landing (hero, features, FAQ, roadmap…)
│   ├── sensitivity/            # Laboratorio de sensibilidad
│   ├── ui/                     # Primitivas UI (Button, Dialog, Card, Input, etc.)
│   ├── Header.tsx              # Navegación principal con indicador de escenario
│   ├── StationEditor.tsx       # Tabla editable de estaciones (Desktop/Mobile)
│   ├── ScenarioControls.tsx    # Parámetros de jornada, turnos y demanda
│   ├── KpiPanel.tsx            # Tarjetas de KPIs (Takt, Cuello, Throughput, Balanceo)
│   ├── MonteCarloPanel.tsx     # Panel de simulación estocástica
│   ├── CostImpactPanel.tsx     # Análisis económico y costes de no-calidad
│   ├── ImprovementPlan.tsx     # Plan de recomendación de mejoras y ROI
│   ├── SharedScenarioLoader.tsx# Carga de escenarios compartidos por URL
│   └── …                       # LineDiagram, TaktChart, InsightsPanel, ExportPdfButton…
├── e2e/
│   └── smoke.spec.ts           # 6 tests E2E Playwright (ES/EN, build de producción)
├── i18n/
│   ├── routing.ts              # Definición de locales y prefijos de ruta
│   ├── navigation.ts           # Link/redirect localizados
│   └── request.ts              # Carga de diccionarios por locale
├── lib/
│   ├── calculations.ts         # Motor analítico puro de fórmulas de organización industrial
│   ├── monte-carlo.ts          # Motor Monte Carlo (PRNG mulberry32, muestreo lognormal)
│   ├── store.ts                # Store global Zustand con persistencia en localStorage
│   ├── store-names.ts          # Nombres localizados de escenarios/snapshots
│   ├── insights.ts             # Algoritmos de generación de diagnósticos
│   ├── import-export.ts        # Validadores e importadores/exportadores JSON
│   ├── share.ts                # Serialización de escenarios en hash de URL
│   ├── presets.ts              # Plantilla precargada de línea Monobath (7 estaciones)
│   └── *.test.ts               # 8 archivos de pruebas unitarias (103 tests)
├── messages/
│   ├── es.json                 # Diccionario español (560 claves)
│   └── en.json                 # Diccionario inglés (560 claves)
├── types/
│   └── index.ts                # Definiciones de tipos TypeScript (Station, Scenario, KPIs…)
├── public/
│   ├── sw.js                   # Service Worker (precache + fallback offline)
│   ├── offline.html            # Página offline bilingüe
│   ├── manifest.webmanifest    # Manifest PWA (iconos, maskable, theme color)
│   └── …                       # Iconos PNG/SVG, og-image, favicon
├── middleware.ts               # Detección y redirección de idioma
├── vitest.config.ts            # Cobertura v8 con umbrales 78/68/82/79
├── playwright.config.ts        # Suite E2E (Chromium, webServer de producción)
├── docs/                       # Documentación de marca (brand-assets)
├── LICENSE                     # Licencia propietaria (todos los derechos reservados)
└── CHANGELOG.md                # Historial de cambios del proyecto
```

---

## ⚡ Instalación y Desarrollo Local

### Prerrequisitos
- **Node.js**: v20.0.0 o superior
- **npm**: v10.0.0 o superior

### Pasos de Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/markusx5622/takt-studio.git
   cd takt-studio
   ```

2. **Instalar dependencias:**
   ```bash
   npm ci
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Acceder a la aplicación:**
   Abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

## 🧪 Scripts y Calidad de Código

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local en `localhost:3000`. |
| `npm run build` | Compila y optimiza la aplicación para entorno de producción. |
| `npm run start` | Inicia el servidor de producción tras ejecutar el build. |
| `npm run lint` | Ejecuta ESLint sobre todo el proyecto (0 errores / 0 warnings exigidos). |
| `npm run type-check` | Verificación estricta del compilador de TypeScript (`tsc --noEmit`). |
| `npm run test` | Ejecuta la suite completa de pruebas unitarias con Vitest. |
| `npm run test:watch` | Ejecuta las pruebas unitarias en modo reactivo (watch mode). |
| `npm run test:coverage` | Tests + informe de cobertura v8 con umbrales obligatorios. |
| `npm run test:e2e` | Suite E2E Playwright (requiere build de producción). |

---

## 🔬 Testing y Calidad

### Pruebas Unitarias (103 tests, 8 archivos en `lib/`)
- Cálculo exacto de **Takt Time** ante diferentes escenarios de demanda y jornada.
- Identificación precisa del **Cuello de Botella** y tiempos efectivos con operarios y scrap.
- Comprobación de límites en la **Eficiencia de Balanceo** ($0 \le E_b \le 1$).
- Verificación del **Profit Proxy** y amortización (Payback) de inversiones de mejora.
- Motor **Monte Carlo**: reproducibilidad con semilla fija, muestreo lognormal y histogramas.
- **Store Zustand**: todas las acciones (escenarios, snapshots, baseline, importación) con aislamiento de `localStorage`.
- **Import/Export**: validación estricta de esquemas, errores localizados y resistencia a payloads corruptos.
- Resistencia ante colecciones vacías o parámetros nulos.

**Umbrales de cobertura obligatorios** (el CI falla por debajo): 78% statements · 68% branches · 82% functions · 79% lines.

### Pruebas E2E (Playwright)
6 smoke tests sobre el build de producción en Chromium, en español e inglés: navegación landing → simulador, edición de estaciones, páginas de historial/importación y cambio de idioma.

### Integración Continua
Cada push a `main` ejecuta en GitHub Actions: ESLint → TypeScript → tests con cobertura → build SSG de ambos locales → suite E2E. Pipeline bloqueante.

---

## 🤝 Créditos y Licencia

Desarrollado como proyecto para el área de **Ingeniería de Organización Industrial** de la **Universidad Europea de Valencia**.

**Copyright © 2026 Marc Cubero Cantavella — Todos los derechos reservados.**

Este proyecto, incluyendo su código fuente, diseño, algoritmos y documentación, es propiedad intelectual exclusiva de su autor. No se concede ningún derecho de uso, copia, modificación, distribución o explotación sin autorización previa y por escrito. La presencia de este código en un repositorio público cumple una función estrictamente demostrativa y de portafolio profesional.

Consulta el archivo [`LICENSE`](./LICENSE) para más información.
