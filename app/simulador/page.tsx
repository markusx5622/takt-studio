import ScenarioControls from "@/components/ScenarioControls"
import StationEditor from "@/components/StationEditor"
import KpiPanel from "@/components/KpiPanel"
import TaktChart from "@/components/TaktChart"
import LineDiagram from "@/components/LineDiagram"
import InsightsPanel from "@/components/InsightsPanel"
import ImprovementPlan from "@/components/ImprovementPlan"
import CostImpactPanel from "@/components/CostImpactPanel"
import SensitivityLab from "@/components/SensitivityLab"
import ConsultingBackground from "@/components/ConsultingBackground"

export default function SimuladorPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <ConsultingBackground />
      <div className="relative z-10 mx-auto max-w-6xl space-y-6 px-4 py-6">
        <div className="page-header-rule pb-4 mb-2">
          <h1 className="text-2xl font-bold tracking-tight">Simulador</h1>
          <p className="text-sm text-muted-foreground">
            Configura la línea, ajusta parámetros y observa los KPIs en tiempo real.
          </p>
        </div>
      {/* ── 1. Configuración del escenario ──────────────────────────────────── */}
      <ScenarioControls />

      {/* ── 2. Definición de estaciones ─────────────────────────────────────── */}
      <StationEditor />

      {/* ── 3. Visión cuantitativa: gráfico + KPIs ──────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TaktChart />
        <KpiPanel />
      </div>

      {/* ── 4. Propuestas de mejora ─────────────────────────────────────────── */}
      <ImprovementPlan />

      {/* ── 5. Coste e impacto estimado ─────────────────────────────────────── */}
      <CostImpactPanel />

      {/* ── 6. Laboratorio de sensibilidad ──────────────────────────────────── */}
      <SensitivityLab />

      {/* ── 6. Diagrama de flujo ────────────────────────────────────────────── */}
      <LineDiagram />

      {/* ── 7. Análisis interpretativo ──────────────────────────────────────── */}
      <InsightsPanel />
      </div>
    </div>
  )
}
