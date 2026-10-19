import React, { useState } from "react";
import { Check, X } from "lucide-react";

const ITEMS = [
  { id: "nin", label: "Government ID (NIN)" },
  { id: "passport", label: "Passport photograph" },
  { id: "license", label: "Driver's licence" },
  { id: "vehicle", label: "Vehicle registration" },
  { id: "insurance", label: "Insurance certificate" },
  { id: "other", label: "Other (explain in message)" },
];

const RequestMoreInfoModal = ({
  riderName = "the rider",
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const toggleItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (selectedItems.length === 0 && !message.trim()) return;
    onSubmit({
      itemsNeeded: selectedItems,
      message: message.trim(),
    });
  };

  const canSubmit = selectedItems.length > 0 || message.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 font-poppins"
      onMouseDown={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}
    >
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl motion-safe:animate-fade-in-up">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold text-[#1E2A5E]">
            Request additional information
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
          Choose what {riderName} needs to re-submit. They'll get a notification in the rider app.
        </p>

        <form onSubmit={handleSend} className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-700">
              Items needed
            </label>
            <div className="space-y-2.5">
              {ITEMS.map((item) => {
                const isSelected = selectedItems.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                      isSelected
                        ? "border-[#0088FF] bg-blue-50/20"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        isSelected
                          ? "border-[#0088FF] bg-[#0088FF] text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check size={13} className="stroke-[3]" />}
                    </div>
                    <span className="text-sm font-normal text-gray-800 select-none">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-700">
              Message to rider
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="For example, the photo is blurry. Please upload a clearer copy."
              className="w-full resize-none rounded-xl border border-gray-200 p-3.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#0088FF] focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
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
              disabled={!canSubmit || isSubmitting}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white transition-colors ${
                canSubmit && !isSubmitting
                  ? "bg-[#0088FF] hover:bg-blue-600 shadow-sm cursor-pointer"
                  : "bg-slate-300 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Sending..." : "Send request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestMoreInfoModal;
