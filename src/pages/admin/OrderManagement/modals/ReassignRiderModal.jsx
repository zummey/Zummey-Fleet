import React, { useState } from "react";
import { X } from "lucide-react";
import { NEARBY_RIDERS } from "../adminOrders.config";

const ReassignRiderModal = ({ isOpen, onClose, order, onConfirm }) => {
  const [selectedRiderId, setSelectedRiderId] = useState("r1");
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  const orderId = order?.orderId || order?.request_id || "ORD-48201";

  const handleConfirm = () => {
    const selectedRider = NEARBY_RIDERS.find((r) => r.id === selectedRiderId);
    onConfirm?.({
      orderId,
      rider: selectedRider,
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
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Reassign Rider</h2>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed max-w-md">
                Choose a rider for <span className="font-semibold text-gray-700">{orderId}</span>. The new rider is notified straight away and the previous rider is told the job was removed.
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
        <div className="px-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="text-[11px] font-medium text-gray-400 block mb-2">
              Nearby riders
            </label>
            <div className="space-y-2">
              {NEARBY_RIDERS.map((rider) => {
                const isSelected = selectedRiderId === rider.id;
                return (
                  <label
                    key={rider.id}
                    onClick={() => setSelectedRiderId(rider.id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#1E2A5E] bg-slate-50/70 shadow-xs"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="reassign-rider"
                          checked={isSelected}
                          onChange={() => setSelectedRiderId(rider.id)}
                          className="w-4 h-4 text-[#1E2A5E] border-gray-300 focus:ring-[#1E2A5E] cursor-pointer"
                        />
                      </div>
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs ${rider.avatarBg}`}
                      >
                        {rider.initials}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {rider.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {rider.fleet} · {rider.distance}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                        rider.status === "Available"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}
                    >
                      {rider.status}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1.5">
              Note to rider <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="For example, the recipient prefers a call before arrival"
              className="w-full px-3.5 py-2.5 text-xs text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E2A5E]/20 focus:border-[#1E2A5E] placeholder:text-gray-400 resize-none transition-all"
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
            disabled={!selectedRiderId}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#1E2A5E] hover:bg-[#162046] disabled:bg-slate-200 disabled:text-slate-400 rounded-xl transition-all shadow-sm"
          >
            Reassign rider
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReassignRiderModal;
