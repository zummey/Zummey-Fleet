import React from "react";

/**
 * Small grey "Last 7 days / Last 30 days / Last 12 months" switch used on chart cards.
 * ranges: [{ id, label }]. Behaves as a radio group.
 */
const RangeToggle = ({ ranges, value, onChange, label = "Date range" }) => (
  <div role="radiogroup" aria-label={label} className="flex rounded-lg bg-gray-50 p-1">
    {ranges.map((r) => {
      const selected = r.id === value;
      return (
        <button
          key={r.id}
          type="button"
          role="radio"
          aria-checked={selected}
          onClick={() => onChange(r.id)}
          className={`rounded-md px-3 py-1 text-xs whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none ${
            selected ? "bg-white font-medium text-[#343C6A] shadow-sm" : "text-gray-500 hover:text-[#343C6A]"
          }`}
        >
          {r.label}
        </button>
      );
    })}
  </div>
);

export default RangeToggle;
