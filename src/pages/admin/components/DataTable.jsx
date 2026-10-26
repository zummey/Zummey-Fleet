import React from "react";

/**
 * Plain admin table with a loading skeleton.
 *
 * - columns: [{ key, label, render?(row), className?, srOnlyLabel? }]
 *   `render` defaults to row[key]; `srOnlyLabel` hides the header text visually (e.g. "Actions")
 * - rows, rowKey(row) (defaults to row.id)
 * - isLoading: show `skeletonRows` placeholder rows
 * - isDimmed: fade while the next page / filter loads
 */
const DataTable = ({
  columns,
  rows,
  rowKey = (row) => row.id,
  isLoading = false,
  isDimmed = false,
  skeletonRows = 5,
  minWidth = "min-w-[720px]",
  cellClassName = "py-4",
}) => (
  <div className="no-scrollbar overflow-x-auto">
    <table className={`w-full text-left text-sm transition-opacity ${minWidth} ${isDimmed ? "opacity-60" : ""}`}>
      <thead>
        <tr className="border-b border-gray-100 text-[#343C6A]">
          {columns.map((col) => (
            <th key={col.key} className="relative py-3 pr-4 font-medium whitespace-nowrap">
              {col.srOnlyLabel ? <span className="sr-only">{col.label}</span> : col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {isLoading
          ? Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {columns.map((col) => (
                  <td key={col.key} className={`${cellClassName} pr-4`}>
                    <div className="h-4 w-20 rounded bg-gray-200"></div>
                  </td>
                ))}
              </tr>
            ))
          : rows.map((row) => (
              <tr key={rowKey(row)} className="text-[#343C6A] hover:bg-gray-50/60">
                {columns.map((col) => (
                  <td key={col.key} className={`${cellClassName} pr-4 whitespace-nowrap ${col.className ?? ""}`}>
                    {col.render ? col.render(row) : (row[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
      </tbody>
    </table>
  </div>
);

export default DataTable;
