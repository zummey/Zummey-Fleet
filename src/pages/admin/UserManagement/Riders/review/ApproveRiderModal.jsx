import React from "react";
import { CheckCircle2, X } from "lucide-react";

const ApproveRiderModal = ({
  riderName = "this rider",
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 font-poppins"
      onMouseDown={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl motion-safe:animate-fade-in-up">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={24} />
            </span>
            <h3 className="text-xl font-bold text-[#1E2A5E]">
              Approve {riderName}?
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
          The rider application will be approved. Their status will change to Active and they will be able to start accepting orders.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-xl bg-[#059669] hover:bg-[#047857] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Approving..." : "Approve application"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveRiderModal;
