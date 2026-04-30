/**
 * Representa una estación individual en la línea de producción.
 * Cada estación tiene un tiempo de ciclo y un número de operarios asignados.
 */
export type Station = {
  /** Identificador único (usa crypto.randomUUID() al crear) */
  id: string
  /** Nombre descriptivo de la estación (ej: "Alicatado y revestimientos") */
  name: string
  /** Tiempo de ciclo en minutos por unidad */
  cycleTimeMin: number
  /** Número de operarios asignados a esta estación (mínimo 1) */
  operators: number
  /** Tasa de fallo/reproceso como decimal 0-1 (ej: 0.05 = 5%). Opcional, default 0 */
  failureRate: number
}

/**
 * Representa un escenario completo de producción:
 * la configuración de la línea + los parámetros de demanda.
 */
export type Scenario = {
  id: string
  name: string
  stations: Station[]
  /** Unidades que la demanda requiere producir por día */
  demandPerDay: number
  /** Horas efectivas por turno (descontando descansos) */
  shiftHours: number
  /** Número de turnos por día (1, 2 o 3) */
  shiftsPerDay: number
  /** Supuestos económicos del escenario */
  economics: EconomicInputs
}

/** Supuestos económicos configurables por escenario */
export type EconomicInputs = {
  /** Coste laboral por hora (€) */
  laborCostPerHour: number
  /** Margen de contribución por unidad producida (€) */
  contributionMarginPerUnit: number
  /** Coste de reproceso por unidad defectuosa (€) */
  reworkCostPerUnit: number
  /** Coste fijo adicional por turno y día (€) */
  shiftFixedCostPerDay: number
  /** Coste one-off estimado para una mejora de método (€) */
  methodImprovementOneOffCost: number
  /** Coste one-off estimado para una mejora de calidad (€) */
  qualityImprovementOneOffCost: number
  /** Días laborables por mes para estimaciones mensuales */
  workingDaysPerMonth: number
}

/** KPIs económicos calculados a partir de un escenario */
export type EconomicKPIs = {
  totalOperators: number
  laborHoursPerDay: number
  laborCostPerDay: number
  expectedReworkRate: number
  reworkCostPerDay: number
  fulfilledUnitsPerDay: number
  demandShortfallUnitsPerDay: number
  fulfilledContributionPerDay: number
  opportunityGapValuePerDay: number
  shiftCostPerDay: number
  totalOperatingCostPerDay: number
  profitProxyPerDay: number
}

/** Impacto económico estimado de una recomendación de mejora */
export type RecommendationEconomicImpact = {
  additionalContributionPerDay: number
  additionalLaborCostPerDay: number
  additionalShiftCostPerDay: number
  additionalReworkCostPerDay: number
  netImpactPerDay: number
  oneOffCost: number
  paybackDays: number | null
}

/**
 * KPIs calculados a partir de un Scenario.
 * Todas las unidades de tiempo están en minutos.
 */
export type KPIs = {
  /** Ritmo al que hay que producir para satisfacer la demanda (min/unidad) */
  taktTimeMin: number
  /** ID de la estación que limita el throughput */
  bottleneckStationId: string
  /** Nombre de la estación cuello de botella */
  bottleneckStationName: string
  /** Tiempo de ciclo efectivo del cuello de botella (min/unidad) */
  bottleneckCycleMin: number
  /** Unidades reales que la línea puede producir por día */
  throughputPerDay: number
  /** Tiempo total que tarda una unidad en recorrer toda la línea (min) */
  leadTimeMin: number
  /** Eficiencia de balanceo: 0-1 (1 = perfectamente balanceada) */
  balancingEfficiency: number
  /** Suma de todos los tiempos de ciclo sin ajustar */
  totalCycleMin: number
  /** Tiempo disponible total en minutos por día */
  availableTimeMin: number
  /** Si la línea cumple con la demanda */
  meetsDemand: boolean
  /** Déficit o superávit de unidades respecto a la demanda */
  demandDelta: number
}

/**
 * Datos de una estación con su tiempo efectivo calculado.
 * Usado para gráficos y diagramas.
 */
export type StationWithEffective = Station & {
  /** cycleTimeMin / operators, ajustado por failureRate */
  effectiveCycleMin: number
  /** Si esta estación es el cuello de botella */
  isBottleneck: boolean
  /** Si su tiempo efectivo excede el takt time */
  exceedsTakt: boolean
}

/**
 * Estado global de la aplicación.
 */
export type AppState = {
  scenarios: Scenario[]
  activeScenarioId: string
  compareScenarioAId: string
  compareScenarioBId: string
}

// ─── Plan de mejora ────────────────────────────────────────────────────────────

export type ImprovementType = 'operators' | 'failure-rate' | 'cycle-time' | 'shifts'
export type ImprovementPriority = 'high' | 'medium' | 'low'

export type ImprovementRecommendation = {
  id: string
  title: string
  description: string
  type: ImprovementType
  priority: ImprovementPriority
  baseKpis: KPIs
  projectedKpis: KPIs
  throughputDelta: number
  balancingDelta: number
  leadTimeDelta: number
  meetsDemandAfter: boolean
  stationId?: string
  stationName?: string
  badge?: string
  applyLabel: string
  stationChanges?: { originalStationId: string; updates: Partial<Omit<Station, 'id'>> }[]
  scenarioChanges?: Partial<Pick<Scenario, 'shiftsPerDay'>>
}
