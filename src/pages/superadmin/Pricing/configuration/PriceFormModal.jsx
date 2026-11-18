import React, { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import Modal from "../../../admin/components/Modal";
import FormField from "../shared/FormField";
import SelectField from "../shared/SelectField";
import DialogFooter from "../shared/DialogFooter";
import ChipField from "../shared/ChipField";
import { usePriceList } from "../../../../api/pricing.queries";
import { PRICE_CHANGE_NOTICE } from "../pricing.config";
import { checkPriceForm, priceDialogs } from "./configuration.config";

// Number keypad on phones for amounts and whole numbers; with a decimal point when decimals are allowed
const inputModeFor = (field) => {
  if (field.type === "naira") return "numeric";
  if (field.type === "number") return field.decimals ? "decimal" : "numeric";
  return undefined;
};

/**
 * Chips whose options are the names in another price list (field.optionsFrom).
 * When editing, the entry's current value stays selectable even if that price was since deleted.
 */
const ListChips = ({ field, current, ...props }) => {
  const source = usePriceList(field.optionsFrom);
  const names = [...(source.data ?? []).map((p) => p.name)].sort((a, b) => a.localeCompare(b));
  if (current && !names.includes(current)) names.push(current);

  const status = source.isLoading ? "loading" : source.isError ? "error" : names.length === 0 ? "empty" : "ready";
  return (
    <ChipField
      {...props}
      options={names}
      status={status}
      message={status === "error" ? "Couldn’t load the options." : field.noOptions}
      onRetry={status === "error" ? () => source.refetch() : undefined}
    />
  );
};

/**
 * Create a price-list entry, or edit `row` when given. Fields come from the section config.
 * `takenNames` are names that already have a price; they're left out of the choice list.
 * `rows` are the section's current rows, for checks such as overlapping weight bands.
 */
const PriceFormModal = ({ section, row, takenNames, rows, isPending, error, onConfirm, onClose }) => {
  const copy = row ? priceDialogs(section).edit : priceDialogs(section).create;
  const [form, setForm] = useState(() =>
    Object.fromEntries(section.fields.map((f) => [f.key, row ? String(row[f.key]) : ""]))
  );
  const [showErrors, setShowErrors] = useState(false);
  const firstRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const result = checkPriceForm(section, form, rows, row?.id);
  const errors = showErrors ? result.errors ?? {} : {};
  const unchanged = !!row && !!result.values && section.fields.every((f) => result.values[f.key] === row[f.key]);
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (result.errors) return setShowErrors(true);
    if (!unchanged) onConfirm(result.values);
  };

  return (
    <Modal onClose={onClose} canClose={!isPending} labelledBy={titleId} className="max-w-md">
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-base font-semibold text-[#343C6A]">
            {copy.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Close"
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <fieldset disabled={isPending} className="mt-4 space-y-4">
          {section.fields.map((field, i) => {
            const common = {
              label: field.label,
              value: form[field.key],
              onChange: set(field.key),
              error: errors[field.key],
            };
            if (field.type === "choice") {
              return (
                <SelectField key={field.key}
                  {...common}
                  selectRef={i === 0 ? firstRef : undefined}
                  placeholder={field.placeholder}
                  options={field.options.filter((o) => o === row?.[field.key] || !takenNames.has(o.toLowerCase()))}
                />
              );
            }
            if (field.type === "chips") {
              return <ListChips key={field.key} {...common} field={field} current={row?.[field.key]} />;
            }
            return (
              <FormField key={field.key}
                {...common}
                inputRef={i === 0 ? firstRef : undefined}
                hint={field.hint}
                maxLength={field.maxLength}
                inputMode={inputModeFor(field)}
                prefix={field.prefix}
                suffix={field.suffix}
                autoComplete="off"
              />
            );
          })}
        </fieldset>

        {row && (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {PRICE_CHANGE_NOTICE}
          </p>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error?.response?.data?.responseMessage || error?.message || "Couldn’t save the price"}
          </p>
        )}

        <DialogFooter
          onCancel={onClose}
          isPending={isPending}
          submitLabel={copy.submit}
          pendingLabel={copy.pending}
          disabled={unchanged}
        />
      </form>
    </Modal>
  );
};

export default PriceFormModal;
