import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import StatusBadge from "../../../components/StatusBadge";
import Pagination from "../../../components/Pagination";
import ErrorBox from "../../../components/ErrorBox";
import ExportPanel from "../../../components/ExportPanel";
import { exportRows } from "../../../components/exporters";
import { formatShortDate } from "../../../components/formatters";
import { useDebouncedValue } from "../../../components/useDebouncedValue";
import { HISTORY_PAGE_SIZE, formatCell } from "./customerDetails.config";
import { useCustomerHistory } from "../../../../../api/admin.queries";
import { exportCustomerHistory } from "../../../../../api/admin.service";

const renderCell = (column, row) => {
  const value = row[column.key];
  switch (column.type) {
    case "status":
      return <StatusBadge status={value} />;
    case "id":
      return <span className="font-semibold">{value}</span>;
    case "money":
    case "date":
      return <span className="font-medium tabular-nums">{formatCell[column.type](value)}</span>;
    default:
      return <span className="font-medium text-[#343C6A]">{value ?? "—"}</span>;
  }
};

const TableBody = ({ tab, rows, isLoading }) => (
  <div className="no-scrollbar overflow-x-auto">
    <table className="w-full min-w-[680px] text-left text-sm">
      <thead>
        <tr className="border-b border-gray-100 text-[#343C6A]">
          {tab.columns.map((col) => (
            <th key={col.key} className="py-3 pr-4 font-medium whitespace-nowrap">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {tab.columns.map((col) => (
                  <td key={col.key} className="py-5 pr-4">
                    <div className="h-4 w-20 rounded bg-gray-200"></div>
                  </td>
                ))}
              </tr>
            ))
          : rows.map((row) => (
              <tr key={row.id} className="text-[#343C6A] hover:bg-gray-50/60">
                {tab.columns.map((col) => (
                  <td key={col.key} className="py-5 pr-4 whitespace-nowrap">
                    {renderCell(col, row)}
                  </td>
                ))}
              </tr>
            ))}
      </tbody>
    </table>
  </div>
);

const CardsBody = ({ rows, isLoading }) => (
  <div className="space-y-4">
    {isLoading
      ? Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-gray-200 p-4">
            <div className="h-4 w-32 rounded bg-gray-200"></div>
            <div className="mt-2 h-3 w-64 rounded bg-gray-100"></div>
            <div className="mt-2 h-3 w-24 rounded bg-gray-100"></div>
          </div>
        ))
      : rows.map((row) => (
          <article key={row.id} className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 p-4">
            <div className="min-w-0">
              <h5 className="text-sm font-semibold text-[#343C6A]">{row.title}</h5>
              <p className="mt-1 text-xs text-gray-500">{row.description}</p>
              <p className="mt-1 text-xs text-gray-400">
                {row.id} · {formatShortDate(row.date)}
                {row.orderId && ` · Order ${row.orderId}`}
              </p>
            </div>
            <StatusBadge status={row.status} />
          </article>
        ))}
  </div>
);

/**
 * One history tab (orders / complaints / payments): title, search, export,
 * table or card list, and pagination. Search + page are local to the tab.
 */
const HistoryPanel = ({ customerId, tab }) => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput).trim();

  useEffect(() => setPage(1), [search]);

  const history = useCustomerHistory(customerId, tab.kind, { page, pageSize: HISTORY_PAGE_SIZE, search });
  const rows = history.data?.results ?? [];
  const total = history.data?.total;

  const handleExport = async ({ scope, format }) => {
    const data = scope === "all" ? await exportCustomerHistory(customerId, tab.kind) : rows;
    await exportRows({
      format,
      rows: data,
      columns: tab.exportColumns,
      title: tab.label,
      filename: `customer-${customerId}-${tab.kind}-${scope === "all" ? "all" : "current-view"}`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-base font-semibold text-[#343C6A]">
          {tab.label}
          {total != null && <span className="ml-2 text-sm font-normal text-gray-400 tabular-nums">({total})</span>}
        </h4>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
            <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={tab.searchPlaceholder}
              aria-label={`Search ${tab.label}`}
              className="w-full rounded-full bg-gray-50 py-2 pr-4 pl-9 text-sm placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#FFF4E8] focus:outline-none"
            />
          </div>
          <ExportPanel
            title={`Export ${tab.noun.other}`}
            noun={tab.noun}
            onExport={handleExport}
            scopes={[
              {
                id: "all",
                label: `All ${tab.noun.other}`,
                count: total,
                description: `${total ?? 0} ${total === 1 ? tab.noun.one : tab.noun.other} in total`,
              },
              {
                id: "current",
                label: "Current View",
                count: history.isLoading ? undefined : rows.length,
                description: `${rows.length} ${rows.length === 1 ? tab.noun.one : tab.noun.other} shown in this page`,
              },
            ]}
          />
        </div>
      </div>

      {history.isError ? (
        <ErrorBox
          title={`Error loading ${tab.label.toLowerCase()}`}
          error={history.error}
          onRetry={history.refetch}
          isRetrying={history.isFetching}
        />
      ) : (
        <div className={`transition-opacity ${history.isPlaceholderData ? "opacity-60" : ""}`}>
          {tab.layout === "cards" ? (
            <CardsBody rows={rows} isLoading={history.isLoading} />
          ) : (
            <TableBody tab={tab} rows={rows} isLoading={history.isLoading} />
          )}

          {!history.isLoading && rows.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">
              {search ? `No ${tab.noun.other.toLowerCase()} match "${search}".` : tab.emptyText}
            </p>
          )}

          {history.data?.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                page={page}
                totalPages={history.data.totalPages}
                onChange={setPage}
                disabled={history.isFetching}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
