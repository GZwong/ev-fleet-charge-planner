type Inputs = {
  numEV: number;
  dailyMileage: number;
  batteryCapacity: number;
  chargePower: number;
  efficiency: number;
};

export async function POST(req: Request) {
  let {
    numEV,
    dailyMileage,
    batteryCapacity,
    chargePower,
    efficiency,
  }: Inputs = await req.json();

  // Daily Energy Consumption
  const dailyEnergyConsumption: number = dailyMileage / efficiency;

  // Charging Time per Vehicle (hours)
  const chargeTimePerEV: number = batteryCapacity / chargePower;

  // Total Fleet Energy Demand (kWh)
  const totalFleetEnergyDemand: number = numEV * dailyEnergyConsumption;

  return Response.json({
    dailyEnergyConsumption,
    chargeTimePerEV,
    totalFleetEnergyDemand,
  });
}
