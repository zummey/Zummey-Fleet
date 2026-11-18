import React, { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import Modal from "../../../admin/components/Modal";
import FormField from "../shared/FormField";
import DialogFooter from "../shared/DialogFooter";
import { PRICE_CHANGE_NOTICE, RATE_LIMITS } from "../pricing.config";

const check = (text) => {
  const digits = text.replace(/,/g, "").trim();
  if (!digits) return { error: "Enter a price" };
  if (!/^\d+$/.test(digits)) return { error: "Use whole naira, e.g. 800" };
  const value = Number(digits);
  if (value < RATE_LIMITS.min) return { error: "Must be at least ₦1" };
  if (value > RATE_LIMITS.max) return { error: `Must be at most ₦${RATE_LIMITS.max.toLocaleString()}` };
  return { value };
};

/** Edit the base delivery price or the per-km charge. `card` is an entry from RATE_CARDS. */
const EditRateModal = ({ card, rates, isPending, error, onConfirm, onClose }) => {
  const current = rates[card.id];
  const [text, setText] = useState(current.toLocaleString());
  const [showErrors, setShowErrors] = useState(false);
  const inputRef = useRef(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  const result = check(text);
  const unchanged = result.value === current;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (result.error) return setShowErrors(true);
    if (!unchanged) onConfirm({ [card.id]: result.value });
  };

  return (
    <Modal onClose={onClose} canClose={!isPending} labelledBy={titleId} describedBy={descId} className="max-w-md">
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-base font-semibold text-[#343C6A]">
            {card.edit.title}
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
        <p id={descId} className="mt-1 text-xs text-gray-500">
          {card.edit.description(rates)}
        </p>

        <div className="mt-4">
          <FormField
            inputRef={inputRef}
            label={card.edit.label}
            value={text}
            onChange={setText}
            prefix="₦"
            suffix={card.suffix}
            inputMode="numeric"
            autoComplete="off"
            disabled={isPending}
            error={showErrors ? result.error : null}
            hint={`Currently ₦${current.toLocaleString()}${card.suffix ?? ""}`}
          />
        </div>

        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {PRICE_CHANGE_NOTICE}
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error?.response?.data?.responseMessage || error?.message || "Couldn’t save the price"}
          </p>
        )}

        <DialogFooter
          onCancel={onClose}
          isPending={isPending}
          submitLabel="Save"
          pendingLabel="Saving..."
          disabled={unchanged}
        />
      </form>
    </Modal>
  );
};

export default EditRateModal;
