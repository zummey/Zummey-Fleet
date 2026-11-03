import React from "react";
import RevenueChart from "./RevenueChart";
import TransactionsTable from "../transactions/TransactionsTable";
import AdminStatCard from "../../Dashboard/AdminStatCard";
import AdminStatsSkeleton from "../../Dashboard/AdminStatsSkeleton";
import ErrorBox from "../../components/ErrorBox";
import { OVERVIEW_CARDS, RECENT_TRANSACTIONS_COUNT } from "../finance.config";
import { useFinanceOverview, useTransactions } from "../../../../api/admin.queries";

const GRID = "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";

const FinanceOverview = ({ onViewAllTransactions }) => {
  const overview = useFinanceOverview();
  const recent = useTransactions({ page: 1, pageSize: RECENT_TRANSACTIONS_COUNT, search: "", type: "all", status: "any" });

  return (
    <div className="space-y-6">
      {overview.isLoading ? (
        <AdminStatsSkeleton count={OVERVIEW_CARDS.length} gridClass={GRID} />
      ) : overview.isError ? (
        <ErrorBox
          title="Error loading finance summary"
          error={overview.error}
          onRetry={overview.refetch}
          isRetrying={overview.isFetching}
        />
      ) : (
        <div className={`grid gap-5 ${GRID}`}>
          {OVERVIEW_CARDS.map((card) => (
            <AdminStatCard key={card.key} card={card} stat={overview.data?.[card.key]} />
          ))}
        </div>
      )}

      <RevenueChart />

      <section className="rounded-2xl bg-white p-5 sm:p-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h4 className="text-base font-semibold text-[#343C6A]">Transaction History</h4>
          <button
            type="button"
            onClick={onViewAllTransactions}
            className="text-xs font-medium text-[#718EBF] hover:text-[#EB4827] hover:underline"
          >
            View all Transactions
          </button>
        </div>

        {recent.isError ? (
          <ErrorBox
            title="Error loading transactions"
            error={recent.error}
            onRetry={recent.refetch}
            isRetrying={recent.isFetching}
          />
        ) : (
          <TransactionsTable
            rows={recent.data?.results ?? []}
            isLoading={recent.isLoading}
            skeletonRows={RECENT_TRANSACTIONS_COUNT}
          />
        )}
      </section>
    </div>
  );
};

export default FinanceOverview;
