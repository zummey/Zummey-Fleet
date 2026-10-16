import React, { useRef } from "react";

/**
 * Underline-style tabs for admin details pages (WAI-ARIA tabs pattern).
 * idPrefix: tab ids are `${idPrefix}-tab-${id}`; the panel should use `${idPrefix}-panel-${id}`.
 */
const DetailTabs = ({ tabs, activeTab, onChange, label = "Details", idPrefix = "detail" }) => {
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
    <div role="tablist" aria-label={label} className="no-scrollbar flex gap-8 overflow-x-auto">
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
            className={`relative shrink-0 pb-2 text-sm whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 ${
              isActive ? "font-medium text-[#343C6A]" : "text-gray-500 hover:text-[#343C6A]"
            }`}
          >
            {tab.label}
            <span
              className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#EB4827] transition-transform duration-200 ${
                isActive ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default DetailTabs;
