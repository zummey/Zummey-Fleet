import React, { useEffect, useId, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * Simple confirm dialog for destructive or important actions.
 * tone: "danger" (red confirm button + warning icon) | "default"
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPending, onClose]);

  const danger = tone === "danger";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && !isPending && onClose()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="w-full max-w-sm rounded-2xl bg-white p-6 font-poppins shadow-xl motion-safe:animate-fade-in-up"
      >
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
              danger ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:opacity-90"
            }`}
          >
            {isPending ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
