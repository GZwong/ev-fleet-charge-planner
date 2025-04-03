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

/**
 * Construct an array of objects containing the charging cost across a range
 * of electric tariff rate.
 * @param energy - The energy to be gained after charging (kWh)
 * @param minRate - Minimum electric rate (£/kWh)
 * @param maxRate - Maximum electric rate (£/kWh)
 * @param numPoints - Number of points between minRate and maxRate
 * @returns An array of objects, each object containing the electricity tariff
 *          rate `rate` and its corresponding charging cost `cost` of charging
 */
export function calculateChargeCostAcrossRates(
  energy: number,
  minRate: number,
  maxRate: number,
  numPoints: number = 50,
): ChargeCostAtRate[] {
  const chargeCosts: ChargeCostAtRate[] = [];

  const electricRates = linspace(minRate, maxRate, numPoints);
  electricRates.map((rate) => {
    chargeCosts.push({
      rate: rate,
      cost: energy * rate,
    });
  });

  return chargeCosts;
}

type ChargeCostAtRate = {
  rate: number;
  cost: number;
};

export type BatteryCapacityAtTime = {
  time: number;
  capacity: number;
  SOC?: number;
  mileage?: number;
};

/**
 * Estimate the charging profile of an EV battery throughout the day.
 *
 * Assumptions:
 * 1. Charging has two phases: normal charging and slow charging above 80% SOC
 * 2. The vehicle keeps moving until daily mileage is reached.
 * 3. Assumes constant speed
 *
 * @param batteryCapacity
 * @param chargePower
 * @param dailyMileage
 * @param vehicleEfficiency - The efficiency of the vehicle [mi/kWh]
 * @param startHour
 * @param endHour
 * @param speed - Average vehicle speed [mph]
 * @param SOC_min - Minimum allowable state of charge in decimals [-]
 * @param SOC_max - Maximum allowable state of charge in decimals [-]
 * @param chargeEfficiency - Charging efficiency in decimals [-]
 * @param maxChargePower
 * @returns An array of object, consisting of the battery SOC throughout every
 *          hour of the day
 */
export function calculateOptimumChargeProfile(
  batteryCapacity: number,
  chargePower: number,
  dailyMileage: number,
  vehicleEfficiency: number,
  startHour: number,
  endHour: number,
  speed: number = 40,
  SOC_min: number = 0, // Enforce minimum SOC
  SOC_max: number = 0.99,
  chargeEfficiency: number = 0.9,
  maxChargePower: number = 0,
): BatteryCapacityAtTime[] {
  if (maxChargePower !== 0) {
    chargePower = Math.min(chargePower, maxChargePower);
  }

  let remainingCapacity = batteryCapacity * SOC_max;
  const minCapacity = batteryCapacity * SOC_min; // Ensure capacity does not go below this
  let remainingMileage = dailyMileage;
  let currentHour = startHour;
  const chargeProfile = [];

  // Time constant for slow charge above 80%
  const t_p1 = (0.8 * batteryCapacity) / (chargeEfficiency * chargePower);
  const tau = t_p1 / Math.log(2);

  while (remainingMileage > 0 && currentHour < endHour) {
    const energyUsedNextHour = speed / vehicleEfficiency;
    let SOC_current = remainingCapacity / batteryCapacity;

    // Driving phase: Ensure battery does not go below SOC_min
    if (remainingCapacity - energyUsedNextHour >= minCapacity) {
      remainingCapacity = Math.max(
        remainingCapacity - energyUsedNextHour,
        minCapacity,
      );
      remainingMileage = Math.max(remainingMileage - speed, 0);
    } else {
      // Enter charging phase if not enough charge to drive
      while (SOC_current < SOC_max && currentHour < endHour) {
        if (SOC_current < 0.8) {
          remainingCapacity = Math.min(
            remainingCapacity + chargeEfficiency * chargePower,
            batteryCapacity,
          );
        } else {
          SOC_current = 1 - 0.2 * Math.exp(-currentHour / tau);
          remainingCapacity = Math.min(
            SOC_current * batteryCapacity,
            batteryCapacity,
          );
        }
        SOC_current = remainingCapacity / batteryCapacity;

        chargeProfile.push({
          time: currentHour,
          capacity: remainingCapacity,
          SOC: SOC_current,
          mileage: remainingMileage,
        });
        currentHour++;
      }
    }

    chargeProfile.push({
      time: currentHour,
      capacity: remainingCapacity,
      SOC: SOC_current,
      mileage: remainingMileage,
    });
    currentHour++;
  }

  return chargeProfile;
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
