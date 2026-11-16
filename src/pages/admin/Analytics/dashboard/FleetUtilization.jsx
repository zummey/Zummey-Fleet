import React, { useState } from "react";
import ChartCard from "./ChartCard";
import ErrorBox from "../../components/ErrorBox";
import { exportRows } from "../../components/exporters";
import { DEFAULT_RANGE, FLEET_EXPORT_COLUMNS, rangeLabel } from "../analytics.config";
import { useFleetUtilization } from "../../../../api/analytics.queries";

/** Share of each fleet's riders that were active (average per day over the range). */
const FleetUtilization = () => {
  const [range, setRange] = useState(DEFAULT_RANGE);
  const fleets = useFleetUtilization({ range });
  const rows = fleets.data ?? [];

  const handleExport = (format) =>
    exportRows({
      format,
      rows,
      columns: FLEET_EXPORT_COLUMNS,
      title: `Fleet utilization (${rangeLabel(range)})`,
      filename: `fleet-utilization-${range}-${new Date().toISOString().slice(0, 10)}`,
    });

  return (
    <ChartCard
      title="Fleet utilization"
      range={range}
      onRangeChange={setRange}
      onExport={handleExport}
      exportDisabled={!rows.length}
    >
      {fleets.isError ? (
        <ErrorBox title="Error loading fleets" error={fleets.error} onRetry={fleets.refetch} isRetrying={fleets.isFetching} />
      ) : fleets.isLoading ? (
        <ul className="animate-pulse space-y-6 py-2" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="space-y-2">
              <span className="block h-3 w-28 rounded bg-gray-200" />
              <span className="block h-2.5 rounded-full bg-gray-100" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className={`space-y-5 transition-opacity ${fleets.isPlaceholderData ? "opacity-60" : ""}`}>
          {rows.map((fleet) => (
            <li key={fleet.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm text-[#343C6A]">{fleet.name}</p>
                <p className="text-sm font-semibold text-[#343C6A] tabular-nums">{fleet.utilization}%</p>
              </div>
              <div
                role="progressbar"
                aria-label={`${fleet.name} utilization`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={fleet.utilization}
                className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100"
              >
                <div
                  className="h-full rounded-full bg-[#FF5A1F] transition-[width] duration-300"
                  style={{ width: `${fleet.utilization}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-gray-400">
                {fleet.activeRiders} of {fleet.totalRiders} riders active
              </p>
            </li>
          ))}
        </ul>
      )}
    </ChartCard>
  );
};

export default FleetUtilization;
