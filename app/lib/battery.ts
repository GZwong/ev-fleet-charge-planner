import { linspace } from "./utils";

/**
 * Calculate the charge time of a battery given its capacity, charging power
 * and start & end SOC.
 *
 * Implementation: Splits the charging into two phases:
 * 1. Constant current phase (0% to 80%) - the capacity increases with constant power
 * 2. Constant voltage phase (80% to 100%) - the capacity increases logarithmically as it approaches 100%
 *
 * Assumptions:
 * 1. Charging is 90% efficient
 * 2. Charging time from 80% to 99% is as long as 0 to 80%.
 *
 * @param SOC_start - Starting SOC before charging in decimals [-]
 * @param SOC_end - SOC reached at the end of charge in decimals [-]
 * @param capacity - Total battery capacity [kWh]
 * @param chargePower - Rate of charge [kW]
 * @param chargeEfficiency - (Optional) Charge Efficiency [-]. Default to 0.9
 * @returns Charging time [hours]
 */
export function calculateChargeTime(
  SOC_start: number,
  SOC_end: number,
  capacity: number,
  chargePower: number,
  chargeEfficiency: number = 0.9,
): number {
  // Config: Charge efficiency set to 0.9
  let time = 0;

  // Calculate charge time for phase 1
  if (SOC_start < 0.8) {
    time += ((0.8 - SOC_start) * capacity) / (chargeEfficiency * chargePower);
  }

  // Calculate time constant `tau` such that the charge time from 80% to 99%
  // is equal to the charge time from 0% to 80%
  const t_p1 = (0.8 * capacity) / (chargeEfficiency * chargePower); // Charge time for phase 1
  const tau = t_p1 / Math.log(2);

  // Calculate charge time for phase 2 (modelled as logarithmic function of SOC)
  if (SOC_end > 0.8) {
    time += tau * Math.log((1 - 0.8) / (1 - SOC_end));
  }

  return time;
}

/**
 * Calculate the charging cost given the total energy and the electricity
 * tariff rate
 *
 * @param energy - Amount of energy charged [kWh]
 * @param rate - Cost of energy per kW [£/kWh]
 * @returns
 */
export function calculateChargeCost(energy: number, rate: number): number {
  return rate * energy;
}

type ChargeCostAtRate = {
  rate: number;
  cost: number;
};

export function calculateChargeCostAcrossRates(
  energy: number,
  minRate: number,
  maxRate: number,
  numPoints: number = 50,
): ChargeCostAtRate[] {
  let chargeCosts: ChargeCostAtRate[] = [];

  const electricRates = linspace(minRate, maxRate, numPoints);
  electricRates.map((rate, idx) => {
    chargeCosts.push({
      rate: rate,
      cost: energy * rate,
    });
  });

  return chargeCosts;
}

export type BatteryCapacityAtTime = {
  time: number;
  capacity: number;
};

export function calculateOptimumChargeProfile(
  batteryCapacity: number,
  chargePower: number,
  dailyMileage: number,
  SOC_min: number = 0.99,
  SOC_max: number = 0,
  maxChargePower: number = 0,
): BatteryCapacityAtTime[] {
  // If maximum charging rate provided, limit the charge power to max
  if (maxChargePower != 0) {
    chargePower = maxChargePower;
  }

  return [{ time: 0, capacity: 2 }];
}

/**
 * Estimate the remaining capacity of a battery assuming it follows the equation:
 * Remaining Capacity = Initial Capacity x (1 - Annual Degradation) ^ Years
 *
 * Assumption: The annual degradation default to 3.5%, which is true for deeper
 * cycles that is typically experienced by fleet vehicles. This estimation does
 * not consider the effects of temperature and depth of discharge.
 *
 * @param initialCapacity - Initial Capacity of a battery [kWh / any appropriate units]
 * @param year - The number of years passed
 * @param annualDegradation - (Optional) The rate of degradation in decimal [-]
 *                            Default to 0.035 for 3.5% annual degradation.
 * @returns The ramaining capacity of a battery [Same units as provided in initialCapacity]
 */
export function calculateRemainingCapacity(
  initialCapacity: number,
  year: number,
  annualDegradation: number = 0.035,
): number {
  return initialCapacity * Math.pow(1 - annualDegradation, year);
}
