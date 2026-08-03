"use client"

import { useMemo, useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { useTaktStore, useHydrated } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  ArrowLeftRight,
  FolderOutput,
  FolderInput,
  Info,
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
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-48 animate-pulse rounded-lg bg-muted" />
          <div className="h-48 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  )
}

// ─── Import preview card ───────────────────────────────────────────────────────

function ImportPreview({ payload }: { payload: ExportPayload }) {
  const t = useTranslations("importExport")
  const locale = useLocale()

  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[10px]">
          {payload.exportType === "scenario" ? t("previewTypeScenario") : t("previewTypeSnapshot")}
        </Badge>
        <span className="text-[11px] text-muted-foreground">
          v{payload.appVersion} · {fmtDate(payload.exportedAt, locale)}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold">
        {payload.exportType === "scenario"
          ? payload.scenario.name
          : payload.snapshot.name}
      </p>
      {payload.exportType === "scenario" && (
        <p className="mt-1 text-xs text-muted-foreground">
          {t("previewScenarioSummary", {
            stations: payload.scenario.stations.length,
            demand: payload.scenario.demandPerDay,
          })}
        </p>
      )}
      {payload.exportType === "snapshot" && (
        <p className="mt-1 text-xs text-muted-foreground">
          {t("previewSnapshotStations", { count: payload.snapshot.scenarioData.stations.length })} ·{" "}
          {t("baselineTag")}:{" "}
          {payload.snapshot.isBaseline ? t("baselineYes") : t("baselineNo")}
        </p>
      )}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

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
      <div className="relative z-10 mx-auto max-w-5xl space-y-6 px-4 pt-2 pb-8">
        <div className="page-header-rule pb-4 mb-2">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

      {/* Export cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Export scenario */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderOutput className="h-4 w-4 text-primary" />
              {t("exportScenarioTitle")}
            </CardTitle>
            <CardDescription className="text-xs">
              {t("exportScenarioDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("scenarioLabel")}</label>
              <select
                value={selectedScenarioId}
                onChange={(e) => setSelectedScenarioId(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">{t("selectScenario")}</option>
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            {activeScenario && (
              <div className="rounded-md border bg-muted/20 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  {t("scenarioSummary", {
                    stations: activeScenario.stations.length,
                    demand: activeScenario.demandPerDay,
                    hours: activeScenario.shiftHours,
                    shifts: activeScenario.shiftsPerDay,
                  })}
                </p>
              </div>
            )}
            <Button
              size="sm"
              className="gap-1.5"
              disabled={!selectedScenarioId}
              onClick={handleExportScenario}
            >
              <Download className="h-4 w-4" />
              {t("exportScenarioTitle")}
            </Button>
          </CardContent>
        </Card>

        {/* Export snapshot */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderOutput className="h-4 w-4 text-primary" />
              {t("exportSnapshotTitle")}
            </CardTitle>
            <CardDescription className="text-xs">
              {t("exportSnapshotDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("snapshotLabel")}</label>
              <select
                value={selectedSnapshotId}
                onChange={(e) => setSelectedSnapshotId(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">{t("selectSnapshot")}</option>
                {snapshots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.isBaseline ? t("baselineSuffix") : ""}
                  </option>
                ))}
              </select>
            </div>
            {activeSnapshot && (
              <div className="rounded-md border bg-muted/20 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  {t("snapshotSummaryStations", { count: activeSnapshot.scenarioData.stations.length })} ·{" "}
                  {fmtDate(activeSnapshot.createdAt, locale)}
                  {activeSnapshot.isBaseline && ` · ${t("baselineTag")}`}
                </p>
              </div>
            )}
            <Button
              size="sm"
              className="gap-1.5"
              disabled={!selectedSnapshotId}
              onClick={handleExportSnapshot}
            >
              <Download className="h-4 w-4" />
              {t("exportSnapshotTitle")}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Import card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderInput className="h-4 w-4 text-primary" />
            {t("importTitle")}
          </CardTitle>
          <CardDescription className="text-xs">
            {t("importDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File input area */}
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 transition-colors",
              importStatus.type === "valid"
                ? "border-green-300 bg-green-50/30"
                : importStatus.type === "invalid"
                ? "border-red-300 bg-red-50/30"
                : "border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/20"
            )}
          >
            <FileJson className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              {importStatus.type === "validating"
                ? t("dropValidating")
                : importStatus.type === "valid"
                ? t("dropValid")
                : importStatus.type === "invalid"
                ? t("dropInvalid")
                : t("dropIdle")}
            </p>
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
                className="gap-1.5"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                {t("selectFile")}
              </Button>
            )}
          </div>

          {/* Validation feedback */}
          {importStatus.type === "invalid" && (
            <div className="flex items-center gap-2 rounded-md border border-red-200/60 bg-red-50/40 px-3 py-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-xs text-red-800/80">
                {translateError((key, values) => t(`errors.${key}`, values), importStatus.error)}
              </p>
            </div>
          )}

          {importStatus.type === "valid" && (
            <>
              <div className="flex items-center gap-2 rounded-md border border-green-200/60 bg-green-50/40 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <p className="text-xs text-green-800/80">{t("validReady")}</p>
              </div>

              <ImportPreview payload={importStatus.payload} />

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("importNameLabel")}
                </label>
                <Input
                  placeholder={t("importNamePlaceholder")}
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="gap-1.5" onClick={handleImport}>
                  <ArrowLeftRight className="h-4 w-4" />
                  {t("importButton")}
                </Button>
                <Button variant="outline" size="sm" onClick={handleResetImport}>
                  {t("cancel")}
                </Button>
              </div>
            </>
          )}

          {importStatus.type === "success" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-md border border-green-200/60 bg-green-50/40 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <p className="text-xs text-green-800/80">
                  {t("successMessage", { name: importStatus.scenarioName })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="gap-1.5" asChild>
                  <Link href="/simulador">
                    {t("goToSimulator")}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" asChild>
                  <Link href="/comparar">
                    {t("goToCompare")}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleResetImport}>
                  {t("importAnother")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help card */}
      <div className="rounded-lg border bg-muted/20 px-4 py-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-medium">{t("helpTitle")}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t("helpText")}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)
}
