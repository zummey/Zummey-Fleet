import React, { useState } from "react";
import { X } from "lucide-react";

const CANCEL_REASONS = [
  { id: "customer_requested", label: "Customer requested cancellation" },
  { id: "no_rider", label: "No rider available" },
  { id: "pickup_address", label: "Pickup address issue" },
  { id: "payment_problem", label: "Payment problem" },
  { id: "other", label: "Other" },
];

const CancelOrderModal = ({ isOpen, onClose, order, onConfirm }) => {
  const [selectedReason, setSelectedReason] = useState("customer_requested");
  const [refundCustomer, setRefundCustomer] = useState(true);
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  const orderId = order?.orderId || order?.request_id || "ORD-48201";
  const amountStr = order?.amount ? `₦${Number(order.amount).toLocaleString()}` : "₦4,500";

  const handleConfirm = () => {
    const reasonLabel =
      CANCEL_REASONS.find((r) => r.id === selectedReason)?.label || selectedReason;
    onConfirm?.({
      orderId,
      reason: reasonLabel,
      refundCustomer,
      note,
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
                Cancel {orderId}?
              </h2>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed max-w-md">
                The customer and rider will be told the order was cancelled. This cannot be undone.
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

        {/* Content */}
        <div className="px-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Reason */}
          <div>
            <label className="text-[11px] font-medium text-gray-400 block mb-2">
              Reason
            </label>
            <div className="space-y-2">
              {CANCEL_REASONS.map((r) => {
                const isSelected = selectedReason === r.id;
                return (
                  <label
                    key={r.id}
                    onClick={() => setSelectedReason(r.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#D9383A] bg-rose-50/50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancel-reason"
                      checked={isSelected}
                      onChange={() => setSelectedReason(r.id)}
                      className="w-4 h-4 text-[#D9383A] border-gray-300 focus:ring-[#D9383A] accent-[#D9383A] cursor-pointer"
                    />
                    <span className="text-xs font-medium text-gray-800">
                      {r.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Refund Customer Toggle Box */}
          <div className="flex items-center justify-between p-3.5 bg-gray-50/70 border border-gray-200 rounded-xl">
            <div>
              <div className="text-xs font-semibold text-gray-900">
                Refund the customer
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                Return {amountStr} to the original payment method
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={refundCustomer}
              onClick={() => setRefundCustomer(!refundCustomer)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                refundCustomer ? "bg-emerald-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  refundCustomer ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1.5">
              Note <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add context for other admins"
              className="w-full px-3.5 py-2.5 text-xs text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D9383A]/20 focus:border-[#D9383A] placeholder:text-gray-400 resize-none transition-all"
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
            Keep order
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#D9383A] hover:bg-[#B92B2D] rounded-xl transition-all shadow-sm"
          >
            Cancel order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
