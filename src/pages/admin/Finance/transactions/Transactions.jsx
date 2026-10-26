import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ReceiptText } from "lucide-react";
import TransactionsTable from "./TransactionsTable";
import TransactionDetailsModal from "./TransactionDetailsModal";
import TableToolbar from "../../components/TableToolbar";
import Pagination from "../../components/Pagination";
import ErrorBox from "../../components/ErrorBox";
import EmptyState from "../../components/EmptyState";
import { useTableParams } from "../../components/useTableParams";
import { exportRows } from "../../components/exporters";
import { FINANCE_PAGE_SIZE, TRANSACTION_EXPORT_COLUMNS, TRANSACTION_FILTER_GROUPS } from "../finance.config";
import { useTransactionCount, useTransactions } from "../../../../api/admin.queries";
import { exportTransactions } from "../../../../api/admin.service";

const NOUN = { one: "Transaction", other: "Transactions" };

const Transactions = () => {
  const table = useTableParams({ filterGroups: TRANSACTION_FILTER_GROUPS });
  const { page, search, filters } = table;
  const transactions = useTransactions({ page, pageSize: FINANCE_PAGE_SIZE, search, ...filters });
  const rows = transactions.data?.results ?? [];

  const [viewing, setViewing] = useState(null);

  // Live count for the filter panel's unapplied selection
  const [draftFilters, setDraftFilters] = useState(null);
  const draftCount = useTransactionCount({ search, ...(draftFilters ?? filters) }, { enabled: draftFilters !== null });

  // Export: "All Transactions" ignores search/filters; "Current View" is exactly the rows on screen
  const [exportOpen, setExportOpen] = useState(false);
  const totalCount = useTransactionCount({ search: "", type: "all", status: "any" }, { enabled: exportOpen });

  const exporter = useMutation({
    mutationKey: ["admin", "exportTransactions"],
    mutationFn: async ({ scope, format }) => {
      // TODO: for very large exports, prefer a backend export endpoint over fetching every row
      const data = scope === "all" ? await exportTransactions() : rows;
      await exportRows({
        format,
        rows: data,
        columns: TRANSACTION_EXPORT_COLUMNS,
        title: scope === "all" ? "All Transactions" : "Transactions (current view)",
        filename: `transactions-${scope === "all" ? "all" : "current-view"}-${new Date().toISOString().slice(0, 10)}`,
      });
    },
  });

  return (
    <section className="rounded-2xl bg-white p-5 sm:p-6">
      <TableToolbar
        title="Transaction History"
        count={transactions.data?.count}
        search={{
          value: table.searchInput,
          onChange: table.setSearchInput,
          placeholder: "Search ID, reference, name or method",
          label: "Search transactions",
        }}
        filter={{
          groups: TRANSACTION_FILTER_GROUPS,
          value: filters,
          onApply: table.applyFilters,
          onDraftChange: setDraftFilters,
          resultCount: draftCount.data,
          isCounting: draftCount.isFetching,
        }}
        exportPanel={{
          title: "Export Transactions",
          noun: NOUN,
          onOpenChange: setExportOpen,
          onExport: exporter.mutateAsync,
          scopes: [
            {
              id: "all",
              label: "All Transactions",
              count: totalCount.data,
              description: `${(totalCount.data ?? 0).toLocaleString()} Transactions in total`,
            },
            {
              id: "current",
              label: "Current View",
              count: transactions.isLoading ? undefined : rows.length,
              description: `${rows.length} Transaction${rows.length === 1 ? "" : "s"} shown in this page`,
            },
          ],
        }}
      />

      {transactions.isError ? (
        <ErrorBox
          title="Error loading transactions"
          error={transactions.error}
          onRetry={transactions.refetch}
          isRetrying={transactions.isFetching}
        />
      ) : (
        <>
          <TransactionsTable
            rows={rows}
            isLoading={transactions.isLoading}
            isDimmed={transactions.isPlaceholderData}
            onView={setViewing}
          />

          {!transactions.isLoading && rows.length === 0 && (
            <EmptyState
              icon={ReceiptText}
              title={table.isFiltered ? "No transactions match" : "No transactions yet"}
              description={
                table.isFiltered ? "Try a different search term or filter." : "Payments, payouts and refunds will appear here."
              }
              action={table.isFiltered ? { label: "Clear search and filters", onClick: table.clearAll } : undefined}
            />
          )}

          {rows.length > 0 && (
            <div className="mt-6">
              <Pagination
                page={page}
                totalPages={transactions.data?.totalPages ?? 1}
                onChange={table.setPage}
                disabled={transactions.isFetching}
              />
            </div>
          )}
        </>
      )}

      {viewing && <TransactionDetailsModal transaction={viewing} onClose={() => setViewing(null)} />}
    </section>
  );
};

export default Transactions;
