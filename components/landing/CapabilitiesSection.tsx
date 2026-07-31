import {
  Gauge,
  GitCompare,
  Layers,
  BarChart3,
  FileDown,
  Zap,
} from "lucide-react"

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

export default function CapabilitiesSection() {
  return (
<section className="reveal relative z-10 px-4 py-20 md:py-24">
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
  )
}
