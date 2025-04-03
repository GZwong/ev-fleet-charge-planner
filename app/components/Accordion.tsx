import { useState, ReactNode } from "react";

export function Accordion({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false); // State to track open/closed

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700">
      <h2>
        <button
          type="button"
          className="flex w-full items-center justify-between p-5 font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          onClick={() => setIsOpen(!isOpen)} // Toggle open/close state
        >
          <span>{title}</span>
          <svg
            className={`h-3 w-3 transform ${isOpen ? "rotate-180" : ""}`} // Rotate icon when open
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5 5 1 1 5"
            />
          </svg>
        </button>
      </h2>
      {isOpen && (
        <div className="border-t border-gray-200 p-5 dark:border-gray-700 dark:bg-gray-900">
          {children}
        </div>
      )}
    </div>
  );
}
