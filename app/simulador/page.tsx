import ScenarioControls from "@/components/ScenarioControls"
import StationEditor from "@/components/StationEditor"

export default function SimuladorPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <ScenarioControls />
      <StationEditor />
    </div>
  )
}
