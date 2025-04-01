"use client";

import { ReactNode } from "react";
import { notFound } from "next/navigation";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Label,
} from "recharts";
import { linspace } from "../lib/utils";
import { ReportOutputs } from "@/app/api/route";
import { CardGrid, CardKPI, CardWithChart } from "./Cards";
import {
  calculateChargeCost,
  calculateChargeCostAcrossRates,
} from "../lib/battery";
import { Noto_Sans_Cypro_Minoan } from "next/font/google";

export default function Dashboard({ output }: { output: ReportOutputs }) {
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
  } = output;

  // Plot costs across different rates
  const [nominalRate, minRate, maxRate] = [0.245, 0.1, 0.3];
  const chargeCostAcrossRates = calculateChargeCostAcrossRates(
    numEV * dailyEnergyConsumptionPerEV,
    minRate,
    maxRate,
    5,
  );

  console.log(chargeCostAcrossRates);
  const ChargeCostAcrossRatesChart: ReactNode = (
    <ResponsiveContainer minHeight={150}>
      <LineChart data={chargeCostAcrossRates}>
        <Line dataKey="cost" stroke="#8884d8" />
        <XAxis dataKey="rate">
          <Label value="Rate (per kWh)" position="insideBottom" offset={40} />
        </XAxis>
        <YAxis>
          {/* <Label
            value="Charging Cost (£)"
            angle={-90}
            position="insideBottomLeft"
          /> */}
        </YAxis>
        <Tooltip
          formatter={(value: number, name: string, props) => {
            const formattedValue = value.toFixed(2);
            const formattedName = name.toUpperCase();
            return [`£${formattedValue}`, `${formattedName}`];
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

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
              ? `a single charge to ${(100 * (dailyEnergyConsumptionPerEV / batteryCapacity)).toFixed(1)}% is sufficient for your EV's daily mileage.`
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

        {/* Area Chart: Charging Cost vs Rate*/}
        <CardWithChart
          title="Charging Cost"
          chart={ChargeCostAcrossRatesChart}
          className="col-span-2"
          notes={`At a flat, nominal rate of £${nominalRate.toFixed(2)}/kWh, you are paying £${calculateChargeCost(dailyEnergyConsumptionPerEV * numEV, nominalRate).toFixed(2)} for charging.`}
        ></CardWithChart>
      </CardGrid>
    </div>
  );
}
