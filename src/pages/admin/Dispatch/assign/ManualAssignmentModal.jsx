import React, { useId, useState } from "react";
import { Search, X } from "lucide-react";
import Modal from "../../components/Modal";
import SegmentedTabs from "../../components/SegmentedTabs";
import CandidateOption from "./CandidateOption";
import { useDebouncedValue } from "../../components/useDebouncedValue";
import { ASSIGN_TABS, MANUAL_REASONS, NOTE_REQUIRED_REASONS, getAssignTab } from "../dispatch.config";
import { useDispatchCandidates } from "../../../../api/admin.queries";

const MANUAL_TABS = ASSIGN_TABS.map((t) => ({ id: t.id, label: t.manualLabel }));

/**
 * "Manual assignment" popup: pick anyone free (rider or fleet) and say why.
 * - initialSelection: the candidate already picked on the page, if any
 * - onConfirm({ kind, candidate, reason, note })
 */
const ManualAssignmentModal = ({ orderId, initialSelection, isPending, error, onConfirm, onClose }) => {
  const [kind, setKind] = useState(initialSelection?.kind ?? ASSIGN_TABS[0].id);
  const [selected, setSelected] = useState(initialSelection ?? null);
  const [searchInput, setSearchInput] = useState("");
  const [reason, setReason] = useState(null);
  const [note, setNote] = useState("");
  const search = useDebouncedValue(searchInput.trim());

  const titleId = useId();
  const descId = useId();
  const groupName = useId();
  const reasonsLabelId = useId();
  const noteId = useId();

  const candidates = useDispatchCandidates(orderId, { kind, search });
  const results = candidates.data ?? [];

  const noteRequired = NOTE_REQUIRED_REASONS.includes(reason);
  const canConfirm = !!selected && !!reason && (!noteRequired || note.trim()) && !isPending;

  const changeKind = (next) => {
    if (next === kind) return;
    setKind(next);
    setSelected(null); // the other list has different people
    setSearchInput("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canConfirm) onConfirm({ kind, candidate: selected, reason, note: note.trim() });
  };

  const noun = getAssignTab(kind).noun;

  return (
    <Modal onClose={onClose} canClose={!isPending} labelledBy={titleId} describedBy={descId} className="max-w-md">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-base font-semibold text-[#343C6A]">
            Manual assignment
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Close"
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>
        <p id={descId} className="mt-1 text-xs text-gray-500">
          Choose anyone who is free for {orderId}. This is saved in the order history with your name.
        </p>

        <div className="mt-4">
          <SegmentedTabs
            tabs={MANUAL_TABS}
            activeTab={kind}
            onChange={changeKind}
            label="Assign to"
            idPrefix="manual-assign"
            size="sm"
          />
        </div>

        <div id="manual-assign-panel" role="tabpanel" aria-labelledby={`manual-assign-tab-${kind}`}>
          <div className="relative mt-3">
            <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search riders or fleets"
              aria-label={`Search ${noun}s`}
              className="w-full rounded-lg border border-gray-200 py-2 pr-3 pl-8 text-sm text-[#343C6A] placeholder-gray-400 focus:border-[#EB4827]/60 focus:ring-2 focus:ring-[#FFF4E8] focus:outline-none"
            />
          </div>

          <fieldset className="mt-3" disabled={isPending}>
            <legend className="sr-only">Choose a {noun}</legend>
            <div
              className={`max-h-[200px] space-y-2 overflow-y-auto pr-1 transition-opacity ${
                candidates.isPlaceholderData ? "opacity-60" : ""
              }`}
            >
              {candidates.isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-[54px] animate-pulse rounded-xl bg-gray-100" />
                ))
              ) : candidates.isError ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                  Couldn’t load {noun}s.{" "}
                  <button type="button" onClick={() => candidates.refetch()} className="font-medium underline">
                    Retry
                  </button>
                </p>
              ) : results.length === 0 ? (
                <p className="py-6 text-center text-xs text-gray-400">
                  {search ? `No free ${noun}s match “${search}”.` : `No ${noun}s are free right now.`}
                </p>
              ) : (
                results.map((candidate) => (
                  <CandidateOption
                    key={candidate.id}
                    candidate={candidate}
                    name={groupName}
                    selected={selected?.id === candidate.id}
                    onSelect={setSelected}
                    compact
                  />
                ))
              )}
            </div>
          </fieldset>
        </div>

        <fieldset className="mt-4" disabled={isPending}>
          <legend id={reasonsLabelId} className="mb-2 text-xs text-gray-500">
            Why are you assigning manually?
          </legend>
          <div className="flex flex-wrap gap-2">
            {MANUAL_REASONS.map((option) => {
              const active = option.value === reason;
              return (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-orange-300 ${
                    active
                      ? "border-[#0B1437] bg-[#0B1437] text-white"
                      : "border-gray-300 text-[#343C6A] hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={reasonsLabelId}
                    value={option.value}
                    checked={active}
                    onChange={() => setReason(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        {noteRequired && (
          <div className="mt-3">
            <label htmlFor={noteId} className="mb-1 block text-xs text-gray-500">
              Tell us more<span className="text-red-500"> *</span>
            </label>
            <textarea
              id={noteId}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isPending}
              placeholder="e.g. Customer asked for a rider they know"
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#343C6A] placeholder-gray-400 focus:border-[#EB4827]/60 focus:ring-2 focus:ring-[#FFF4E8] focus:outline-none"
            />
          </div>
        )}

        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            {error?.response?.data?.responseMessage || error?.message || "Something went wrong"}
          </p>
        )}

        <div className="mt-4 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-[#343C6A] hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canConfirm}
            className="rounded-lg bg-[#0B1437] px-4 py-2 text-sm font-medium text-white hover:bg-[#1c2657] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isPending ? "Assigning..." : "Use this assignment"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ManualAssignmentModal;
