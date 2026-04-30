import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Gauge, AlertTriangle, GitCompare, ArrowRight, MoveRight } from "lucide-react"

// ─── Mock UI preview ──────────────────────────────────────────────────────────

function InterfaceMockup() {
  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-xl border bg-muted/20 shadow-2xl">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400/70" />
        <span className="h-3 w-3 rounded-full bg-amber-400/70" />
        <span className="h-3 w-3 rounded-full bg-green-400/70" />
        <span className="ml-3 text-[11px] font-medium text-muted-foreground/60 tracking-wide">
          takt-studio / simulador
        </span>
      </div>

      <div className="grid grid-cols-5 gap-0">
        {/* Left panel */}
        <div className="col-span-3 space-y-3 border-r p-4">
          {/* Scenario controls mock */}
          <div className="rounded-lg border bg-background p-3">
            <div className="mb-3 h-3 w-36 rounded bg-muted" />
            <div className="grid grid-cols-2 gap-2">
              {["Nombre", "Demanda", "Horas/turno", "Turnos"].map((label) => (
                <div key={label}>
                  <div className="mb-1 h-2 w-16 rounded bg-muted/60 text-[9px]" />
                  <div className="h-7 rounded-md border bg-muted/30" />
                </div>
              ))}
            </div>
          </div>

          {/* Station table mock */}
          <div className="rounded-lg border bg-background p-3">
            <div className="mb-3 h-3 w-28 rounded bg-muted" />
            <div className="overflow-hidden rounded-md border">
              {/* Table header */}
              <div className="grid grid-cols-5 gap-1 bg-muted/40 px-2 py-1.5">
                {["Estación", "Ciclo", "Ops", "Fallo", ""].map((h) => (
                  <div key={h} className="h-2 rounded bg-muted/60" />
                ))}
              </div>
              {/* Rows */}
              {[
                { w: "w-20", accent: false },
                { w: "w-16", accent: false },
                { w: "w-24", accent: true },
                { w: "w-18", accent: false },
              ].map(({ w, accent }, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-5 gap-1 border-t px-2 py-1.5 ${accent ? "bg-red-50 dark:bg-red-950/20" : ""}`}
                >
                  <div className={`h-2 rounded ${w} ${accent ? "bg-red-300/60" : "bg-muted/40"}`} />
                  <div className={`h-2 rounded w-8 ${accent ? "bg-red-300/60" : "bg-muted/40"}`} />
                  <div className="h-2 w-4 rounded bg-muted/40" />
                  <div className="h-2 w-6 rounded bg-muted/40" />
                  <div className={`h-2 w-3 rounded ${accent ? "bg-red-400/60" : "bg-green-400/50"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="col-span-2 space-y-3 p-4">
          {/* KPI cards mock */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Takt Time", val: "7.5", unit: "min/ud", color: "bg-primary/80" },
              { label: "Throughput", val: "64", unit: "uds/día", color: "bg-green-500/80" },
              { label: "Cuello bot.", val: "Alicatado", unit: "9.2 min", color: "bg-red-500/80" },
              { label: "Balanceo", val: "81%", unit: "eficiencia", color: "bg-amber-500/80" },
            ].map(({ label, val, unit, color }) => (
              <div key={label} className="rounded-lg border bg-background p-2.5">
                <div className="mb-1.5 h-2 w-14 rounded bg-muted/60" />
                <div className={`mb-0.5 h-5 w-12 rounded ${color}`} />
                <div className="h-1.5 w-10 rounded bg-muted/40" />
              </div>
            ))}
          </div>

          {/* Bar chart mock */}
          <div className="rounded-lg border bg-background p-3">
            <div className="mb-2 h-2.5 w-32 rounded bg-muted" />
            <div className="flex items-end gap-1.5 h-20 px-1">
              {[40, 55, 75, 95, 60, 45, 80].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${h}%`,
                    background: i === 3
                      ? "rgb(220 38 38 / 0.7)"
                      : "rgb(37 99 235 / 0.6)",
                  }}
                />
              ))}
            </div>
            {/* Takt reference line */}
            <div className="relative mt-0.5">
              <div className="absolute inset-x-0 -top-[42px] border-t-2 border-dashed border-gray-400/70" />
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
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="group rounded-xl border bg-background p-6 transition-shadow hover:shadow-md">
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
      <section className="flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-20 text-center">
        {/* Eyebrow */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Ingeniería de Organización Industrial
        </div>

        {/* Title */}
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight md:text-7xl">
          Diseña, simula y optimiza
          <br />
          <span className="text-muted-foreground/50">tu línea de producción</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-xl text-muted-foreground">
          Takt Studio te permite modelar estaciones, detectar cuellos de botella
          y comparar escenarios what-if en minutos. Sin tocar la línea real.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="gap-2 px-6">
            <Link href="/simulador">
              Probar con plantilla Monobath
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="gap-2 px-6">
            <Link href="/comparar">
              Ver comparador
            </Link>
          </Button>
        </div>

        {/* Social proof / metadata */}
        <p className="mt-6 text-xs text-muted-foreground/60">
          Cálculo en tiempo real · Sin cuenta · Sin instalación
        </p>

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
            <p className="mt-2 text-muted-foreground">
              Basado en los fundamentos de la Ingeniería de Organización Industrial
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FeatureCard
              icon={Gauge}
              title="Cálculo instantáneo"
              description="Takt time, throughput, eficiencia de balanceo y lead time se recalculan al instante mientras ajustas la línea."
            />
            <FeatureCard
              icon={AlertTriangle}
              title="Detección de cuellos de botella"
              description="Identifica automáticamente la estación que limita tu producción y recibe sugerencias concretas de mejora."
            />
            <FeatureCard
              icon={GitCompare}
              title="Comparación what-if"
              description="Duplica un escenario, cambia parámetros y compara lado a lado el impacto en KPIs antes de implementar."
            />
          </div>
        </div>
      </section>

      {/* ── PARA QUIÉN ───────────────────────────────────────────────────────── */}
      <section className="border-t px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-base leading-relaxed text-muted-foreground">
            Pensado para{" "}
            <span className="font-medium text-foreground">ingenieros de producción</span>,{" "}
            <span className="font-medium text-foreground">responsables de planta</span> y{" "}
            <span className="font-medium text-foreground">
              estudiantes de Ingeniería de Organización Industrial
            </span>{" "}
            que quieren tomar decisiones con datos antes de intervenir en la línea real.
          </p>

          {/* Metrics strip */}
          <div className="mt-12 grid grid-cols-3 divide-x rounded-xl border bg-muted/20">
            {[
              { value: "< 1 s",   label: "Tiempo de cálculo" },
              { value: "∞",       label: "Escenarios comparables" },
              { value: "0 €",     label: "Sin licencias" },
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
