import React, { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import Modal from "../../../admin/components/Modal";
import FormField from "../shared/FormField";
import ChipField from "../shared/ChipField";
import DialogFooter from "../shared/DialogFooter";
import { CODE_LIMITS, DISCOUNT_TYPES, checkCoupon, cleanCode, formatExpiry, maskDate } from "./promotions.config";

const labelOf = (typeId) => DISCOUNT_TYPES.find((t) => t.id === typeId).label;
const idOf = (label) => DISCOUNT_TYPES.find((t) => t.label === label).id;

/** Create a coupon, or edit `coupon` when given. */
const CouponFormModal = ({ coupon, isPending, error, onConfirm, onClose }) => {
  const [form, setForm] = useState({
    code: coupon?.code ?? "",
    type: coupon?.type ?? "percent",
    value: coupon ? String(coupon.value) : "",
    usageLimit: coupon ? String(coupon.usageLimit) : "",
    expiresOn: coupon ? formatExpiry(coupon.expiresOn) : "",
  });
  const [showErrors, setShowErrors] = useState(false);
  const firstRef = useRef(null);
  const titleId = useId();
  const codeLocked = (coupon?.used ?? 0) > 0;

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const result = checkCoupon(form, coupon);
  const errors = showErrors ? result.errors ?? {} : {};
  const unchanged =
    !!coupon && !!result.values && Object.entries(result.values).every(([key, value]) => coupon[key] === value);

  const set = (key, clean = (v) => v) => (value) => setForm((f) => ({ ...f, [key]: clean(value) }));

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
            {coupon ? "Edit coupon" : "Create coupon"}
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
          <FormField
            inputRef={codeLocked ? undefined : firstRef}
            label="Coupon code"
            value={form.code}
            onChange={set("code", cleanCode)}
            placeholder="e.g. WELCOME20"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            readOnly={codeLocked}
            error={errors.code}
            hint={
              codeLocked
                ? "The code can’t change once customers have used it."
                : `Letters and numbers only, ${CODE_LIMITS.min} to ${CODE_LIMITS.max} characters.`
            }
          />

          <ChipField
            label="Type of discount"
            value={labelOf(form.type)}
            onChange={(label) => setForm((f) => ({ ...f, type: idOf(label) }))}
            options={DISCOUNT_TYPES.map((t) => t.label)}
            firstRef={codeLocked ? firstRef : undefined}
          />

          <FormField
            label="Discount value"
            value={form.value}
            onChange={set("value")}
            prefix={form.type === "fixed" ? "₦" : undefined}
            suffix={form.type === "percent" ? "%" : undefined}
            placeholder={form.type === "percent" ? "20" : "500"}
            inputMode="numeric"
            autoComplete="off"
            error={errors.value}
          />

          <FormField
            label="How many times it can be used"
            value={form.usageLimit}
            onChange={set("usageLimit")}
            placeholder="1000"
            inputMode="numeric"
            autoComplete="off"
            error={errors.usageLimit}
            hint={codeLocked ? `Used ${coupon.used.toLocaleString()} times so far.` : "Across all customers."}
          />

          <FormField
            label="Expiry date"
            value={form.expiresOn}
            onChange={set("expiresOn", maskDate)}
            placeholder="DD/MM/YYYY"
            inputMode="numeric"
            autoComplete="off"
            error={errors.expiresOn}
            hint="It works until the end of this day."
          />
        </fieldset>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error?.response?.data?.responseMessage || error?.message || "Couldn’t save the coupon"}
          </p>
        )}

        <DialogFooter
          onCancel={onClose}
          isPending={isPending}
          submitLabel={coupon ? "Save changes" : "Create"}
          pendingLabel={coupon ? "Saving..." : "Creating..."}
          disabled={unchanged}
        />
      </form>
    </Modal>
  );
};

export default CouponFormModal;
