import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Search, Users } from "lucide-react";
import AdminStatCard from "../../Dashboard/AdminStatCard";
import AdminStatsSkeleton from "../../Dashboard/AdminStatsSkeleton";
import { getTabById } from "../../Dashboard/adminDashboard.config";
import StatusBadge from "../../components/StatusBadge";
import RowActionsMenu from "../../components/RowActionsMenu";
import Pagination from "../../components/Pagination";
import ErrorBox from "../../components/ErrorBox";
import FilterPanel from "../../components/FilterPanel";
import { defaultsFor, filtersFromParams, filtersToParams } from "../../components/filters";
import ExportPanel from "../../components/ExportPanel";
import { exportRows } from "../../components/exporters";
import { formatLongDate } from "../../components/formatters";
import { useDebouncedValue } from "../../components/useDebouncedValue";
import {
  CUSTOMERS_PAGE_SIZE,
  CUSTOMERS_SUMMARY_TAB_ID,
  CUSTOMER_COLUMNS,
  CUSTOMER_EXPORT_COLUMNS,
  CUSTOMER_FILTER_GROUPS,
  CUSTOMER_QUERY_PARAMS as P,
  toCustomerQuery,
} from "./customers.config";
import { getCustomerRowActions } from "./details/customerDetails.config";
import { useCustomerActions } from "./useCustomerActions";
import { useAdminDashboardStats, useCustomerCount, useCustomers } from "../../../../api/admin.queries";
import { exportCustomers } from "../../../../api/admin.service";

const summaryTab = getTabById(CUSTOMERS_SUMMARY_TAB_ID);

const initials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Customers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get(P.page)) || 1);
  const search = searchParams.get(P.search) ?? "";
  const filters = filtersFromParams(CUSTOMER_FILTER_GROUPS, searchParams);
  const query = { search, ...toCustomerQuery(filters) };

  // Input updates instantly; the URL (and therefore the query) follows once typing pauses
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput);

  // Merge param changes into the URL. Changing search/filter always returns to page 1.
  const updateParams = (changes, { resetPage = true } = {}) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(changes).forEach(([key, value]) => {
          if (value === "" || value == null) next.delete(key);
          else next.set(key, String(value));
        });
        if (resetPage) next.delete(P.page);
        return next;
      },
      { replace: true }
    );
  };

  useEffect(() => {
    if (debouncedSearch.trim() !== search) updateParams({ [P.search]: debouncedSearch.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the debounced input
  }, [debouncedSearch]);

  const stats = useAdminDashboardStats();
  const { handleAction, dialog } = useCustomerActions();
  const customers = useCustomers({ page, pageSize: CUSTOMERS_PAGE_SIZE, ...query });

  // Live count for the filter panel's unapplied selection
  const [draftFilters, setDraftFilters] = useState(null);
  const draftCount = useCustomerCount(
    { search, ...toCustomerQuery(draftFilters ?? filters) },
    { enabled: draftFilters !== null }
  );

  const rows = customers.data?.results ?? [];

  // Export: "All Customers" ignores search/filters; "Current View" is exactly the rows on screen
  const [exportOpen, setExportOpen] = useState(false);
  const totalCount = useCustomerCount({ search: "", status: "all", minOrders: 0 }, { enabled: exportOpen });

  const exporter = useMutation({
    mutationKey: ["admin", "exportCustomers"],
    mutationFn: async ({ scope, format }) => {
      // TODO: for very large exports, prefer a backend export endpoint over fetching every row
      const exportData = scope === "all" ? await exportCustomers() : rows;
      await exportRows({
        format,
        rows: exportData,
        columns: CUSTOMER_EXPORT_COLUMNS,
        title: scope === "all" ? "All Customers" : "Customers (current view)",
        filename: `customers-${scope === "all" ? "all" : "current-view"}-${new Date().toISOString().slice(0, 10)}`,
      });
    },
  });

  const totalPages = customers.data?.totalPages ?? 1;
  const isFiltered = !!search || JSON.stringify(filters) !== JSON.stringify(defaultsFor(CUSTOMER_FILTER_GROUPS));

  return (
    <div className="mb-6 space-y-6 font-poppins">
      <h3 className="text-xl font-semibold text-[#343C6A]">Customers Management</h3>

      {/* Summary cards (shared with the admin dashboard "Customers" tab) */}
      {stats.isLoading ? (
        <AdminStatsSkeleton count={summaryTab.cards.length} gridClass="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {summaryTab.cards.map((card) => (
            <AdminStatCard key={card.key} card={card} stat={stats.data?.[CUSTOMERS_SUMMARY_TAB_ID]?.[card.key]} />
          ))}
        </div>
      )}

      <section className="rounded-2xl bg-white p-5 sm:p-6">
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-base font-semibold text-[#343C6A]">
            All Customers
            {customers.data && (
              <span className="ml-2 text-sm font-normal text-gray-400 tabular-nums">({customers.data.count.toLocaleString()})</span>
            )}
          </h4>

          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
              <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name, ID, phone or email"
                aria-label="Search customers"
                className="w-full rounded-full bg-gray-50 py-2 pr-4 pl-9 text-sm placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#FFF4E8] focus:outline-none"
              />
            </div>

            <FilterPanel
              groups={CUSTOMER_FILTER_GROUPS}
              value={filters}
              onApply={(selection) => updateParams(filtersToParams(CUSTOMER_FILTER_GROUPS, selection))}
              onDraftChange={setDraftFilters}
              resultCount={draftCount.data}
              isCounting={draftCount.isFetching}
            />

            <ExportPanel
              title="Export Customers"
              noun={{ one: "Customer", other: "Customers" }}
              onOpenChange={setExportOpen}
              onExport={exporter.mutateAsync}
              scopes={[
                {
                  id: "all",
                  label: "All Customers",
                  count: totalCount.data,
                  description: `${(totalCount.data ?? 0).toLocaleString()} Customers in total`,
                },
                {
                  id: "current",
                  label: "Current View",
                  count: customers.isLoading ? undefined : rows.length,
                  description: `${rows.length} Customer${rows.length === 1 ? "" : "s"} shown in this page`,
                },
              ]}
            />
          </div>
        </div>

        {customers.isError ? (
          <ErrorBox
            title="Error loading customers"
            error={customers.error}
            onRetry={customers.refetch}
            isRetrying={customers.isFetching}
          />
        ) : (
          <>
            <div className="no-scrollbar overflow-x-auto">
              <table
                className={`w-full min-w-[820px] text-left text-sm transition-opacity ${customers.isPlaceholderData ? "opacity-60" : ""}`}
              >
                <thead>
                  <tr className="border-b border-gray-100 text-[#343C6A]">
                    {CUSTOMER_COLUMNS.map((col) => (
                      <th key={col.key} className="py-3 pr-4 font-medium whitespace-nowrap">
                        {col.label}
                      </th>
                    ))}
                    <th className="relative py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 rounded-full bg-gray-200"></div>
                              <div className="space-y-1.5">
                                <div className="h-4 w-24 rounded bg-gray-200"></div>
                                <div className="h-3 w-16 rounded bg-gray-100"></div>
                              </div>
                            </div>
                          </td>
                          {CUSTOMER_COLUMNS.slice(1).map((col) => (
                            <td key={col.key} className="py-4 pr-4">
                              <div className="h-4 w-20 rounded bg-gray-200"></div>
                            </td>
                          ))}
                          <td className="py-4">
                            <div className="ml-auto h-8 w-8 rounded-lg bg-gray-200"></div>
                          </td>
                        </tr>
                      ))
                    : rows.map((customer) => (
                        <tr key={customer.id} className="text-[#343C6A] hover:bg-gray-50/60">
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFF4E8] text-xs font-semibold text-[#EB4827]">
                                {initials(customer.name)}
                              </span>
                              <div>
                                <p className="font-semibold whitespace-nowrap">{customer.name}</p>
                                <p className="text-xs text-gray-400">{customer.code}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 pr-4 font-medium whitespace-nowrap tabular-nums">{customer.phone}</td>
                          <td className="py-4 pr-4 font-medium whitespace-nowrap">{customer.email}</td>
                          <td className="py-4 pr-4">
                            <StatusBadge status={customer.status} />
                          </td>
                          <td className="py-4 pr-4 tabular-nums">{customer.totalOrders}</td>
                          <td className="py-4 pr-4 font-medium whitespace-nowrap">{formatLongDate(customer.dateJoined)}</td>
                          <td className="py-4 text-right">
                            <RowActionsMenu
                              label={`Actions for ${customer.name}`}
                              actions={getCustomerRowActions(customer)}
                              onSelect={(actionId) => handleAction(actionId, customer)}
                            />
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            {!customers.isLoading && rows.length === 0 && (
              <div className="flex flex-col items-center py-12 text-center">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <Users size={22} />
                </span>
                <p className="text-sm font-medium text-[#343C6A]">{isFiltered ? "No customers match" : "No customers yet"}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {isFiltered ? "Try a different search term or filter." : "Customers will appear here once they sign up."}
                </p>
                {isFiltered && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      updateParams({
                        [P.search]: "",
                        ...filtersToParams(CUSTOMER_FILTER_GROUPS, defaultsFor(CUSTOMER_FILTER_GROUPS)),
                      });
                    }}
                    className="mt-3 text-sm font-medium text-[#EB4827] hover:underline"
                  >
                    Clear search and filters
                  </button>
                )}
              </div>
            )}

            {rows.length > 0 && (
              <div className="mt-6">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={(next) => updateParams({ [P.page]: next }, { resetPage: false })}
                  disabled={customers.isFetching}
                />
              </div>
            )}
          </>
        )}
      </section>

      {dialog}
    </div>
  );
};

export default Customers;
