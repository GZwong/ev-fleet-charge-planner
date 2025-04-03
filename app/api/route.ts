import { NextRequest, NextResponse } from "next/server";
import { calculateChargeCost, calculateChargeTime } from "../lib/battery";

type Inputs = {
  numEV: number;
  dailyMileage: number;
  batteryCapacity: number;
  chargePower: number;
  efficiency: number;
  batteryDOD: [number, number];
  workingHours: [number, number];
};

export type ReportOutputs = {
  // Also output the values input by user
  numEV: number;
  dailyMileage: number;
  batteryCapacity: number;
  chargePower: number;
  efficiency: number;
  batteryDOD: [number, number];
  workingHours: [number, number];

  // Computed values
  dailyEnergyConsumptionPerEV: number;
  chargeTimePerEV: number;
  mileagePerCharge: number;
  totalFleetEnergyDemand: number;
  totalChargingCost: number;
  reducedChargingCost: number;
  numDischargeCyclesPerYear: number;
};

const electricRate = 0.245; // Flat electricity tariff [£/kWh]
const electricRateOffPeak = electricRate / 2; // Off-peak electricity tariff [£/kWh] (Assumed half)

// In-memory storage
const reports: Record<string, ReportOutputs> = {};

export async function POST(req: Request) {
  const {
    numEV,
    dailyMileage,
    batteryCapacity,
    chargePower,
    efficiency,
    batteryDOD,
    workingHours,
  }: Inputs = await req.json();

  const usableCapacity: number =
    ((batteryDOD[1] - batteryDOD[0]) / 100) * batteryCapacity;

  // Daily Energy Consumption
  const dailyEnergyConsumptionPerEV: number = dailyMileage / efficiency;

  // Charging Time per Vehicle (hours)
  const chargeTimePerEV = calculateChargeTime(
    batteryDOD[0] / 100, // Convert % to decimal
    batteryDOD[1] / 100,
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

  // Number of charge/discharge cycles per year
  const numDischargeCyclesPerYear = numDischargeCyclesPerDay * 365.25;

  const output: ReportOutputs = {
    numEV,
    dailyMileage,
    batteryCapacity,
    chargePower,
    efficiency,
    batteryDOD,
    workingHours,
    dailyEnergyConsumptionPerEV,
    chargeTimePerEV,
    mileagePerCharge,
    totalFleetEnergyDemand,
    totalChargingCost,
    reducedChargingCost,
    numDischargeCyclesPerYear,
  };

  const reportId = Math.random().toString(36).substr(2, 9);
  reports[reportId] = output;

  return Response.json(output);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reportId = searchParams.get("id");

  if (!reportId || !reports[reportId]) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json(reports[reportId]);
}
