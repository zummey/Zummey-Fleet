import React, { useState } from "react";
import { X } from "lucide-react";

const ISSUE_OPTIONS = [
  { id: "delayed_delivery", label: "Delayed delivery" },
  { id: "rider_unreachable", label: "Rider unreachable" },
  { id: "customer_dispute", label: "Customer dispute" },
  { id: "payment_issue", label: "Payment issue" },
  { id: "other", label: "Other" },
];

const PRIORITIES = [
  { id: "normal", label: "Normal" },
  { id: "high", label: "High" },
  { id: "urgent", label: "Urgent" },
];

const EscalateIssueModal = ({ isOpen, onClose, order, onConfirm }) => {
  const [selectedIssue, setSelectedIssue] = useState("delayed_delivery");
  const [priority, setPriority] = useState("high");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const orderId = order?.orderId || order?.request_id || "ORD-48201";

  const handleConfirm = () => {
    const issueLabel = ISSUE_OPTIONS.find((i) => i.id === selectedIssue)?.label || selectedIssue;
    onConfirm?.({
      orderId,
      issue: issueLabel,
      priority,
      description,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-poppins">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Escalate issue on {orderId}
              </h2>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed max-w-md">
                Send this order to the operations team for urgent follow-up. They will see the full order history.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Issue Types */}
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-2">
              What is the issue?
            </label>
            <div className="space-y-2">
              {ISSUE_OPTIONS.map((opt) => {
                const isSelected = selectedIssue === opt.id;
                return (
                  <label
                    key={opt.id}
                    onClick={() => setSelectedIssue(opt.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#E06516] bg-[#FFF8F3]"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="escalate-issue"
                      checked={isSelected}
                      onChange={() => setSelectedIssue(opt.id)}
                      className="w-4 h-4 text-[#E06516] border-gray-300 focus:ring-[#E06516] accent-[#E06516] cursor-pointer"
                    />
                    <span className="text-xs font-medium text-gray-800">
                      {opt.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-2">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITIES.map((p) => {
                const isSelected = priority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                      isSelected
                        ? "border-[#E06516] bg-[#FFF8F3] text-[#E06516]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Problem Description */}
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1.5">
              Describe the problem
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened and what do you need from the operations team?"
              className="w-full px-3.5 py-2.5 text-xs text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E06516]/20 focus:border-[#E06516] placeholder:text-gray-400 resize-none transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 flex items-center justify-end gap-3 border-t border-gray-100 mt-4 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#E06516] hover:bg-[#C9550F] rounded-xl transition-all shadow-sm"
          >
            Escalate issue
          </button>
        </div>
      </div>
    </div>
  );
};

export default EscalateIssueModal;
