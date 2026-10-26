import React, { useId, useState } from "react";
import Modal from "./Modal";
import { TONE_BUTTON_CLASSES } from "./dialogTones";

/**
 * Confirm dialog that asks for a reason (radio list) plus an optional note.
 * Used for holding payouts and rejecting refunds.
 *
 * - reasons: [{ value, label }]; choosing a value listed in `noteRequiredFor` makes the note required
 * - onConfirm({ reason, note })
 */
const ReasonDialog = ({
  title,
  description,
  reasons,
  noteLabel = "Note (optional)",
  notePlaceholder = "",
  noteRequiredFor = ["other"],
  confirmLabel = "Confirm",
  tone = "default",
  isPending = false,
  error,
  onConfirm,
  onClose,
}) => {
  const [reason, setReason] = useState(null);
  const [note, setNote] = useState("");
  const titleId = useId();
  const descId = useId();
  const noteId = useId();

  const noteRequired = noteRequiredFor.includes(reason);
  const canConfirm = !!reason && (!noteRequired || note.trim().length > 0) && !isPending;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canConfirm) onConfirm({ reason, note: note.trim() });
  };

  return (
    <Modal onClose={onClose} canClose={!isPending} labelledBy={titleId} describedBy={descId} className="max-w-md">
      <form onSubmit={handleSubmit}>
        <h3 id={titleId} className="text-base font-semibold text-[#343C6A]">
          {title}
        </h3>
        <p id={descId} className="mt-1 text-sm text-gray-500">
          {description}
        </p>

        <fieldset className="mt-4" disabled={isPending}>
          <legend className="mb-2 text-xs text-gray-400">Reason</legend>
          <div className="space-y-2">
            {reasons.map((option) => {
              const selected = option.value === reason;
              return (
                <label
                  key={option.value}
                  className={`relative flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm text-[#343C6A] transition-colors ${
                    selected ? "border-[#EB4827]/60 bg-[#FFF4E8]" : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={titleId}
                    value={option.value}
                    checked={selected}
                    onChange={() => setReason(option.value)}
                    className="peer sr-only"
                  />
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-orange-300 ${
                      selected ? "border-[#EB4827]" : "border-gray-300"
                    }`}
                  >
                    {selected && <span className="h-2 w-2 rounded-full bg-[#EB4827]" />}
                  </span>
                  {option.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <label htmlFor={noteId} className="mt-4 mb-2 block text-xs text-gray-400">
          {noteRequired ? noteLabel.replace(/\s*\(optional\)/i, "") : noteLabel}
          {noteRequired && <span className="text-red-500"> *</span>}
        </label>
        <textarea
          id={noteId}
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isPending}
          placeholder={notePlaceholder}
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#343C6A] placeholder-gray-400 focus:border-[#EB4827]/60 focus:ring-2 focus:ring-[#FFF4E8] focus:outline-none"
        />
        {noteRequired && !note.trim() && (
          <p className="mt-1 text-xs text-gray-400">Add a short note when choosing “Other”.</p>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error?.response?.data?.responseMessage || error?.message || "Something went wrong"}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-[#343C6A] hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${
              TONE_BUTTON_CLASSES[tone] ?? TONE_BUTTON_CLASSES.default
            }`}
          >
            {isPending ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReasonDialog;
