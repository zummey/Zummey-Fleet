import React, { useState } from "react";
import { Search } from "lucide-react";
import ErrorBox from "../components/ErrorBox";

/**
 * Card-row table with a client-side search box, shared by the
 * Fleet Riders and Fleet Vehicles tabs.
 *
 * - query: TanStack query result whose `data` is an array
 * - searchKeys: row fields the search box matches against
 * - renderRow: (row) => array of cell nodes, one per column
 */
const SearchableTable = ({ title, columns, query, searchKeys, renderRow, getRowKey, emptyText, minWidth = "min-w-[640px]" }) => {
  const [search, setSearch] = useState("");
  const term = search.trim().toLowerCase();

  const rows = (query.data ?? []).filter(
    (row) => !term || searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(term))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-base font-semibold text-[#343C6A]">{title}</h4>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for something"
            aria-label={`Search ${title}`}
            className="w-full rounded-full bg-gray-50 py-2 pr-4 pl-9 text-sm placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#FFF4E8] focus:outline-none"
          />
        </div>
      </div>

      {query.isError ? (
        <ErrorBox title={`Error loading ${title.toLowerCase()}`} error={query.error} onRetry={query.refetch} isRetrying={query.isFetching} />
      ) : (
        <div className="no-scrollbar overflow-x-auto">
          <table className={`w-full border-separate border-spacing-y-2 text-left text-sm ${minWidth}`}>
            <thead>
              <tr className="text-[#343C6A]">
                {columns.map((col) => (
                  <th key={col} className="px-4 py-2 font-medium whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {query.isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {columns.map((col) => (
                        <td key={col} className="bg-white px-4 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] first:rounded-l-xl last:rounded-r-xl">
                          <div className="h-4 w-20 rounded bg-gray-200"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                : rows.map((row) => (
                    <tr key={getRowKey(row)} className="group text-[#343C6A]">
                      {renderRow(row).map((cell, i) => (
                        <td
                          key={i}
                          className="bg-white px-4 py-3.5 whitespace-nowrap shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-colors group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>

          {!query.isLoading && rows.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">{term ? `No results for "${search}".` : emptyText}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableTable;
