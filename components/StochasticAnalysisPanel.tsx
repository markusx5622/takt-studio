"use client"

import { useMemo, useState } from "react"
import { useAppStore } from "@/lib/store"
import { runMonteCarloSimulation } from "@/lib/monte-carlo"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { FlaskConical, Play, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function StochasticAnalysisPanel() {
  const { scenarios, activeScenarioId } = useAppStore()
  const activeScenario = scenarios.find((s) => s.id === activeScenarioId)

  const [simulating, setSimulating] = useState(false)
  const [results, setResults] = useState<ReturnType<typeof runMonteCarloSimulation> | null>(null)

  const handleSimulate = () => {
    if (!activeScenario) return
    setSimulating(true)
    
    // Use setTimeout to allow UI to render the loading state
    setTimeout(() => {
      const mcResults = runMonteCarloSimulation(activeScenario, 2000)
      setResults(mcResults)
      setSimulating(false)
    }, 100)
  }

  // Create histogram data when results change
  const histogramData = useMemo(() => {
    if (!results) return []
    // A real histogram would bucket the raw throughputs. 
    // Since we only kept percentiles and mean in the basic MC, 
    // we'll approximate a visualization for demonstration purposes.
    const data = []
    const min = Math.floor(results.meanThroughput - results.throughputStdDev * 3)
    const max = Math.ceil(results.meanThroughput + results.throughputStdDev * 3)
    
    for (let i = min; i <= max; i++) {
      // Normal distribution probability density function approximation
      const z = (i - results.meanThroughput) / results.throughputStdDev
      const pdf = Math.exp(-0.5 * z * z) / (results.throughputStdDev * Math.sqrt(2 * Math.PI))
      
      data.push({
        throughput: i,
        probability: Number((pdf * 100).toFixed(2)) // percentage
      })
    }
    return data
  }, [results])

  if (!activeScenario) return null

  return (
    <div className="rounded-2xl border bg-background/60 p-6 backdrop-blur-xl shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <FlaskConical className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Análisis Estocástico (Monte Carlo)</h2>
            <p className="text-sm text-muted-foreground">Simulación de probabilidad con tiempos de ciclo variables</p>
          </div>
        </div>
        <Button onClick={handleSimulate} disabled={simulating} className="gap-2">
          <Play className="h-4 w-4" />
          {simulating ? "Simulando..." : "Ejecutar Simulación (2k iteraciones)"}
        </Button>
      </div>

      {!results && !simulating && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="h-10 w-10 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground max-w-sm">Ejecuta la simulación para calcular el riesgo probabilístico de no cumplir la demanda debido a la variabilidad de la línea.</p>
        </div>
      )}

      {simulating && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
          <p className="text-sm font-medium animate-pulse text-muted-foreground">Calculando miles de escenarios posibles...</p>
        </div>
      )}

      {results && !simulating && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="col-span-1 space-y-4">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm text-muted-foreground mb-1 font-medium">Probabilidad de Éxito</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-primary">{(results.probabilityMeetsDemand * 100).toFixed(1)}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Probabilidad de cumplir la demanda de {activeScenario.demandPerDay} uds/día.</p>
            </div>
            
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm text-muted-foreground mb-1 font-medium">Throughput Promedio</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{results.meanThroughput.toFixed(1)}</span>
                <span className="text-sm font-medium text-muted-foreground">± {results.throughputStdDev.toFixed(1)} uds</span>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-4 space-y-2">
              <p className="text-sm text-muted-foreground font-medium border-b pb-2">Percentiles de Capacidad</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Pesimista (P10)</span>
                <span className="font-bold">{results.p10Throughput} uds</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Mediano (P50)</span>
                <span className="font-bold">{results.p50Throughput} uds</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Optimista (P90)</span>
                <span className="font-bold">{results.p90Throughput} uds</span>
              </div>
            </div>
          </div>

          <div className="col-span-2 rounded-xl border bg-card p-4 h-full min-h-[300px] flex flex-col">
            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Distribución de Probabilidad del Throughput</p>
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="throughput" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Probabilidad']}
                    labelFormatter={(label) => `Throughput: ${label} uds`}
                  />
                  <ReferenceLine x={activeScenario.demandPerDay} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Demanda', fill: '#ef4444', fontSize: 12 }} />
                  <Bar dataKey="probability" fill="currentColor" className="fill-primary" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
