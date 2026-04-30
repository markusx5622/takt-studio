import ScenarioControls from "@/components/ScenarioControls"
import StationEditor from "@/components/StationEditor"
import KpiPanel from "@/components/KpiPanel"
import TaktChart from "@/components/TaktChart"
import LineDiagram from "@/components/LineDiagram"
import InsightsPanel from "@/components/InsightsPanel"
import ImprovementPlan from "@/components/ImprovementPlan"

export default function SimuladorPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <ScenarioControls />

      {/* ── Row 1: Station editor + KPIs ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <StationEditor />
        </div>
        <div className="lg:col-span-2">
          <KpiPanel />
        </div>
      </div>

      {/* ── Row 2: Chart + Improvement plan ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TaktChart />
        </div>
        <div className="lg:col-span-2">
          <ImprovementPlan />
        </div>
      </div>

      {/* ── Row 3: Line diagram + Insights ──────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <LineDiagram />
        </div>
        <div className="lg:col-span-2">
          <InsightsPanel />
        </div>
      </div>
    </div>
  )
}
