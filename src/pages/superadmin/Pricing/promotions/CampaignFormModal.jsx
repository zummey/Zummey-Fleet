import React, { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import Modal from "../../../admin/components/Modal";
import FormField from "../shared/FormField";
import ChipField from "../shared/ChipField";
import DialogFooter from "../shared/DialogFooter";
import { maskDate } from "./promotions.config";
import { AUDIENCES, CAMPAIGN_NAME_MAX, checkCampaign, formatDmy } from "./campaigns.config";

const labelOf = (id) => AUDIENCES.find((a) => a.id === id).label;
const idOf = (label) => AUDIENCES.find((a) => a.label === label).id;

/** Create a promo campaign, or edit `campaign` when given. */
const CampaignFormModal = ({ campaign, isPending, error, onConfirm, onClose }) => {
  const [form, setForm] = useState({
    name: campaign?.name ?? "",
    audience: campaign?.audience ?? "all",
    discount: campaign ? String(campaign.discount) : "",
    startsOn: campaign ? formatDmy(campaign.startsOn) : "",
    endsOn: campaign ? formatDmy(campaign.endsOn) : "",
  });
  const [showErrors, setShowErrors] = useState(false);
  const nameRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const result = checkCampaign(form, campaign);
  const errors = showErrors ? result.errors ?? {} : {};
  const unchanged =
    !!campaign && !!result.values && Object.entries(result.values).every(([key, value]) => campaign[key] === value);

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
            {campaign ? "Edit campaign" : "Create campaign"}
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
            label="Campaign name"
            value={form.name}
            onChange={set("name")}
            placeholder="e.g. Welcome month"
            maxLength={CAMPAIGN_NAME_MAX}
            autoComplete="off"
            error={errors.name}
          />

          <ChipField
            label="Who gets it"
            value={labelOf(form.audience)}
            onChange={(label) => setForm((f) => ({ ...f, audience: idOf(label) }))}
            options={AUDIENCES.map((a) => a.label)}
          />

          <FormField
            label="Discount %"
            value={form.discount}
            onChange={set("discount")}
            suffix="%"
            placeholder="20"
            inputMode="numeric"
            autoComplete="off"
            error={errors.discount}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Starts on"
              value={form.startsOn}
              onChange={set("startsOn", maskDate)}
              placeholder="DD/MM/YYYY"
              inputMode="numeric"
              autoComplete="off"
              error={errors.startsOn}
            />
            <FormField
              label="Ends on"
              value={form.endsOn}
              onChange={set("endsOn", maskDate)}
              placeholder="DD/MM/YYYY"
              inputMode="numeric"
              autoComplete="off"
              error={errors.endsOn}
              hint="It runs until the end of this day."
            />
          </div>
        </fieldset>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error?.response?.data?.responseMessage || error?.message || "Couldn’t save the campaign"}
          </p>
        )}

        <DialogFooter
          onCancel={onClose}
          isPending={isPending}
          submitLabel={campaign ? "Save changes" : "Create"}
          pendingLabel={campaign ? "Saving..." : "Creating..."}
          disabled={unchanged}
        />
      </form>
    </Modal>
  );
};

export default CampaignFormModal;
