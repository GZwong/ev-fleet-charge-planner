"use client";

import { useState } from "react";

function toHtmlId(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-");
}

type inputArguments = {
  label: string;
  minVal?: number;
  maxVal?: number;
  info?: string;
};

function NumericInputWithValidation(props: inputArguments) {
  const [inputVal, setInputVal] = useState<number>(0);

  // Turn the label into a valid ID
  const id = toHtmlId(props.label);

  return (
    <div>
      <label
        htmlFor={id}
        className="col-span-1 mb-2 block text-sm font-medium text-gray-900 dark:text-white"
      >
        <p className="mr-3 inline-block">{props.label}</p>

        {/* Div to show info tooltip */}
        {props.info && (
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

            <div className="absolute top-full left-1/2 mt-1 w-40 -translate-x-1/2 scale-0 transform rounded-lg bg-gray-800 p-2 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
              <p>{props.info}</p>
            </div>
          </div>
        )}
      </label>

      <input
        id={id}
        type="number"
        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        min={props.minVal}
        max={props.maxVal}
        onChange={(e) => setInputVal(Number(e.target.value))}
      />
    </div>
  );
}

export default NumericInputWithValidation;
