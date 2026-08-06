import { useTaktStore } from "@/lib/store"
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
import { runMonteCarlo } from "@/lib/monte-carlo"
import { LOGO_REPORT_BASE64 } from "@/lib/logo-base64"

const APP_VERSION = "0.1.0"

// ─── PDF Geometry Constants ───────────────────────────────────────────────────

const LM = 15        // left margin (mm)
const RM = 195       // right margin x-coordinate (mm)
const CW = 180       // content width (mm)
const FOOTER_Y = 286 // y coordinate for footer line

// ─── Formatting Helpers ───────────────────────────────────────────────────────

function getTargetLocale(locale: string): string {
  if (locale === "es") return "es-ES"
  if (locale === "en") return "en-US"
  return locale
}

function formatNumber(val: number, locale: string): string {
  const targetLocale = getTargetLocale(locale)
  return new Intl.NumberFormat(targetLocale, { useGrouping: "always" }).format(Math.round(val))
}

function formatCurrency(val: number, locale: string): string {
  return `${formatNumber(val, locale)} €`
}

function formatSignedAmount(num: number, locale: string, unit?: string): string {
  const rounded = Math.round(num)
  const actualUnit = unit ?? (locale === "es" ? "€/día" : "€/day")
  if (rounded === 0) return `0 ${actualUnit}`
  const formatted = formatNumber(Math.abs(rounded), locale)
  return rounded > 0 ? `+${formatted} ${actualUnit}` : `-${formatted} ${actualUnit}`
}

function formatPayback(paybackDays: number | null | undefined, t: PdfTranslator, locale: string): string {
  if (paybackDays === null || paybackDays === undefined || !isFinite(paybackDays)) return "—"
  const rounded = Math.round(paybackDays)
  if (rounded <= 0) return t("paybackImmediate")
  if (rounded > 3650) return t("paybackOver10Years")
  return t("paybackDays", { days: formatNumber(rounded, locale) })
}

/**
 * Truncates text with an ellipsis if it exceeds maxWidth at current font settings
 */
function fitText(doc: { getTextWidth: (s: string) => number }, text: string, maxWidth: number): string {
  if (!text) return ""
  if (doc.getTextWidth(text) <= maxWidth) return text
  let truncated = text
  while (truncated.length > 0 && doc.getTextWidth(truncated + "…") > maxWidth) {
    truncated = truncated.slice(0, -1)
  }
  return truncated ? truncated + "…" : ""
}

/**
 * Cleanly separates scenario base title from applied improvement suffixes
 */
function parseCleanScenarioTitle(rawName: string): { baseTitle: string; improvementSubtitle?: string } {
  if (!rawName) return { baseTitle: "Escenario" }
  const parts = rawName.split(" — ")
  const baseTitle = parts[0].trim()
  if (parts.length > 1) {
    const improvementSubtitle = parts.slice(1).join(" · ").trim()
    return { baseTitle, improvementSubtitle }
  }
  return { baseTitle }
}

// ─── Types & i18n Interfaces ──────────────────────────────────────────────────

export type PdfTranslator = (key: string, values?: Record<string, string | number>) => string

export interface PdfOptions {
  t: PdfTranslator
  tInsights: PdfTranslator
  tImprovements: PdfTranslator
  locale: string
}

// ─── Main PDF Generation Engine ───────────────────────────────────────────────

export async function generatePdf(scenarioId: string, options: PdfOptions) {
  const { t, tInsights, tImprovements, locale } = options
  const { jsPDF } = await import("jspdf")

  const state = useTaktStore.getState()
  const scenario = state.scenarios.find((s) => s.id === scenarioId)
  if (!scenario) return

  const kpis = calculateAllKPIs(scenario)
  const economicKpis = calculateEconomicKPIs(scenario, kpis)
  const stations = getStationsWithEffective(scenario.stations, kpis.taktTimeMin)
  const recommendations = generateRecommendations(scenario, kpis)
  const insights = generateInsights(scenario, kpis).slice(0, 4)
  const mcCv = scenario.monteCarloOptions?.cv ?? 0.1
  const mcSeed = scenario.monteCarloOptions?.seed ?? 42
  const mcResult = runMonteCarlo(scenario, { runs: 2000, cv: mcCv, seed: mcSeed })

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

  doc.setProperties({
    title: `${t("reportTitle")} — ${scenario.name}`,
    author: "Takt Studio",
    subject: t("metadataSubject"),
    keywords: `takt time, bottleneck, lean, ${scenario.name}`,
    creator: "Takt Studio",
  })

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
      y = 28
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
    const baseFooterText = t("footer")
    const footerStr = baseFooterText.includes("Takt Studio")
      ? baseFooterText.replace("Takt Studio", `Generado por Takt Studio v${APP_VERSION}`)
      : `Generado por Takt Studio v${APP_VERSION} · ${baseFooterText}`
    doc.text(footerStr, LM, FOOTER_Y + 5)
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

  // Report Date & Unique Identifier (Top Right Header)
  const now = new Date()
  const dateStr = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(now)

  const timeCompact = `${now.getHours().toString().padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}`
  const dateCompact = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`
  const reportId = `TST-${dateCompact}-${timeCompact}`

  function drawHeaderRightMetadata(yPos: number) {
    const isEn = locale.toLowerCase().startsWith("en")
    const labelEmisionText = isEn ? "Issued: " : "Emisión: "
    const labelIdText = " · ID: "

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    const wValEmision = doc.getTextWidth(dateStr)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    const wLabelEmision = doc.getTextWidth(labelEmisionText)
    const wLabelId = doc.getTextWidth(labelIdText)
    const wValId = doc.getTextWidth(reportId)

    const totalW = wLabelEmision + wValEmision + wLabelId + wValId
    let curX = RM - totalW

    // "Emisión: " in bold gray
    setGray()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.text(labelEmisionText, curX, yPos)
    curX += wLabelEmision

    // dateStr in normal gray
    doc.setFont("helvetica", "normal")
    doc.text(dateStr, curX, yPos)
    curX += wValEmision

    // " · ID: " in bold gray
    doc.setFont("helvetica", "bold")
    doc.text(labelIdText, curX, yPos)
    curX += wLabelId

    // reportId in normal gray
    doc.setFont("helvetica", "normal")
    doc.text(reportId, curX, yPos)
  }

  drawHeaderRightMetadata(19)

  // Main Report Title & Scenario Subtitle (Clean & Boundary-safe)
  setDark()
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text(t("reportTitle"), LM, 30)

  const { baseTitle, improvementSubtitle } = parseCleanScenarioTitle(scenario.name)

  setBlue()
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  const cleanBaseTitle = fitText(doc, baseTitle, CW)
  doc.text(cleanBaseTitle, LM, 36.5)

  let headerLineY = 40.5

  if (improvementSubtitle) {
    setGray()
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7.5)
    const label = locale.toLowerCase().startsWith("en") ? "Applied improvements" : "Mejoras aplicadas"
    const fullSubText = `${label}: ${improvementSubtitle}`
    const subLines = doc.splitTextToSize(fullSubText, CW) as string[]
    doc.text(subLines, LM, 40.5)
    headerLineY = 40.5 + subLines.length * 3.6 + 0.5
  }

  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.4)
  doc.line(LM, headerLineY, RM, headerLineY)
  y = headerLineY + 5

  // ── 2. RESUMEN EJECUTIVO ─────────────────────────────────────────────────────

  sectionTitle(t("secExecutive"))

  const deltaVal = Math.abs(kpis.demandDelta)
  const execValues = {
    demand: formatNumber(scenario.demandPerDay, locale),
    throughput: formatNumber(kpis.throughputPerDay, locale),
    delta: formatNumber(deltaVal, locale),
    bottleneck: kpis.bottleneckStationName || "—",
    bottleneckTime: kpis.bottleneckCycleMin.toFixed(1),
    efficiency: (kpis.balancingEfficiency * 100).toFixed(0),
    gap: formatNumber(economicKpis.opportunityGapValuePerDay, locale),
  }

  const execText = kpis.meetsDemand
    ? t("execPass", execValues)
    : t("execFail", execValues)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
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
    { label: t("paramDemand"),    value: t("paramDemandValue", { value: formatNumber(scenario.demandPerDay, locale) }) },
    { label: t("paramShifts"),    value: String(scenario.shiftsPerDay) },
    { label: t("paramHours"),     value: t("paramHoursValue", { value: scenario.shiftHours }) },
    { label: t("paramAvailable"), value: t("paramAvailableValue", { value: formatNumber(availMin, locale) }) },
    { label: t("paramLaborRate"), value: t("paramRateValue", { value: formatNumber(economics.laborCostPerHour, locale) }) },
    { label: t("paramMargin"),    value: t("paramMarginValue", { value: formatNumber(economics.contributionMarginPerUnit, locale) }) },
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
    const cleanLabel = fitText(doc, col.label, pColW - 2)
    doc.text(cleanLabel, LM + i * pColW + pColW / 2, y + 3.5, { align: "center" })
  })
  y += 5

  // Param Values
  doc.setFillColor(255, 255, 255)
  doc.rect(LM, y, CW, pBoxH - 5, "FD")
  setDark()
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8.5)
  paramCols.forEach((col, i) => {
    const cleanVal = fitText(doc, col.value, pColW - 2)
    doc.text(cleanVal, LM + i * pColW + pColW / 2, y + 4.8, { align: "center" })
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

    // Card Header Title (7pt bold)
    setGray()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7)
    const cleanTitle = fitText(doc, title.toUpperCase(), gridColW - 12)
    doc.text(cleanTitle, bx + 7, by + 5)

    if (status === "red") setRed()
    else if (status === "green") setGreen()
    else if (status === "amber") setAmber()
    else setDark()

    const maxValW = gridColW - 8 // 50mm max inner width

    // Test font size 11pt bold first
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    if (doc.getTextWidth(val) <= maxValW) {
      doc.text(val, bx + 4, by + 11.2)
    } else {
      // Try font size 9pt bold
      doc.setFontSize(9)
      if (doc.getTextWidth(val) <= maxValW) {
        doc.text(val, bx + 4, by + 11.2)
      } else {
        // Multi-line value (e.g. long station names): use 8pt bold with line wrapping and fitText
        doc.setFontSize(8)
        const lines = doc.splitTextToSize(val, maxValW) as string[]
        if (lines.length === 1) {
          doc.text(lines[0], bx + 4, by + 11.2)
        } else {
          const line1 = lines[0]
          const line2 = fitText(doc, lines.slice(1).join(" "), maxValW)
          doc.text(line1, bx + 4, by + 9.0)
          doc.text(line2, bx + 4, by + 12.0)
        }
      }
    }

    setGray()
    doc.setFont("helvetica", "normal")
    doc.setFontSize(6.8)
    const cleanSub = fitText(doc, sub, maxValW)
    doc.text(cleanSub, bx + 4, by + 15.5)
  }

  // Row 1
  drawKpiGridCard(0, 0, t("taktTitle"), `${kpis.taktTimeMin.toFixed(1)} ${t("minPerUnit")}`, t("taktSub", { available: formatNumber(kpis.availableTimeMin, locale), demand: formatNumber(scenario.demandPerDay, locale) }), "neutral")
  
  const tpSub = kpis.meetsDemand
    ? t("throughputSubPass", { delta: formatNumber(deltaVal, locale) })
    : t("throughputSubFail", { delta: formatNumber(deltaVal, locale) })
  drawKpiGridCard(1, 0, t("throughputTitle"), t("throughputValue", { value: formatNumber(kpis.throughputPerDay, locale) }), tpSub, kpis.meetsDemand ? "green" : "red")

  drawKpiGridCard(2, 0, t("bottleneckTitle"), kpis.bottleneckStationName || "—", t("bottleneckSub", { value: kpis.bottleneckCycleMin.toFixed(1) }), kpis.bottleneckCycleMin > kpis.taktTimeMin ? "red" : "amber")

  // Row 2
  const effPct = (kpis.balancingEfficiency * 100).toFixed(0)
  const effStatus = kpis.balancingEfficiency >= 0.85 ? "green" : kpis.balancingEfficiency >= 0.70 ? "amber" : "red"
  const effSubText = kpis.balancingEfficiency >= 0.85 ? t("effExcellent") : kpis.balancingEfficiency >= 0.70 ? t("effGood") : t("effBad")
  drawKpiGridCard(0, 1, t("balancingTitle"), `${effPct}%`, effSubText, effStatus)

  drawKpiGridCard(1, 1, t("leadTimeTitle"), `${kpis.leadTimeMin.toFixed(1)} ${t("minUnit")}`, t("leadTimeSub"), "neutral")

  const totalOps = scenario.stations.reduce((sum, st) => sum + st.operators, 0)
  drawKpiGridCard(2, 1, t("operatorsTitle"), `${totalOps} ops.`, t("operatorsSub"), "neutral")

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

  // Subtle horizontal background gridlines (3 lines)
  doc.setDrawColor(240, 242, 245)
  doc.setLineWidth(0.1)
  const gridSteps = [0.25, 0.5, 0.75]
  for (const step of gridSteps) {
    const gridY = axisBottomY - chartPlotH * step
    doc.line(axisX, gridY, LM + chartW - 4, gridY)
  }

  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.3)
  doc.line(axisX, axisTopY, axisX, axisBottomY)
  doc.line(axisX, axisBottomY, LM + chartW - 4, axisBottomY)

  // Y-axis Unit Label top-left of chart area
  setGray()
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.text(t("minUnit"), LM + 2, axisTopY - 1)

  // Takt Time Horizontal Line (Dashed)
  const taktY = axisBottomY - (kpis.taktTimeMin / yMaxScale) * chartPlotH
  doc.setDrawColor(220, 38, 38) // Red dashed line
  doc.setLineWidth(0.4)
  doc.setLineDashPattern([1.5, 1.5], 0)
  doc.line(axisX, taktY, LM + chartW - 4, taktY)
  doc.setLineDashPattern([], 0) // Reset line style

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

  // Chart Legend (Boundary safe positioning)
  const legendY = y
  doc.setFillColor(30, 64, 175)
  doc.rect(LM + 4, legendY, 3, 3, "F")
  setGray()
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  const legNormal = fitText(doc, t("chartLegendNormal"), 40)
  doc.text(legNormal, LM + 9, legendY + 2.5)

  const legendOffset1 = LM + 9 + doc.getTextWidth(legNormal) + 8

  doc.setFillColor(220, 38, 38)
  doc.rect(legendOffset1, legendY, 3, 3, "F")
  const legBottleneck = fitText(doc, t("chartLegendBottleneck"), 40)
  doc.text(legBottleneck, legendOffset1 + 5, legendY + 2.5)

  const legendOffset2 = legendOffset1 + 5 + doc.getTextWidth(legBottleneck) + 8

  if (legendOffset2 + 25 <= RM) {
    doc.setDrawColor(220, 38, 38)
    doc.setLineWidth(0.4)
    doc.setLineDashPattern([1.5, 1.5], 0)
    doc.line(legendOffset2, legendY + 1.5, legendOffset2 + 7, legendY + 1.5)
    doc.setLineDashPattern([], 0)
    const taktLegendStr = fitText(doc, t("chartLegendTakt", { value: kpis.taktTimeMin.toFixed(1) }), RM - (legendOffset2 + 9))
    doc.text(taktLegendStr, legendOffset2 + 9, legendY + 2.5)
  }

  y += 9

  // ── 5. MAPA DE FLUJO DE VALOR (VSM) ─────────────
  
  checkPageBreak(50)
  sectionTitle(t("secVsm"))

  const vsmCols = 4
  const boxW = 38
  const boxH = 17
  const gapX = (CW - (vsmCols * boxW)) / (vsmCols - 1)
  const gapY = 10

  for (let i = 0; i < stations.length; i++) {
    const st = stations[i]
    const col = i % vsmCols
    const row = Math.floor(i / vsmCols)
    
    if (col === 0 && checkPageBreak(boxH + gapY + 5)) {
      // y is updated by checkPageBreak if page breaks mid-VSM
    }

    const bx = LM + col * (boxW + gapX)
    const by = y + row * (boxH + gapY)

    // Draw Box
    if (st.isBottleneck) {
      doc.setFillColor(254, 242, 242)
      doc.setDrawColor(220, 38, 38)
      doc.setLineWidth(0.4)
    } else {
      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(203, 213, 225)
      doc.setLineWidth(0.2)
    }
    doc.rect(bx, by, boxW, boxH, "FD")

    // Box Header: "#1 - Station Name"
    doc.setFont("helvetica", st.isBottleneck ? "bold" : "normal")
    doc.setFontSize(6.5)
    setDark()
    const rawLines = doc.splitTextToSize(`#${i + 1} ${st.name}`, boxW - 3) as string[]
    const nameStr = rawLines[0] + (rawLines.length > 1 ? "..." : "")
    doc.text(nameStr, bx + boxW / 2, by + 4.5, { align: "center" })
    
    // Operator count (No emojis to prevent winansi encoding issues)
    setGray()
    doc.setFontSize(6)
    const opText = `${st.operators} ${st.operators === 1 ? "op." : "ops."}`
    doc.text(opText, bx + boxW / 2, by + 9, { align: "center" })

    // Effective Time
    doc.setFont("helvetica", "bold")
    doc.setFontSize(6.5)
    if (st.isBottleneck) {
      doc.setTextColor(220, 38, 38)
    } else {
      setDark()
    }
    doc.text(`TE: ${st.effectiveCycleMin.toFixed(1)} ${t("minUnit")}`, bx + boxW / 2, by + 13.5, { align: "center" })

    // Draw Connector Arrow to next station
    if (i < stations.length - 1) {
      doc.setDrawColor(148, 163, 184)
      doc.setFillColor(148, 163, 184)
      doc.setLineWidth(0.3)
      if (col < vsmCols - 1) {
        // Right arrow
        const startX = bx + boxW
        const startY = by + boxH / 2
        const endX = startX + gapX
        doc.line(startX, startY, endX - 1.5, startY)
        doc.triangle(endX, startY, endX - 2, startY - 1, endX - 2, startY + 1, "F")
      } else {
        // Wrap around arrow
        const startX = bx + boxW / 2
        const startY = by + boxH
        const endX = LM + boxW / 2
        const endY = by + boxH + gapY
        doc.line(startX, startY, startX, startY + gapY / 2)
        doc.line(startX, startY + gapY / 2, endX, startY + gapY / 2)
        doc.line(endX, startY + gapY / 2, endX, endY - 1.5)
        doc.triangle(endX, endY, endX - 1, endY - 2, endX + 1, endY - 2, "F")
      }
    }
  }

  y += Math.ceil(stations.length / vsmCols) * (boxH + gapY) + 4

  // ── 6. MAPA DE RESTRICCIONES Y CARGA DE TRABAJO (YAMAZUMI) ─────────────
  
  checkPageBreak(65)
  sectionTitle(t("secWorkload"))

  // Subtitle
  setGray()
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.text(t("workloadSub"), LM, y)
  y += 5

  const sortedStations = [...stations].sort((a, b) => b.effectiveCycleMin - a.effectiveCycleMin)
  const totalEffTime = sortedStations.reduce((sum, st) => sum + st.effectiveCycleMin, 0)
  
  // Top 3 restrictions visual cards
  const rBadges = [t("primaryBadge"), t("secondaryBadge"), t("tertiaryBadge")]
  const rStyles = [
    { bg: [254, 242, 242], border: [239, 68, 68], badgeBg: [239, 68, 68], text: [185, 28, 28] }, // Red
    { bg: [254, 243, 199], border: [245, 158, 11], badgeBg: [245, 158, 11], text: [180, 83, 9] },  // Orange
    { bg: [245, 243, 255], border: [139, 92, 246], badgeBg: [139, 92, 246], text: [109, 40, 217] } // Purple / Violet
  ]

  const numCards = Math.min(3, sortedStations.length)
  const cardGap = 3
  const cardW = (CW - (numCards - 1) * cardGap) / numCards
  const cardH = 19

  for (let k = 0; k < numCards; k++) {
    const st = sortedStations[k]
    const style = rStyles[k]
    const cx = LM + k * (cardW + cardGap)
    const cy = y

    // Card background & border
    doc.setFillColor(style.bg[0], style.bg[1], style.bg[2])
    doc.setDrawColor(style.border[0], style.border[1], style.border[2])
    doc.setLineWidth(0.3)
    doc.rect(cx, cy, cardW, cardH, "FD")

    // Top Badge Header inside card
    doc.setFillColor(style.badgeBg[0], style.badgeBg[1], style.badgeBg[2])
    doc.rect(cx, cy, cardW, 4.5, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(5.5)
    doc.setTextColor(255, 255, 255)
    doc.text(rBadges[k], cx + cardW / 2, cy + 3.2, { align: "center" })

    // Station Name inside card
    doc.setFont("helvetica", "bold")
    doc.setFontSize(6.5)
    setDark()
    const nameLines = doc.splitTextToSize(st.name, cardW - 3) as string[]
    const nameStr = nameLines[0] + (nameLines.length > 1 ? "..." : "")
    doc.text(nameStr, cx + cardW / 2, cy + 9.5, { align: "center" })

    // Time & %
    doc.setFont("helvetica", "bold")
    doc.setFontSize(6.5)
    doc.setTextColor(style.text[0], style.text[1], style.text[2])
    const pct = ((st.effectiveCycleMin / totalEffTime) * 100).toFixed(1)
    doc.text(`${st.effectiveCycleMin.toFixed(1)} ${t("minUnit")} (${pct}%)`, cx + cardW / 2, cy + 15.5, { align: "center" })
  }

  y += cardH + 7

  // Yamazumi Stacked Bar Title
  setDark()
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.5)
  doc.text(t("workloadDistribution") + ":", LM, y)
  y += 4

  // Draw Stacked Bar
  const yamazumiH = 9
  let currentX = LM
  
  let colorIdx = 0
  const blueShades = [
    [59, 130, 246],  // blue-500
    [96, 165, 250],  // blue-400
    [147, 197, 253], // blue-300
    [37, 99, 235],   // blue-600
    [29, 78, 216]    // blue-700
  ]

  const stationColors: number[][] = []

  for (let i = 0; i < stations.length; i++) {
    const st = stations[i]
    const w = (st.effectiveCycleMin / totalEffTime) * CW
    
    let color: number[]
    if (st.isBottleneck) {
      color = [239, 68, 68]
    } else {
      color = blueShades[colorIdx % blueShades.length]
      colorIdx++
    }
    stationColors.push(color)

    doc.setFillColor(color[0], color[1], color[2])
    doc.rect(currentX, y, w, yamazumiH, "F")
    
    const pct = Math.round((st.effectiveCycleMin / totalEffTime) * 100) + "%"
    if (w >= 14) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(6)
      doc.setTextColor(255, 255, 255)
      doc.text(`#${i + 1} (${pct})`, currentX + w / 2, y + 5.5, { align: "center" })
    } else if (w >= 7) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(6)
      doc.setTextColor(255, 255, 255)
      doc.text(`#${i + 1}`, currentX + w / 2, y + 5.5, { align: "center" })
    }
    
    currentX += w
  }

  y += yamazumiH + 5

  // Yamazumi Station Legend Table / Key
  setDark()
  doc.setFont("helvetica", "bold")
  doc.setFontSize(6.5)
  doc.text(t("totalWorkloadLegend"), LM, y)
  y += 4

  const legCols = 2
  const legColW = CW / legCols

  for (let i = 0; i < stations.length; i++) {
    const st = stations[i]
    const color = stationColors[i]
    const cCol = i % legCols
    const cRow = Math.floor(i / legCols)
    const lx = LM + cCol * legColW
    const ly = y + cRow * 4.5

    // Color Swatch
    doc.setFillColor(color[0], color[1], color[2])
    doc.rect(lx, ly, 2.5, 2.5, "F")

    // Label: #i Station Name (X.X min - Y.Y%) [Cuello de Botella]
    doc.setFont("helvetica", st.isBottleneck ? "bold" : "normal")
    doc.setFontSize(6.5)
    if (st.isBottleneck) {
      doc.setTextColor(220, 38, 38)
    } else {
      setDark()
    }
    
    const pct = ((st.effectiveCycleMin / totalEffTime) * 100).toFixed(1)
    const lineLabel = fitText(
      doc,
      `#${i + 1} ${st.name}: ${st.effectiveCycleMin.toFixed(1)} ${t("minUnit")} (${pct}%)${st.isBottleneck ? ` - ${t("chartLegendBottleneck")}` : ""}`,
      legColW - 5
    )
    doc.text(lineLabel, lx + 4, ly + 2.2)
  }

  y += Math.ceil(stations.length / legCols) * 4.5 + 8

  // ── 7. TABLA DETALLADA DE ESTACIONES (MULTILÍNEA Y BOUNDARY SAFE) ─────────────

  checkPageBreak(30)
  sectionTitle(t("secStations"))

  const tCols = [
    { x: LM,       w: 8,  label: t("colIndex"),    align: "center" as const },
    { x: LM + 8,   w: 60, label: t("colName"),     align: "left" as const   },
    { x: LM + 68,  w: 20, label: t("colCycle"),    align: "right" as const  },
    { x: LM + 88,  w: 16, label: t("colOperators"),align: "center" as const },
    { x: LM + 104, w: 20, label: t("colFailure"),  align: "center" as const },
    { x: LM + 124, w: 23, label: t("colEffective"),align: "right" as const  },
    { x: LM + 147, w: 33, label: t("colExceeds"),  align: "center" as const },
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

    // Multiline wrapped station name with correct font size set first
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

    const textY = y + 4.2
    doc.text(String(i + 1), tCols[0].x + tCols[0].w / 2, textY, { align: "center" })
    doc.text(nameLines, tCols[1].x + 1.5, textY)
    doc.text(`${st.cycleTimeMin} ${t("minUnit")}`, tCols[2].x + tCols[2].w - 1, textY, { align: "right" })
    doc.text(String(st.operators), tCols[3].x + tCols[3].w / 2, textY, { align: "center" })
    doc.text(`${(st.failureRate * 100).toFixed(0)}%`, tCols[4].x + tCols[4].w / 2, textY, { align: "center" })
    doc.text(`${st.effectiveCycleMin.toFixed(1)} ${t("minUnit")}`, tCols[5].x + tCols[5].w - 1, textY, { align: "right" })

    if (exceedsTakt) setRed()
    else setGreen()
    doc.setFont("helvetica", "bold")
    doc.text(exceedsTakt ? t("exceedsYes") : t("exceedsNo"), tCols[6].x + tCols[6].w / 2, textY, { align: "center" })

    y += rowH
  }

  y += 6

  // ── 8. PLAN DE MEJORA Y RECOMENDACIONES (SI EXISTEN) ───────────────────────

  if (recommendations.length > 0) {
    checkPageBreak(35)
    sectionTitle(t("secImprovements"))

    const rCols = [
      { x: LM,       w: 20, label: t("colRecType"),   align: "center" as const },
      { x: LM + 20,  w: 78, label: t("colRecDesc"),   align: "left" as const   },
      { x: LM + 98,  w: 28, label: t("colRecImpact"), align: "right" as const  },
      { x: LM + 126, w: 24, label: t("colRecCost"),   align: "right" as const  },
      { x: LM + 150, w: 30, label: t("colRecPayback"),align: "center" as const },
    ]

    function drawRecTableHeader() {
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
    }

    drawRecTableHeader()

    for (let rIdx = 0; rIdx < recommendations.length; rIdx++) {
      const rec = recommendations[rIdx]
      const stationChanges = rec.stationChanges?.map((c) => ({
        stationId: c.originalStationId,
        updates: c.updates,
      }))
      const { scenario: projectedScenario } = simulateScenario(scenario, stationChanges, rec.scenarioChanges)
      const econImpact = calculateRecommendationEconomicImpact(scenario, projectedScenario, rec.type)

      const priorityText = rec.priority === "high" ? "ALTA" : rec.priority === "medium" ? "MEDIA" : "BAJA"
      const recDesc = tImprovements(`recs.${rec.titleKey}.title`, rec.titleValues)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(7.5)
      const descLines = doc.splitTextToSize(recDesc, rCols[1].w - 3) as string[]
      const rRowH = Math.max(6, descLines.length * 3.8 + 2.5)

      if (checkPageBreak(rRowH)) {
        drawRecTableHeader()
      }

      doc.setFillColor(rIdx % 2 === 0 ? 255 : 248, rIdx % 2 === 0 ? 255 : 250, rIdx % 2 === 0 ? 255 : 252)
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.15)
      doc.rect(LM, y, CW, rRowH, "FD")

      // Priority Badge Text Color
      if (rec.priority === "high") setRed()
      else if (rec.priority === "medium") setAmber()
      else setBlue()

      const rTextY = y + 4.2
      doc.setFont("helvetica", "bold")
      doc.setFontSize(7)
      doc.text(priorityText, rCols[0].x + rCols[0].w / 2, rTextY, { align: "center" })

      setDark()
      doc.setFont("helvetica", "normal")
      doc.setFontSize(7.5)
      doc.text(descLines, rCols[1].x + 1.5, rTextY)

      setGreen()
      doc.setFont("helvetica", "bold")
      const netStr = fitText(doc, formatSignedAmount(econImpact.netImpactPerDay, locale, t("perDay")), rCols[2].w - 2)
      doc.text(netStr, rCols[2].x + rCols[2].w - 1, rTextY, { align: "right" })

      setDark()
      doc.setFont("helvetica", "normal")
      const costStr = fitText(doc, econImpact.oneOffCost > 0 ? formatCurrency(econImpact.oneOffCost, locale) : "0 €", rCols[3].w - 2)
      doc.text(costStr, rCols[3].x + rCols[3].w - 1, rTextY, { align: "right" })

      const paybackStr = fitText(doc, formatPayback(econImpact.paybackDays, t, locale), rCols[4].w - 2)
      doc.text(paybackStr, rCols[4].x + rCols[4].w / 2, rTextY, { align: "center" })

      y += rRowH
    }
    y += 6
  }

  // ── 9. ANÁLISIS ECONÓMICO Y DE IMPACTO FINANCIERO ────────────────────────────

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

    const maxW = econCardW - 8

    setGray()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7)
    const cleanTitle = fitText(doc, title.toUpperCase(), maxW)
    doc.text(cleanTitle, bx + 4, by + 4.5)

    if (isGap && amount <= 0) {
      setGreen()
      doc.setFont("helvetica", "bold")
      doc.setFontSize(8.5)
      const cleanZero = fitText(doc, t("econGapZero"), maxW)
      doc.text(cleanZero, bx + 4, by + 11.5)
    } else {
      if (isGap && amount > 0) setRed()
      else if (amount > 0) setDark()
      else setGray()

      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      const formattedAmount = fitText(doc, `${formatNumber(amount, locale)} ${t("perDay")}`, maxW)
      doc.text(formattedAmount, bx + 4, by + 11.5)
    }
  }

  drawEconCard(0, 0, t("econOpCost"), economicKpis.totalOperatingCostPerDay)
  drawEconCard(1, 0, t("econLaborCost"), economicKpis.laborCostPerDay)
  drawEconCard(2, 0, t("econReworkCost"), economicKpis.reworkCostPerDay)

  drawEconCard(0, 1, t("econContribution"), economicKpis.fulfilledContributionPerDay)
  drawEconCard(1, 1, t("econOpportunityGap"), economicKpis.opportunityGapValuePerDay, true)

  y += econCardH * 2 + 9

  // ── 10. ANÁLISIS DE RIESGO ESTOCÁSTICO (SIMULACIÓN MONTE CARLO) ───────────────

  checkPageBreak(40)
  sectionTitle(t("secMonteCarlo"))

  const mcConfidencePct = Math.round(mcResult.probabilityMeetDemand * 100)
  const isMcHighConfidence = mcConfidencePct >= 80

  // Status Banner
  const mcBannerH = 14
  doc.setFillColor(isMcHighConfidence ? 240 : 254, isMcHighConfidence ? 253 : 242, isMcHighConfidence ? 244 : 242)
  doc.setDrawColor(isMcHighConfidence ? 187 : 254, isMcHighConfidence ? 247 : 202, isMcHighConfidence ? 208 : 202)
  doc.setLineWidth(0.3)
  doc.roundedRect(LM, y, CW, mcBannerH, 1.2, 1.2, "FD")

  // Accent Pill
  doc.setFillColor(isMcHighConfidence ? 22 : 220, isMcHighConfidence ? 163 : 38, isMcHighConfidence ? 74 : 38)
  doc.rect(LM, y, 2.5, mcBannerH, "F")

  if (isMcHighConfidence) setGreen()
  else setRed()

  doc.setFont("helvetica", "bold")
  doc.setFontSize(8.5)
  doc.text(t("mcConfidence", { pct: mcConfidencePct, cv: Math.round(mcCv * 100) }), LM + 6, y + 5)

  setGray()
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7.5)
  const mcSubText = isMcHighConfidence
    ? t("mcRobust", { pct: mcConfidencePct })
    : t("mcAtRisk", { pct: mcConfidencePct })
  const mcSubLines = doc.splitTextToSize(mcSubText, CW - 10) as string[]
  doc.text(mcSubLines[0], LM + 6, y + 9.5)

  y += mcBannerH + 4

  // 3 Percentile Cards: P5 (Pesimista), P50 (Mediana), P95 (Optimista)
  const mcCardW = (CW - 6) / 3
  const mcCardH = 16

  function drawMcCard(col: number, labelKey: string, valNum: number, status: "red" | "neutral" | "green") {
    const bx = LM + col * (mcCardW + 3)
    const by = y

    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.roundedRect(bx, by, mcCardW, mcCardH, 1.2, 1.2, "FD")

    setGray()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7)
    const cleanTitle = fitText(doc, t(labelKey).toUpperCase(), mcCardW - 6)
    doc.text(cleanTitle, bx + 4, by + 4.5)

    if (status === "red") setRed()
    else if (status === "green") setGreen()
    else setDark()

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    const formattedVal = fitText(doc, t("mcUnitsDay", { value: formatNumber(valNum, locale) }), mcCardW - 6)
    doc.text(formattedVal, bx + 4, by + 11.5)
  }

  const p5Status = mcResult.throughput.p5 >= scenario.demandPerDay ? "green" : "red"
  const p50Status = mcResult.throughput.median >= scenario.demandPerDay ? "green" : "neutral"

  drawMcCard(0, "mcP5", mcResult.throughput.p5, p5Status)
  drawMcCard(1, "mcP50", mcResult.throughput.median, p50Status)
  drawMcCard(2, "mcP95", mcResult.throughput.p95, "green")

  y += mcCardH + 9

  // ── 11. DIAGNÓSTICO AUTOMÁTICO DE LÍNEA (INSIGHTS) ────────────────────────────

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

    doc.setFont("helvetica", "normal")
    doc.setFontSize(7.5)
    const msgLines = doc.splitTextToSize(msgText, CW - 8) as string[]
    const insightH = msgLines.length * 3.8 + 6

    checkPageBreak(insightH)

    // Vector bullet circle
    doc.setFillColor(r, g, b)
    doc.circle(LM + 2, y + 2, 1.2, "F")

    doc.setTextColor(r, g, b)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8.5)
    const cleanInsightTitle = fitText(doc, titleText, CW - 8)
    doc.text(cleanInsightTitle, LM + 5, y + 3)

    setGray()
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7.5)
    doc.text(msgLines, LM + 5, y + 7)

    y += insightH + 2
  }

  y += 4

  // ── 12. METODOLOGÍA Y SUPUESTOS DEL MODELO ────────────────────────────────────

  checkPageBreak(25)
  sectionTitle(t("secMethodology"))

  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.2)

  const methodText = t("methodologyText")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  const methodLines = doc.splitTextToSize(methodText, CW - 6) as string[]
  const methodBoxH = methodLines.length * 3.6 + 5

  doc.rect(LM, y, CW, methodBoxH, "FD")

  setGray()
  doc.text(methodLines, LM + 3, y + 4)

  // ── FOOTER NUMERADO EN TODAS LAS PÁGINAS ─────────────────────────────────────

  const totalPages = doc.getNumberOfPages()
  for (let pageIdx = 1; pageIdx <= totalPages; pageIdx++) {
    doc.setPage(pageIdx)
    if (pageIdx >= 2) {
      try {
        doc.addImage(LOGO_REPORT_BASE64, "PNG", LM, 7, 42, 9.3)
      } catch {
        setBlue()
        doc.setFont("helvetica", "bold")
        doc.setFontSize(14)
        doc.text("TAKT STUDIO", LM, 14)
      }
      drawHeaderRightMetadata(13)
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.3)
      doc.line(LM, 18, RM, 18)
    }
    drawFooter(pageIdx, totalPages)
  }

  // ── NOMBRE DE ARCHIVO SANITIZADO ──────────────────────────────────────────────

  const safeScenarioName = baseTitle
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
