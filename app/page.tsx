import Link from "next/link"
import { Button } from "@/components/ui/button"
import HeroParticles from "@/components/HeroParticles"
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
  History,
  ShieldCheck,
  FileText,
  HelpCircle,
  Cpu,
  Box,
  Database,
} from "lucide-react"

// ─── Interface mockup ──────────────────────────────────────────────────────────

function InterfaceMockup() {
  const kpis = [
    { label: "Takt Time", value: "7.5", unit: "min/ud", bar: "bg-blue-500", trend: "+2.4%", status: "up" },
    { label: "Throughput", value: "64", unit: "uds/día", bar: "bg-emerald-500", trend: "-1.2%", status: "down" },
    { label: "Cuello bot.", value: "Alicatado", unit: "9.2 min", bar: "bg-red-500", trend: "Crítico", status: "warning" },
    { label: "Balanceo", value: "81%", unit: "efic.", bar: "bg-amber-400", trend: "+5.1%", status: "up" },
  ]

  const stations = [
    { name: "Prep", h: 42, bottleneck: false },
    { name: "Mont", h: 62, bottleneck: false },
    { name: "Alic", h: 100, bottleneck: true },
    { name: "Elec", h: 58, bottleneck: false },
    { name: "Font", h: 55, bottleneck: false },
    { name: "Pint", h: 48, bottleneck: false },
    { name: "QC", h: 38, bottleneck: false },
    { name: "Emb", h: 32, bottleneck: false },
  ]

  return (
    <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border bg-background/60 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] backdrop-blur-xl transition-all duration-700 hover:scale-[1.015] hover:shadow-[0_40px_80px_-12px_rgba(0,0,0,0.18)]">
      {/* Window chrome / Top bar */}
      <div className="flex items-center gap-4 border-b bg-muted/40 px-4 py-3">
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57] shadow-sm" />
          <span className="h-3 w-3 rounded-full bg-[#FEBC2E] shadow-sm" />
          <span className="h-3 w-3 rounded-full bg-[#28C840] shadow-sm" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex h-7 w-full max-w-sm items-center gap-2 rounded-lg border bg-background/50 px-3 text-[10px] text-muted-foreground/60 backdrop-blur-sm">
            <ScanSearch className="h-3 w-3" />
            <span>takt-studio.vercel.app/simulador — Prototipo V.2.0</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Settings2 className="h-3 w-3 text-primary" />
          </div>
          <div className="h-6 w-12 rounded-full bg-muted/60 border border-border flex items-center justify-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[8px] font-bold text-foreground/60">LIVE</span>
          </div>
        </div>
      </div>

      <div className="flex h-[420px]">
        {/* Sidebar Mini */}
        <div className="hidden w-16 flex-col items-center gap-6 border-r bg-muted/20 py-8 md:flex">
          <div className="rounded-xl bg-primary p-2 shadow-lg shadow-primary/20">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <GitCompare className="h-5 w-5 text-muted-foreground/50 hover:text-primary transition-colors cursor-pointer" />
          <Layers className="h-5 w-5 text-muted-foreground/50 hover:text-primary transition-colors cursor-pointer" />
          <History className="h-5 w-5 text-muted-foreground/50 hover:text-primary transition-colors cursor-pointer" />
          <div className="mt-auto">
            <Zap className="h-5 w-5 text-amber-400" />
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="flex-1 overflow-hidden p-6 space-y-5">
          {/* Header Area */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight">Dashboard de Producción</h3>
              <p className="text-[10px] text-muted-foreground">Línea Monobath — Planta Valencia Centro</p>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-24 rounded-md border bg-background/50 flex items-center justify-center text-[10px] font-medium gap-2">
                <FileDown className="h-3 w-3" /> Reporte
              </div>
              <div className="h-8 w-24 rounded-md bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                Simular
              </div>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {kpis.map(({ label, value, unit, bar, trend, status }) => (
              <div
                key={label}
                className="group relative rounded-xl border bg-background/40 p-3.5 transition-all hover:bg-background/60 hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70">{label}</p>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                    status === 'up' ? 'bg-emerald-100 text-emerald-600' : 
                    status === 'down' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {trend}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="text-xl font-bold tracking-tight">{value}</p>
                  <p className="text-[10px] text-muted-foreground/60 font-medium">{unit}</p>
                </div>
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted/50">
                  <div className={`h-full rounded-full ${bar} opacity-70 transition-all duration-1000 w-3/4`} />
                </div>
              </div>
            ))}
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-5 gap-4 h-48">
            {/* Bar chart - Simulation */}
            <div className="col-span-3 rounded-xl border bg-background/40 p-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ciclo efectivo vs Takt</p>
                <div className="flex gap-2">
                   <div className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-blue-500/60" /><span className="text-[8px] text-muted-foreground">Estándar</span></div>
                   <div className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-red-500/80" /><span className="text-[8px] text-muted-foreground">Bottleneck</span></div>
                </div>
              </div>
              <div className="relative flex items-end gap-1.5 h-24">
                {stations.map(({ name, h, bottleneck }) => (
                  <div key={name} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                      className={`w-full rounded-t-sm transition-all duration-700 ${
                        bottleneck ? "bg-red-500/90 shadow-[0_0_12px_rgba(239,68,68,0.3)]" : "bg-blue-500/50"
                      }`}
                      style={{ height: `${h}%` }}
                    />
                    <span className="text-[7px] font-bold text-muted-foreground/60">{name}</span>
                  </div>
                ))}
                {/* Takt Line */}
                <div className="absolute inset-x-0 border-t border-primary/40 border-dashed z-10" style={{ bottom: "75%" }}>
                  <span className="absolute -top-2 right-0 bg-background/80 px-1 text-[6px] font-bold text-primary tracking-widest">TAKT 7.5s</span>
                </div>
              </div>
            </div>

            {/* Performance Mini Card */}
            <div className="col-span-2 rounded-xl border bg-background/40 p-4 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Eficiencia Global (OEE)</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-primary tracking-tighter">92.4%</span>
                  <span className="text-[10px] text-emerald-500 font-bold">↑ 2.1%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-medium">
                  <span className="text-muted-foreground">Disponibilidad</span>
                  <span>98%</span>
                </div>
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[98%]" />
                </div>
                <div className="flex justify-between text-[9px] font-medium">
                  <span className="text-muted-foreground">Rendimiento</span>
                  <span>94%</span>
                </div>
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[94%]" />
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
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-slate-50/50">
      {/* Particle layer — covers entire landing page */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <HeroParticles />
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center overflow-hidden px-4 pb-20 pt-24 text-center md:pt-32">
        {/* Ambient glow behind content */}
        <div className="pointer-events-none absolute inset-0 bg-hero-ambient" />
        {/* Focus glow around title area */}
        <div className="pointer-events-none absolute left-1/2 top-[20%] h-[500px] w-[800px] -translate-x-1/2 bg-hero-glow" />
        {/* Eyebrow */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse-soft" />
          </span>
          Ingeniería de Organización Industrial
        </div>

        {/* Title */}
        <h1 className="max-w-5xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Diseña, simula y optimiza
          <span className="block shimmer-text">tu línea de producción</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-foreground/70 sm:text-xl">
          Modela estaciones, calcula KPIs operativos y compara escenarios{" "}
          <em className="not-italic font-medium text-foreground/80">what-if</em>.{" "}
          Sin tocar la planta real.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="gap-2 px-6 shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 animate-cta-pulse"
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
        <div className="relative mt-16 w-full px-0 sm:px-4">
          {/* Subtle glow behind mockup */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.12] blur-3xl" />
          <InterfaceMockup />
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 border-t border-border/50 px-4 py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0 section-ambient-product" />
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
      <section className="relative z-10 border-t border-border/50 bg-grid-pattern-light px-4 py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0 section-ambient-product" />
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
      <section className="relative z-10 border-t border-border/50 px-4 py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0 section-ambient-structure" />
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
      <section className="relative z-10 border-t border-border/50 bg-grid-pattern-light px-4 py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0 section-ambient-calm" />
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
      <section className="relative z-10 border-t border-border/50 px-4 py-16 md:py-20">
        <div className="pointer-events-none absolute inset-0 section-ambient-calm" />
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

      {/* ── TECH STACK & ARCHITECTURE ───────────────────────────────────────── */}
      <section className="relative z-10 border-t border-border/50 bg-grid-pattern-light px-4 py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0 section-ambient-product opacity-40" />
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Ingeniería y Arquitectura</h2>
            <p className="mt-2 text-sm text-foreground/60">
              Tecnología de vanguardia para simulaciones industriales de alto rendimiento
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Core Engine */}
            <div className="rounded-2xl border bg-background/60 p-8 backdrop-blur-xl shadow-sm transition-all hover:shadow-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <Cpu className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-lg font-bold">Motor Reactivo</h3>
              <p className="text-sm leading-relaxed text-foreground/70 mb-6">
                Algoritmos optimizados en JavaScript que recalculan el flujo completo de la línea 
                y detectan cuellos de botella en milisegundos ante cualquier cambio de parámetros.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold text-foreground/50 uppercase">Next.js 14</span>
                <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold text-foreground/50 uppercase">TypeScript</span>
              </div>
            </div>

            {/* Interface & Experience */}
            <div className="rounded-2xl border bg-background/60 p-8 backdrop-blur-xl shadow-sm transition-all hover:shadow-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <Box className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-lg font-bold">Industrial Design</h3>
              <p className="text-sm leading-relaxed text-foreground/70 mb-6">
                Interfaz de alta fidelidad construida con Tailwind CSS, priorizando la 
                legibilidad técnica y la ergonomía visual para entornos profesionales de ingeniería.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold text-foreground/50 uppercase">Tailwind v4</span>
                <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold text-foreground/50 uppercase">Lucide Icons</span>
              </div>
            </div>

            {/* Infrastructure */}
            <div className="rounded-2xl border bg-background/60 p-8 backdrop-blur-xl shadow-sm transition-all hover:shadow-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-lg font-bold">Local Computing</h3>
              <p className="text-sm leading-relaxed text-foreground/70 mb-6">
                Estrategia "Offline-First" utilizando persistencia en el navegador. Garantiza 
                latencia cero y privacidad total de los datos industriales sin necesidad de base de datos.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold text-foreground/50 uppercase">Local Storage</span>
                <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold text-foreground/50 uppercase">Zustand</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PREGUNTAS FRECUENTES (FAQ) ───────────────────────────────────────── */}
      <section className="relative z-10 border-t border-border/50 px-4 py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0 section-ambient-structure opacity-50" />
        <div className="mx-auto max-w-4xl">
          <div className="mb-14 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Preguntas frecuentes</h2>
            <p className="mt-2 text-sm text-foreground/60">
              Todo lo que necesitas saber sobre Takt Studio y la simulación de líneas
            </p>
          </div>

          <div className="grid gap-4">
            {[
              {
                q: "¿Qué precisión tienen los cálculos de Takt Studio?",
                a: "Los cálculos se basan en fórmulas estándar de Ingeniería de Organización Industrial. La precisión depende de la calidad de los datos de entrada (tiempos de ciclo, eficiencias). Es una herramienta de simulación analítica para toma de decisiones, no un sistema de control en tiempo real."
              },
              {
                q: "¿Dónde se guardan mis datos de simulación?",
                a: "Por privacidad y seguridad, tus datos nunca salen de tu dispositivo. Se guardan en el almacenamiento local de tu navegador (localStorage). Si borras la caché o cambias de navegador, los datos no se sincronizarán a menos que los exportes manualmente."
              },
              {
                q: "¿Puedo exportar mis análisis a otros formatos?",
                a: "Sí, Takt Studio permite exportar los resultados y la configuración actual en formato PDF para presentaciones e informes técnicos, así como importar/exportar archivos JSON para compartir modelos entre diferentes usuarios."
              },
              {
                q: "¿Es necesario tener conocimientos avanzados de Lean Manufacturing?",
                a: "No es obligatorio, pero ayuda. La herramienta está diseñada para ser intuitiva, pero conceptos como 'Cuello de Botella' o 'Balanceo de Línea' son fundamentales para interpretar correctamente los resultados y tomar decisiones de mejora."
              }
            ].map((faq, i) => (
              <div 
                key={i}
                className="group rounded-2xl border bg-background/40 p-6 backdrop-blur-xl transition-all hover:bg-background/60 hover:shadow-md"
              >
                <div className="flex gap-4">
                  <div className="mt-1 shrink-0">
                    <HelpCircle className="h-5 w-5 text-primary/60" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold tracking-tight text-foreground/90">{faq.q}</h3>
                    <p className="text-xs leading-relaxed text-foreground/60">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 px-4 py-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <span className="text-xs font-bold uppercase tracking-widest text-foreground/40">Takt Studio · 2026</span>
            <span className="text-[10px] text-foreground/30">Ingeniería de Organización Industrial · UEV</span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/privacidad" 
              className="group flex items-center gap-2 rounded-full border border-foreground/5 bg-background/40 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground/50 transition-all hover:border-primary/20 hover:bg-background hover:text-primary"
            >
              <ShieldCheck className="h-3 w-3 transition-transform group-hover:scale-110" />
              Privacidad
            </Link>
            <Link 
              href="/legal" 
              className="group flex items-center gap-2 rounded-full border border-foreground/5 bg-background/40 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground/50 transition-all hover:border-primary/20 hover:bg-background hover:text-primary"
            >
              <FileText className="h-3 w-3 transition-transform group-hover:scale-110" />
              Legal
            </Link>
          </div>

          <span className="text-[10px] text-foreground/30">Hecho con Next.js y Vercel</span>
        </div>
      </footer>
    </div>
  )
}
