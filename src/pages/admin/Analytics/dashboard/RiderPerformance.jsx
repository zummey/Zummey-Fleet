import React, { useId, useState } from "react";
import { Search } from "lucide-react";
import ChartCard from "./ChartCard";
import ErrorBox from "../../components/ErrorBox";
import { exportRows } from "../../components/exporters";
import { useDebouncedValue } from "../../components/useDebouncedValue";
import { DEFAULT_RANGE, RIDER_EXPORT_COLUMNS, RIDER_METRICS, rangeLabel } from "../analytics.config";
import { useRiderPerformance } from "../../../../api/analytics.queries";

const BAR = "bg-[#FF5A1F]";

/** Riders ranked by deliveries, on-time rate or rating, with a name search. */
const RiderPerformance = () => {
  const [range, setRange] = useState(DEFAULT_RANGE);
  const [metricId, setMetricId] = useState(RIDER_METRICS[0].id);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const metricGroup = useId();

  const metric = RIDER_METRICS.find((m) => m.id === metricId);
  const riders = useRiderPerformance({ range, metric: metricId, search });
  const rows = riders.data ?? [];
  const scale = metric.max ?? Math.max(1, ...rows.map((r) => r[metricId]));

  const handleExport = (format) =>
    exportRows({
      format,
      rows,
      columns: RIDER_EXPORT_COLUMNS,
      title: `Rider performance by ${metric.label.toLowerCase()} (${rangeLabel(range)})`,
      filename: `rider-performance-${metricId}-${range}-${new Date().toISOString().slice(0, 10)}`,
    });

  return (
    <ChartCard
      title="Rider performance"
      range={range}
      onRangeChange={setRange}
      onExport={handleExport}
      exportDisabled={!rows.length}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div role="radiogroup" aria-label="Rank riders by" className="flex flex-wrap gap-2">
          {RIDER_METRICS.map((m) => {
            const selected = m.id === metricId;
            return (
              <label
                key={m.id}
                className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-orange-300 ${
                  selected ? "border-[#0B1437] bg-[#0B1437] text-white" : "border-gray-300 text-[#343C6A] hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name={metricGroup}
                  value={m.id}
                  checked={selected}
                  onChange={() => setMetricId(m.id)}
                  className="sr-only"
                />
                {m.label}
              </label>
            );
          })}
        </div>

        <div className="relative w-full sm:w-44">
          <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search a rider"
            aria-label="Search a rider"
            className="w-full rounded-full border border-gray-200 py-1.5 pr-3 pl-8 text-xs text-[#343C6A] placeholder-gray-400 focus:border-[#EB4827]/60 focus:ring-2 focus:ring-[#FFF4E8] focus:outline-none"
          />
        </div>
      </div>

      {riders.isError ? (
        <ErrorBox title="Error loading riders" error={riders.error} onRetry={riders.refetch} isRetrying={riders.isFetching} />
      ) : riders.isLoading ? (
        <ul className="animate-pulse space-y-4 py-2" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="h-4 rounded bg-gray-100" />
          ))}
        </ul>
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-xs text-gray-400">No riders match “{search}”.</p>
      ) : (
        <ol
          className={`max-h-[340px] divide-y divide-gray-100 overflow-y-auto transition-opacity ${
            riders.isPlaceholderData ? "opacity-60" : ""
          }`}
        >
          {rows.map((rider) => {
            const value = rider[metricId];
            return (
              <li key={rider.id} className="flex items-center gap-3 py-2.5">
                <span className="w-5 shrink-0 text-xs text-gray-400 tabular-nums">{rider.rank}</span>
                <span className="w-28 shrink-0 truncate text-xs text-[#343C6A] sm:w-32" title={rider.name}>
                  {rider.name}
                </span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
                  <span
                    className={`block h-full rounded-full ${BAR} transition-[width] duration-300`}
                    style={{ width: `${Math.min(100, (value / scale) * 100)}%` }}
                  />
                </span>
                <span className="w-10 shrink-0 text-right text-xs font-semibold text-[#343C6A] tabular-nums">
                  {metric.format(value)}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </ChartCard>
  );
};

export default RiderPerformance;
