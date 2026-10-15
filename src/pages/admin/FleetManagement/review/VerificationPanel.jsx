import React from "react";
import { Check } from "lucide-react";
import { REVIEW_CHECKLIST, REVIEW_DECISIONS } from "../adminFleet.config";

const logoInitials = (name = "") =>
  name
    .split(" ")
    .filter((w) => /^[A-Za-z]/.test(w))
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const DetailRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 border-t border-gray-100 py-4">
    <span className="text-xs text-gray-400">{label}</span>
    <span className="text-right text-sm font-medium text-[#343C6A]">{value ?? "—"}</span>
  </div>
);

const VerificationPanel = ({ fleet, checklist, onToggleCheck, onDecision, disabled }) => {
  const allChecked = REVIEW_CHECKLIST.every((item) => checklist[item.id]);
  const checkedCount = REVIEW_CHECKLIST.filter((item) => checklist[item.id]).length;

  return (
    <section className="flex flex-col rounded-2xl bg-white p-5">
      <h4 className="mb-4 text-base font-semibold text-[#343C6A]">Verification Details</h4>

      {/* Company logo */}
      <div className="flex items-center gap-4 pb-4">
        {fleet.logo?.url ? (
          <img src={fleet.logo.url} alt={`${fleet.companyName} logo`} className="h-14 w-16 rounded-md object-cover" />
        ) : (
          <span className="flex h-14 w-16 items-center justify-center rounded-md bg-blue-300 text-lg font-bold text-blue-700">
            {logoInitials(fleet.companyName)}
          </span>
        )}
        <div>
          <p className="text-sm font-medium text-[#343C6A]">Company Logo</p>
          <p className="text-xs text-gray-400">{fleet.logo?.name ?? "Not uploaded"}</p>
        </div>
      </div>

      <DetailRow label="Registration Number" value={fleet.cac?.registrationNumber} />
      <DetailRow label="Business Address" value={fleet.businessAddress} />

      {/* Checklist */}
      <fieldset className="mt-2">
        <legend className="flex w-full items-center justify-between text-base font-semibold text-[#343C6A]">
          Review Checklist
          <span className="text-xs font-normal text-gray-400 tabular-nums">
            {checkedCount}/{REVIEW_CHECKLIST.length}
          </span>
        </legend>
        <div className="mt-3 space-y-2.5">
          {REVIEW_CHECKLIST.map((item) => {
            const checked = !!checklist[item.id];
            return (
              <label key={item.id} className="group relative flex cursor-pointer items-center gap-2.5 text-sm text-[#343C6A]">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleCheck(item.id)}
                  disabled={disabled}
                  className="peer sr-only"
                />
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-orange-300 ${
                    checked ? "border-green-500 bg-green-500 text-white" : "border-gray-300 bg-white group-hover:border-gray-400"
                  }`}
                >
                  {checked && <Check size={12} strokeWidth={3} />}
                </span>
                <span className={checked ? "text-gray-500 line-through decoration-gray-300" : ""}>{item.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Decisions */}
      <div className="mt-auto pt-6">
        <div className="flex flex-wrap gap-3">
          {REVIEW_DECISIONS.map((decision) => {
            const blocked = decision.requiresChecklist && !allChecked;
            return (
              <button
                key={decision.id}
                type="button"
                onClick={() => onDecision(decision)}
                disabled={disabled || blocked}
                title={blocked ? "Tick every checklist item to approve" : undefined}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed ${decision.buttonClass}`}
              >
                {decision.label}
              </button>
            );
          })}
        </div>
        {!allChecked && !disabled && (
          <p className="mt-3 text-xs text-gray-400">Complete the checklist to enable approval.</p>
        )}
      </div>
    </section>
  );
};

export default VerificationPanel;
