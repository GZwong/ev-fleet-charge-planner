"use client";

import { ReactNode } from "react";

/**
 * A grid acting as parent of cards
 *
 * @param children - React node that contains cards
 * @returns
 */
export function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="lg: grid grid-cols-1 gap-4 p-10 md:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  );
}

/**
 * The base card component to be "inherited". Cards with specific functions
 * should be made by nesting children within this component
 *
 * @param children - Components to be added to the card
 * @param className - (Optional) Additional class styles to be applied to the
 *                    card. Mainly used to configure the number of columns to
 *                    take on the grid
 * @returns React Component - Base Card to be implemented
 */
function BaseCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`${className ?? ""} flex min-h-[150px] flex-col items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800`}
    >
      {children}
    </div>
  );
}

/**
 * A simple KPI card component that shows a title, value and some optional
 * notes.
 * @param value - The value to be emphasized
 * @param title - The title to describe the KPI
 * @param className - (Optional) The styling class name
 * @param unit - (Optional) The unit of the displayed value
 * @param notes - (Optional) Text to be displayed at the bottom of the card
 * @returns
 */
export function CardKPI({
  value,
  title,
  className,
  unit,
  notes,
}: {
  value: number;
  title: string;
  className?: string;
  unit?: string;
  notes?: string;
}) {
  return (
    <BaseCard className={className}>
      <h5 className="text-sm font-bold">{title}</h5>
      <h1 className="text-center text-4xl">
        {value && value.toFixed(0)} <span className="text-sm">{unit}</span>
      </h1>
      <p className="text-sm">{notes}</p>
    </BaseCard>
  );
}

/**
 * A card component that displays a title with a chart on the right.
 *
 * @param title - The title to describe the card
 * @param chart - React Node (intended to be a chart) to be added to the card
 * @param className - (Optional) The styling class name
 * @param notes  - (Optional) Text to be displayed at the bottom of the card
 * @returns
 */
export function CardWithChartOnRight({
  title,
  chart,
  className,
  notes,
}: {
  title: string;
  chart: ReactNode;
  className?: string;
  notes?: string;
}) {
  return (
    <div
      className={`${className ?? ""} flex min-h-[150px] items-center gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800`}
    >
      <div className="flex w-[40%] flex-col justify-between gap-4">
        <h5 className="text-sm font-bold">{title}</h5>
        <p className="text-sm">{notes}</p>
      </div>
      <div className="min-h-[150px] w-[60%]">{chart}</div>
    </div>
  );
}

/**
 * A card component that displays a title, a chart and optionally notes from
 * top to bottom.
 *
 * @param title - The title to describe the card
 * @param chart - React Node (intended to be a chart) to be added to the card
 * @param className - (Optional) The styling class name
 * @param notes  - (Optional) Text to be displayed at the bottom of the card
 * @returns
 */
export function CardWithChart({
  title,
  chart,
  className,
  notes,
}: {
  title: string;
  chart: ReactNode;
  className?: string;
  notes?: string;
}) {
  return (
    <BaseCard className={className}>
      <h5 className="text-sm font-bold">{title}</h5>
      {chart}
      <p className="text-sm">{notes}</p>
    </BaseCard>
  );
}
