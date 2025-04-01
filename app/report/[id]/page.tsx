import { notFound } from "next/navigation";
import { ReportOutputs } from "@/app/api/route";
import { CardGrid, CardKPI } from "./cards";

async function getReportData(reportId: string): Promise<ReportOutputs | null> {
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api?id=${encodeURIComponent(reportId)}`;

  const res = await fetch(apiUrl);

  if (!res.ok) {
    console.log("Error when getting report data. Error code: ", res.status);
    return null;
  }

  return res.json();
}

export default async function ReportPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  if (!id) {
    console.error("No report ID found in params");
    return notFound(); // Handle the case where the ID is not available
  }

  // Fetch the report data
  const report = await getReportData(id);

  // Return NotFound page if no report is found
  if (!report) {
    return notFound();
  }

  // Extract parameters
  const {
    numEV,
    dailyMileage,
    batteryCapacity,
    chargePower,
    efficiency,
    batteryDOD,
    dailyEnergyConsumptionPerEV,
    chargeTimePerEV,
    totalFleetEnergyDemand,
    totalChargingCost,
    reducedChargingCost,
  } = report;

  return (
    <div className="container m-auto">
      <h1 className="m-auto mt-2 mb-2 text-center text-4xl">Charging Report</h1>
      <hr className="m-auto w-[50%]"></hr>

      {/* KPI: Daily Energy Consumption*/}
      <CardGrid>
        <CardKPI
          className="col-span-1"
          value={dailyEnergyConsumptionPerEV}
          title="Daily Energy Consumption per EV"
          unit="kWh"
          // Tell the user that a single charge is sufficient or not
          notes={
            `Based on your battery capacity of ${batteryCapacity.toFixed(0)} kWh, ` +
            (dailyEnergyConsumptionPerEV < batteryCapacity
              ? `a single charge to ${(100 * (dailyEnergyConsumptionPerEV / batteryCapacity)).toFixed(1)}% will be sufficient to power your EV's daily mileage.`
              : `each EV needs to be charged at least ${Math.ceil(dailyEnergyConsumptionPerEV / batteryCapacity)} times.`)
          }
        />

        {/* KPI: Charge Time*/}
        <CardKPI
          className="col-span-1"
          value={chargeTimePerEV}
          title="Average Charge Duration per EV"
          unit="hours"
          notes={`Time taken to charge from ${batteryDOD[0].toFixed(0)}% to ${batteryDOD[1].toFixed(0)}%.`}
        ></CardKPI>

        {/* KPI: Charge Time*/}
        <CardKPI
          className="col-span-1"
          value={totalFleetEnergyDemand}
          title="Total Fleet Energy Demand"
          unit="kWh"
          notes="This is the daily energy consumption per vehicle multiplied by the number of EVs in your fleet."
        ></CardKPI>
      </CardGrid>
    </div>
  );
}
