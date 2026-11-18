import React, { useId } from "react";

/**
 * Labelled text input for the pricing dialogs, with an optional prefix ("₦", "×") / suffix ("/km"),
 * hint and error.
 */
const FormField = ({ label, value, onChange, error, hint, prefix, suffix, inputRef, ...inputProps }) => {
  const id = useId();
  const hintId = useId();
  const errorId = useId();
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs text-gray-500">
        {label}
      </label>
      <div
        className={`flex items-center rounded-lg border bg-white px-3 focus-within:ring-2 ${
          error ? "border-red-300 focus-within:ring-red-100" : "border-gray-200 focus-within:border-[#EB4827]/60 focus-within:ring-[#FFF4E8]"
        }`}
      >
        {prefix && (
          <span aria-hidden="true" className="mr-1.5 text-sm text-gray-400">
            {prefix}
          </span>
        )}
        <input
          ref={inputRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-[#343C6A] placeholder-gray-400 outline-none"
          {...inputProps}
        />
        {suffix && (
          <span aria-hidden="true" className="ml-1.5 text-sm text-gray-400">
            {suffix}
          </span>
        )}
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-1 text-[11px] text-gray-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
