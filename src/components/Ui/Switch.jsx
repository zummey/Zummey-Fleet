import React, { useId } from "react";

/**
 * Switch
 * Accessible toggle switch (role="switch").
 *
 * Props:
 * - checked: boolean
 * - onChange: (nextChecked: boolean) => void
 * - label: optional visible text next to the switch
 * - ariaLabel: accessible name when no visible label is given
 * - disabled: boolean
 */
const Switch = ({ checked = false, onChange, label, ariaLabel, disabled = false, className = "" }) => {
  const labelId = useId();

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label ? undefined : ariaLabel}
        aria-labelledby={label ? labelId : undefined}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? "bg-[#EB4827]" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
      {label && (
        <span
          id={labelId}
          onClick={() => !disabled && onChange?.(!checked)}
          className="cursor-pointer text-sm font-medium text-gray-600 select-none"
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default Switch;
