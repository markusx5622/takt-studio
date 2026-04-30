import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Gauge, AlertTriangle, GitCompare, ArrowRight } from "lucide-react"

// ─── Interface mockup ──────────────────────────────────────────────────────────

function InterfaceMockup() {
  const kpis = [
    { label: "Takt Time",  value: "7.5",        unit: "min/ud",   bar: "bg-blue-500",  barW: "w-full" },
    { label: "Throughput", value: "64",          unit: "uds/día",  bar: "bg-green-500", barW: "w-4/5"  },
    { label: "Cuello bot.",value: "Alicatado",   unit: "9.2 min",  bar: "bg-red-500",   barW: "w-full" },
    { label: "Balanceo",   value: "81%",         unit: "efic.",    bar: "bg-amber-400", barW: "w-4/5"  },
  ]

  const stations = [
    { name: "Replanteo",      h: 55,  bottleneck: false },
    { name: "Tabiquería",     h: 68,  bottleneck: false },
    { name: "Alicatado",      h: 100, bottleneck: true  },
    { name: "Electricidad",   h: 72,  bottleneck: false },
    { name: "Sanitarios",     h: 60,  bottleneck: false },
    { name: "Pintura",        h: 48,  bottleneck: false },
    { name: "Control final",  h: 40,  bottleneck: false },
  ]

  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-xl border bg-background shadow-2xl">
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
            <div key={label} className="rounded-lg border bg-muted/20 p-2.5">
              <p className="mb-1 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70">
                {label}
              </p>
              <p className="text-sm font-bold leading-none">{value}</p>
              <p className="mb-1.5 text-[9px] text-muted-foreground/60">{unit}</p>
              <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${bar} ${barW} opacity-70`} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {/* Bar chart */}
          <div className="col-span-2 rounded-lg border bg-muted/20 p-3">
            <p className="mb-2 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70">
              Ciclo efectivo vs Takt
            </p>
            <div className="relative flex items-end gap-1" style={{ height: 64 }}>
              {stations.map(({ name, h, bottleneck }) => (
                <div
                  key={name}
                  className={`flex-1 rounded-t transition-all ${
                    bottleneck ? "bg-red-500/75" : "bg-blue-500/55"
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
              {/* Takt reference line at ~76% */}
              <div
                className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-foreground/30"
                style={{ bottom: "76%" }}
              />
            </div>
          </div>

          {/* Line diagram */}
          <div className="col-span-3 rounded-lg border bg-muted/20 p-3">
            <p className="mb-2 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70">
              Diagrama de línea
            </p>
            <div className="flex items-center gap-1 overflow-hidden">
              {/* ENTRADA */}
              <div className="flex shrink-0 flex-col items-center gap-0.5 rounded border border-dashed border-muted-foreground/30 px-1.5 py-1">
                <div className="h-1.5 w-1.5 rounded-sm bg-muted-foreground/30" />
                <span className="text-[7px] font-bold uppercase tracking-widest text-muted-foreground/40">In</span>
              </div>

              {stations.map(({ name, bottleneck }, i) => (
                <div key={name} className="flex shrink-0 items-center gap-1">
                  <div className="text-[8px] text-muted-foreground/30">›</div>
                  <div
                    className={`rounded border px-1.5 py-1 ${
                      bottleneck
                        ? "border-red-400/70 bg-red-50 dark:bg-red-950/30"
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
      className="animate-fade-up rounded-xl border bg-background p-6 transition-shadow hover:shadow-md"
      style={{ animationDelay: delay }}
    >
      <div className="mb-4 inline-flex rounded-lg border bg-muted/50 p-2.5">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="mb-2 text-base font-semibold tracking-tight">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 pb-16 pt-20 text-center"
        style={{
          backgroundImage: "radial-gradient(circle, #00000008 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {/* Eyebrow */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Ingeniería de Organización Industrial
        </div>

        {/* Title */}
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight md:text-7xl">
          Diseña, simula y optimiza
          <br />
          <span className="text-muted-foreground/40">tu línea de producción</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-xl text-muted-foreground">
          Takt Studio te permite modelar estaciones, detectar cuellos de botella
          y comparar escenarios <em>what-if</em> en minutos.{" "}
          <span className="text-foreground/70">Sin tocar la línea real.</span>
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="gap-2 px-6 shadow-md">
            <Link href="/simulador">
              Probar con plantilla Monobath
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="gap-2 px-6 bg-background/80 backdrop-blur-sm">
            <Link href="/comparar">Ver comparador</Link>
          </Button>
        </div>

        {/* Metadata strip */}
        <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground/50">
          <span>Cálculo en tiempo real</span>
          <span className="h-px w-4 bg-border" />
          <span>Sin cuenta</span>
          <span className="h-px w-4 bg-border" />
          <span>Sin instalación</span>
        </div>

        {/* UI Mockup */}
        <div className="mt-16 w-full px-0 sm:px-4">
          <InterfaceMockup />
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section className="border-t bg-muted/20 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Todo lo que necesitas para optimizar tu línea
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Basado en los fundamentos de la Ingeniería de Organización Industrial
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FeatureCard
              icon={Gauge}
              title="Cálculo instantáneo"
              description="Takt time, throughput, eficiencia de balanceo y lead time se recalculan al instante mientras ajustas la línea."
              delay="0ms"
            />
            <FeatureCard
              icon={AlertTriangle}
              title="Detección de cuellos de botella"
              description="Identifica automáticamente la estación que limita tu producción y recibe sugerencias concretas de mejora."
              delay="100ms"
            />
            <FeatureCard
              icon={GitCompare}
              title="Comparación what-if"
              description="Duplica un escenario, cambia parámetros y compara lado a lado el impacto en KPIs antes de implementar."
              delay="200ms"
            />
          </div>
        </div>
      </section>

      {/* ── PARA QUIÉN ───────────────────────────────────────────────────────── */}
      <section className="border-t px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-base leading-relaxed text-muted-foreground">
            Pensado para{" "}
            <span className="font-semibold text-foreground">ingenieros de producción</span>,{" "}
            <span className="font-semibold text-foreground">responsables de planta</span> y{" "}
            <span className="font-semibold text-foreground">
              estudiantes de Ingeniería de Organización Industrial
            </span>{" "}
            que quieren tomar decisiones con datos antes de intervenir en la línea real.
          </p>

          {/* Metrics strip */}
          <div className="mt-12 grid grid-cols-3 divide-x rounded-xl border bg-muted/20">
            {[
              { value: "< 1 s", label: "Tiempo de cálculo" },
              { value: "∞",     label: "Escenarios comparables" },
              { value: "0 €",   label: "Sin licencias" },
            ].map(({ value, label }) => (
              <div key={label} className="px-6 py-5 text-center">
                <p className="text-2xl font-bold tracking-tight">{value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="border-t px-4 py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <span className="font-medium">Takt Studio · 2026</span>
          <span className="text-center">
            Desarrollado por Markus · Ingeniería de Organización Industrial ·{" "}
            Universidad Europea de Valencia
          </span>
          <span>Hecho con Next.js y desplegado en Vercel</span>
        </div>
      </footer>

    </div>
  )
}
