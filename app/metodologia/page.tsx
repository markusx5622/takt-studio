import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Clock,
  Gauge,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Activity,
  Layers,
  Timer,
  Zap,
  Euro,
  CheckCircle2,
} from "lucide-react"

function Formula({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`my-3 overflow-x-auto rounded-md border bg-muted/40 px-4 py-2.5 font-mono text-sm text-foreground/90 ${className ?? ""}`}>
      {children}
    </div>
  )
}

function KpiCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border bg-background p-5 transition-shadow hover:shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="text-sm leading-relaxed text-foreground/75">{children}</div>
    </div>
  )
}

import ConsultingBackground from "@/components/ConsultingBackground"

export default function MetodologiaPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col bg-slate-50/50">
      <ConsultingBackground />
      {/* ── Encabezado ───────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-4 pb-8 pt-4 text-center md:pt-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Metodología y supuestos del modelo
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-foreground/70 sm:text-lg">
            Cómo calcula Takt Studio sus métricas y qué limitaciones tiene el modelo analítico.
          </p>
        </div>
      </section>

      <div className="relative z-10 mx-auto w-full max-w-4xl space-y-8 px-4 pt-2 pb-20">
        {/* ── Introducción ────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Qué es Takt Studio metodológicamente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-foreground/75">
            <p>
              Takt Studio es un modelo analítico determinista de líneas de producción
              industrializada. Parte de los tiempos de ciclo, el número de operarios, la
              demanda y los turnos para calcular métricas operativas clave: takt time,
              throughput, lead time y eficiencia de balanceo.
            </p>
            <p>
              La herramienta no es una simulación de eventos discretos (DES) completa ni una
              validación financiera definitiva. Su valor está en prevalidar decisiones de
              mejora antes de intervenir en planta, proporcionando una primera aproximación
              cuantitativa rápida y rigurosa.
            </p>
            <div className="flex items-start gap-2 rounded-md border border-amber-200/60 bg-amber-50/40 px-3 py-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-800/80">
                Los resultados son orientativos. Para decisiones reales de inversión, deben
                calibrarse con datos operativos y financieros reales de la línea.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── KPIs operativos ─────────────────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">KPIs operativos</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <KpiCard icon={Clock} title="Takt Time">
              <p>
                Ritmo al que hay que producir para satisfacer la demanda. Expresa el tiempo
                máximo permitido por unidad.
              </p>
              <Formula>taktTime = (shiftHours × 60 × shiftsPerDay) / demandPerDay</Formula>
              <p className="text-xs text-muted-foreground">
                Un takt time bajo indica una demanda agresiva; un takt time alto, una demanda
                relajada.
              </p>
            </KpiCard>

            <KpiCard icon={Timer} title="Tiempo de ciclo efectivo">
              <p>
                Tiempo real que consume una estación por unidad, considerando operarios
                paralelos y tasa de reproceso.
              </p>
              <Formula>effectiveCycle = (cycleTimeMin / operators) × (1 + failureRate)</Formula>
              <p className="text-xs text-muted-foreground">
                Más operarios reducen el tiempo efectivo; más fallos lo aumentan por el
                retrabajo inherente.
              </p>
            </KpiCard>

            <KpiCard icon={Layers} title="Cuello de botella">
              <p>
                Estación que limita el ritmo global de la línea: aquella con el mayor tiempo
                de ciclo efectivo.
              </p>
              <Formula>bottleneck = max(effectiveCycle₁, effectiveCycle₂, …)</Formula>
              <p className="text-xs text-muted-foreground">
                Aliviar el bottleneck es la acción de mayor impacto sobre el throughput global.
              </p>
            </KpiCard>

            <KpiCard icon={TrendingUp} title="Throughput">
              <p>
                Unidades máximas que la línea puede producir por día, limitada por el
                bottleneck.
              </p>
              <Formula>throughput = ⌊availableTimeMin / bottleneckEffectiveCycle⌋</Formula>
              <p className="text-xs text-muted-foreground">
                El throughput nunca supera la capacidad del cuello de botella, independientemente
                del rendimiento del resto de estaciones.
              </p>
            </KpiCard>

            <KpiCard icon={ArrowRight} title="Lead Time">
              <p>
                Tiempo total estimado que tarda una unidad en recorrer toda la línea desde la
                entrada hasta la salida.
              </p>
              <Formula>leadTime = Σ effectiveCycleᵢ</Formula>
              <p className="text-xs text-muted-foreground">
                No modela colas ni esperas en buffer; es una aproximación del tiempo de
                recorrido puro.
              </p>
            </KpiCard>

            <KpiCard icon={Gauge} title="Eficiencia de balanceo">
              <p>
                Medida de qué tan equilibrados están los tiempos efectivos entre estaciones.
              </p>
              <Formula>balance = Σ effectiveCycleᵢ / (nStations × maxEffectiveCycle)</Formula>
              <p className="text-xs text-muted-foreground">
                Un valor de 1.0 indica una línea perfectamente balanceada. Valores por debajo
                de 0.7 sugieren oportunidad de redistribución de cargas.
              </p>
            </KpiCard>
          </div>
        </section>

        {/* ── Capa económica ──────────────────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Euro className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">Capa económica</h2>
          </div>
          <Card>
            <CardContent className="space-y-4 pt-6 text-sm leading-relaxed text-foreground/75">
              <p>
                La capa económica de Takt Studio traduce las métricas operativas a estimaciones
                de impacto financiero bajo supuestos configurables por escenario.
              </p>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Costes operativos diarios
                </h4>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="rounded-md border bg-muted/30 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Laboral</p>
                    <Formula className="my-1.5 text-xs">operarios × horas × turnos × costeHora</Formula>
                  </div>
                  <div className="rounded-md border bg-muted/30 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Turnos</p>
                    <Formula className="my-1.5 text-xs">turnos × costeFijoTurno</Formula>
                  </div>
                  <div className="rounded-md border bg-muted/30 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Reproceso</p>
                    <Formula className="my-1.5 text-xs">uds × tasaFallo × costeReproceso</Formula>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Proxy de margen
                </h4>
                <p>
                  Diferencia entre la contribución generada por las unidades servidas y el coste
                  operativo total diario.
                </p>
                <Formula>profitProxy = (udsServidas × margenUnidad) − costeOperativoTotal</Formula>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Impacto neto de una recomendación
                </h4>
                <p>
                  Para cada acción de mejora propuesta, se calcula el cambio estimado en
                  contribución menos el cambio en costes operativos.
                </p>
                <Formula>netImpact = Δcontribución − Δlabor − Δturnos − Δreproceso</Formula>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Payback
                </h4>
                <p>
                  Si la recomendación conlleva una inversión inicial one-off (mejora de método o
                  de calidad), se estima el tiempo de recuperación.
                </p>
                <Formula>payback = inversiónInicial / impactoNetoDiario</Formula>
              </div>

              <div className="flex items-start gap-2 rounded-md border border-amber-200/60 bg-amber-50/40 px-3 py-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-xs text-amber-800/80">
                  La capa económica es una estimación orientativa bajo supuestos configurables.
                  No sustituye un análisis financiero detallado ni la validación contable real de
                  la empresa.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Supuestos y limitaciones ────────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">Supuestos y limitaciones</h2>
          </div>
          <Card>
            <CardContent className="space-y-3 pt-6">
              {[
                {
                  label: "Modelo determinista",
                  text: "El cálculo es analítico y no modela la variabilidad estocástica del tiempo de ciclo, ausencias ni fallos aleatorios.",
                },
                {
                  label: "Sin DES completa",
                  text: "No es una simulación de eventos discretos (DES). No modela colas, buffers ni acumulación de WIP entre estaciones.",
                },
                {
                  label: "Sin secuenciación compleja",
                  text: "No modela rutas alternativas, paralelismo complejo ni dependencias de secuencia entre estaciones.",
                },
                {
                  label: "Bottleneck aproximado",
                  text: "El cuello de botella se identifica como la estación con mayor tiempo de ciclo efectivo. En la realidad, el constraint puede depender también de políticas de WIP, turnos escalonados o materiales.",
                },
                {
                  label: "Capa económica orientativa",
                  text: "Los costes, márgenes e impactos son estimaciones configurables. Deben calibrarse con datos contables y operativos reales antes de usarse para decisiones de inversión.",
                },
                {
                  label: "Lead time simplificado",
                  text: "El lead time es la suma de tiempos efectivos. No incluye tiempos de espera en cola ni tiempos de transporte entre estaciones.",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 rounded-md border bg-muted/20 px-3 py-2.5">
                  <Badge variant="outline" className="mt-0.5 shrink-0 text-[10px]">
                    {item.label}
                  </Badge>
                  <p className="text-xs leading-relaxed text-foreground/70">{item.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* ── Nota de uso profesional ─────────────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Nota de uso profesional</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-foreground/75">
            <p>
              El valor de Takt Studio está en ofrecer una primera aproximación cuantitativa
              rápida y consistente para prevalidar decisiones de mejora antes de intervenir en
              la línea real. Permite descartar opciones inviables, priorizar intervenciones con
              mayor impacto operativo y respaldar propuestas con números.
            </p>
            <p className="mt-3">
              Para decisiones reales de inversión, reorganización de planta o contratación,
              los resultados de Takt Studio deben complementarse con:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-foreground/70">
              <li>Validación operativa in situ (observación directa, cronometraje)</li>
              <li>Análisis financiero detallado con datos contables reales</li>
              <li>Simulación DES si la complejidad de la línea lo justifica</li>
              <li>Juicio del equipo de ingeniería y dirección de producción</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
