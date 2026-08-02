import { setRequestLocale, getTranslations } from "next-intl/server"
import ScenarioControls from "@/components/ScenarioControls"
import StationEditor from "@/components/StationEditor"
import KpiPanel from "@/components/KpiPanel"
import TaktChart from "@/components/TaktChart"
import LineDiagram from "@/components/LineDiagram"
import InsightsPanel from "@/components/InsightsPanel"
import ImprovementPlan from "@/components/ImprovementPlan"
import CostImpactPanel from "@/components/CostImpactPanel"
import SensitivityLab from "@/components/SensitivityLab"
import MonteCarloPanel from "@/components/MonteCarloPanel"
import ConsultingBackground from "@/components/ConsultingBackground"
import SharedScenarioLoader from "@/components/SharedScenarioLoader"

export default async function SimuladorPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("simulator")

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <ConsultingBackground />
      <SharedScenarioLoader />
      <div className="relative z-10 mx-auto max-w-6xl space-y-6 px-4 pt-2 pb-8">
        <div className="page-header-rule pb-4 mb-2">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("subtitle")}
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

      {/* ── 7. Simulación Monte Carlo ───────────────────────────────────────── */}
      <MonteCarloPanel />

      {/* ── 8. Diagrama de flujo ────────────────────────────────────────────── */}
      <LineDiagram />

      {/* ── 9. Análisis interpretativo ──────────────────────────────────────── */}
      <InsightsPanel />
      </div>
    </div>
  )
}
