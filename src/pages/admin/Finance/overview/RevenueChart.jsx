import React, { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ErrorBox from "../../components/ErrorBox";
import { formatNaira } from "../../components/formatters";
import { DEFAULT_REVENUE_RANGE, REVENUE_RANGES } from "../finance.config";
import { useRevenueSeries } from "../../../../api/admin.queries";

const BAR_COLOR = "#EB4827";

// 800000 -> "₦800k", 1200000 -> "₦1.2M"
const compactNaira = (value) => {
  if (value >= 1_000_000) return `₦${+(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₦${Math.round(value / 1_000)}k`;
  return `₦${value}`;
};

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs text-gray-400">{point.label}</p>
      <p className="text-sm font-semibold text-[#343C6A] tabular-nums">{formatNaira(point.amount)}</p>
    </div>
  );
};

const RevenueChart = () => {
  const [range, setRange] = useState(DEFAULT_REVENUE_RANGE);
  const series = useRevenueSeries(range);
  const points = series.data ?? [];
  const rangeLabel = REVENUE_RANGES.find((r) => r.id === range)?.label;

  return (
    <section className="rounded-2xl bg-white p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-base font-semibold text-[#343C6A]">Revenue per {range === "12m" ? "month" : "day"}</h4>

        <div role="radiogroup" aria-label="Revenue range" className="flex rounded-lg bg-gray-50 p-1">
          {REVENUE_RANGES.map((r) => {
            const selected = r.id === range;
            return (
              <button
                key={r.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setRange(r.id)}
                className={`rounded-md px-3 py-1 text-xs whitespace-nowrap transition-colors ${
                  selected ? "bg-white font-medium text-[#343C6A] shadow-sm" : "text-gray-500 hover:text-[#343C6A]"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {series.isError ? (
        <ErrorBox title="Error loading revenue" error={series.error} onRetry={series.refetch} isRetrying={series.isFetching} />
      ) : series.isLoading ? (
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      ) : (
        <div
          className={`h-64 transition-opacity ${series.isPlaceholderData ? "opacity-60" : ""}`}
          role="img"
          aria-label={`Revenue bar chart, ${rangeLabel}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#F1F1F4" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#718EBF" }}
                interval={range === "30d" ? 4 : 0}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#718EBF" }}
                tickFormatter={compactNaira}
                width={48}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#FFF4E8" }} />
              <Bar dataKey="amount" fill={BAR_COLOR} radius={[4, 4, 4, 4]} maxBarSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};

export default RevenueChart;
