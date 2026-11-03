import React, { useRef } from "react";

/**
 * Small grey "segmented control" tabs (WAI-ARIA tabs pattern), e.g. Suggested riders / Suggested fleets.
 * tabs: [{ id, label }]. idPrefix: tab ids are `${idPrefix}-tab-${id}`; the panel should use `${idPrefix}-panel`.
 */
const SegmentedTabs = ({ tabs, activeTab, onChange, label, idPrefix = "segmented", size = "md" }) => {
  const tabRefs = useRef({});

  const handleKeyDown = (e, index) => {
    let next;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else return;
    e.preventDefault();
    onChange(tabs[next].id);
    tabRefs.current[tabs[next].id]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-lg bg-gray-100 p-1">
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[tab.id] = el)}
            id={`${idPrefix}-tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`rounded-md whitespace-nowrap text-[#343C6A] transition-colors focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none ${
              size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm"
            } ${isActive ? "bg-white font-medium shadow-sm" : "text-gray-500 hover:text-[#343C6A]"}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedTabs;
