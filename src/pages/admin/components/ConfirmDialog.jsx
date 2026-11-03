import React, { useEffect, useId, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";
import Modal from "./Modal";
import { TONE_BUTTON_CLASSES } from "./dialogTones";

/**
 * Simple confirm dialog for destructive or important actions.
 * tone: "default" | "danger" (adds a warning icon) | "success" | "info" | "warning"
 */
const ConfirmDialog = ({
  title,
  description,
  confirmLabel = "Confirm",
  tone = "default",
  isPending = false,
  error,
  onConfirm,
  onClose,
}) => {
  const confirmRef = useRef(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    confirmRef.current?.focus();
  }, []);

  const danger = tone === "danger";

  return (
    <Modal onClose={onClose} canClose={!isPending} role="alertdialog" labelledBy={titleId} describedBy={descId}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {danger && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertTriangle size={18} />
            </span>
          )}
          <div>
            <h3 id={titleId} className="text-base font-semibold text-[#343C6A]">
              {title}
            </h3>
            <p id={descId} className="mt-1 text-sm text-gray-500">
              {description}
            </p>
          </div>
        </div>
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

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error?.response?.data?.responseMessage || error?.message || "Something went wrong"}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-[#343C6A] hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          ref={confirmRef}
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${
            TONE_BUTTON_CLASSES[tone] ?? TONE_BUTTON_CLASSES.default
          }`}
        >
          {isPending ? "Please wait..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
