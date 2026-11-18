import React, { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import Modal from "../../../admin/components/Modal";
import FormField from "../shared/FormField";
import DialogFooter from "../shared/DialogFooter";
import { MULTIPLIER_LIMITS, PRICE_CHANGE_NOTICE, SURGE_DIALOGS, SURGE_FIELD_LIMITS, checkSurgeRule } from "../pricing.config";

/** Create a surge rule, or edit one when `rule` is given. */
const SurgeRuleModal = ({ rule, isPending, error, onConfirm, onClose }) => {
  const copy = rule ? SURGE_DIALOGS.edit : SURGE_DIALOGS.create;
  const [form, setForm] = useState({
    name: rule?.name ?? "",
    appliesWhen: rule?.appliesWhen ?? "",
    multiplier: rule ? String(rule.multiplier) : "",
  });
  const [showErrors, setShowErrors] = useState(false);
  const nameRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const result = checkSurgeRule(form);
  const errors = showErrors ? result.errors ?? {} : {};
  const unchanged =
    !!rule &&
    !!result.values &&
    result.values.name === rule.name &&
    result.values.appliesWhen === rule.appliesWhen &&
    result.values.multiplier === rule.multiplier;

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

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
          <FormField
            inputRef={nameRef}
            label="Rule name"
            value={form.name}
            onChange={set("name")}
            placeholder="e.g. Rush hour"
            maxLength={SURGE_FIELD_LIMITS.name}
            autoComplete="off"
            error={errors.name}
          />
          <FormField
            label="When it applies"
            value={form.appliesWhen}
            onChange={set("appliesWhen")}
            placeholder="e.g. Weekdays, 7 am to 9 am"
            maxLength={SURGE_FIELD_LIMITS.appliesWhen}
            autoComplete="off"
            error={errors.appliesWhen}
          />
          <FormField
            label="Price multiplier"
            value={form.multiplier}
            onChange={set("multiplier")}
            prefix="×"
            placeholder="1.3"
            inputMode="decimal"
            autoComplete="off"
            error={errors.multiplier}
            hint={`1.3 makes deliveries 30% more expensive. Up to ×${MULTIPLIER_LIMITS.max}.`}
          />
        </fieldset>

        {rule?.status === "active" && (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {PRICE_CHANGE_NOTICE}
          </p>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error?.response?.data?.responseMessage || error?.message || "Couldn’t save the rule"}
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

export default SurgeRuleModal;
