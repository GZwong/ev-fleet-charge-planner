import { ReactNode } from "react";

/**
 * A grid which cards can be laid onto
 *
 * @param param0
 * @returns
 */
export function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="lg: grid grid-cols-1 gap-4 p-10 md:grid-cols-2 lg:grid-cols-4">
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
        {value.toFixed(1)} <span className="text-sm">{unit}</span>
      </h1>
      <p className="text-sm">{notes}</p>
    </BaseCard>
  );
}

export function CardWithChart({ data, xAxis, yAxis, xUnit, yUnit, notes });
