import React from "react";
import { ACTION_BUTTON_STYLES } from "../finance.config";

/**
 * Row action buttons for payouts / refunds (e.g. "Approve Payout" + "Hold Payout").
 * When the row has no actions left, shows `doneText` (e.g. "Paid Oct 21") instead.
 *
 * - actionIds: which actions to show, in order
 * - actions: { [id]: { label, style } } (style is a key of ACTION_BUTTON_STYLES)
 */
const InlineActions = ({ actionIds, actions, onSelect, doneText, label }) => {
  if (!actionIds.length) return <span className="text-sm text-[#718EBF]">{doneText}</span>;

  return (
    <div role="group" aria-label={label} className="flex items-center justify-end gap-2">
      {actionIds.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${ACTION_BUTTON_STYLES[actions[id].style]}`}
        >
          {actions[id].label}
        </button>
      ))}
    </div>
  );
};

export default InlineActions;
