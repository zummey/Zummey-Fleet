import React from "react";
import { Search } from "lucide-react";
import FilterPanel from "./FilterPanel";
import ExportPanel from "./ExportPanel";

/**
 * Title row for admin tables: heading (+ count), search box, Filter and Export.
 * Each control renders only when its props are passed, so any combination works.
 *
 * - search: { value, onChange(text), placeholder, label }
 * - filter: FilterPanel props
 * - exportPanel: ExportPanel props
 */
const TableToolbar = ({ title, count, search, filter, exportPanel, className = "mb-4" }) => (
  <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
    <h4 className="text-base font-semibold text-[#343C6A]">
      {title}
      {count != null && (
        <span className="ml-2 text-sm font-normal text-gray-400 tabular-nums">({count.toLocaleString()})</span>
      )}
    </h4>

    {(search || filter || exportPanel) && (
      <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
        {search && (
          <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
            <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder ?? "Search"}
              aria-label={search.label ?? search.placeholder ?? "Search"}
              className="w-full rounded-full bg-gray-50 py-2 pr-4 pl-9 text-sm placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#FFF4E8] focus:outline-none"
            />
          </div>
        )}
        {filter && <FilterPanel {...filter} />}
        {exportPanel && <ExportPanel {...exportPanel} />}
      </div>
    )}
  </div>
);

export default TableToolbar;
