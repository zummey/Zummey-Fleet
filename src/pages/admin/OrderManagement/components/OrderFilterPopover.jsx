import React from "react";
import { ORDER_FILTER_OPTIONS } from "../adminOrders.config";

const OrderFilterPopover = ({
  isOpen,
  onClose,
  selectedStatus,
  onSelectStatus,
  onReset,
  resultsCount = 10,
  onApply,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Invisible backdrop */}
      <div className="fixed inset-0 z-20" onClick={onClose} />

      {/* Floating Popover matching Screen 2 */}
      <div className="absolute right-0 top-12 z-30 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 font-poppins animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h4 className="text-sm font-bold text-gray-900">Filters</h4>
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
          >
            Reset all
          </button>
        </div>

        {/* Status Section */}
        <div className="py-4">
          <label className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase block mb-3">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {ORDER_FILTER_OPTIONS.map((opt) => {
              const isSelected = selectedStatus === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSelectStatus(opt.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[#1E2A5E] text-white shadow-xs"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              onApply?.();
              onClose();
            }}
            className="w-full py-2.5 bg-[#0B1736] hover:bg-[#162046] text-white rounded-xl font-semibold text-xs transition-colors shadow-sm"
          >
            Show {resultsCount} Results
          </button>
        </div>
      </div>
    </>
  );
};

export default OrderFilterPopover;
