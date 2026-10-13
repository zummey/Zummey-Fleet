import React from "react";
import ErrorBox from "../components/ErrorBox";
import { PERFORMANCE_METRICS } from "../adminFleet.config";
import { useFleetPerformance } from "../../../../api/admin.queries";

// Design is still in progress — only the metric cards exist so far.
const PerformanceMetricsTab = ({ fleetId }) => {
  const performance = useFleetPerformance(fleetId);

  if (performance.isError) {
    return (
      <ErrorBox
        title="Error loading performance metrics"
        error={performance.error}
        onRetry={performance.refetch}
        isRetrying={performance.isFetching}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {PERFORMANCE_METRICS.map((metric) => (
        <div key={metric.key} className="rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-[#343C6A]">{metric.label}</p>
          {performance.isLoading ? (
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-gray-200"></div>
          ) : (
            <p className="mt-2 text-3xl font-semibold text-[#343C6A] tabular-nums">
              {metric.format(performance.data?.[metric.key])}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default PerformanceMetricsTab;
