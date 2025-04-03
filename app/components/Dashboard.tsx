"use client";

import { ReactNode } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Label,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { linspace } from "../lib/utils";
import { ReportOutputs } from "@/app/api/route";
import {
  CardGrid,
  CardKPI,
  CardWithChart,
  CardWithChartOnRight,
} from "./Cards";
import {
  BatteryCapacityAtTime,
  calculateChargeCost,
  calculateChargeCostAcrossRates,
  calculateOptimumChargeProfile,
  calculateRemainingCapacity,
} from "../lib/battery";

export default function Dashboard({ output }: { output: ReportOutputs }) {
  // Extract parameters
  const {
    numEV,
    dailyMileage,
    batteryCapacity,
    chargePower,
    efficiency,
    batteryDOD,
    workingHours,
    dailyEnergyConsumptionPerEV,
    chargeTimePerEV,
    totalFleetEnergyDemand,
    totalChargingCostPerEV,
    reducedChargingCostPerEV,
    numDischargeCyclesPerYear,
  } = output;

  // Chart plotting cost against rates
  const [nominalRate, minRate, maxRate] = [0.245, 0.1, 0.3];
  const chargeCostAcrossRates = calculateChargeCostAcrossRates(
    numEV * dailyEnergyConsumptionPerEV,
    minRate,
    maxRate,
    5,
  );
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
          formatter={(value: number, name: string) => {
            const formattedValue = value.toFixed(2);
            const formattedName = name.toUpperCase();
            return [`£${formattedValue}`, `${formattedName}`];
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  // Chart showing difference between flat vs off peak rate
  const data = [{ totalChargingCostPerEV, reducedChargingCostPerEV }];
  const ReducedChargeCostChart: ReactNode = (
    <ResponsiveContainer minHeight={150}>
      <BarChart data={data}>
        <Bar dataKey="totalChargingCostPerEV" fill="#8884d8" />
        <Bar dataKey="reducedChargingCostPerEV" fill="#82ca9d" />
        <XAxis></XAxis>
        <YAxis></YAxis>
        <Tooltip
          formatter={(value: number, name: string) => {
            const formattedValue = value.toFixed(2);
            const formattedName = name.toUpperCase();
            return [`£${formattedValue}`, `${formattedName}`];
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  // Chart showing battery degradation
  const degradationRate = 0.035; // 3.5% every year
  const years = linspace(0, 5, 5); // Show battery degradation across years
  const remainingBatteryCapacityAcrossTime: BatteryCapacityAtTime[] = [];
  years.map((year) => {
    remainingBatteryCapacityAcrossTime.push({
      time: year,
      capacity: calculateRemainingCapacity(batteryCapacity, year),
    });
  });
  const RemainingBatteryCapacityChart: ReactNode = (
    <ResponsiveContainer minHeight={150}>
      <LineChart data={remainingBatteryCapacityAcrossTime}>
        <Line dataKey="capacity" stroke="#8884d8" />
        <XAxis dataKey="time">
          <Label value="Years" position="insideBottom" offset={40} />
        </XAxis>
        <YAxis>
          <Label
            value="Remaining Capacity"
            angle={-90}
            dx={-10}
            style={{ fontSize: "0.7rem" }}
          />
        </YAxis>
        <Tooltip
          formatter={(value: number, name: string) => {
            const formattedValue = value.toFixed(0);
            const formattedName = name.toUpperCase();
            return [`${formattedValue} kWh`, `${formattedName}`];
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  // Chart showing SOC (charging schedule)
  const chargeProfile = calculateOptimumChargeProfile(
    batteryCapacity,
    chargePower,
    dailyMileage,
    efficiency,
    workingHours[0],
    workingHours[1],
  );
  const ChargeProfileChart: ReactNode = (
    <ResponsiveContainer minHeight={150}>
      <LineChart data={chargeProfile}>
        <XAxis dataKey="time">
          <Label value="Hour" position="insideBottom" offset={40} />
        </XAxis>
        {/* First Y Axis: Capacity */}
        <YAxis yAxisId="left">
          <Label
            value="Capacity (kWh)"
            angle={-90}
            dx={-10}
            style={{ fontSize: "0.7rem" }}
          />
        </YAxis>
        {/* Second Y Axis: Remaining Mileage */}
        <YAxis yAxisId="right" orientation="right" domain={[0, "dataMax"]}>
          <Label
            value="Remaining Mileage (mi)"
            angle={-90}
            dx={15}
            style={{ fontSize: "0.7rem" }}
          />
        </YAxis>
        {/* Ensure yAxisId matches the YAxis components */}
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="capacity"
          stroke="#8884d8"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="mileage"
          stroke="#82ca9d"
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            return [`${value.toFixed(0)}`, `${name.toUpperCase()}`];
          }}
        />
        <Legend />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div className="container m-auto">
      <h1 className="m-auto mt-20 mb-2 text-center text-4xl">
        Charging Report
      </h1>
      <hr className="m-auto mt-5 mb-2 w-[80%]"></hr>

      {/* KPI: Daily Energy Consumption*/}
      <CardGrid>
        <CardKPI
          className="col-span-1"
          value={dailyEnergyConsumptionPerEV}
          title="Daily Energy Consumption per EV"
          unit="kWh"
          // Tell the user that a single charge is sufficient or not
          notes={
            `With a battery capacity of ${batteryCapacity.toFixed(0)} kWh, ` +
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
          notes="Daily energy consumption per EV X Number of EVs in your fleet."
        ></CardKPI>

        {/* Area Chart: Charging Cost vs Rate*/}
        <CardWithChartOnRight
          title="Charging Cost"
          chart={ChargeCostAcrossRatesChart}
          className="col-span-1 md:col-span-2"
          notes={`At a flat, nominal rate of £${nominalRate.toFixed(2)}/kWh, charging costs £${calculateChargeCost(dailyEnergyConsumptionPerEV * numEV, nominalRate).toFixed(2)}/day for the fleet.`}
        ></CardWithChartOnRight>

        {/* Bar Chart: Flat vs Reduced Rate */}
        <CardWithChart
          title="Charging Cost: Flat vs Off-Peak"
          chart={ReducedChargeCostChart}
          className="col-span-1"
          notes="Take advantage of lower electricity rates overnight."
        ></CardWithChart>

        {/* Line Chart: Charging Profile*/}
        <CardWithChartOnRight
          title="Charge Profile"
          chart={ChargeProfileChart}
          className="col-span-1 lg:col-span-3"
          // notes={
          //   maxTime < workingHours[1]
          //     ? `On average, your EV takes ${(maxTime - workingHours[0]).toFixed(0)} hours to complete the daily mileage.`
          //     : ""
          // }
        />
      </CardGrid>
      <h2>Battery Health</h2>
      <CardGrid>
        {/* Battery Degradation Curve */}
        <CardWithChart
          title="Battery Degradation"
          chart={RemainingBatteryCapacityChart}
          className="col-span-1 md:col-span-2"
          notes={`Assumes a degradation rate of ${(degradationRate * 100).toFixed(1)}% per year. Battery capacity will be reduced to ${remainingBatteryCapacityAcrossTime[years.length - 1].capacity.toFixed(1)} kWh in ${years[years.length - 1].toFixed(1)} years.`}
        />
        <CardKPI
          className="col-span-1"
          value={Math.round(numDischargeCyclesPerYear)}
          title="Annual No. of Charge/Discharge Cycles"
          notes="Battery gradually degrades as it is cycled. Try keeping it between 20% to 80% to slow degradation"
        />
      </CardGrid>
    </div>
  );
}
