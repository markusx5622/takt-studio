import { useTaktStore } from "@/lib/store"
import {
  calculateAllKPIs,
  calculateEconomicKPIs,
  getStationsWithEffective
} from "@/lib/calculations"
import { runMonteCarlo } from "@/lib/monte-carlo"
import { LOGO_REPORT_BASE64 } from "@/lib/logo-base64"
import type { KPIs, Scenario } from "@/types"

const APP_VERSION = "0.1.0"

// ─── PDF Geometry Constants ───────────────────────────────────────────────────

const LM = 15
const RM = 195
const CW = 180
const FOOTER_Y = 286

// ─── Formatting Helpers ───────────────────────────────────────────────────────

function getTargetLocale(locale: string): string {
  if (locale === "es") return "es-ES"
  if (locale === "en") return "en-US"
  return locale
}

function formatNumber(val: number, locale: string, fractionDigits = 0): string {
  const targetLocale = getTargetLocale(locale)
  return new Intl.NumberFormat(targetLocale, { 
    useGrouping: "always",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(val)
}

// ─── Types & i18n Interfaces ──────────────────────────────────────────────────

export type PdfTranslator = (key: string, values?: Record<string, string | number>) => string

export interface ComparePdfOptions {
  tCompare: PdfTranslator
  tPdf: PdfTranslator
  locale: string
}

// ─── Main PDF Generation Engine ───────────────────────────────────────────────

export async function generateComparativePdf(scenarioAId: string, scenarioBId: string, options: ComparePdfOptions) {
  const { tCompare, tPdf, locale } = options
  const { jsPDF } = await import("jspdf")

  const state = useTaktStore.getState()
  const scenarioA = state.scenarios.find((s) => s.id === scenarioAId)
  const scenarioB = state.scenarios.find((s) => s.id === scenarioBId)
  if (!scenarioA || !scenarioB) return

  const kpisA = calculateAllKPIs(scenarioA)
  const kpisB = calculateAllKPIs(scenarioB)
  const econA = calculateEconomicKPIs(scenarioA, kpisA)
  const econB = calculateEconomicKPIs(scenarioB, kpisB)

  const mcCvA = scenarioA.monteCarloOptions?.cv ?? 0.1
  const mcSeedA = scenarioA.monteCarloOptions?.seed ?? 42
  const mcA = runMonteCarlo(scenarioA, { runs: 2000, cv: mcCvA, seed: mcSeedA })

  const mcCvB = scenarioB.monteCarloOptions?.cv ?? 0.1
  const mcSeedB = scenarioB.monteCarloOptions?.seed ?? 42
  const mcB = runMonteCarlo(scenarioB, { runs: 2000, cv: mcCvB, seed: mcSeedB })

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

  doc.setProperties({
    title: `${tCompare("pdfReportTitle")}`,
    author: "Takt Studio",
    creator: "Takt Studio",
  })

  // ── Color & Typography Helpers ──────────────────────────────────────────────
  function setDark()   { doc.setTextColor(15, 23, 42) }
  function setGray()   { doc.setTextColor(100, 116, 139) }
  function setBlue()   { doc.setTextColor(30, 64, 175) }
  function setGreen()  { doc.setTextColor(21, 128, 61) }
  function setRed()    { doc.setTextColor(185, 28, 28) }
  function setDeltaColor(delta: number, higherIsBetter: boolean) {
    if (delta > 0) return higherIsBetter ? setGreen() : setRed()
    if (delta < 0) return higherIsBetter ? setRed() : setGreen()
    setGray()
  }

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
    const baseFooterText = tPdf("footer")
    const footerStr = baseFooterText.includes("Takt Studio")
      ? baseFooterText.replace("Takt Studio", `Generado por Takt Studio v${APP_VERSION}`)
      : `Generado por Takt Studio v${APP_VERSION} · ${baseFooterText}`
    doc.text(footerStr, LM, FOOTER_Y + 5)
    doc.text(tPdf("page", { current, total }), RM, FOOTER_Y + 5, { align: "right" })
  }

  // ── PORTADA CORPORATIVA ─────────────────────────────────────────────────────

  const now = new Date()
  const dateStr = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(now)

  const timeCompact = `${now.getHours().toString().padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}`
  const dateCompact = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`
  const reportId = `CMP-${dateCompact}-${timeCompact}`

  const pageCenter = 210 / 2

  const coverLogoW = 110
  const coverLogoH = 24.4
  const coverLogoX = pageCenter - 0.3833 * coverLogoW
  try {
    doc.addImage(LOGO_REPORT_BASE64, "PNG", coverLogoX, 18, coverLogoW, coverLogoH)
  } catch {
    setBlue()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(32)
    doc.text("TAKT STUDIO", pageCenter, 32, { align: "center" })
  }

  setDark()
  doc.setFont("helvetica", "bold")
  doc.setFontSize(22)
  doc.text(tCompare("pdfReportTitle"), pageCenter, 78, { align: "center" })

  setBlue()
  doc.setFont("helvetica", "normal")
  doc.setFontSize(13)
  const subtitle = tCompare("subtitleFull")
  doc.text(subtitle, pageCenter, 89, { align: "center" })

  doc.setDrawColor(30, 64, 175)
  doc.setLineWidth(0.5)
  doc.line(pageCenter - 40, 97, pageCenter + 40, 97)

  const vsY = 115
  setDark()
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text("A", pageCenter - 45, vsY, { align: "center" })
  doc.text("B", pageCenter + 45, vsY, { align: "center" })
  
  setGray()
  doc.setFont("helvetica", "italic")
  doc.setFontSize(12)
  doc.text("vs", pageCenter, vsY, { align: "center" })

  setBlue()
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  
  const aLines = doc.splitTextToSize(scenarioA.name, 75) as string[]
  for (let i = 0; i < aLines.length; i++) {
    doc.text(aLines[i], pageCenter - 45, vsY + 8 + i * 7, { align: "center" })
  }

  const bLines = doc.splitTextToSize(scenarioB.name, 75) as string[]
  for (let i = 0; i < bLines.length; i++) {
    doc.text(bLines[i], pageCenter + 45, vsY + 8 + i * 7, { align: "center" })
  }

  const metaStartY = vsY + Math.max(aLines.length, bLines.length) * 7 + 25

  const metaCardW = 135
  const metaCardX = pageCenter - metaCardW / 2
  const metaCardH = 40

  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.4)
  doc.roundedRect(metaCardX, metaStartY, metaCardW, metaCardH, 3, 3, "FD")

  const metaItems = [
    { label: tPdf("coverDate"), value: dateStr },
    { label: tPdf("coverId"), value: reportId },
    { label: tPdf("coverVersion"), value: `Takt Studio v${APP_VERSION}` },
  ]

  const metaRowH = metaCardH / metaItems.length
  for (let i = 0; i < metaItems.length; i++) {
    const my = metaStartY + i * metaRowH + metaRowH / 2 + 1.8
    setGray()
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9.5)
    doc.text(metaItems[i].label, metaCardX + 12, my)

    setDark()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text(metaItems[i].value, metaCardX + metaCardW - 12, my, { align: "right" })

    if (i < metaItems.length - 1) {
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.2)
      doc.line(metaCardX + 6, metaStartY + (i + 1) * metaRowH, metaCardX + metaCardW - 6, metaStartY + (i + 1) * metaRowH)
    }
  }

  doc.setFillColor(30, 64, 175)
  doc.rect(0, 280, 210, 17, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.text(tPdf("coverConfidential"), pageCenter, 290, { align: "center" })


  // ── CONTENT PAGES START (Page 2+) ──────────────────────────────────────────

  doc.addPage()
  
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

    setGray()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.text(labelEmisionText, curX, yPos)
    curX += wLabelEmision

    doc.setFont("helvetica", "normal")
    doc.text(dateStr, curX, yPos)
    curX += wValEmision

    doc.setFont("helvetica", "bold")
    doc.text(labelIdText, curX, yPos)
    curX += wLabelId

    doc.setFont("helvetica", "normal")
    doc.text(reportId, curX, yPos)
  }

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

  setDark()
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text(tCompare("pdfReportTitle"), LM, 25)

  y = 35

  function fitText(text: string, maxWidth: number): string {
    if (!text) return ""
    if (doc.getTextWidth(text) <= maxWidth) return text
    let truncated = text
    while (truncated.length > 0 && doc.getTextWidth(truncated + "…") > maxWidth) {
      truncated = truncated.slice(0, -1)
    }
    return truncated + "…"
  }

  // ── 0. COMPARATIVA RÁPIDA (MINI KPIS) ───────────────────────────────────────
  
  function drawMiniKpis() {
    sectionTitle(tCompare("quickCompareTitle"))
    
    const gap = 4
    const cols = 5
    const cardW = (CW - (cols - 1) * gap) / cols
    const cardH = 24
    
    const kpiData = [
      {
        title: "Takt Time",
        unit: tCompare("minPerUnit"),
        valA: kpisA.taktTimeMin,
        valB: kpisB.taktTimeMin,
        delta: kpisB.taktTimeMin - kpisA.taktTimeMin,
        higherIsBetter: false,
        fmt: (v: number) => formatNumber(v, locale, 1)
      },
      {
        title: "Throughput",
        unit: tCompare("unitsPerDay"),
        valA: kpisA.throughputPerDay,
        valB: kpisB.throughputPerDay,
        delta: kpisB.throughputPerDay - kpisA.throughputPerDay,
        higherIsBetter: true,
        fmt: (v: number) => formatNumber(v, locale, 0)
      },
      {
        title: tCompare("rowBottleneck"),
        unit: tCompare("minPerUnit"),
        valA: kpisA.bottleneckCycleMin,
        valB: kpisB.bottleneckCycleMin,
        delta: kpisB.bottleneckCycleMin - kpisA.bottleneckCycleMin,
        higherIsBetter: false,
        fmt: (v: number) => formatNumber(v, locale, 1)
      },
      {
        title: tCompare("rowBalancing"),
        unit: "%",
        valA: kpisA.balancingEfficiency * 100,
        valB: kpisB.balancingEfficiency * 100,
        delta: (kpisB.balancingEfficiency - kpisA.balancingEfficiency) * 100,
        higherIsBetter: true,
        fmt: (v: number) => formatNumber(v, locale, 1)
      },
      {
        title: "Lead Time",
        unit: tCompare("minUnit"),
        valA: kpisA.leadTimeMin,
        valB: kpisB.leadTimeMin,
        delta: kpisB.leadTimeMin - kpisA.leadTimeMin,
        higherIsBetter: false,
        fmt: (v: number) => formatNumber(v, locale, 1)
      }
    ]

    for (let i = 0; i < cols; i++) {
      const data = kpiData[i]
      const bx = LM + i * (cardW + gap)
      const by = y
      
      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.3)
      doc.roundedRect(bx, by, cardW, cardH, 2, 2, "FD")
      
      // Title
      setGray()
      doc.setFont("helvetica", "normal")
      doc.setFontSize(7)
      const titleClean = fitText(data.title, cardW - 4)
      doc.text(titleClean, bx + 2, by + 4.5)
      
      // Values B
      setDark()
      doc.setFont("helvetica", "bold")
      doc.setFontSize(10.5)
      doc.text(`${data.fmt(data.valB)}`, bx + cardW / 2, by + 10.5, { align: "center" })
      
      // Values A vs B string
      setGray()
      doc.setFont("helvetica", "normal")
      doc.setFontSize(6.5)
      doc.text(`A: ${data.fmt(data.valA)} | B: ${data.fmt(data.valB)}`, bx + cardW / 2, by + 15, { align: "center" })
      
      // Delta
      if (Math.abs(data.delta) > 0.01) {
        setDeltaColor(data.delta, data.higherIsBetter)
      } else {
        setGray()
      }
      doc.setFont("helvetica", "bold")
      doc.setFontSize(7.5)
      const sign = data.delta > 0 ? "+" : ""
      doc.text(`${sign}${data.fmt(data.delta)}`, bx + cardW / 2, by + 20, { align: "center" })
    }
    
    y += cardH + 8
  }

  // ── 0.5 DIAGRAMAS TAKT TIME ────────────────────────────────────────────────
  
  function drawTaktChart(scenario: Scenario, kpis: KPIs, label: string) {
    checkPageBreak(50)
    
    const effectiveStations = getStationsWithEffective(scenario.stations, kpis.taktTimeMin)
    
    setDark()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.text(label, LM, y)
    y += 4

    const chartH = 28
    const chartW = CW
    const chartY = y
    
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.rect(LM, chartY, chartW, chartH, "FD")
    
    const maxCycle = Math.max(...effectiveStations.map((s) => s.effectiveCycleMin), kpis.taktTimeMin, 1)
    const yMaxScale = maxCycle * 1.25
    
    const axisX = LM + 12
    const axisBottomY = chartY + chartH - 5
    const axisTopY = chartY + 4
    const chartPlotH = axisBottomY - axisTopY
    
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
    
    setGray()
    doc.setFont("helvetica", "normal")
    doc.setFontSize(6.5)
    doc.text(tCompare("minUnit") || "min", LM + 2, axisTopY - 1)
    
    const taktY = axisBottomY - (kpis.taktTimeMin / yMaxScale) * chartPlotH
    doc.setDrawColor(220, 38, 38)
    doc.setLineWidth(0.4)
    doc.setLineDashPattern([1.5, 1.5], 0)
    doc.line(axisX, taktY, LM + chartW - 4, taktY)
    doc.setLineDashPattern([], 0)
    
    const numStations = effectiveStations.length
    const availW = chartW - 20
    const barSpacing = Math.max(1.5, Math.min(6, (availW / numStations) * 0.25))
    const barW = Math.max(3, Math.min(16, (availW - barSpacing * (numStations + 1)) / numStations))
    
    for (let i = 0; i < numStations; i++) {
      const st = effectiveStations[i]
      const bx = axisX + barSpacing + i * (barW + barSpacing)
      const bHeight = Math.max(1, (st.effectiveCycleMin / yMaxScale) * chartPlotH)
      const by = axisBottomY - bHeight
      
      if (st.isBottleneck) {
        doc.setFillColor(220, 38, 38)
        doc.setDrawColor(185, 28, 28)
      } else {
        doc.setFillColor(30, 64, 175)
        doc.setDrawColor(29, 78, 216)
      }
      doc.setLineWidth(0.2)
      doc.rect(bx, by, barW, bHeight, "FD")
      
      setDark()
      doc.setFont("helvetica", st.isBottleneck ? "bold" : "normal")
      doc.setFontSize(5.5)
      doc.text(`${st.effectiveCycleMin.toFixed(1)}`, bx + barW / 2, by - 1, { align: "center" })
      
      setGray()
      doc.setFont("helvetica", "bold")
      doc.setFontSize(6)
      doc.text(`#${i + 1}`, bx + barW / 2, axisBottomY + 3.5, { align: "center" })
    }
    
    y = chartY + chartH + 4
    
    const legendY = y
    doc.setFillColor(30, 64, 175)
    doc.rect(LM + 4, legendY, 2.5, 2.5, "F")
    setGray()
    doc.setFont("helvetica", "normal")
    doc.setFontSize(6.5)
    const legNormal = fitText(tCompare("chartLegendNormal") || "Estación (Ciclo Efectivo)", 40)
    doc.text(legNormal, LM + 8, legendY + 2)
    
    const legendOffset1 = LM + 8 + doc.getTextWidth(legNormal) + 8
    doc.setFillColor(220, 38, 38)
    doc.rect(legendOffset1, legendY, 2.5, 2.5, "F")
    const legBottleneck = fitText(tCompare("chartLegendBottleneck") || "Cuello de Botella", 40)
    doc.text(legBottleneck, legendOffset1 + 4, legendY + 2)
    
    const legendOffset2 = legendOffset1 + 4 + doc.getTextWidth(legBottleneck) + 8
    if (legendOffset2 + 25 <= RM) {
      doc.setDrawColor(220, 38, 38)
      doc.setLineWidth(0.4)
      doc.setLineDashPattern([1.5, 1.5], 0)
      doc.line(legendOffset2, legendY + 1.2, legendOffset2 + 6, legendY + 1.2)
      doc.setLineDashPattern([], 0)
      const taktLegendStr = fitText(tCompare("chartLegendTakt", { value: kpis.taktTimeMin.toFixed(1) }) || `Takt Time (${kpis.taktTimeMin.toFixed(1)})`, RM - (legendOffset2 + 8))
      doc.text(taktLegendStr, legendOffset2 + 8, legendY + 2)
    }
    
    y += 8
  }

  drawMiniKpis()
  
  sectionTitle(tCompare("secChartTitle"))
  drawTaktChart(scenarioA, kpisA, `Escenario A: ${scenarioA.name}`)
  drawTaktChart(scenarioB, kpisB, `Escenario B: ${scenarioB.name}`)
  
  y += 6

  // ── Helper to draw a Comparison Table ───────────────────────────────────────
  
  type Row = { 
    label: string
    sublabel?: string
    a: string
    b: string
    deltaNum: number
    deltaStr: string
    higherIsBetter: boolean 
  }

  const colDeltaHeader = locale.toLowerCase().startsWith("en") ? "Diff (B - A)" : "Dif (B - A)"

  function drawComparisonTable(title: string, subtitle: string | undefined, rows: Row[]) {
    sectionTitle(title)
    
    if (subtitle) {
      setGray()
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.text(subtitle, LM, y)
      y += 6
    }
    
    const cw = CW
    const colLabelW = cw * 0.40
    const colAW = cw * 0.20
    const colBW = cw * 0.20
    const colDeltaW = cw * 0.20
    
    const xLabel = LM
    const xA = LM + colLabelW
    const xB = xA + colAW
    const xDelta = xB + colBW
    
    // Header
    doc.setFillColor(241, 245, 249) // slate-100
    doc.rect(LM, y, cw, 8, "F")
    
    setDark()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.text(tCompare("colMetric"), xLabel + 3, y + 5.5)
    doc.text(tCompare("colA"), xA + colAW - 3, y + 5.5, { align: "right" })
    doc.text(tCompare("colB"), xB + colBW - 3, y + 5.5, { align: "right" })
    doc.text(colDeltaHeader, xDelta + colDeltaW - 3, y + 5.5, { align: "right" })
    
    y += 8
    
    // Rows
    rows.forEach((r, i) => {
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      const labelLines = doc.splitTextToSize(r.label, colLabelW - 6) as string[]
      
      let subLines: string[] = []
      if (r.sublabel) {
        doc.setFontSize(6.5)
        subLines = doc.splitTextToSize(r.sublabel, colLabelW - 6) as string[]
      }
      
      const labelBlockHeight = labelLines.length * 3.8
      const subBlockHeight = subLines.length > 0 ? subLines.length * 3.2 + 1.5 : 0
      const contentHeight = labelBlockHeight + subBlockHeight
      const rowHeight = Math.max(8, contentHeight + 4)

      checkPageBreak(rowHeight)

      if (i % 2 === 1) {
        doc.setFillColor(248, 250, 252) // slate-50
        doc.rect(LM, y, cw, rowHeight, "F")
      }
      
      // Render main label lines
      setGray()
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      labelLines.forEach((lLine, idx) => {
        doc.text(lLine, xLabel + 3, y + 4.5 + idx * 3.8)
      })
      
      // Render sublabel lines
      if (subLines.length > 0) {
        doc.setFontSize(6.5)
        doc.setTextColor(148, 163, 184) // slate-400
        const subStartY = y + 4.5 + labelLines.length * 3.8
        subLines.forEach((sLine, idx) => {
          doc.text(sLine, xLabel + 3, subStartY + idx * 3.2)
        })
      }
      
      // Center values vertically in the row
      setDark()
      doc.setFont("helvetica", "bold")
      doc.setFontSize(8)
      const valY = y + rowHeight / 2 + 1.5
      doc.text(r.a, xA + colAW - 3, valY, { align: "right" })
      doc.text(r.b, xB + colBW - 3, valY, { align: "right" })
      
      if (r.deltaNum !== 0) {
        setDeltaColor(r.deltaNum, r.higherIsBetter)
      } else {
        setGray()
      }
      doc.text(r.deltaStr, xDelta + colDeltaW - 3, valY, { align: "right" })
      
      doc.setDrawColor(241, 245, 249)
      doc.setLineWidth(0.2)
      doc.line(LM, y + rowHeight, RM, y + rowHeight)
      
      y += rowHeight
    })
    
    y += 8
  }

  // ── 1. COMPARATIVA OPERATIVA ────────────────────────────────────────────────

  const opRows: Row[] = [
    {
      label: tCompare("rowTakt"),
      a: `${formatNumber(kpisA.taktTimeMin, locale, 1)} ${tCompare("minPerUnit")}`,
      b: `${formatNumber(kpisB.taktTimeMin, locale, 1)} ${tCompare("minPerUnit")}`,
      deltaNum: kpisB.taktTimeMin - kpisA.taktTimeMin,
      deltaStr: `${formatNumber(kpisB.taktTimeMin - kpisA.taktTimeMin, locale, 1)} ${tCompare("minPerUnit")}`,
      higherIsBetter: false
    },
    {
      label: tCompare("rowThroughput"),
      a: `${formatNumber(kpisA.throughputPerDay, locale, 0)} ${tCompare("unitsPerDay")}`,
      b: `${formatNumber(kpisB.throughputPerDay, locale, 0)} ${tCompare("unitsPerDay")}`,
      deltaNum: kpisB.throughputPerDay - kpisA.throughputPerDay,
      deltaStr: `${formatNumber(kpisB.throughputPerDay - kpisA.throughputPerDay, locale, 0)} ${tCompare("unitsPerDay")}`,
      higherIsBetter: true
    },
    {
      label: tCompare("rowBottleneck"),
      sublabel: `A: ${kpisA.bottleneckStationName} | B: ${kpisB.bottleneckStationName}`,
      a: `${formatNumber(kpisA.bottleneckCycleMin, locale, 1)} ${tCompare("minPerUnit")}`,
      b: `${formatNumber(kpisB.bottleneckCycleMin, locale, 1)} ${tCompare("minPerUnit")}`,
      deltaNum: kpisB.bottleneckCycleMin - kpisA.bottleneckCycleMin,
      deltaStr: `${formatNumber(kpisB.bottleneckCycleMin - kpisA.bottleneckCycleMin, locale, 1)} ${tCompare("minPerUnit")}`,
      higherIsBetter: false
    },
    {
      label: tCompare("rowBalancing"),
      a: `${formatNumber(kpisA.balancingEfficiency * 100, locale, 1)}%`,
      b: `${formatNumber(kpisB.balancingEfficiency * 100, locale, 1)}%`,
      deltaNum: (kpisB.balancingEfficiency - kpisA.balancingEfficiency) * 100,
      deltaStr: `${formatNumber((kpisB.balancingEfficiency - kpisA.balancingEfficiency) * 100, locale, 1)} pp`,
      higherIsBetter: true
    },
    {
      label: tCompare("autoOeeReq") || "OEE Requerido",
      a: `${formatNumber(kpisA.requiredOEE * 100, locale, 1)}%`,
      b: `${formatNumber(kpisB.requiredOEE * 100, locale, 1)}%`,
      deltaNum: (kpisB.requiredOEE - kpisA.requiredOEE) * 100,
      deltaStr: `${formatNumber((kpisB.requiredOEE - kpisA.requiredOEE) * 100, locale, 1)} pp`,
      higherIsBetter: true
    },
    {
      label: tCompare("autoAllocation") || "Asignación de Línea",
      a: `${formatNumber(scenarioA.allocationPercent ?? 100, locale, 1)}%`,
      b: `${formatNumber(scenarioB.allocationPercent ?? 100, locale, 1)}%`,
      deltaNum: (scenarioB.allocationPercent ?? 100) - (scenarioA.allocationPercent ?? 100),
      deltaStr: `${formatNumber((scenarioB.allocationPercent ?? 100) - (scenarioA.allocationPercent ?? 100), locale, 1)} pp`,
      higherIsBetter: true
    },
    {
      label: tCompare("rowTotalCycle"),
      a: `${formatNumber(kpisA.totalCycleMin, locale, 1)} ${tCompare("minUnit")}`,
      b: `${formatNumber(kpisB.totalCycleMin, locale, 1)} ${tCompare("minUnit")}`,
      deltaNum: kpisB.totalCycleMin - kpisA.totalCycleMin,
      deltaStr: `${formatNumber(kpisB.totalCycleMin - kpisA.totalCycleMin, locale, 1)} ${tCompare("minUnit")}`,
      higherIsBetter: false
    }
  ]

  drawComparisonTable(tCompare("tableTitleOperational"), undefined, opRows)


  // ── 2. IMPACTO ECONÓMICO ────────────────────────────────────────────────────

  const daysA = scenarioA.economics?.workingDaysPerMonth || 22
  const daysB = scenarioB.economics?.workingDaysPerMonth || 22
  const monthA = econA.profitProxyPerDay * daysA
  const monthB = econB.profitProxyPerDay * daysB

  const econRows: Row[] = [
    {
      label: tCompare("rowTotalOpCost"),
      a: `${formatNumber(econA.totalOperatingCostPerDay, locale, 0)} ${tCompare("euroPerDay")}`,
      b: `${formatNumber(econB.totalOperatingCostPerDay, locale, 0)} ${tCompare("euroPerDay")}`,
      deltaNum: econB.totalOperatingCostPerDay - econA.totalOperatingCostPerDay,
      deltaStr: `${formatNumber(econB.totalOperatingCostPerDay - econA.totalOperatingCostPerDay, locale, 0)} ${tCompare("euroPerDay")}`,
      higherIsBetter: false
    },
    {
      label: tCompare("rowOpportunityGap"),
      a: `${formatNumber(econA.opportunityGapValuePerDay, locale, 0)} ${tCompare("euroPerDay")}`,
      b: `${formatNumber(econB.opportunityGapValuePerDay, locale, 0)} ${tCompare("euroPerDay")}`,
      deltaNum: econB.opportunityGapValuePerDay - econA.opportunityGapValuePerDay,
      deltaStr: `${formatNumber(econB.opportunityGapValuePerDay - econA.opportunityGapValuePerDay, locale, 0)} ${tCompare("euroPerDay")}`,
      higherIsBetter: false
    },
    {
      label: tCompare("rowProfitProxyMonth"),
      a: `${formatNumber(monthA, locale, 0)} ${tCompare("euroPerMonth")}`,
      b: `${formatNumber(monthB, locale, 0)} ${tCompare("euroPerMonth")}`,
      deltaNum: monthB - monthA,
      deltaStr: `${formatNumber(monthB - monthA, locale, 0)} ${tCompare("euroPerMonth")}`,
      higherIsBetter: true
    }
  ]

  drawComparisonTable(tCompare("econTableTitle"), tCompare("econDisclaimer"), econRows)


  // ── 3. RIESGO ESTOCÁSTICO (MONTE CARLO) ─────────────────────────────────────
  
  const probA = mcA.probabilityMeetDemand * 100
  const probB = mcB.probabilityMeetDemand * 100

  const mcRows: Row[] = [
    {
      label: tCompare("rowProbMeet"),
      a: `${formatNumber(probA, locale, 1)}%`,
      b: `${formatNumber(probB, locale, 1)}%`,
      deltaNum: probB - probA,
      deltaStr: `${formatNumber(probB - probA, locale, 1)} pp`,
      higherIsBetter: true
    },
    {
      label: tCompare("rowP5"),
      a: `${formatNumber(mcA.throughput.p5, locale, 0)} ${tCompare("unitsUds")}`,
      b: `${formatNumber(mcB.throughput.p5, locale, 0)} ${tCompare("unitsUds")}`,
      deltaNum: mcB.throughput.p5 - mcA.throughput.p5,
      deltaStr: `${formatNumber(mcB.throughput.p5 - mcA.throughput.p5, locale, 0)} ${tCompare("unitsUds")}`,
      higherIsBetter: true
    },
    {
      label: tCompare("rowP50"),
      a: `${formatNumber(mcA.throughput.median, locale, 0)} ${tCompare("unitsUds")}`,
      b: `${formatNumber(mcB.throughput.median, locale, 0)} ${tCompare("unitsUds")}`,
      deltaNum: mcB.throughput.median - mcA.throughput.median,
      deltaStr: `${formatNumber(mcB.throughput.median - mcA.throughput.median, locale, 0)} ${tCompare("unitsUds")}`,
      higherIsBetter: true
    },
    {
      label: tCompare("rowP95"),
      a: `${formatNumber(mcA.throughput.p95, locale, 0)} ${tCompare("unitsUds")}`,
      b: `${formatNumber(mcB.throughput.p95, locale, 0)} ${tCompare("unitsUds")}`,
      deltaNum: mcB.throughput.p95 - mcA.throughput.p95,
      deltaStr: `${formatNumber(mcB.throughput.p95 - mcA.throughput.p95, locale, 0)} ${tCompare("unitsUds")}`,
      higherIsBetter: true
    }
  ]

  drawComparisonTable(tCompare("mcTableTitle"), tCompare("mcDisclaimer"), mcRows)

  // Add footers loop only for content pages (starting from page 2)
  const totalPages = doc.getCurrentPageInfo().pageNumber
  const contentPageCount = totalPages - 1
  for (let pageIdx = 2; pageIdx <= totalPages; pageIdx++) {
    doc.setPage(pageIdx)
    const displayPageNum = pageIdx - 1
    drawFooter(displayPageNum, contentPageCount)
  }

  // Sanitized scenario name for PDF filename
  const sanitize = (name: string) =>
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")

  const nameA = sanitize(scenarioA.name)
  const nameB = sanitize(scenarioB.name)

  const filename = `Takt_Comparativa_${nameA}_vs_${nameB}_${dateCompact}.pdf`
  doc.save(filename)
}
