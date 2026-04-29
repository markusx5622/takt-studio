import ScenarioControls from "@/components/ScenarioControls"
import StationEditor from "@/components/StationEditor"
import KpiPanel from "@/components/KpiPanel"
import TaktChart from "@/components/TaktChart"
import LineDiagram from "@/components/LineDiagram"
import InsightsPanel from "@/components/InsightsPanel"

export default function SimuladorPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left column — 60% */}
        <div className="space-y-6 lg:col-span-3">
          <ScenarioControls />
          <StationEditor />
        </div>

        {/* Right column — 40% */}
        <div className="space-y-6 lg:col-span-2">
          <KpiPanel />
          <TaktChart />
        </div>
      </div>

      {/* Full-width rows */}
      <LineDiagram />
      <InsightsPanel />
    </div>
  )
}
