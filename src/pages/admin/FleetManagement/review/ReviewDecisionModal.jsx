import React, { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";

/**
 * Confirmation dialog for a review decision. Collects the note
 * (required for reject / clarify) and shows the mutation's error, if any.
 */
const ReviewDecisionModal = ({ decision, initialNote = "", isSubmitting, error, onConfirm, onClose }) => {
  const [note, setNote] = useState(initialNote);
  const [touched, setTouched] = useState(false);
  const textareaRef = useRef(null);
  const titleId = useId();
  const descId = useId();

  const noteMissing = decision.requiresNote && !note.trim();

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (noteMissing) return;
    onConfirm(note.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-6 font-poppins shadow-xl motion-safe:animate-fade-in-up"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 id={titleId} className="text-lg font-semibold text-[#343C6A]">
            {decision.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>
        <p id={descId} className="mt-1 text-sm text-gray-500">
          {decision.description}
        </p>

        <label className="mt-5 block text-sm font-medium text-[#343C6A]">
          {decision.requiresNote ? "Message" : "Note"}
          {!decision.requiresNote && <span className="font-normal text-gray-400"> (optional)</span>}
          <textarea
            ref={textareaRef}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => setTouched(true)}
            rows={4}
            placeholder={decision.notePlaceholder}
            aria-invalid={touched && noteMissing}
            className={`mt-1.5 w-full resize-none rounded-lg border px-3 py-2 text-sm font-normal placeholder-gray-400 focus:ring-2 focus:outline-none ${
              touched && noteMissing ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:ring-[#FFF4E8]"
            }`}
          />
        </label>
        {touched && noteMissing && <p className="mt-1 text-xs text-red-500">Please add a message for the fleet owner.</p>}

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error?.response?.data?.responseMessage || error?.message || "Something went wrong"}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-[#343C6A] hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60 ${decision.confirmClass}`}
          >
            {isSubmitting ? "Submitting..." : decision.label}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewDecisionModal;
