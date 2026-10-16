import React, { useEffect, useRef, useState } from "react";
import { Filter } from "lucide-react";
import { defaultsFor } from "./filters";

/**
 * "Filter" button that opens a panel of chip groups. Selections are a draft
 * until "Show N Results" applies them; closing the panel discards the draft.
 *
 * - groups: [{ id, label, options: [{ value, label }] }] — first option is the default
 * - value: applied selection, e.g. { status: "all", minOrders: "any" }
 * - onApply(selection)
 * - onDraftChange(selection | null): lets the parent fetch a live count (null = panel closed)
 * - resultCount / isCounting: the count to show on the apply button
 */
const FilterPanel = ({ groups, value, onApply, onDraftChange, resultCount, isCounting }) => {
  const [draft, setDraft] = useState(null); // null = closed
  const wrapperRef = useRef(null);
  const defaults = defaultsFor(groups);
  const isOpen = draft !== null;
  const activeCount = groups.filter((g) => value[g.id] !== defaults[g.id]).length;
  const draftIsDefault = isOpen && groups.every((g) => draft[g.id] === defaults[g.id]);

  const updateDraft = (next) => {
    setDraft(next);
    onDraftChange?.(next);
  };

  const close = () => updateDraft(null);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e) => {
      if (!wrapperRef.current?.contains(e.target)) close();
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close is stable in behaviour
  }, [isOpen]);

  const apply = () => {
    onApply(draft);
    close();
  };

  const countLabel =
    resultCount == null ? "Show Results" : `Show ${resultCount.toLocaleString()} Result${resultCount === 1 ? "" : "s"}`;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? close() : updateDraft({ ...value }))}
        className={`relative inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
          activeCount ? "border-[#EB4827] text-[#EB4827]" : "border-[#343C6A] text-[#343C6A] hover:bg-gray-50"
        }`}
      >
        <Filter size={15} />
        Filter
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EB4827] px-1 text-[11px] text-white tabular-nums">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Filters"
          className="absolute right-0 z-30 mt-2 w-[min(19rem,calc(100vw-2rem))] rounded-xl border border-gray-200 bg-white p-4 shadow-lg motion-safe:animate-fade-in-up"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <p className="text-sm font-semibold text-[#343C6A]">Filters</p>
            <button
              type="button"
              onClick={() => updateDraft({ ...defaults })}
              disabled={draftIsDefault}
              className="text-sm font-medium text-red-500 hover:underline disabled:cursor-default disabled:text-gray-300 disabled:no-underline"
            >
              Reset all
            </button>
          </div>

          {groups.map((group) => (
            <fieldset key={group.id} className="mt-4">
              <legend className="mb-2 text-xs text-gray-400">{group.label}</legend>
              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => {
                  const selected = draft[group.id] === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => updateDraft({ ...draft, [group.id]: option.value })}
                      className={`rounded-full border px-3.5 py-1 text-xs font-medium transition-colors ${
                        selected
                          ? "border-[#343C6A] bg-[#343C6A] text-white"
                          : "border-gray-200 text-[#343C6A] hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <button
            type="button"
            onClick={apply}
            disabled={resultCount === 0}
            className="mt-5 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className={isCounting ? "opacity-70" : ""}>{resultCount === 0 ? "No Results" : countLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
