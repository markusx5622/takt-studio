import ScenarioControls from "@/components/ScenarioControls"
import StationEditor from "@/components/StationEditor"
import KpiPanel from "@/components/KpiPanel"
import TaktChart from "@/components/TaktChart"
import LineDiagram from "@/components/LineDiagram"
import InsightsPanel from "@/components/InsightsPanel"
import ImprovementPlan from "@/components/ImprovementPlan"
import CostImpactPanel from "@/components/CostImpactPanel"
import SensitivityLab from "@/components/SensitivityLab"

export default function SimuladorPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
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
  )
}
