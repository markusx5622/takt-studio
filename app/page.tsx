import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Gauge,
  AlertTriangle,
  GitCompare,
  ArrowRight,
  Code2,
  Briefcase,
  Layers,
  BarChart3,
  FileDown,
  Zap,
  Settings2,
  ScanSearch,
  CheckCircle2,
} from "lucide-react"

// ─── Interface mockup ──────────────────────────────────────────────────────────

function InterfaceMockup() {
  const kpis = [
    { label: "Takt Time", value: "7.5", unit: "min/ud", bar: "bg-blue-500", barW: "w-full" },
    { label: "Throughput", value: "64", unit: "uds/día", bar: "bg-emerald-500", barW: "w-4/5" },
    { label: "Cuello bot.", value: "Alicatado", unit: "9.2 min", bar: "bg-red-500", barW: "w-full" },
    { label: "Balanceo", value: "81%", unit: "efic.", bar: "bg-amber-400", barW: "w-4/5" },
  ]

  const stations = [
    { name: "Preparación", h: 42, bottleneck: false },
    { name: "Montaje", h: 62, bottleneck: false },
    { name: "Alicatado", h: 100, bottleneck: true },
    { name: "Electricidad", h: 58, bottleneck: false },
    { name: "Fontanería", h: 55, bottleneck: false },
    { name: "Pintura", h: 48, bottleneck: false },
    { name: "Control QC", h: 38, bottleneck: false },
    { name: "Embalaje", h: 32, bottleneck: false },
  ]

  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-xl border bg-background shadow-2xl transition-transform duration-500 hover:scale-[1.01]">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
        <span className="ml-3 text-[10px] font-mono text-muted-foreground/50 tracking-wider">
          takt-studio.vercel.app/simulador
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* KPI cards row */}
        <div className="grid grid-cols-4 gap-2">
          {kpis.map(({ label, value, unit, bar, barW }) => (
            <div
              key={label}
              className="rounded-lg border bg-muted/20 p-2.5 transition-colors hover:bg-muted/40"
            >
              <p className="mb-1 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/80">
                {label}
              </p>
              <p className="text-sm font-bold leading-none">{value}</p>
              <p className="mb-1.5 text-[9px] text-muted-foreground/70">{unit}</p>
              <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${bar} ${barW} opacity-80`} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {/* Bar chart */}
          <div className="col-span-2 rounded-lg border bg-muted/20 p-3">
            <p className="mb-2 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/80">
              Ciclo efectivo vs Takt
            </p>
            <div className="relative flex items-end gap-1" style={{ height: 64 }}>
              {stations.map(({ name, h, bottleneck }) => (
                <div
                  key={name}
                  className={`flex-1 rounded-t transition-all ${
                    bottleneck ? "bg-red-500/80" : "bg-blue-500/60"
                  }`}
                  style={{ height: `${h}%` }}
                  title={name}
                />
              ))}
              {/* Takt reference line at ~76% */}
              <div
                className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-foreground/30"
                style={{ bottom: "76%" }}
              />
              {/* Bottleneck label */}
              <div
                className="pointer-events-none absolute right-1 flex items-center gap-0.5 text-[7px] font-bold uppercase tracking-wide text-red-500"
                style={{ bottom: "88%" }}
              >
                <AlertTriangle className="h-2.5 w-2.5" />
                Excede Takt
              </div>
            </div>
          </div>

          {/* Line diagram */}
          <div className="col-span-3 rounded-lg border bg-muted/20 p-3">
            <p className="mb-2 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/80">
              Diagrama de línea
            </p>
            <div className="flex items-center gap-1 overflow-hidden">
              {/* ENTRADA */}
              <div className="flex shrink-0 flex-col items-center gap-0.5 rounded border border-dashed border-muted-foreground/30 px-1.5 py-1">
                <div className="h-1.5 w-1.5 rounded-sm bg-muted-foreground/30" />
                <span className="text-[7px] font-bold uppercase tracking-widest text-muted-foreground/50">In</span>
              </div>

              {stations.map(({ name, bottleneck }) => (
                <div key={name} className="flex shrink-0 items-center gap-1">
                  <div className="text-[8px] text-muted-foreground/30">›</div>
                  <div
                    className={`rounded border px-1.5 py-1 transition-colors ${
                      bottleneck
                        ? "border-red-400/80 bg-red-50 dark:bg-red-950/30"
                        : "border-border bg-muted/30"
                    }`}
                  >
                    <p className={`text-[8px] font-semibold leading-tight ${bottleneck ? "text-red-600" : ""}`}>
                      {name.split(" ")[0]}
                    </p>
                    {bottleneck && (
                      <p className="text-[6px] font-bold uppercase tracking-wide text-red-500">
                        ⚠ botella
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex shrink-0 items-center gap-1">
                <div className="text-[8px] text-muted-foreground/30">›</div>
                <div className="flex flex-col items-center gap-0.5 rounded border border-dashed border-green-400/50 px-1.5 py-1">
                  <div className="h-1.5 w-1.5 rounded-sm bg-green-400/60" />
                  <span className="text-[7px] font-bold uppercase tracking-widest text-green-600/60">Out</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Feature card ──────────────────────────────────────────────────────────────

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  delay: string
}) {
  return (
    <div
      className="animate-fade-up group rounded-xl border bg-background p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/20"
      style={{ animationDelay: delay }}
    >
      <div className="mb-4 inline-flex rounded-lg border bg-muted/50 p-2.5 transition-colors group-hover:bg-primary/10 group-hover:border-primary/20">
        <Icon className="h-5 w-5 text-primary transition-colors" />
      </div>
      <h3 className="mb-2 text-base font-semibold tracking-tight">{title}</h3>
      <p className="text-sm leading-relaxed text-foreground/70">{description}</p>
    </div>
  )
}

// ─── Capability pill ───────────────────────────────────────────────────────────

function CapabilityItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-background p-4 transition-all duration-200 hover:shadow-md hover:border-primary/15">
      <div className="mt-0.5 shrink-0 rounded-md border bg-muted/50 p-2">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs leading-relaxed text-foreground/65">{description}</p>
      </div>
    </div>
  )
}

// ─── Step card ─────────────────────────────────────────────────────────────────

function StepCard({
  step,
  icon: Icon,
  title,
  description,
}: {
  step: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border bg-background font-bold text-sm text-primary shadow-sm">
        {step}
      </div>
      <div className="mb-3 inline-flex rounded-lg border bg-muted/50 p-2.5">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="mb-1 text-sm font-semibold">{title}</h3>
      <p className="max-w-[16rem] text-xs leading-relaxed text-foreground/70">{description}</p>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 pb-20 pt-24 text-center md:pt-32"
        style={{
          backgroundImage: "radial-gradient(circle, #00000008 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {/* Eyebrow */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Ingeniería de Organización Industrial
        </div>

        {/* Title */}
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Diseña, simula y optimiza{" "}
          <span className="text-muted-foreground/50">tu línea de producción</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-foreground/70 sm:text-xl">
          Takt Studio te permite modelar estaciones, detectar cuellos de botella
          y comparar escenarios <em className="not-italic font-medium text-foreground/80">what-if</em> en minutos.{" "}
          <span className="text-foreground/80">Sin tocar la línea real.</span>
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="gap-2 px-6 shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            <Link href="/simulador">
              Probar con plantilla Monobath
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="gap-2 px-6 bg-background/80 backdrop-blur-sm transition-all duration-200 hover:bg-background hover:shadow-md"
          >
            <Link href="/comparar">Ver comparador</Link>
          </Button>
        </div>

        {/* Metadata strip */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-foreground/50">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3" />
            Cálculo en tiempo real
          </span>
          <span className="hidden h-px w-4 bg-border sm:block" />
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3" />
            Sin cuenta
          </span>
          <span className="hidden h-px w-4 bg-border sm:block" />
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3" />
            Sin instalación
          </span>
        </div>

        {/* UI Mockup */}
        <div className="mt-16 w-full px-0 sm:px-4">
          <InterfaceMockup />
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section className="border-t bg-muted/20 px-4 py-20 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Análisis operativo en tiempo real
            </h2>
            <p className="mt-2 text-sm text-foreground/60">
              Fundamentos de Ingeniería de Organización Industrial aplicados a la toma de decisiones
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FeatureCard
              icon={Gauge}
              title="Métricas operativas continuas"
              description="Takt time, throughput, eficiencia de balanceo y lead time se recalculan automáticamente a cada cambio. Sin esperas, sin exportar a Excel."
              delay="0ms"
            />
            <FeatureCard
              icon={AlertTriangle}
              title="Identificación del constraint"
              description="Localiza con precisión la estación que limita el ritmo de producción y evalúa el impacto de aliviarla antes de invertir en planta."
              delay="100ms"
            />
            <FeatureCard
              icon={GitCompare}
              title="Análisis de escenarios A/B"
              description="Duplica una configuración, modifica parámetros y compara métricas diferenciadas para justificar decisiones de mejora con datos."
              delay="200ms"
            />
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────────────────────────────── */}
      <section className="border-t px-4 py-20 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-14 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Flujo de uso</h2>
            <p className="mt-2 text-sm text-foreground/60">
              De la definición a la decisión en tres pasos
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            <StepCard
              step="1"
              icon={Settings2}
              title="Define la línea"
              description="Configura estaciones, tiempos de ciclo, operarios, demanda y turnos. Parte de la plantilla Monobath o construye desde cero."
            />
            <StepCard
              step="2"
              icon={ScanSearch}
              title="Detecta el cuello de botella"
              description="El simulador identifica automáticamente el constraint y muestra su impacto sobre el throughput y el balanceo global."
            />
            <StepCard
              step="3"
              icon={GitCompare}
              title="Compara antes de intervenir"
              description="Evalúa escenarios what-if en el comparador y exporta el análisis para respaldar la propuesta de mejora."
            />
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES ─────────────────────────────────────────────────────── */}
      <section className="border-t bg-muted/20 px-4 py-20 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-14 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Capacidades</h2>
            <p className="mt-2 text-sm text-foreground/60">
              Todo lo que incluye Takt Studio desde el primer acceso
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <CapabilityItem
              icon={Layers}
              title="Plantilla Monobath"
              description="Línea de baños prefabricados preconfigurada como caso de estudio operativo."
            />
            <CapabilityItem
              icon={GitCompare}
              title="Comparación A/B"
              description="Contrasta dos escenarios lado a lado con delta automático en cada métrica."
            />
            <CapabilityItem
              icon={BarChart3}
              title="KPIs clave"
              description="Takt time, throughput, lead time, eficiencia de balanceo y análisis de constraint."
            />
            <CapabilityItem
              icon={FileDown}
              title="Exportación PDF"
              description="Genera informes del escenario activo para documentación o presentaciones."
            />
            <CapabilityItem
              icon={Zap}
              title="Simulación instantánea"
              description="Cálculo en tiempo real sin latencia perceptible al ajustar cualquier parámetro."
            />
            <CapabilityItem
              icon={Gauge}
              title="Sin instalación"
              description="Funciona en el navegador. Sin cuentas, sin licencias, sin dependencias externas."
            />
          </div>
        </div>
      </section>

      {/* ── CREDIBILIDAD METODOLÓGICA ────────────────────────────────────────── */}
      <section className="border-t px-4 py-20 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Validación antes de la inversión
          </h2>
          <p className="mt-4 text-base leading-relaxed text-foreground/70">
            Takt Studio parte de una{" "}
            <span className="font-medium text-foreground">plantilla Monobath calibrada</span>{" "}
            como demostración del método. Puedes ajustar cada parámetro con datos reales de tu
            propia línea y validar decisiones antes de cualquier intervención física.{" "}
            <span className="font-medium text-foreground">
              La herramienta está pensada para reducir el riesgo operativo de las mejoras de
              producción
            </span>{" "}
            mediante simulación analítica, no para sustituir el juicio del ingeniero.
          </p>
        </div>
      </section>

      {/* ── SOBRE ESTE PROYECTO ──────────────────────────────────────────────── */}
      <section className="border-t bg-muted/20 px-4 py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border bg-background p-8 shadow-sm md:p-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-16">
              {/* Text */}
              <div className="flex flex-col justify-center">
                <h2 className="text-xl font-bold tracking-tight md:text-2xl">
                  Sobre este proyecto
                </h2>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/70">
                  <p>
                    Takt Studio es un prototipo funcional de simulación y análisis de líneas de
                    producción industrializada. Permite modelar estaciones, calcular KPIs operativos
                    y comparar escenarios <em className="not-italic font-medium text-foreground/80">what-if</em>{" "}
                    antes de realizar cualquier intervención en planta.
                  </p>
                  <p>
                    Desarrollado por{" "}
                    <span className="font-medium text-foreground">Marc Cubero</span> en el ámbito
                    de la Ingeniería de Organización Industrial de la{" "}
                    <span className="font-medium text-foreground">Universidad Europea de Valencia</span>.
                    El enfoque es práctico: una herramienta que respalde la toma de decisiones con
                    datos, no que la sustituya.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col justify-center gap-3.5">
                <Button
                  asChild
                  variant="outline"
                  className="h-11 w-full justify-start gap-2.5 rounded-lg border-foreground/15 bg-muted/30 px-5 text-sm transition-all duration-200 hover:bg-muted hover:border-foreground/25"
                >
                  <a
                    href="https://github.com/markusx5622/takt-studio"
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Ver repositorio en GitHub"
                  >
                    <Code2 className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground/90">Ver repositorio</span>
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 w-full justify-start gap-2.5 rounded-lg border-foreground/15 bg-muted/30 px-5 text-sm transition-all duration-200 hover:bg-muted hover:border-foreground/25"
                >
                  <a
                    href="https://www.linkedin.com/in/marc-cubero-cantavella-bb04542a7"
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Ver perfil de LinkedIn"
                  >
                    <Briefcase className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground/90">Perfil de LinkedIn</span>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="border-t px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 text-xs text-foreground/50 sm:flex-row">
          <span className="font-medium">Takt Studio · 2026</span>
          <span>Hecho con Next.js y desplegado en Vercel</span>
        </div>
      </footer>
    </div>
  )
}
