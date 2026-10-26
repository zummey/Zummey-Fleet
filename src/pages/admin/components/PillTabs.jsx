import React, { useRef } from "react";

/**
 * Rounded "pill" tabs (WAI-ARIA tabs pattern), e.g. Finance: Overview / Transactions / ...
 * idPrefix: tab ids are `${idPrefix}-tab-${id}`; the panel should use `${idPrefix}-panel-${id}`.
 */
const PillTabs = ({ tabs, activeTab, onChange, label, idPrefix = "pill" }) => {
  const tabRefs = useRef({});

  const handleKeyDown = (e, index) => {
    let next;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;

    e.preventDefault();
    onChange(tabs[next].id);
    tabRefs.current[tabs[next].id]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
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
            aria-controls={`${idPrefix}-panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`shrink-0 rounded-full border px-5 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none ${
              isActive
                ? "border-[#343C6A] bg-[#343C6A] text-white"
                : "border-gray-200 bg-white text-[#343C6A] hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default PillTabs;
