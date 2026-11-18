import React, { useId } from "react";

/**
 * Pick-one chips (radio group under the hood), e.g. the State options in the city price form.
 * `status` lets the caller show a loading row or a message instead of chips.
 */
const ChipField = ({ label, value, onChange, options, error, status, message, onRetry, firstRef }) => {
  const labelId = useId();
  const errorId = useId();
  const group = useId();

  return (
    <fieldset aria-labelledby={labelId} aria-describedby={error ? errorId : undefined}>
      <legend id={labelId} className="mb-1.5 text-xs text-gray-500">
        {label}
      </legend>

      {status === "loading" ? (
        <div className="flex gap-2" aria-label="Loading options">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="h-8 w-16 animate-pulse rounded-md bg-gray-100" />
          ))}
        </div>
      ) : status === "error" || status === "empty" ? (
        <p className={`rounded-lg px-3 py-2 text-xs ${status === "error" ? "bg-red-50 text-red-600" : "border border-amber-200 bg-amber-50 text-amber-800"}`}>
          {message}{" "}
          {onRetry && (
            <button type="button" onClick={onRetry} className="font-medium underline">
              Retry
            </button>
          )}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((option, i) => {
            const checked = option === value;
            return (
              <label
                key={option}
                className={`cursor-pointer rounded-md border px-3 py-1.5 text-xs transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-orange-300 ${
                  checked
                    ? "border-[#343C6A] bg-[#343C6A] text-white"
                    : error
                      ? "border-red-300 text-[#343C6A] hover:bg-gray-50"
                      : "border-gray-200 text-[#343C6A] hover:bg-gray-50"
                }`}
              >
                <input
                  ref={i === 0 ? firstRef : undefined}
                  type="radio"
                  name={group}
                  value={option}
                  checked={checked}
                  onChange={() => onChange(option)}
                  className="sr-only"
                />
                {option}
              </label>
            );
          })}
        </div>
      )}

      {error && status !== "empty" && status !== "error" && (
        <p id={errorId} className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </fieldset>
  );
};

export default ChipField;
