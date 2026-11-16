import React from "react";
import SeriesChart from "./SeriesChart";
import RiderPerformance from "./RiderPerformance";
import FleetUtilization from "./FleetUtilization";
import AdminStatCard from "../../Dashboard/AdminStatCard";
import AdminStatsSkeleton from "../../Dashboard/AdminStatsSkeleton";
import ErrorBox from "../../components/ErrorBox";
import { SERIES_CHARTS, SUMMARY_CARDS } from "../analytics.config";
import { useAnalyticsSummary } from "../../../../api/analytics.queries";

const GRID = "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";

const AnalyticsDashboard = () => {
  const summary = useAnalyticsSummary();

  return (
    <div className="space-y-6">
      {summary.isLoading ? (
        <AdminStatsSkeleton count={SUMMARY_CARDS.length} gridClass={GRID} />
      ) : summary.isError ? (
        <ErrorBox
          title="Error loading summary"
          error={summary.error}
          onRetry={summary.refetch}
          isRetrying={summary.isFetching}
        />
      ) : (
        <div className={`grid gap-5 ${GRID}`}>
          {SUMMARY_CARDS.map((card) => (
            <AdminStatCard key={card.key} card={card} stat={summary.data?.[card.key]} />
          ))}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        {SERIES_CHARTS.map((chart) => (
          <SeriesChart key={chart.metric} chart={chart} />
        ))}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <RiderPerformance />
        <FleetUtilization />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
