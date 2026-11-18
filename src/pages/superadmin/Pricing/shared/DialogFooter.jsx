import React from "react";

/** Cancel + submit row used at the bottom of the pricing form dialogs. */
const DialogFooter = ({ onCancel, isPending, submitLabel, pendingLabel, disabled = false }) => (
  <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
    <button
      type="button"
      onClick={onCancel}
      disabled={isPending}
      className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-[#343C6A] hover:bg-gray-50 disabled:opacity-50"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={isPending || disabled}
      className="rounded-lg bg-[#343C6A] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a3058] focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? pendingLabel : submitLabel}
    </button>
  </div>
);

export default DialogFooter;
