import React from "react";
import Avatar from "../../components/Avatar";
import { candidateSubtitle } from "../dispatch.config";

/**
 * One rider/fleet as a radio card. Cards sharing a `name` form a native radio group,
 * so arrow keys move between them.
 * compact: smaller card used in the manual-assignment popup (rating instead of distance).
 */
const CandidateOption = ({ candidate, name, selected, onSelect, compact = false, disabled = false }) => (
  <label
    className={`flex cursor-pointer items-center gap-3 rounded-xl border transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-orange-300 ${
      compact ? "px-3 py-2.5" : "px-4 py-3.5"
    } ${selected ? "border-[#EB4827]/60 bg-[#FFF4E8]" : "border-gray-200 bg-white hover:bg-gray-50"} ${
      disabled ? "cursor-not-allowed opacity-60" : ""
    }`}
  >
    <input
      type="radio"
      name={name}
      value={candidate.id}
      checked={selected}
      disabled={disabled}
      onChange={() => onSelect(candidate)}
      className="sr-only"
    />
    <span
      aria-hidden="true"
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
        selected ? "border-[#EB4827]" : "border-gray-300"
      }`}
    >
      {selected && <span className="h-2 w-2 rounded-full bg-[#EB4827]" />}
    </span>

    <Avatar name={candidate.name} size={compact ? "h-8 w-8" : "h-10 w-10"} colorful />

    <span className="min-w-0 flex-1">
      <span className={`block truncate font-medium text-[#343C6A] ${compact ? "text-xs" : "text-sm"}`}>
        {candidate.name}
      </span>
      <span className="block truncate text-xs text-gray-400">{candidateSubtitle(candidate, { compact })}</span>
    </span>

    {compact ? (
      <span className="shrink-0 text-xs text-gray-500 tabular-nums">{candidate.etaMinutes} min</span>
    ) : (
      <span className="shrink-0 text-right">
        <span className="block text-base font-semibold text-[#343C6A] tabular-nums">{candidate.etaMinutes} min</span>
        <span className="block text-[11px] text-gray-400">est. completion</span>
      </span>
    )}
  </label>
);

export default CandidateOption;
