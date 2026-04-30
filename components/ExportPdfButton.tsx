"use client"

import { useState } from "react"
import { FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTaktStore, useHydrated } from "@/lib/store"
import { calculateAllKPIs, getStationsWithEffective } from "@/lib/calculations"
import { generateInsights } from "@/lib/insights"

// ─── PDF geometry constants ────────────────────────────────────────────────────

const LM = 15        // left margin (mm)
const RM = 195       // right margin x-coordinate (mm)
const CW = 180       // content width (mm)
const PAGE_H = 297   // A4 height (mm)
const FOOTER_Y = 289 // y where footer sits

// ─── PDF generation ────────────────────────────────────────────────────────────

async function generatePdf(scenarioId: string): Promise<void> {
  // Dynamic import — jsPDF is browser-only
  const { jsPDF } = await import("jspdf")

  const store = useTaktStore.getState()
  const scenario = store.scenarios.find((s) => s.id === scenarioId)
  if (!scenario) return

  const kpis = calculateAllKPIs(scenario)
  const stations = getStationsWithEffective(scenario.stations, kpis.taktTimeMin)
  const insights = generateInsights(scenario, kpis).slice(0, 3)

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

  // ── helpers ──────────────────────────────────────────────────────────────────

  function setDark()  { doc.setTextColor(17, 24, 39) }
  function setGray()  { doc.setTextColor(107, 114, 128) }
  function setBlue()  { doc.setTextColor(30, 64, 175) }
  function setRed()   { doc.setTextColor(185, 28, 28) }
  function setGreen() { doc.setTextColor(21, 128, 61) }

  function sectionTitle(label: string, y: number) {
    setBlue()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text(label.toUpperCase(), LM, y)
    doc.setDrawColor(30, 64, 175)
    doc.setLineWidth(0.3)
    doc.line(LM, y + 1.5, RM, y + 1.5)
    setDark()
  }

  function drawFooter() {
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.3)
    doc.line(LM, FOOTER_Y, RM, FOOTER_Y)
    setGray()
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.text(
      "Generado por Takt Studio · Ingeniería de Organización Industrial",
      LM,
      FOOTER_Y + 5
    )
    doc.text("Pág. 1", RM, FOOTER_Y + 5, { align: "right" })
  }

  // ── HEADER ───────────────────────────────────────────────────────────────────

  // Top accent bar
  doc.setFillColor(30, 64, 175)
  doc.rect(LM, 10, CW, 1.5, "F")

  setDark()
  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text("TAKT STUDIO — Informe de Línea", LM, 22)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(14)
  doc.text(scenario.name, LM, 31)

  const now = new Date()
  const dateStr = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${now.getFullYear()}`
  setGray()
  doc.setFontSize(10)
  doc.text(`Generado el ${dateStr}`, LM, 38)

  doc.setDrawColor(229, 231, 235)
  doc.setLineWidth(0.4)
  doc.line(LM, 42, RM, 42)

  // ── SECTION 1: Parámetros ────────────────────────────────────────────────────

  let y = 50
  sectionTitle("1. Parámetros", y)
  y += 7

  const availMin = scenario.shiftHours * 60 * scenario.shiftsPerDay
  const paramCols = [
    { label: "Demanda/día",         value: `${scenario.demandPerDay} uds` },
    { label: "Turnos/día",          value: String(scenario.shiftsPerDay) },
    { label: "Horas/turno",         value: `${scenario.shiftHours} h` },
    { label: "Tiempo disponible",   value: `${availMin} min` },
  ]
  const colW = CW / 4

  // Header row background
  doc.setFillColor(241, 245, 249)
  doc.rect(LM, y, CW, 6, "F")
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.2)
  doc.rect(LM, y, CW, 6, "S")

  setGray()
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  paramCols.forEach((col, i) => {
    doc.text(col.label, LM + i * colW + colW / 2, y + 4, { align: "center" })
  })
  y += 6

  // Values row
  doc.setFillColor(255, 255, 255)
  doc.rect(LM, y, CW, 7, "FD")
  setDark()
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  paramCols.forEach((col, i) => {
    doc.text(col.value, LM + i * colW + colW / 2, y + 5, { align: "center" })
  })
  y += 7

  // ── SECTION 2: KPIs principales ──────────────────────────────────────────────

  y += 8
  sectionTitle("2. KPIs Principales", y)
  y += 7

  const boxW = (CW - 4) / 2  // 2 columns with 4mm gap
  const boxH = 20

  function drawKpiBox(
    bx: number,
    by: number,
    label: string,
    value: string,
    sub: string,
    highlight?: "red" | "green"
  ) {
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(203, 213, 225)
    doc.setLineWidth(0.3)
    doc.roundedRect(bx, by, boxW, boxH, 1.5, 1.5, "FD")

    setGray()
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7.5)
    doc.text(label, bx + 4, by + 5.5)

    if (highlight === "red") setRed()
    else if (highlight === "green") setGreen()
    else setDark()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.text(value, bx + 4, by + 13)

    setGray()
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7.5)
    doc.text(sub, bx + 4, by + 18)
  }

  const taktSub = `Ritmo necesario: ${kpis.availableTimeMin} min ÷ ${scenario.demandPerDay} uds`
  drawKpiBox(LM, y, "Takt Time", `${kpis.taktTimeMin.toFixed(1)} min/ud`, taktSub)

  const throughputSub = kpis.meetsDemand
    ? `✓ Cumple demanda (+${kpis.demandDelta} extra)`
    : `✗ Déficit de ${Math.abs(kpis.demandDelta)} uds/día`
  drawKpiBox(
    LM + boxW + 4,
    y,
    "Throughput",
    `${kpis.throughputPerDay} uds/día`,
    throughputSub,
    kpis.meetsDemand ? "green" : "red"
  )
  y += boxH + 3

  const bnSub = `Tiempo efectivo: ${kpis.bottleneckCycleMin.toFixed(1)} min/ud`
  const bnHighlight = kpis.bottleneckCycleMin > kpis.taktTimeMin ? "red" : undefined
  drawKpiBox(LM, y, "Cuello de botella", kpis.bottleneckStationName || "—", bnSub, bnHighlight)

  const effPct = (kpis.balancingEfficiency * 100).toFixed(0)
  const effSub =
    kpis.balancingEfficiency >= 0.85
      ? "Excelente balanceo"
      : kpis.balancingEfficiency >= 0.70
      ? "Buen balanceo"
      : "Línea desbalanceada"
  drawKpiBox(
    LM + boxW + 4,
    y,
    "Eficiencia de balanceo",
    `${effPct}%`,
    effSub,
    kpis.balancingEfficiency >= 0.70 ? "green" : "red"
  )
  y += boxH + 3

  // ── SECTION 3: Estaciones ─────────────────────────────────────────────────────

  y += 5
  sectionTitle("3. Estaciones", y)
  y += 7

  // Column definitions: x, width, label, alignment
  const tCols: Array<{ x: number; w: number; label: string; align: "left" | "center" | "right" }> = [
    { x: LM,       w: 10, label: "#",          align: "center" },
    { x: LM + 10,  w: 65, label: "Nombre",     align: "left"   },
    { x: LM + 75,  w: 26, label: "T. Ciclo",   align: "right"  },
    { x: LM + 101, w: 24, label: "Operarios",  align: "center" },
    { x: LM + 125, w: 22, label: "Fallo %",    align: "center" },
    { x: LM + 147, w: 33, label: "T. Efectivo",align: "right"  },
  ]

  // Table header
  doc.setFillColor(241, 245, 249)
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.2)
  doc.rect(LM, y, CW, 6, "FD")
  setGray()
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.5)
  for (const col of tCols) {
    const tx = col.align === "right" ? col.x + col.w - 1 : col.align === "center" ? col.x + col.w / 2 : col.x + 1.5
    doc.text(col.label, tx, y + 4, { align: col.align })
  }
  y += 6

  const ROW_H = 6.5
  for (let i = 0; i < stations.length; i++) {
    const st = stations[i]

    if (st.isBottleneck) {
      doc.setFillColor(254, 226, 226)
      doc.setDrawColor(252, 165, 165)
    } else if (i % 2 === 0) {
      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(229, 231, 235)
    } else {
      doc.setFillColor(249, 250, 251)
      doc.setDrawColor(229, 231, 235)
    }
    doc.setLineWidth(0.15)
    doc.rect(LM, y, CW, ROW_H, "FD")

    if (st.isBottleneck) setRed()
    else setDark()
    doc.setFont("helvetica", st.isBottleneck ? "bold" : "normal")
    doc.setFontSize(8)

    const cells = [
      { col: tCols[0], val: String(i + 1) },
      { col: tCols[1], val: st.name.length > 28 ? st.name.substring(0, 27) + "…" : st.name },
      { col: tCols[2], val: `${st.cycleTimeMin} min` },
      { col: tCols[3], val: String(st.operators) },
      { col: tCols[4], val: `${(st.failureRate * 100).toFixed(0)}%` },
      { col: tCols[5], val: `${st.effectiveCycleMin.toFixed(1)} min` },
    ]
    for (const { col, val } of cells) {
      const tx = col.align === "right" ? col.x + col.w - 1 : col.align === "center" ? col.x + col.w / 2 : col.x + 1.5
      doc.text(val, tx, y + 4.5, { align: col.align })
    }

    y += ROW_H
  }

  // ── SECTION 4: Análisis ───────────────────────────────────────────────────────

  y += 8
  // Check if we need a new page (leave room for at least the section header + 3 insights)
  if (y > PAGE_H - 60) {
    doc.addPage()
    y = 20
  }

  sectionTitle("4. Análisis Automático", y)
  y += 7

  const bulletSymbols: Record<string, string> = {
    critical: "✖",
    warning:  "▲",
    success:  "✔",
    info:     "ℹ",
  }
  const bulletColors: Record<string, [number, number, number]> = {
    critical: [185, 28, 28],
    warning:  [180, 83, 9],
    success:  [21, 128, 61],
    info:     [29, 78, 216],
  }

  for (const insight of insights) {
    const [r, g, b] = bulletColors[insight.type]
    doc.setTextColor(r, g, b)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text(
      `${bulletSymbols[insight.type]}  ${insight.title}`,
      LM,
      y
    )
    y += 5

    setGray()
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    const lines = doc.splitTextToSize(insight.message, CW - 6) as string[]
    doc.text(lines, LM + 5, y)
    y += lines.length * 4 + 4
  }

  // ── FOOTER ────────────────────────────────────────────────────────────────────

  drawFooter()

  // ── SAVE ─────────────────────────────────────────────────────────────────────

  const safeName = scenario.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()
  const dateFile = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now
    .getDate()
    .toString()
    .padStart(2, "0")}`
  doc.save(`takt-studio-${safeName}-${dateFile}.pdf`)
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ExportPdfButton() {
  const hydrated = useHydrated()
  const scenarioId = useTaktStore((s) => s.activeScenarioId)
  const hasStations = useTaktStore(
    (s) => (s.scenarios.find((sc) => sc.id === s.activeScenarioId)?.stations.length ?? 0) > 0
  )
  const [loading, setLoading] = useState(false)

  if (!hydrated) return null

  async function handleClick() {
    if (!scenarioId || loading) return
    setLoading(true)
    try {
      await generatePdf(scenarioId)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading || !hasStations}
    >
      <FileDown className="mr-2 h-4 w-4" />
      {loading ? "Generando…" : "Exportar PDF"}
    </Button>
  )
}
