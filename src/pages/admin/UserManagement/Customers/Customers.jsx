import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Users } from "lucide-react";
import AdminStatCard from "../../Dashboard/AdminStatCard";
import AdminStatsSkeleton from "../../Dashboard/AdminStatsSkeleton";
import { getTabById } from "../../Dashboard/adminDashboard.config";
import StatusBadge from "../../components/StatusBadge";
import RowActionsMenu from "../../components/RowActionsMenu";
import Pagination from "../../components/Pagination";
import ErrorBox from "../../components/ErrorBox";
import TableToolbar from "../../components/TableToolbar";
import EmptyState from "../../components/EmptyState";
import Avatar from "../../components/Avatar";
import { useTableParams } from "../../components/useTableParams";
import { exportRows } from "../../components/exporters";
import { formatLongDate } from "../../components/formatters";
import {
  CUSTOMERS_PAGE_SIZE,
  CUSTOMERS_SUMMARY_TAB_ID,
  CUSTOMER_COLUMNS,
  CUSTOMER_EXPORT_COLUMNS,
  CUSTOMER_FILTER_GROUPS,
  CUSTOMER_QUERY_PARAMS,
  toCustomerQuery,
} from "./customers.config";
import { getCustomerRowActions } from "./details/customerDetails.config";
import { useCustomerActions } from "./useCustomerActions";
import { useAdminDashboardStats, useCustomerCount, useCustomers } from "../../../../api/admin.queries";
import { exportCustomers } from "../../../../api/admin.service";

const summaryTab = getTabById(CUSTOMERS_SUMMARY_TAB_ID);

const Customers = () => {
  const table = useTableParams({ filterGroups: CUSTOMER_FILTER_GROUPS, keys: CUSTOMER_QUERY_PARAMS });
  const { page, search, filters } = table;
  const query = { search, ...toCustomerQuery(filters) };

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
        <TableToolbar
          title="All Customers"
          count={customers.data?.count}
          search={{
            value: table.searchInput,
            onChange: table.setSearchInput,
            placeholder: "Search name, ID, phone or email",
            label: "Search customers",
          }}
          filter={{
            groups: CUSTOMER_FILTER_GROUPS,
            value: filters,
            onApply: table.applyFilters,
            onDraftChange: setDraftFilters,
            resultCount: draftCount.data,
            isCounting: draftCount.isFetching,
          }}
          exportPanel={{
            title: "Export Customers",
            noun: { one: "Customer", other: "Customers" },
            onOpenChange: setExportOpen,
            onExport: exporter.mutateAsync,
            scopes: [
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
            ],
          }}
        />

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
                              <Avatar name={customer.name} size="h-11 w-11" />
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
              <EmptyState
                icon={Users}
                title={table.isFiltered ? "No customers match" : "No customers yet"}
                description={
                  table.isFiltered ? "Try a different search term or filter." : "Customers will appear here once they sign up."
                }
                action={table.isFiltered ? { label: "Clear search and filters", onClick: table.clearAll } : undefined}
              />
            )}

            {rows.length > 0 && (
              <div className="mt-6">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={table.setPage}
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
