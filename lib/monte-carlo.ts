import { Station, Scenario, KPIs } from "@/types"
import { calculateAllKPIs } from "./calculations"

/**
 * Genera un número aleatorio usando la distribución Normal (Box-Muller transform)
 */
export function randomNormal(mean: number, stdDev: number): number {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return Math.max(0, num * stdDev + mean); // Avoid negative times
}

/**
 * Genera un número aleatorio usando la distribución Lognormal
 */
export function randomLognormal(mean: number, stdDev: number): number {
  // Lognormal parameters mu and sigma based on mean and stdDev of the variable
  const variance = stdDev * stdDev;
  const meanSquared = mean * mean;
  const mu = Math.log(meanSquared / Math.sqrt(variance + meanSquared));
  const sigma = Math.sqrt(Math.log(1 + (variance / meanSquared)));
  
  const normalVal = randomNormal(0, 1);
  return Math.exp(mu + sigma * normalVal);
}

/**
 * Devuelve un tiempo de ciclo estocástico para la estación basado en su distribución
 */
export function getStochasticCycleTime(station: Station): number {
  const stdDev = station.cycleTimeStdDev ?? 0;
  const type = station.distributionType ?? "constant";
  
  if (stdDev <= 0 || type === "constant") {
    return station.cycleTimeMin;
  }
  
  if (type === "lognormal") {
    return randomLognormal(station.cycleTimeMin, stdDev);
  }
  
  return randomNormal(station.cycleTimeMin, stdDev);
}

export type MonteCarloResults = {
  iterations: number;
  meanThroughput: number;
  throughputStdDev: number;
  probabilityMeetsDemand: number;
  p10Throughput: number;
  p50Throughput: number;
  p90Throughput: number;
}

/**
 * Ejecuta una simulación Monte Carlo iterando N veces sobre el escenario dado
 */
export function runMonteCarloSimulation(scenario: Scenario, iterations: number = 1000): MonteCarloResults {
  const throughputs: number[] = [];
  let meetsDemandCount = 0;

  for (let i = 0; i < iterations; i++) {
    // Generate stochastic scenario
    const stochasticStations = scenario.stations.map(s => ({
      ...s,
      cycleTimeMin: getStochasticCycleTime(s)
    }));
    
    const stochasticScenario = {
      ...scenario,
      stations: stochasticStations
    };
    
    // Calculate KPIs
    const kpis = calculateAllKPIs(stochasticScenario);
    throughputs.push(kpis.throughputPerDay);
    
    if (kpis.throughputPerDay >= scenario.demandPerDay) {
      meetsDemandCount++;
    }
  }
  
  // Sort for percentiles
  throughputs.sort((a, b) => a - b);
  
  // Statistics
  const sum = throughputs.reduce((a, b) => a + b, 0);
  const mean = sum / iterations;
  
  const variance = throughputs.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / iterations;
  const stdDev = Math.sqrt(variance);
  
  const p10Index = Math.floor(iterations * 0.1);
  const p50Index = Math.floor(iterations * 0.5);
  const p90Index = Math.floor(iterations * 0.9);
  
  return {
    iterations,
    meanThroughput: mean,
    throughputStdDev: stdDev,
    probabilityMeetsDemand: meetsDemandCount / iterations,
    p10Throughput: throughputs[p10Index],
    p50Throughput: throughputs[p50Index],
    p90Throughput: throughputs[p90Index]
  };
}
