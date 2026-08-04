"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTaktStore, useHydrated } from "@/lib/store"
import {
  calculateAllKPIs,
  calculateEconomicKPIs,
  getStationsWithEffective,
  generateRecommendations,
  calculateRecommendationEconomicImpact,
  simulateScenario,
  normalizeEconomics,
} from "@/lib/calculations"
import { generateInsights } from "@/lib/insights"
import { LOGO_REPORT_BASE64 } from "@/lib/logo-base64"

// ─── PDF Geometry Constants ───────────────────────────────────────────────────

const LM = 15        // left margin (mm)
const RM = 195       // right margin x-coordinate (mm)
const CW = 180       // content width (mm)
const FOOTER_Y = 286 // y coordinate for footer line

// ─── Types & i18n Interfaces ──────────────────────────────────────────────────

type PdfTranslator = (key: string, values?: Record<string, string | number>) => string

interface PdfI18n {
  t: PdfTranslator
  tInsights: PdfTranslator
  tImprovements: PdfTranslator
  locale: string
}

// ─── Main PDF Generator ───────────────────────────────────────────────────────

async function generatePdf(scenarioId: string, i18n: PdfI18n): Promise<void> {
  const { t, tInsights, tImprovements, locale } = i18n
  const { jsPDF } = await import("jspdf")

  const store = useTaktStore.getState()
  const scenario = store.scenarios.find((s) => s.id === scenarioId)
  if (!scenario) return

  const kpis = calculateAllKPIs(scenario)
  const economicKpis = calculateEconomicKPIs(scenario, kpis)
  const stations = getStationsWithEffective(scenario.stations, kpis.taktTimeMin)
  const recommendations = generateRecommendations(scenario, kpis)
  const insights = generateInsights(scenario, kpis).slice(0, 4)

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

  // ── Color & Typography Helpers ──────────────────────────────────────────────

  function setDark()   { doc.setTextColor(15, 23, 42) }    // Slate-900
  function setGray()   { doc.setTextColor(100, 116, 139) } // Slate-500
  function setBlue()   { doc.setTextColor(30, 64, 175) }   // Blue-800
  function setRed()    { doc.setTextColor(185, 28, 28) }   // Red-700
  function setGreen()  { doc.setTextColor(21, 128, 61) }   // Green-700
  function setAmber()  { doc.setTextColor(180, 83, 9) }    // Amber-700

  let y = 15

  function checkPageBreak(neededHeight: number): boolean {
    if (y + neededHeight > FOOTER_Y - 6) {
      doc.addPage()
      y = 18
      return true
    }
    return false
  }

  function sectionTitle(label: string) {
    checkPageBreak(12)
    setBlue()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text(label.toUpperCase(), LM, y)
    doc.setDrawColor(30, 64, 175)
    doc.setLineWidth(0.4)
    doc.line(LM, y + 1.5, RM, y + 1.5)
    y += 7
    setDark()
  }

  function drawFooter(current: number, total: number) {
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.line(LM, FOOTER_Y, RM, FOOTER_Y)
    setGray()
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.text(t("footer"), LM, FOOTER_Y + 5)
    doc.text(t("page", { current, total }), RM, FOOTER_Y + 5, { align: "right" })
  }

  // ── 1. HEADER PROFESIONAL ────────────────────────────────────────────────────

  // Top accent bar
  doc.setFillColor(30, 64, 175)
  doc.rect(LM, 10, CW, 1.8, "F")

  // Corporate Logo
  try {
    doc.addImage(LOGO_REPORT_BASE64, "PNG", LM, 14, 42, 9.3)
  } catch {
    // Fallback text if image fails
    setBlue()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text("TAKT STUDIO", LM, 20)
  }

  // Report Date & Unique Identifier (Top Right)
  const now = new Date()
  const dateStr = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(now)

  const timeCompact = `${now.getHours().toString().padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}`
  const dateCompact = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`
  const reportId = `TST-${dateCompact}-${timeCompact}`

  setGray()
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.text(reportId, RM, 16, { align: "right" })
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text(t("generatedOn", { date: dateStr, id: reportId }), RM, 21, { align: "right" })

  // Main Report Title & Scenario Subtitle
  setDark()
  doc.setFont("helvetica", "bold")
  doc.setFontSize(15)
  doc.text(t("reportTitle"), LM, 31)

  setBlue()
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text(scenario.name, LM, 38)

  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.4)
  doc.line(LM, 42, RM, 42)
  y = 47

  // ── 2. RESUMEN EJECUTIVO ─────────────────────────────────────────────────────

  sectionTitle(t("secExecutive"))

  const deltaVal = Math.abs(kpis.demandDelta)
  const execText = kpis.meetsDemand
    ? t("execPass", {
        demand: scenario.demandPerDay,
        throughput: kpis.throughputPerDay,
        delta: deltaVal,
        bottleneck: kpis.bottleneckStationName || "N/A",
        bottleneckTime: kpis.bottleneckCycleMin.toFixed(1),
        efficiency: (kpis.balancingEfficiency * 100).toFixed(0),
      })
    : t("execFail", {
        demand: scenario.demandPerDay,
        throughput: kpis.throughputPerDay,
        delta: deltaVal,
        bottleneck: kpis.bottleneckStationName || "N/A",
        bottleneckTime: kpis.bottleneckCycleMin.toFixed(1),
        gap: Math.round(economicKpis.opportunityGapValuePerDay).toLocaleString(locale),
      })

  const execLines = doc.splitTextToSize(execText, CW - 8) as string[]
  const execBoxH = Math.max(execLines.length * 4.2 + 7, 16)

  // Card container
  if (kpis.meetsDemand) {
    doc.setFillColor(240, 253, 244) // Light green bg
    doc.setDrawColor(187, 247, 208)
  } else {
    doc.setFillColor(254, 242, 242) // Light red bg
    doc.setDrawColor(254, 202, 202)
  }
  doc.setLineWidth(0.3)
  doc.roundedRect(LM, y, CW, execBoxH, 1.5, 1.5, "FD")

  // Left status accent pill
  doc.setFillColor(kpis.meetsDemand ? 22 : 185, kpis.meetsDemand ? 163 : 28, kpis.meetsDemand ? 74 : 28)
  doc.rect(LM, y, 2.5, execBoxH, "F")

  if (kpis.meetsDemand) setGreen()
  else setRed()
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.text(execLines, LM + 6, y + 5)
  y += execBoxH + 6

  // ── 3. PARÁMETROS DEL ESCENARIO ──────────────────────────────────────────────

  sectionTitle(t("secParams"))

  const economics = normalizeEconomics(scenario.economics)
  const availMin = scenario.shiftHours * 60 * scenario.shiftsPerDay

  const paramCols = [
    { label: t("paramDemand"),    value: t("paramDemandValue", { value: scenario.demandPerDay }) },
    { label: t("paramShifts"),    value: String(scenario.shiftsPerDay) },
    { label: t("paramHours"),     value: t("paramHoursValue", { value: scenario.shiftHours }) },
    { label: t("paramAvailable"), value: t("paramAvailableValue", { value: availMin }) },
    { label: t("paramLaborRate"), value: t("paramRateValue", { value: economics.laborCostPerHour }) },
    { label: t("paramMargin"),    value: t("paramMarginValue", { value: economics.contributionMarginPerUnit }) },
  ]

  const pColW = CW / 6
  const pBoxH = 12

  // Param Header
  doc.setFillColor(241, 245, 249)
  doc.rect(LM, y, CW, 5, "F")
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.2)
  doc.rect(LM, y, CW, 5, "S")

  setGray()
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  paramCols.forEach((col, i) => {
    doc.text(col.label, LM + i * pColW + pColW / 2, y + 3.5, { align: "center" })
  })
  y += 5

  // Param Values
  doc.setFillColor(255, 255, 255)
  doc.rect(LM, y, CW, pBoxH - 5, "FD")
  setDark()
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  paramCols.forEach((col, i) => {
    doc.text(col.value, LM + i * pColW + pColW / 2, y + 5, { align: "center" })
  })
  y += pBoxH + 2

  // ── 4. KPIS OPERATIVOS DE LÍNEA ──────────────────────────────────────────────

  sectionTitle(t("secKpis"))

  const gridColW = (CW - 6) / 3 // 3 columns with 3mm gap
  const gridBoxH = 17

  function drawKpiGridCard(
    colIdx: number,
    rowIdx: number,
    title: string,
    val: string,
    sub: string,
    status: "green" | "amber" | "red" | "neutral"
  ) {
    const bx = LM + colIdx * (gridColW + 3)
    const by = y + rowIdx * (gridBoxH + 3)

    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.roundedRect(bx, by, gridColW, gridBoxH, 1.2, 1.2, "FD")

    // Status vector dot
    const statusColors = {
      green: [22, 163, 74],
      amber: [217, 119, 6],
      red: [220, 38, 38],
      neutral: [148, 163, 184],
    }
    const [cr, cg, cb] = statusColors[status]
    doc.setFillColor(cr, cg, cb)
    doc.circle(bx + 4, by + 4.5, 1.2, "F")

    setGray()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7)
    doc.text(title.toUpperCase(), bx + 7, by + 5)

    if (status === "red") setRed()
    else if (status === "green") setGreen()
    else if (status === "amber") setAmber()
    else setDark()

    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text(val, bx + 4, by + 11.5)

    setGray()
    doc.setFont("helvetica", "normal")
    doc.setFontSize(6.8)
    doc.text(sub, bx + 4, by + 15.5)
  }

  // Row 1
  drawKpiGridCard(0, 0, t("taktTitle"), `${kpis.taktTimeMin.toFixed(1)} ${t("minPerUnit")}`, t("taktSub", { available: kpis.availableTimeMin, demand: scenario.demandPerDay }), "neutral")
  
  const tpSub = kpis.meetsDemand
    ? t("throughputSubPass", { delta: Math.abs(kpis.demandDelta) })
    : t("throughputSubFail", { delta: Math.abs(kpis.demandDelta) })
  drawKpiGridCard(1, 0, t("throughputTitle"), `${kpis.throughputPerDay} uds`, tpSub, kpis.meetsDemand ? "green" : "red")

  const bnNameShort = (kpis.bottleneckStationName || "—").length > 18
    ? (kpis.bottleneckStationName || "—").substring(0, 17) + "..."
    : kpis.bottleneckStationName || "—"
  drawKpiGridCard(2, 0, t("bottleneckTitle"), bnNameShort, t("bottleneckSub", { value: kpis.bottleneckCycleMin.toFixed(1) }), kpis.bottleneckCycleMin > kpis.taktTimeMin ? "red" : "amber")

  // Row 2
  const effPct = (kpis.balancingEfficiency * 100).toFixed(0)
  const effStatus = kpis.balancingEfficiency >= 0.85 ? "green" : kpis.balancingEfficiency >= 0.70 ? "amber" : "red"
  const effSubText = kpis.balancingEfficiency >= 0.85 ? t("effExcellent") : kpis.balancingEfficiency >= 0.70 ? t("effGood") : t("effBad")
  drawKpiGridCard(0, 1, t("balancingTitle"), `${effPct}%`, effSubText, effStatus)

  drawKpiGridCard(1, 1, t("leadTimeTitle"), `${kpis.leadTimeMin.toFixed(1)} ${t("minUnit")}`, t("leadTimeSub"), "neutral")

  const totalOps = scenario.stations.reduce((sum, st) => sum + st.operators, 0)
  drawKpiGridCard(2, 1, t("operatorsTitle"), `${totalOps} ${t("colOperators")}`, t("operatorsSub"), "neutral")

  y += gridBoxH * 2 + 9

  // ── 5. GRÁFICO TAKT VS TIEMPO EFECTIVO (BARRAS VECTORIALES) ─────────────────

  checkPageBreak(55)
  sectionTitle(t("secChart"))

  const chartH = 34
  const chartW = CW
  const chartY = y

  // Background grid box
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.rect(LM, chartY, chartW, chartH, "FD")

  // Calculate max scale value for Y axis
  const maxCycle = Math.max(...stations.map((s) => s.effectiveCycleMin), kpis.taktTimeMin, 1)
  const yMaxScale = maxCycle * 1.25

  // Y axis line
  const axisX = LM + 12
  const axisBottomY = chartY + chartH - 6
  const axisTopY = chartY + 4
  const chartPlotH = axisBottomY - axisTopY

  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.3)
  doc.line(axisX, axisTopY, axisX, axisBottomY)
  doc.line(axisX, axisBottomY, LM + chartW - 4, axisBottomY)

  // Takt Time Horizontal Line (Dashed)
  const taktY = axisBottomY - (kpis.taktTimeMin / yMaxScale) * chartPlotH
  doc.setDrawColor(220, 38, 38) // Red dashed line
  doc.setLineWidth(0.4)
  doc.setLineDashPattern([1.5, 1.5], 0)
  doc.line(axisX, taktY, LM + chartW - 4, taktY)
  doc.setLineDashPattern([], 0) // Reset line style

  setRed()
  doc.setFont("helvetica", "bold")
  doc.setFontSize(6.5)
  doc.text(`TAKT: ${kpis.taktTimeMin.toFixed(1)}m`, LM + chartW - 5, taktY - 1, { align: "right" })

  // Bars rendering
  const numStations = stations.length
  const availW = chartW - 20
  const barSpacing = Math.max(1.5, Math.min(6, (availW / numStations) * 0.25))
  const barW = Math.max(3, Math.min(16, (availW - barSpacing * (numStations + 1)) / numStations))

  for (let i = 0; i < numStations; i++) {
    const st = stations[i]
    const bx = axisX + barSpacing + i * (barW + barSpacing)
    const bHeight = Math.max(1, (st.effectiveCycleMin / yMaxScale) * chartPlotH)
    const by = axisBottomY - bHeight

    if (st.isBottleneck) {
      doc.setFillColor(220, 38, 38) // Bottleneck Red
      doc.setDrawColor(185, 28, 28)
    } else {
      doc.setFillColor(30, 64, 175) // Standard Corporate Blue
      doc.setDrawColor(29, 78, 216)
    }
    doc.setLineWidth(0.2)
    doc.rect(bx, by, barW, bHeight, "FD")

    // Bar Value Label
    setDark()
    doc.setFont("helvetica", st.isBottleneck ? "bold" : "normal")
    doc.setFontSize(6)
    doc.text(`${st.effectiveCycleMin.toFixed(1)}`, bx + barW / 2, by - 1, { align: "center" })

    // Station Index under axis
    setGray()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(6.5)
    doc.text(`#${i + 1}`, bx + barW / 2, axisBottomY + 4, { align: "center" })
  }

  y = chartY + chartH + 5

  // Chart Legend
  doc.setFillColor(30, 64, 175)
  doc.rect(LM + 10, y, 3, 3, "F")
  setGray()
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.text(t("chartLegendNormal"), LM + 15, y + 2.5)

  doc.setFillColor(220, 38, 38)
  doc.rect(LM + 55, y, 3, 3, "F")
  doc.text(t("chartLegendBottleneck"), LM + 60, y + 2.5)

  doc.setDrawColor(220, 38, 38)
  doc.setLineWidth(0.4)
  doc.setLineDashPattern([1.5, 1.5], 0)
  doc.line(LM + 105, y + 1.5, LM + 112, y + 1.5)
  doc.setLineDashPattern([], 0)
  doc.text(t("chartLegendTakt", { value: kpis.taktTimeMin.toFixed(1) }), LM + 115, y + 2.5)

  y += 9

  // ── 6. TABLA DETALLADA DE ESTACIONES (MULTILÍNEA Y SIN TRUNCAR) ─────────────

  checkPageBreak(30)
  sectionTitle(t("secStations"))

  const tCols = [
    { x: LM,       w: 8,  label: t("colIndex"),    align: "center" as const },
    { x: LM + 8,   w: 64, label: t("colName"),     align: "left" as const   },
    { x: LM + 72,  w: 22, label: t("colCycle"),    align: "right" as const  },
    { x: LM + 94,  w: 18, label: t("colOperators"),align: "center" as const },
    { x: LM + 112, w: 22, label: t("colFailure"),  align: "center" as const },
    { x: LM + 134, w: 24, label: t("colEffective"),align: "right" as const  },
    { x: LM + 158, w: 22, label: t("colExceeds"),  align: "center" as const },
  ]

  function drawTableHeader() {
    doc.setFillColor(241, 245, 249)
    doc.setDrawColor(203, 213, 225)
    doc.setLineWidth(0.2)
    doc.rect(LM, y, CW, 6, "FD")
    setGray()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7)
    for (const col of tCols) {
      const tx = col.align === "right" ? col.x + col.w - 1 : col.align === "center" ? col.x + col.w / 2 : col.x + 1.5
      doc.text(col.label, tx, y + 4, { align: col.align })
    }
    y += 6
  }

  drawTableHeader()

  for (let i = 0; i < stations.length; i++) {
    const st = stations[i]
    const exceedsTakt = st.effectiveCycleMin > kpis.taktTimeMin

    // Multiline wrapped station name
    doc.setFont("helvetica", st.isBottleneck ? "bold" : "normal")
    doc.setFontSize(7.5)
    const nameLines = doc.splitTextToSize(st.name, tCols[1].w - 3) as string[]
    const rowH = Math.max(6, nameLines.length * 3.8 + 2.5)

    if (checkPageBreak(rowH)) {
      drawTableHeader()
    }

    if (st.isBottleneck) {
      doc.setFillColor(254, 242, 242)
      doc.setDrawColor(254, 202, 202)
    } else if (i % 2 === 0) {
      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(226, 232, 240)
    } else {
      doc.setFillColor(248, 250, 252)
      doc.setDrawColor(226, 232, 240)
    }
    doc.setLineWidth(0.15)
    doc.rect(LM, y, CW, rowH, "FD")

    if (st.isBottleneck) setRed()
    else setDark()

    // Render columns
    doc.text(String(i + 1), tCols[0].x + tCols[0].w / 2, y + 4, { align: "center" })
    doc.text(nameLines, tCols[1].x + 1.5, y + 4)
    doc.text(`${st.cycleTimeMin} ${t("minUnit")}`, tCols[2].x + tCols[2].w - 1, y + 4, { align: "right" })
    doc.text(String(st.operators), tCols[3].x + tCols[3].w / 2, y + 4, { align: "center" })
    doc.text(`${(st.failureRate * 100).toFixed(0)}%`, tCols[4].x + tCols[4].w / 2, y + 4, { align: "center" })
    doc.text(`${st.effectiveCycleMin.toFixed(1)} ${t("minUnit")}`, tCols[5].x + tCols[5].w - 1, y + 4, { align: "right" })

    if (exceedsTakt) setRed()
    else setGreen()
    doc.setFont("helvetica", "bold")
    doc.text(exceedsTakt ? t("exceedsYes") : t("exceedsNo"), tCols[6].x + tCols[6].w / 2, y + 4, { align: "center" })

    y += rowH
  }

  y += 6

  // ── 7. PLAN DE MEJORA Y RECOMENDACIONES (SI EXISTEN) ───────────────────────

  if (recommendations.length > 0) {
    checkPageBreak(35)
    sectionTitle(t("secImprovements"))

    const rCols = [
      { x: LM,       w: 22, label: t("colRecType"),   align: "center" as const },
      { x: LM + 22,  w: 80, label: t("colRecDesc"),   align: "left" as const   },
      { x: LM + 102, w: 26, label: t("colRecImpact"), align: "right" as const  },
      { x: LM + 128, w: 26, label: t("colRecCost"),   align: "right" as const  },
      { x: LM + 154, w: 26, label: t("colRecPayback"),align: "center" as const },
    ]

    doc.setFillColor(241, 245, 249)
    doc.setDrawColor(203, 213, 225)
    doc.setLineWidth(0.2)
    doc.rect(LM, y, CW, 5.5, "FD")
    setGray()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7)
    for (const col of rCols) {
      const tx = col.align === "right" ? col.x + col.w - 1 : col.align === "center" ? col.x + col.w / 2 : col.x + 1.5
      doc.text(col.label, tx, y + 3.8, { align: col.align })
    }
    y += 5.5

    for (let rIdx = 0; rIdx < recommendations.length; rIdx++) {
      const rec = recommendations[rIdx]
      const stationChanges = rec.stationChanges?.map((c) => ({
        stationId: c.originalStationId,
        updates: c.updates,
      }))
      const { scenario: projectedScenario } = simulateScenario(scenario, stationChanges, rec.scenarioChanges)
      const econImpact = calculateRecommendationEconomicImpact(scenario, projectedScenario, rec.type)

      // Priority translation label
      const priorityText = rec.priority === "high" ? "ALTA" : rec.priority === "medium" ? "MEDIA" : "BAJA"
      const recDesc = tImprovements(`recs.${rec.titleKey}.title`, rec.titleValues)
      const descLines = doc.splitTextToSize(recDesc, rCols[1].w - 3) as string[]
      const rRowH = Math.max(6, descLines.length * 3.8 + 2.5)

      if (checkPageBreak(rRowH)) {
        // Redraw header if page break
        doc.setFillColor(241, 245, 249)
        doc.rect(LM, y, CW, 5.5, "FD")
        setGray()
        doc.setFont("helvetica", "bold")
        doc.setFontSize(7)
        for (const col of rCols) {
          const tx = col.align === "right" ? col.x + col.w - 1 : col.align === "center" ? col.x + col.w / 2 : col.x + 1.5
          doc.text(col.label, tx, y + 3.8, { align: col.align })
        }
        y += 5.5
      }

      doc.setFillColor(rIdx % 2 === 0 ? 255 : 248, rIdx % 2 === 0 ? 255 : 250, rIdx % 2 === 0 ? 255 : 252)
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.15)
      doc.rect(LM, y, CW, rRowH, "FD")

      // Priority Badge Text Color
      if (rec.priority === "high") setRed()
      else if (rec.priority === "medium") setAmber()
      else setBlue()

      doc.setFont("helvetica", "bold")
      doc.setFontSize(7)
      doc.text(priorityText, rCols[0].x + rCols[0].w / 2, y + 4, { align: "center" })

      setDark()
      doc.setFont("helvetica", "normal")
      doc.setFontSize(7.5)
      doc.text(descLines, rCols[1].x + 1.5, y + 4)

      setGreen()
      doc.setFont("helvetica", "bold")
      const netStr = `+${Math.round(econImpact.netImpactPerDay)} €/d`
      doc.text(netStr, rCols[2].x + rCols[2].w - 1, y + 4, { align: "right" })

      setDark()
      doc.setFont("helvetica", "normal")
      const costStr = econImpact.oneOffCost > 0 ? `${Math.round(econImpact.oneOffCost)} €` : "0 €"
      doc.text(costStr, rCols[3].x + rCols[3].w - 1, y + 4, { align: "right" })

      const paybackStr = econImpact.paybackDays === null ? "—" : econImpact.paybackDays === 0 ? t("paybackImmediate") : t("paybackDays", { days: econImpact.paybackDays })
      doc.text(paybackStr, rCols[4].x + rCols[4].w / 2, y + 4, { align: "center" })

      y += rRowH
    }
    y += 6
  }

  // ── 8. ANÁLISIS ECONÓMICO Y DE IMPACTO FINANCIERO ────────────────────────────

  checkPageBreak(30)
  sectionTitle(t("secEconomics"))

  const econCardW = (CW - 6) / 3
  const econCardH = 16

  function drawEconCard(col: number, row: number, title: string, amount: number, isGap?: boolean) {
    const bx = LM + col * (econCardW + 3)
    const by = y + row * (econCardH + 3)

    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.roundedRect(bx, by, econCardW, econCardH, 1.2, 1.2, "FD")

    setGray()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7)
    doc.text(title.toUpperCase(), bx + 4, by + 4.5)

    if (isGap && amount > 0) setRed()
    else if (amount > 0) setDark()
    else setGray()

    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    const formattedAmount = `${Math.round(amount).toLocaleString(locale)} €${t("perDay")}`
    doc.text(formattedAmount, bx + 4, by + 11.5)
  }

  drawEconCard(0, 0, t("econOpCost"), economicKpis.totalOperatingCostPerDay)
  drawEconCard(1, 0, t("econLaborCost"), economicKpis.laborCostPerDay)
  drawEconCard(2, 0, t("econReworkCost"), economicKpis.reworkCostPerDay)

  drawEconCard(0, 1, t("econContribution"), economicKpis.fulfilledContributionPerDay)
  drawEconCard(1, 1, t("econOpportunityGap"), economicKpis.opportunityGapValuePerDay, true)

  y += econCardH * 2 + 9

  // ── 9. DIAGNÓSTICO AUTOMÁTICO DE LÍNEA (INSIGHTS) ────────────────────────────

  checkPageBreak(35)
  sectionTitle(t("secAnalysis"))

  const bulletColors: Record<string, [number, number, number]> = {
    critical: [185, 28, 28],
    warning:  [180, 83, 9],
    success:  [21, 128, 61],
    info:     [30, 64, 175],
  }

  for (const insight of insights) {
    const [r, g, b] = bulletColors[insight.type] || [30, 64, 175]

    const titleText = tInsights(`${insight.key}.title`, insight.values)
    const msgText = tInsights(`${insight.key}.message`, insight.values)
    const msgLines = doc.splitTextToSize(msgText, CW - 8) as string[]
    const insightH = msgLines.length * 3.8 + 6

    checkPageBreak(insightH)

    // Vector bullet circle
    doc.setFillColor(r, g, b)
    doc.circle(LM + 2, y + 2, 1.2, "F")

    doc.setTextColor(r, g, b)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8.5)
    doc.text(titleText, LM + 5, y + 3)

    setGray()
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7.5)
    doc.text(msgLines, LM + 5, y + 7)

    y += insightH + 2
  }

  y += 4

  // ── 10. METODOLOGÍA Y SUPUESTOS DEL MODELO ────────────────────────────────────

  checkPageBreak(25)
  sectionTitle(t("secMethodology"))

  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.2)

  const methodText = t("methodologyText")
  const methodLines = doc.splitTextToSize(methodText, CW - 6) as string[]
  const methodBoxH = methodLines.length * 3.6 + 5

  doc.rect(LM, y, CW, methodBoxH, "FD")

  setGray()
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.text(methodLines, LM + 3, y + 4)

  // ── FOOTER NUMERADO EN TODAS LAS PÁGINAS ─────────────────────────────────────

  const totalPages = doc.getNumberOfPages()
  for (let pageIdx = 1; pageIdx <= totalPages; pageIdx++) {
    doc.setPage(pageIdx)
    drawFooter(pageIdx, totalPages)
  }

  // ── NOMBRE DE ARCHIVO SANITIZADO ──────────────────────────────────────────────

  const safeScenarioName = scenario.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-zA-Z0-9_-]/g, "_")  // Replace invalid chars with _
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")

  const dateFile = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now
    .getDate()
    .toString()
    .padStart(2, "0")}`

  doc.save(`TaktStudio_Informe_${safeScenarioName || "Escenario"}_${dateFile}.pdf`)
}

// ─── Export Button Component ───────────────────────────────────────────────────

export default function ExportPdfButton() {
  const t = useTranslations("simulator.pdf")
  const tInsights = useTranslations("simulator.insights")
  const tImprovements = useTranslations("simulator.improvements")
  const locale = useLocale()
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
      await generatePdf(scenarioId, { t, tInsights, tImprovements, locale })
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
      className="transition-all hover:border-primary hover:text-primary"
    >
      <FileDown className="mr-2 h-4 w-4" />
      {loading ? t("generating") : t("button")}
    </Button>
  )
}

