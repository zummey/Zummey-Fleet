import React from "react";
import { candidateAffiliation, expectedBy, getAssignTab } from "../dispatch.config";

/** Right-hand card on the assign page: selected rider/fleet, ETA and the two assignment buttons. */
const AssignmentSummary = ({ selection, isPending, error, onConfirm, onManual }) => (
  <section aria-labelledby="assignment-summary-title" className="rounded-2xl bg-white p-5">
    <h2 id="assignment-summary-title" className="text-sm font-semibold text-[#343C6A]">
      Assignment summary
    </h2>

    <div aria-live="polite">
      {selection ? (
        <>
          <p className="mt-4 text-xs text-gray-400 capitalize">{getAssignTab(selection.kind).noun}</p>
          <p className="text-sm font-semibold text-[#343C6A]">{selection.name}</p>
          <p className="text-xs text-gray-400">{candidateAffiliation(selection)}</p>

          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
            <p className="text-xs text-gray-500">Estimated completion time</p>
            <p className="mt-1 text-2xl font-semibold text-[#1F3A8A] tabular-nums">{selection.etaMinutes} min</p>
            <p className="mt-1 text-xs text-gray-500">Expected delivery by {expectedBy(selection.etaMinutes)}</p>
          </div>
        </>
      ) : (
        <p className="mt-4 rounded-xl border border-gray-200 px-6 py-5 text-center text-xs text-gray-400">
          Pick a suggested rider or fleet to see the estimated completion time.
        </p>
      )}
    </div>

    {error && (
      <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
        {error?.response?.data?.responseMessage || error?.message || "Something went wrong"}
      </p>
    )}

    <div className="mt-4 space-y-3">
      <button
        type="button"
        onClick={onConfirm}
        disabled={!selection || isPending}
        className="w-full rounded-lg bg-[#0B1437] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1c2657] focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isPending ? "Assigning..." : "Confirm Assignment"}
      </button>
      <button
        type="button"
        onClick={onManual}
        disabled={isPending}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-[#343C6A] hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none disabled:opacity-50"
      >
        Manual Assignment
      </button>
    </div>
  </section>
);

export default AssignmentSummary;
