import React, { useRef } from "react";

/**
 * StatsTabs
 * Segmented, horizontally-scrollable tab bar for the admin stat categories.
 * Supports arrow-key / Home / End navigation (WAI-ARIA tabs pattern).
 */
const StatsTabs = ({ tabs, activeTab, onChange }) => {
  const tabRefs = useRef({});

  const handleKeyDown = (e, index) => {
    let next;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;

    e.preventDefault();
    const id = tabs[next].id;
    onChange(id);
    tabRefs.current[id]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Dashboard statistics"
      className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-1.5"
    >
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[tab.id] = el)}
            id={`admin-tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={`admin-panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`group flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none ${
              isActive
                ? "bg-orange-50 text-orange-600 shadow-sm ring-1 ring-orange-100"
                : "text-[#718EBF] hover:bg-gray-50 hover:text-[#343C6A]"
            }`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                isActive ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
              }`}
            >
              <Icon size={15} />
            </span>
            {tab.label}
            <span
              className={`rounded-full px-1.5 text-[11px] leading-5 tabular-nums ${
                isActive ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-400"
              }`}
            >
              {tab.cards.length}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default StatsTabs;
