import { NextRequest, NextResponse } from "next/server";

type Inputs = {
  numEV: number;
  dailyMileage: number;
  batteryCapacity: number;
  chargePower: number;
  efficiency: number;
  batteryDOD: [number, number];
};

type ReportOutputs = {
  dailyEnergyConsumptionPerEV: number;
  chargeTimePerEV: number;
  totalFleetEnergyDemand: number;
  totalChargingCost: number;
  reducedChargingCost: number;
};

const electricRate = 0.245; // Flat electricity tariff [£/kWh]
const electricRateOffPeak = electricRate / 2; // Off-peak electricity tariff [£/kWh] (Assumed half)

// In-memory storage
const reports: Record<string, ReportOutputs> = {};

export async function POST(req: Request) {
  let {
    numEV,
    dailyMileage,
    batteryCapacity,
    chargePower,
    efficiency,
    batteryDOD,
  }: Inputs = await req.json();

  const usableCapacity: number =
    (batteryDOD[1] - batteryDOD[0]) * batteryCapacity;

  // Daily Energy Consumption
  const dailyEnergyConsumptionPerEV: number = dailyMileage / efficiency;

  // Charging Time per Vehicle (hours)
  const chargeTimePerEV = calculateChargeTime(
    batteryDOD[0],
    batteryDOD[1],
    batteryCapacity,
    chargePower,
  );

  // Based on charging time, possibly recommend a tariff scheme - 7/10 hours

  // Total Fleet Energy Demand (kWh)
  const totalFleetEnergyDemand: number = numEV * dailyEnergyConsumptionPerEV;

  // Mileage per full charge
  const mileagePerCharge = usableCapacity * efficiency;

  // Normal Charging Cost [£] (Flat Rate)
  const totalChargingCost = calculateChargeCost(batteryCapacity, electricRate);

  // Off-Peak Charging Cost [£] - We assume overnight charging is cheaper
  const numDischargeCyclesPerDay = dailyEnergyConsumptionPerEV / usableCapacity;
  let reducedChargingCost = 0;
  // If one full, overnight charge at reduced rate sufficient for daily mileage
  if (numDischargeCyclesPerDay < 1) {
    reducedChargingCost = calculateChargeCost(
      dailyEnergyConsumptionPerEV,
      electricRateOffPeak,
    );
  }
  // At higher daily mileages, one full, overnight charge at reduced rate is
  // insufficient so supplement with charging at  flat rates throughout the day
  else {
    reducedChargingCost = calculateChargeCost(
      usableCapacity,
      electricRateOffPeak,
    );
    reducedChargingCost += calculateChargeCost(
      dailyEnergyConsumptionPerEV - usableCapacity,
      electricRate,
    );
  }

  const reportId = Math.random().toString(36).substr(2, 9);
  reports[reportId] = {
    dailyEnergyConsumptionPerEV,
    chargeTimePerEV,
    totalFleetEnergyDemand,
    totalChargingCost,
    reducedChargingCost,
  };

  return Response.json({ reportId });
}

export async function GET(req: NextRequest) {
  console.log("Report Object: ", reports);
  const { searchParams } = new URL(req.url);
  const reportId = searchParams.get("id");

  if (!reportId || !reports[reportId]) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json(reports[reportId]);
}

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
 * @param SOC_start - Starting SOC before charging
 * @param SOC_end - SOC reached at the end of charge
 * @param capacity - Total battery capacity [kWh]
 * @param chargePower - Rate of charge [kW]
 * @param chargeEfficiency - (Optional) Charge Efficiency [-]. Default to 0.9
 * @returns Charging time [hours]
 */
function calculateChargeTime(
  SOC_start: number,
  SOC_end: number,
  capacity: number,
  chargePower: number,
  chargeEfficiency: number = 0.9,
): number {
  // Config: Charge efficiency set to 0.9
  let time = 0;

  // Calculate charge time for phase 1
  if (SOC_start < 80) {
    time += ((80 - SOC_start) * capacity) / (chargeEfficiency * chargePower);
  }

  // Calculate time constant `tau` such that the charge time from 80% to 99%
  // is equal to the charge time from 0% to 80%
  const t_p1 = (0.8 * capacity) / (chargeEfficiency * chargePower); // Charge time for phase 1
  const tau = t_p1 / Math.log(2);

  // Calculate charge time for phase 2 (modelled as logarithmic function of SOC)
  if (SOC_end > 80) {
    time += tau * Math.log((100 - 80) / (100 - SOC_end));
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
function calculateChargeCost(energy: number, rate: number): number {
  return rate * energy;
}
