import React, { useId } from "react";
import { ChevronDown } from "lucide-react";

/** Labelled native select styled like FormField. `options` is a list of strings. */
const SelectField = ({ label, value, onChange, options, placeholder, error, selectRef, ...selectProps }) => {
  const id = useId();
  const errorId = useId();

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs text-gray-500">
        {label}
      </label>
      <div className="relative">
        <select
          ref={selectRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`w-full cursor-pointer appearance-none rounded-lg border bg-white py-2.5 pr-9 pl-3 text-sm focus:ring-2 focus:outline-none disabled:cursor-not-allowed ${
            value ? "text-[#343C6A]" : "text-gray-400"
          } ${error ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-[#EB4827]/60 focus:ring-[#FFF4E8]"}`}
          {...selectProps}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option} className="text-[#343C6A]">
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
        />
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectField;
