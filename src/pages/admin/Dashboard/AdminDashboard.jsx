import React from "react";
import { useAdminAbility } from "../../../auth/useAdminAbility";
import EmptyState from "../components/EmptyState";
import { useSearchParams } from "react-router-dom";
import StatsTabs from "./StatsTabs";
import AdminStatCard from "./AdminStatCard";
import AdminStatsSkeleton from "./AdminStatsSkeleton";
import {
  STAT_TABS,
  TAB_QUERY_PARAM,
} from "./adminDashboard.config";
import { useAdminDashboardStats } from "../../../api/admin.queries";

const gridClassFor = (count) =>
  count >= 4
    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

const tabScopes = { fleet: "fleets", financial: "finance", operational: "incidents" };

const AdminDashboard = () => {
  const ability = useAdminAbility();
  const tabs = STAT_TABS.filter(({ id }) => ability.can("read", tabScopes[id] ?? id));
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = tabs.find(({ id }) => id === searchParams.get(TAB_QUERY_PARAM)) ?? tabs[0];

  const { data, isLoading, isError, error, refetch, isFetching } =
    useAdminDashboardStats({ enabled: tabs.length > 0 });

  const handleTabChange = (id) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(TAB_QUERY_PARAM, id);
        return next;
      },
      { replace: true },
    );
  };

  if (!activeTab) return <EmptyState title="No dashboard statistics available for this role" />;

  const gridClass = gridClassFor(activeTab.cards.length);
  const tabStats = data?.[activeTab.id] ?? {};

  return (
    <div className="space-y-6 font-poppins mb-6">
      <StatsTabs
        tabs={tabs}
        activeTab={activeTab.id}
        onChange={handleTabChange}
      />

      <section
        id={`admin-panel-${activeTab.id}`}
        role="tabpanel"
        aria-labelledby={`admin-tab-${activeTab.id}`}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold tracking-wide text-[#343C6A] uppercase">
          {activeTab.title}
        </h3>

        {isLoading ? (
          <AdminStatsSkeleton
            count={activeTab.cards.length}
            gridClass={gridClass}
          />
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h3 className="mb-2 font-semibold text-red-800">
              Error loading statistics
            </h3>
            <p className="text-sm text-red-600">
              {error?.response?.data?.responseMessage ||
                error?.message ||
                "Something went wrong"}
            </p>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-60"
            >
              {isFetching ? "Retrying..." : "Retry"}
            </button>
          </div>
        ) : (
          // key forces a re-mount per tab so the entry animation replays
          <div
            key={activeTab.id}
            className={`grid gap-5 motion-safe:animate-fade-in-up ${gridClass}`}
          >
            {activeTab.cards.map((card) => (
              <AdminStatCard
                key={card.key}
                card={card}
                stat={tabStats[card.key]}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
