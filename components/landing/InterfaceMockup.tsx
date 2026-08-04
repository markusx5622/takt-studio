import { useTranslations } from "next-intl"
import {
  GitCompare,
  Layers,
  BarChart3,
  FileDown,
  Zap,
  Settings2,
  ScanSearch,
  History,
} from "lucide-react"

// ─── Interface mockup ──────────────────────────────────────────────────────────

const KPI_META = [
  { bar: "bg-blue-500", status: "up" },
  { bar: "bg-emerald-500", status: "down" },
  { bar: "bg-red-500", status: "warning" },
  { bar: "bg-amber-400", status: "up" },
]

export default function InterfaceMockup() {
  const t = useTranslations("landing.mockup")
  const kpis = (t.raw("kpis") as { label: string; value: string; unit: string; trend: string }[]).map(
    (k, i) => ({ ...k, ...KPI_META[i] })
  )
  const stations = t.raw("stations") as { name: string; h: number; bottleneck: boolean }[]

  return (
    <div aria-hidden="true" className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border bg-background/60 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] backdrop-blur-xl transition-all duration-700 hover:scale-[1.015] hover:shadow-[0_40px_80px_-12px_rgba(0,0,0,0.18)] hover:border-primary/60">
      {/* Window chrome / Top bar */}
      <div className="flex items-center gap-4 border-b bg-muted/40 px-4 py-3">
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57] shadow-sm" />
          <span className="h-3 w-3 rounded-full bg-[#FEBC2E] shadow-sm" />
          <span className="h-3 w-3 rounded-full bg-[#28C840] shadow-sm" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex h-7 w-full max-w-sm items-center gap-2 rounded-lg border bg-background/50 px-3 text-[10px] text-muted-foreground/60 backdrop-blur-sm">
            <ScanSearch className="h-3 w-3" />
            <span>takt-studio.vercel.app/simulador — {t("prototype")}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Settings2 className="h-3 w-3 text-primary" />
          </div>
          <div className="h-6 w-12 rounded-full bg-muted/60 border border-border flex items-center justify-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[8px] font-bold text-foreground/60">LIVE</span>
          </div>
        </div>
      </div>

      <div className="flex h-[440px] sm:h-[460px] md:h-[480px]">
        {/* Sidebar Mini */}
        <div className="hidden w-16 flex-col items-center gap-6 border-r bg-muted/20 py-8 md:flex">
          <div className="rounded-xl bg-primary p-2 shadow-lg shadow-primary/20">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <GitCompare className="h-5 w-5 text-muted-foreground/50" />
          <Layers className="h-5 w-5 text-muted-foreground/50" />
          <History className="h-5 w-5 text-muted-foreground/50" />
          <div className="mt-auto">
            <Zap className="h-5 w-5 text-amber-400" />
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Header Area */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight">{t("dashboardTitle")}</h3>
              <p className="text-[10px] text-muted-foreground">{t("dashboardSub")}</p>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-24 rounded-md border bg-background/50 flex items-center justify-center text-[10px] font-medium gap-2">
                <FileDown className="h-3 w-3" /> {t("report")}
              </div>
              <div className="h-8 w-24 rounded-md bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                {t("simulate")}
              </div>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {kpis.map(({ label, value, unit, bar, trend, status }) => (
              <div
                key={label}
                className="group relative rounded-xl border bg-background/40 p-3.5 transition-all hover:bg-background/60 hover:shadow-md hover:border-primary/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70">{label}</p>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                    status === 'up' ? 'bg-emerald-100 text-emerald-600' :
                    status === 'down' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {trend}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="text-xl font-bold tracking-tight">{value}</p>
                  <p className="text-[10px] text-muted-foreground/60 font-medium">{unit}</p>
                </div>
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted/50">
                  <div className={`h-full rounded-full ${bar} opacity-70 transition-all duration-1000 w-3/4`} />
                </div>
              </div>
            ))}
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 sm:h-48">
            {/* Bar chart - Simulation */}
            <div className="sm:col-span-3 rounded-xl border bg-background/40 p-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("chartTitle")}</p>
                <div className="flex gap-2">
                   <div className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-blue-500/60" /><span className="text-[8px] text-muted-foreground">{t("standard")}</span></div>
                   <div className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-red-500/80" /><span className="text-[8px] text-muted-foreground">Bottleneck</span></div>
                </div>
              </div>
              <div className="relative flex items-end gap-1.5 h-24">
                {stations.map(({ name, h, bottleneck }) => (
                  <div key={name} className="flex h-full flex-1 flex-col items-center justify-end gap-1 group">
                    <div
                      className={`w-full rounded-t-sm transition-all duration-700 ${
                        bottleneck ? "bg-red-500/90 shadow-[0_0_12px_rgba(239,68,68,0.3)]" : "bg-blue-500/50"
                      }`}
                      style={{ height: `${h}%` }}
                    />
                    <span className="text-[7px] font-bold text-muted-foreground/60 truncate max-w-full">{name}</span>
                  </div>
                ))}
                {/* Takt Line */}
                <div className="absolute inset-x-0 border-t border-primary/40 border-dashed z-10" style={{ bottom: "75%" }}>
                  <span className="absolute -top-2 right-0 bg-background/80 px-1 text-[6px] font-bold text-primary tracking-widest">TAKT 7.5s</span>
                </div>
              </div>
            </div>

            {/* Performance Mini Card */}
            <div className="sm:col-span-2 rounded-xl border bg-background/40 p-4 flex flex-col justify-between min-h-[140px]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{t("oee")}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-primary tracking-tighter">92.4%</span>
                  <span className="text-[10px] text-emerald-500 font-bold">↑ 2.1%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-medium">
                  <span className="text-muted-foreground">{t("availability")}</span>
                  <span>98%</span>
                </div>
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[98%]" />
                </div>
                <div className="flex justify-between text-[9px] font-medium">
                  <span className="text-muted-foreground">{t("performance")}</span>
                  <span>94%</span>
                </div>
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[94%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
