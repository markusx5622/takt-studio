"use client"

import { useMemo, useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { useTaktStore, useHydrated } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  validateExportPayload,
  downloadJsonFile,
} from "@/lib/import-export"
import type { ValidationError } from "@/lib/import-export"
import type { ExportPayload } from "@/types"
import {
  ArrowRight,
  Download,
  Upload,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  FolderOutput,
  FolderInput,
  Info,
  Database,
  Layers,
  History,
  ShieldCheck,
  Zap,
} from "lucide-react"
import ConsultingBackground from "@/components/ConsultingBackground"

// ─── Format helpers ────────────────────────────────────────────────────────────

function fmtDate(iso: string, locale: string) {
  const d = new Date(iso)
  return d.toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ─── Error translation ─────────────────────────────────────────────────────────

function translateError(
  t: (key: string, values?: Record<string, string | number>) => string,
  error: ValidationError
): string {
  const values: Record<string, string | number> = { ...(error.values ?? {}) }
  if (error.inner) {
    values.reason = translateError(t, error.inner)
  }
  return t(error.code, values)
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function ImportExportSkeleton() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <ConsultingBackground />
      <div className="relative z-10 mx-auto max-w-5xl space-y-6 px-4 pt-2 pb-8">
        <div className="page-header-rule pb-4 mb-2">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  )
}

// ─── Import preview card ───────────────────────────────────────────────────────

function ImportPreview({ payload }: { payload: ExportPayload }) {
  const t = useTranslations("importExport")
  const locale = useLocale()

  const isScenario = payload.exportType === "scenario"
  const scenarioData = isScenario ? payload.scenario : payload.snapshot.scenarioData

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 p-5 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider shadow-2xs",
              isScenario
                ? "border-blue-300 bg-blue-50 text-blue-800"
                : "border-purple-300 bg-purple-50 text-purple-800"
            )}
          >
            {isScenario ? t("previewTypeScenario") : t("previewTypeSnapshot")}
          </Badge>
          <span className="text-[11px] font-medium text-slate-400">
            v{payload.appVersion} · {fmtDate(payload.exportedAt, locale)}
          </span>
        </div>

        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
          <ShieldCheck className="mr-1 h-3 w-3" />
          JSON Schema OK
        </Badge>
      </div>

      <h4 className="mt-3 text-base font-bold tracking-tight text-slate-800">
        {isScenario ? payload.scenario.name : payload.snapshot.name}
      </h4>

      {/* Details Grid */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-xl border border-slate-100 bg-white p-2.5">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block">Estaciones</span>
          <p className="text-xs font-bold text-slate-800">{scenarioData.stations.length}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-2.5">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block">Demanda</span>
          <p className="text-xs font-bold text-slate-800">{scenarioData.demandPerDay} <span className="text-[10px] text-slate-500 font-normal">uds/día</span></p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-2.5">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block">Turnos</span>
          <p className="text-xs font-bold text-slate-800">{scenarioData.shiftHours}h × {scenarioData.shiftsPerDay}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-2.5">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block">Asignación</span>
          <p className="text-xs font-bold text-slate-800">{scenarioData.allocationPercent ?? 100}%</p>
        </div>
      </div>

      {!isScenario && payload.snapshot.note && (
        <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/60 p-2.5 text-xs text-amber-900 italic">
          "{payload.snapshot.note}"
        </div>
      )}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ImportExportPage() {
  const t = useTranslations("importExport")
  const locale = useLocale()
  const hydrated = useHydrated()

  const scenarios = useTaktStore((s) => s.scenarios)
  const snapshots = useTaktStore((s) => s.snapshots)
  const exportScenarioById = useTaktStore((s) => s.exportScenarioById)
  const exportSnapshotById = useTaktStore((s) => s.exportSnapshotById)
  const importScenarioFromPayload = useTaktStore((s) => s.importScenarioFromPayload)
  const importSnapshotAsScenario = useTaktStore((s) => s.importSnapshotAsScenario)

  const [selectedScenarioId, setSelectedScenarioId] = useState("")
  const [selectedSnapshotId, setSelectedSnapshotId] = useState("")
  const [importName, setImportName] = useState("")
  const [isDragging, setIsDragging] = useState(false)

  const [importStatus, setImportStatus] = useState<
    | { type: "idle" }
    | { type: "validating" }
    | { type: "valid"; payload: ExportPayload }
    | { type: "invalid"; error: ValidationError }
    | { type: "success"; scenarioName: string }
  >({ type: "idle" })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeScenario = useMemo(
    () => scenarios.find((s) => s.id === selectedScenarioId),
    [scenarios, selectedScenarioId]
  )

  const activeSnapshot = useMemo(
    () => snapshots.find((s) => s.id === selectedSnapshotId),
    [snapshots, selectedSnapshotId]
  )

  function handleExportScenario() {
    if (!selectedScenarioId) return
    const payload = exportScenarioById(selectedScenarioId)
    if (payload) downloadJsonFile(payload)
  }

  function handleExportSnapshot() {
    if (!selectedSnapshotId) return
    const payload = exportSnapshotById(selectedSnapshotId)
    if (payload) downloadJsonFile(payload)
  }

  function handleExportAllBackup() {
    const state = useTaktStore.getState()
    const backupPayload = {
      exportType: "fullBackup",
      appVersion: "0.1.0",
      exportedAt: new Date().toISOString(),
      scenariosCount: state.scenarios.length,
      snapshotsCount: state.snapshots.length,
      scenarios: state.scenarios,
      snapshots: state.snapshots,
    }
    const json = JSON.stringify(backupPayload, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `takt-studio-full-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleFileSelect(file: File | null) {
    if (!file) {
      setImportStatus({ type: "idle" })
      return
    }

    setImportStatus({ type: "validating" })

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const parsed = JSON.parse(text)

        // Handle full backup payload gracefully
        if (parsed.exportType === "fullBackup" && Array.isArray(parsed.scenarios)) {
          // Import first scenario from backup payload
          const firstScenario = parsed.scenarios[0]
          if (firstScenario) {
            const singlePayload: ExportPayload = {
              exportType: "scenario",
              appVersion: parsed.appVersion ?? "0.1.0",
              exportedAt: parsed.exportedAt ?? new Date().toISOString(),
              scenario: firstScenario,
            }
            const result = validateExportPayload(singlePayload)
            if (result.success) {
              setImportStatus({ type: "valid", payload: result.payload })
              return
            }
          }
        }

        const result = validateExportPayload(parsed)
        if (result.success) {
          setImportStatus({ type: "valid", payload: result.payload })
        } else {
          setImportStatus({ type: "invalid", error: result.error })
        }
      } catch {
        setImportStatus({ type: "invalid", error: { code: "invalidJson" } })
      }
    }
    reader.onerror = () => {
      setImportStatus({ type: "invalid", error: { code: "readError" } })
    }
    reader.readAsText(file)
  }

  function handleImport() {
    if (importStatus.type !== "valid") return
    const payload = importStatus.payload
    const name = importName.trim() || undefined

    if (payload.exportType === "scenario") {
      importScenarioFromPayload(payload, name)
      setImportStatus({ type: "success", scenarioName: name || payload.scenario.name })
    } else {
      importSnapshotAsScenario(payload, name)
      setImportStatus({ type: "success", scenarioName: name || `${payload.snapshot.name}${t("importedSuffix")}` })
    }

    setImportName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function handleResetImport() {
    setImportStatus({ type: "idle" })
    setImportName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (!hydrated) return <ImportExportSkeleton />

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <ConsultingBackground />
      <div className="relative z-10 mx-auto max-w-5xl space-y-6 px-4 pt-2 pb-24 md:pb-8">
        
        {/* Header */}
        <div className="page-header-rule pb-4 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-full shadow-2xs">
            <Link href="/simulador" className="flex items-center gap-1.5 text-xs font-semibold">
              {t("goToSimulator")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Top KPI Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-slate-200/80 bg-gradient-to-br from-white via-white to-blue-50/30 shadow-2xs">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Escenarios en Memoria
                </span>
                <p className="text-xl font-black text-slate-800 tracking-tight">
                  {scenarios.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-gradient-to-br from-white via-white to-purple-50/30 shadow-2xs">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                <History className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Snapshots Guardados
                </span>
                <p className="text-xl font-black text-slate-800 tracking-tight">
                  {snapshots.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-gradient-to-br from-white via-white to-emerald-50/30 shadow-2xs">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Compatibilidad
                </span>
                <p className="text-xs font-bold text-slate-800 tracking-tight">
                  JSON v0.1.0 (Full Standard)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Grid Cards */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          
          {/* Card 1: Export Scenario */}
          <Card className="flex flex-col border-slate-200/80 bg-white shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                <FolderOutput className="h-4 w-4 text-blue-600" />
                {t("exportScenarioTitle")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("exportScenarioDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between space-y-4 pt-1">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t("scenarioLabel")}
                  </label>
                  <Select value={selectedScenarioId} onValueChange={setSelectedScenarioId}>
                    <SelectTrigger className="w-full font-semibold border-slate-200 bg-white text-xs">
                      <SelectValue placeholder={t("selectScenario")} />
                    </SelectTrigger>
                    <SelectContent>
                      {scenarios.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="text-xs font-medium">
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {activeScenario && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs text-slate-600">
                    <p className="font-medium">
                      {t("scenarioSummary", {
                        stations: activeScenario.stations.length,
                        demand: activeScenario.demandPerDay,
                        hours: activeScenario.shiftHours,
                        shifts: activeScenario.shiftsPerDay,
                      })}
                    </p>
                  </div>
                )}
              </div>

              <Button
                size="sm"
                className="w-full gap-2 font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-2xs h-10"
                disabled={!selectedScenarioId}
                onClick={handleExportScenario}
              >
                <Download className="h-4 w-4" />
                {t("exportScenarioTitle")}
              </Button>
            </CardContent>
          </Card>

          {/* Card 2: Export Snapshot */}
          <Card className="flex flex-col border-slate-200/80 bg-white shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                <FolderOutput className="h-4 w-4 text-purple-600" />
                {t("exportSnapshotTitle")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("exportSnapshotDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between space-y-4 pt-1">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t("snapshotLabel")}
                  </label>
                  <Select value={selectedSnapshotId} onValueChange={setSelectedSnapshotId}>
                    <SelectTrigger className="w-full font-semibold border-slate-200 bg-white text-xs">
                      <SelectValue placeholder={t("selectSnapshot")} />
                    </SelectTrigger>
                    <SelectContent>
                      {snapshots.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="text-xs font-medium">
                          {s.name} {s.isBaseline ? t("baselineSuffix") : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {activeSnapshot && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs text-slate-600">
                    <p className="font-medium">
                      {t("snapshotSummaryStations", { count: activeSnapshot.scenarioData.stations.length })} ·{" "}
                      {fmtDate(activeSnapshot.createdAt, locale)}
                      {activeSnapshot.isBaseline && ` · ${t("baselineTag")}`}
                    </p>
                  </div>
                )}
              </div>

              <Button
                size="sm"
                className="w-full gap-2 font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-2xs h-10"
                disabled={!selectedSnapshotId}
                onClick={handleExportSnapshot}
              >
                <Download className="h-4 w-4" />
                {t("exportSnapshotTitle")}
              </Button>
            </CardContent>
          </Card>

          {/* Card 3: Full Backup Bundle */}
          <Card className="flex flex-col border-emerald-200/80 bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/20 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-emerald-950">
                <Database className="h-4 w-4 text-emerald-600" />
                {t("exportAllTitle")}
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                {t("exportAllDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between space-y-4 pt-1">
              <div className="rounded-xl border border-emerald-100 bg-white/80 p-3 text-xs text-emerald-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  Copia de seguridad completa
                </p>
                <p className="text-[11px] text-slate-500">
                  Empaqueta {scenarios.length} escenarios y {snapshots.length} snapshots en un solo JSON de restauración global.
                </p>
              </div>

              <Button
                size="sm"
                className="w-full gap-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-2xs h-10"
                onClick={handleExportAllBackup}
              >
                <Database className="h-4 w-4" />
                {t("exportAllButton")}
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Interactive Dropzone Import Card */}
        <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
              <FolderInput className="h-4 w-4 text-blue-600" />
              {t("importTitle")}
            </CardTitle>
            <CardDescription className="text-xs">
              {t("importDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            
            {/* Interactive Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setIsDragging(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                const file = e.dataTransfer.files?.[0]
                if (file) handleFileSelect(file)
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 transition-all duration-200 text-center cursor-pointer",
                isDragging
                  ? "border-blue-500 bg-blue-50/80 scale-[1.01]"
                  : importStatus.type === "valid"
                  ? "border-emerald-300 bg-emerald-50/30"
                  : importStatus.type === "invalid"
                  ? "border-rose-300 bg-rose-50/30"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 border border-slate-200">
                <FileJson className="h-6 w-6 text-slate-600" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  {isDragging
                    ? t("dropActiveNotice")
                    : importStatus.type === "validating"
                    ? t("dropValidating")
                    : importStatus.type === "valid"
                    ? t("dropValid")
                    : importStatus.type === "invalid"
                    ? t("dropInvalid")
                    : t("dropIdle")}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Soporta archivos .json exportados desde Takt Studio</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              />

              {importStatus.type !== "success" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-xl text-xs font-semibold border-slate-200 bg-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                >
                  <Upload className="h-3.5 w-3.5" />
                  {t("selectFile")}
                </Button>
              )}
            </div>

            {/* Validation Feedback Alert */}
            {importStatus.type === "invalid" && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                <p className="text-xs font-medium text-rose-800">
                  {translateError((key, values) => t(`errors.${key}`, values), importStatus.error)}
                </p>
              </div>
            )}

            {/* Valid Payload Preview */}
            {importStatus.type === "valid" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <p className="text-xs font-bold text-emerald-800">{t("validReady")}</p>
                </div>

                <ImportPreview payload={importStatus.payload} />

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t("importNameLabel")}
                  </label>
                  <Input
                    placeholder={t("importNamePlaceholder")}
                    value={importName}
                    onChange={(e) => setImportName(e.target.value)}
                    className="h-10 text-xs border-slate-200 bg-white"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" className="gap-2 font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-5" onClick={handleImport}>
                    <ArrowRight className="h-4 w-4" />
                    {t("importButton")}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl h-10 border-slate-200" onClick={handleResetImport}>
                    {t("cancel")}
                  </Button>
                </div>
              </div>
            )}

            {/* Success State Actions */}
            {importStatus.type === "success" && (
              <div className="space-y-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 via-white to-white p-5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <p className="text-sm font-bold text-emerald-950">
                    {t("successMessage", { name: importStatus.scenarioName })}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" className="gap-2 font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9" asChild>
                    <Link href="/simulador">
                      {t("goToSimulator")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 font-semibold border-slate-200 rounded-xl h-9" asChild>
                    <Link href="/comparar">
                      {t("goToCompare")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-xl h-9 text-slate-500" onClick={handleResetImport}>
                    {t("importAnother")}
                  </Button>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Help Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-50/80 to-white p-5 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0 border border-blue-100">
              <Info className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800">{t("helpTitle")}</p>
              <p className="text-xs leading-relaxed text-slate-500">
                {t("helpText")}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
