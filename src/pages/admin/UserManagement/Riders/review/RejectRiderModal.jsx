import React, { useState } from "react";
import { Check, X } from "lucide-react";

const REASONS = [
  { id: "unclear_docs", label: "Documents unclear or invalid" },
  { id: "failed_bg_check", label: "Failed background check" },
  { id: "requirements_not_met", label: "Does not meet requirements" },
  { id: "other", label: "Other" },
];

const RejectRiderModal = ({
  riderName = "this rider",
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [selectedReasons, setSelectedReasons] = useState(["unclear_docs"]);
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  const toggleReason = (id) => {
    setSelectedReasons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleReject = (e) => {
    e.preventDefault();
    if (selectedReasons.length === 0 && !note.trim()) return;
    onSubmit({
      reasons: selectedReasons,
      note: note.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 font-poppins"
      onMouseDown={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl motion-safe:animate-fade-in-up">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold text-[#1E2A5E]">
            Reject {riderName}?
          </h3>
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

        <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
          The application will be closed and the rider will be notified that they were not approved.
        </p>

        <form onSubmit={handleReject} className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-700">
              Reason
            </label>
            <div className="space-y-2.5">
              {REASONS.map((reason) => {
                const isSelected = selectedReasons.includes(reason.id);
                return (
                  <div
                    key={reason.id}
                    onClick={() => toggleReason(reason.id)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors ${
                      isSelected
                        ? "border-[#DC2626] bg-red-50/20"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        isSelected
                          ? "border-[#DC2626] bg-[#DC2626] text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check size={13} className="stroke-[3]" />}
                    </div>
                    <span
                      className={`text-sm select-none ${
                        isSelected ? "font-medium text-gray-900" : "font-normal text-gray-800"
                      }`}
                    >
                      {reason.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-700">
              Note (optional)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add context for other admins"
              className="w-full resize-none rounded-xl border border-gray-200 p-3.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 focus:outline-none transition-all"
            />
          </div>

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
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#DC2626] hover:bg-red-700 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Rejecting..." : "Reject application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectRiderModal;
