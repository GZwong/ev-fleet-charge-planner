"use client";

import { useEffect, useState } from "react";

// Configuration for input values
const inputConfig = {
  numEV: {
    label: "Number of Electric Vehicles",
    minVal: 1,
    maxVal: 10000,
  },
  mileage: {
    label: "Average Daily Mileage per EV (mi)",
    minVal: 1,
    maxVal: 500,
  },
  capacity: {
    label: "Battery Capacity (kWh)",
    minVal: 5,
    maxVal: 1000,
  },
  chargePower: {
    label: "Charging Power Rating (kW)",
    minVal: 0,
    maxVal: 350,
  },
  efficiency: {
    label: "Vehicle Efficiency (mi/kWh)",
    minVal: 0.1,
    maxVal: 10,
  },
};

type inputArguments = {
  label: string;
  state: number;
  setState: React.Dispatch<React.SetStateAction<number>>;
  minVal?: number;
  maxVal?: number;
  info?: React.ReactNode;
  children?: React.ReactNode;
};

// Each dropdown option has an associated value and label
type DropdownOptions = {
  options: { label: string; value: number }[];
};

function InputForm() {
  // State for input values
  const [numEV, setNumEV] = useState<number>(100);
  const [dailyMileage, setDailyMileage] = useState<number>(100);
  const [batteryCapacity, setBatteryCapacity] = useState<number>(75);
  const [chargePower, setChargePower] = useState<number>(100);
  const [efficiency, setEfficiency] = useState<number>(3);

  // State denoting whether all values are valid
  const [validInput, setValidInput] = useState<boolean>(false);

  // Whether preselected or custom efficiencies are used as an input
  const [useCustomEfficiency, setUseCustomEfficiency] =
    useState<boolean>(false);

  // Constantly checks input for validity
  useEffect(() => {
    setValidInput(
      numEV >= inputConfig.numEV.minVal &&
        numEV <= inputConfig.numEV.maxVal &&
        dailyMileage >= inputConfig.mileage.minVal &&
        dailyMileage <= inputConfig.mileage.maxVal &&
        batteryCapacity >= inputConfig.capacity.minVal &&
        batteryCapacity <= inputConfig.capacity.maxVal &&
        chargePower >= inputConfig.chargePower.minVal &&
        chargePower <= inputConfig.chargePower.maxVal &&
        efficiency >= inputConfig.efficiency.minVal &&
        efficiency <= inputConfig.efficiency.maxVal,
    );
  }, [numEV, dailyMileage, batteryCapacity, chargePower, efficiency]);

  // Submit user inputs to calculation API
  async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    console.log("Button clicked!");

    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numEV,
          dailyMileage,
          batteryCapacity,
          chargePower,
          efficiency,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch calculation results.");
      }

      const data = await response.json();
      console.log("Data: ", data);
    } catch (error) {
      console.log("Error has been catched");
    }
  }

  return (
    <form>
      <div className="mb-5 grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2 lg:grid-cols-3">
        <IntegerInputWiithValidation
          label={inputConfig.numEV.label}
          state={numEV}
          setState={setNumEV}
          minVal={inputConfig.numEV.minVal}
          maxVal={inputConfig.numEV.maxVal}
        />
        <NumericInputWithValidation
          label={inputConfig.mileage.label}
          state={dailyMileage}
          setState={setDailyMileage}
          minVal={inputConfig.mileage.minVal}
          maxVal={inputConfig.mileage.maxVal}
        />
        <NumericInputWithValidation
          label={inputConfig.capacity.label}
          state={batteryCapacity}
          setState={setBatteryCapacity}
          minVal={inputConfig.capacity.minVal}
          maxVal={inputConfig.capacity.maxVal}
          info={
            <ul>
              <li>Passenger vehicle: 40-100 kWh</li>
              <li>Small Van: 50-80 kWh</li>
              <li>Large Van: 70-120 kWh</li>
              <li>Heavy Goods Vehicle: 300-1000+ kWh</li>
            </ul>
          }
        />
        <NumericInputWithValidation
          label={inputConfig.chargePower.label}
          state={chargePower}
          setState={setChargePower}
          minVal={inputConfig.chargePower.minVal}
          maxVal={inputConfig.chargePower.maxVal}
          info={
            <ul>
              <li>Slow Charging: 2.3 kW (household sockets)</li>
              <li>Fast Home Charging: 7kW </li>
              <li>Public AC Charging: 11-22 kW</li>
              <li>Rapid DC Charging: 50-100 kW</li>
              <li>Ultra-Fast DC Charging: 150kW+</li>
            </ul>
          }
        />
        <div>
          {useCustomEfficiency ? (
            <NumericInputWithValidation
              label={inputConfig.efficiency.label}
              state={efficiency}
              setState={setEfficiency}
              minVal={inputConfig.efficiency.minVal}
              maxVal={inputConfig.efficiency.maxVal}
              info={
                <>
                  <p>
                    Typically larger vehicles operate at lower efficiencies.
                  </p>
                </>
              }
            />
          ) : (
            <NumericDropdown
              label={inputConfig.efficiency.label}
              state={efficiency}
              setState={setEfficiency}
              minVal={inputConfig.efficiency.minVal}
              maxVal={inputConfig.efficiency.maxVal}
              info={
                <>
                  <p>
                    Typically larger vehicles operate at lower efficiencies.
                  </p>
                </>
              }
              options={[
                { label: "Car: 4.5 mi/kWh", value: 4.5 },
                { label: "Small Van: 3.5 mi/kWh", value: 3.5 },
                { label: "Large Van: 2.5 mi/kWh", value: 2.5 },
                { label: "HGV: 1.2 mi/kWh", value: 1.2 },
              ]}
            ></NumericDropdown>
          )}
          <label className="mr-3 inline-block" htmlFor="checkbox">
            Use custom value
          </label>
          <input
            className="inline-block"
            id="custom-efficiency"
            type="checkbox"
            onChange={(e) => setUseCustomEfficiency(e.target.checked)}
          />
        </div>
      </div>
      <button
        className="cursor-pointer rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-500"
        type="submit"
        disabled={!validInput}
        onClick={handleSubmit}
      >
        Submit
      </button>
    </form>
  );
}

function NumericInputWithValidation(props: inputArguments) {
  // Turn the label into a valid ID
  const id = toHtmlId(props.label);

  return (
    <div className="col-span-1">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
      >
        <p className="mr-3 inline-block">{props.label}</p>

        {/* Div to show info tooltip */}
        {props.info && <InfoIcon>{props.info}</InfoIcon>}
      </label>

      <input
        id={id}
        type="number"
        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        min={props.minVal}
        max={props.maxVal}
        value={props.state}
        onChange={(e) => props.setState(Number(e.target.value))}
      />
      <div className="block pt-2">
        <ul>
          {((props.minVal !== undefined && props.state < props.minVal) ||
            (props.maxVal !== undefined && props.state > props.maxVal)) && (
            <li className="text-red-500">
              Please insert a value between {props.minVal} to {props.maxVal}
            </li>
          )}
        </ul>
      </div>
      {props.children}
    </div>
  );
}

function NumericDropdown(props: inputArguments & DropdownOptions) {
  // Turn the label into a valid ID
  const id = toHtmlId(props.label);

  // Initialize the value of the first option during first mount
  useEffect(() => {
    props.setState(props.options[0].value);
  }, []);

  return (
    <div className="col-span-1">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
      >
        <p className="mr-3 inline-block">{props.label}</p>

        {/* Div to show info tooltip */}
        {props.info && <InfoIcon>{props.info}</InfoIcon>}
      </label>

      <select
        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        value={props.state}
        onChange={(e) => props.setState(Number(e.target.value))}
      >
        {props.options.map((option) => {
          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>

      <div className="block pt-2">
        <ul>
          {((props.minVal !== undefined && props.state < props.minVal) ||
            (props.maxVal !== undefined && props.state > props.maxVal)) && (
            <li className="text-red-500">
              Please insert a value between {props.minVal} to {props.maxVal}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function IntegerInputWiithValidation(props: inputArguments) {
  return (
    <NumericInputWithValidation {...props}>
      {!Number.isInteger(props.state) && (
        <li className="text-red-500">This should be an integer</li>
      )}
    </NumericInputWithValidation>
  );
}

type InfoIconProps = {
  children: React.ReactNode;
};

function InfoIcon({ children }: InfoIconProps) {
  return (
    <div className="group relative inline-block">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="inline-block size-5 cursor-pointer"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
        />
      </svg>

      <div className="absolute top-full left-1/2 mt-1 w-60 -translate-x-1/2 scale-0 transform rounded-lg bg-gray-800 p-2 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
        {children}
      </div>
    </div>
  );
}

export default InputForm;

function toHtmlId(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-");
}
