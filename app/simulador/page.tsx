import ScenarioControls from "@/components/ScenarioControls"
import StationEditor from "@/components/StationEditor"
import KpiPanel from "@/components/KpiPanel"

export default function SimuladorPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left column — 60% */}
        <div className="space-y-6 lg:col-span-3">
          <ScenarioControls />
          <StationEditor />
        </div>

        {/* Right column — 40%, sticky on desktop */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-20">
            <KpiPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
