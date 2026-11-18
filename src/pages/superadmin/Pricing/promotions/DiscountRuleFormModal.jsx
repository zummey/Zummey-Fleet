import React, { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import Modal from "../../../admin/components/Modal";
import FormField from "../shared/FormField";
import ChipField from "../shared/ChipField";
import DialogFooter from "../shared/DialogFooter";
import { RULE_NAME_MAX, TRIGGERS, checkDiscountRule, triggerOf } from "./discountRules.config";

const idOf = (label) => TRIGGERS.find((t) => t.label === label).id;

/** Create a discount rule, or edit `rule` when given. */
const DiscountRuleFormModal = ({ rule, isPending, error, onConfirm, onClose }) => {
  const [form, setForm] = useState({
    name: rule?.name ?? "",
    trigger: rule?.trigger ?? "first_order",
    // Keep the threshold per trigger so switching chips back and forth doesn't lose what was typed
    thresholds: rule && rule.trigger !== "first_order" ? { [rule.trigger]: rule.threshold.toLocaleString() } : {},
    discount: rule ? String(rule.discount) : "",
  });
  const [showErrors, setShowErrors] = useState(false);
  const nameRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const trigger = triggerOf(form.trigger);
  const result = checkDiscountRule({ ...form, threshold: form.thresholds[form.trigger] ?? "" });
  const errors = showErrors ? result.errors ?? {} : {};
  const unchanged =
    !!rule && !!result.values && Object.entries(result.values).every(([key, value]) => rule[key] === value);

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
            {rule ? "Edit discount rule" : "Create discount rule"}
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
            onChange={(name) => setForm((f) => ({ ...f, name }))}
            placeholder="e.g. First order discount"
            maxLength={RULE_NAME_MAX}
            autoComplete="off"
            error={errors.name}
          />

          <ChipField
            label="Applies when"
            value={trigger.label}
            onChange={(label) => setForm((f) => ({ ...f, trigger: idOf(label) }))}
            options={TRIGGERS.map((t) => t.label)}
          />

          {trigger.threshold && (
            <FormField
              key={trigger.id}
              label={trigger.threshold.label}
              value={form.thresholds[trigger.id] ?? ""}
              onChange={(value) => setForm((f) => ({ ...f, thresholds: { ...f.thresholds, [trigger.id]: value } }))}
              prefix={trigger.threshold.prefix}
              placeholder={trigger.threshold.placeholder}
              inputMode="numeric"
              autoComplete="off"
              error={errors.threshold}
              hint={trigger.threshold.hint}
            />
          )}

          <FormField
            label="Discount %"
            value={form.discount}
            onChange={(discount) => setForm((f) => ({ ...f, discount }))}
            suffix="%"
            placeholder="10"
            inputMode="numeric"
            autoComplete="off"
            error={errors.discount}
          />
        </fieldset>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error?.response?.data?.responseMessage || error?.message || "Couldn’t save the rule"}
          </p>
        )}

        <DialogFooter
          onCancel={onClose}
          isPending={isPending}
          submitLabel={rule ? "Save changes" : "Create"}
          pendingLabel={rule ? "Saving..." : "Creating..."}
          disabled={unchanged}
        />
      </form>
    </Modal>
  );
};

export default DiscountRuleFormModal;
