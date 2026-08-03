# Changelog — Takt Studio

Historial de cambios del proyecto. Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

### Añadido
- `CHANGELOG.md` con historial retroactivo del proyecto.
- Campo `license: "PROPRIETARY"` y `engines` (Node ≥20, npm ≥10) en `package.json`.

### Cambiado
- `README.md` reescrito para reflejar fielmente el estado real del proyecto: i18n ES/EN, PWA y offline, Monte Carlo, compartición por URL, CI/CD, E2E, cobertura, estructura real del repositorio y scripts completos.

### Eliminado
- Dependencia directa `html2canvas` (no utilizada: la exportación PDF es 100% vectorial con jsPDF).

## [0.1.0] — 2026-08-03

Estado inicial público del proyecto (baseline previo al lanzamiento 1.0.0).

### 2026-04 — Núcleo del producto
- Scaffold Next.js 16 + Tailwind v4 + shadcn/ui, modelo de tipos y motor de cálculo de organización industrial con tests.
- Store Zustand con persistencia en `localStorage`; plantilla industrial "Monobath" (7 estaciones).
- Editor de estaciones, panel de KPIs con semáforos, gráfico ciclo vs Takt, diagrama de línea e insights automáticos.
- Comparador de escenarios A/B, exportación de informe PDF vectorial, plan de mejora con ROI/payback y laboratorio de sensibilidad.
- Historial de snapshots, importación/exportación JSON y secciones independientes de metodología.
- Landing page profesional con atmósfera visual (partículas, fondos consultivos) y sistema de marca completo.

### 2026-07 — Plataforma e internacionalización
- Licencia propietaria bilingüe (`LICENSE`) y aviso de copyright en README.
- Motor de simulación Monte Carlo (PRNG determinista, muestreo lognormal) y panel de análisis estocástico.
- Compartición de escenarios por hash de URL con validación de esquema.
- Infraestructura SEO: Open Graph, `sitemap.xml`, `robots.txt` y metadata por página.
- Vercel Analytics integrado.
- Internacionalización completa ES/EN con next-intl: infraestructura, landing, simulador, comparador, historial, importar/exportar, metodología y páginas legales (560 claves por idioma).
- Pipeline de CI bloqueante en GitHub Actions.

### 2026-08 — PWA, calidad y accesibilidad
- PWA: Service Worker con precache y fallback offline bilingüe, manifest con iconos PNG/maskable y `offline.html`.
- Suite E2E con Playwright (6 smoke tests ES/EN) integrada como job bloqueante en CI.
- Cobertura de tests elevada a 103 pruebas (8 archivos) con umbrales obligatorios 78/68/82/79.
- Auditoría profesional de la landing aplicada: contraste WCAG AA, `prefers-reduced-motion`, mockup decorativo oculto a lectores de pantalla, FAQ como acordeón nativo y estilos de foco visibles.
