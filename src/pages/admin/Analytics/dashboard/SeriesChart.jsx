import React, { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "./ChartCard";
import ErrorBox from "../../components/ErrorBox";
import { exportRows } from "../../components/exporters";
import { DEFAULT_RANGE, rangeLabel } from "../analytics.config";
import { useAnalyticsSeries } from "../../../../api/analytics.queries";

const BAR = "#FF5A1F";
const BAR_SELECTED = "#C2410C";

// One rounded bar; the selected one is darker and carries a dark value pill
const BarShape = ({ x, y, width, height, index, payload, selectedIndex, format }) => {
  if (!(height > 0)) return null;
  const isSelected = index === selectedIndex;
  const r = Math.min(width / 2, 8);
  const text = isSelected ? format(payload?.value) : "";
  const tagWidth = Math.max(28, text.length * 6 + 12);
  const cx = x + width / 2;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={r} ry={r} fill={isSelected ? BAR_SELECTED : BAR} cursor="pointer" />
      {isSelected && height > 40 && (
        <g pointerEvents="none">
          <rect x={cx - tagWidth / 2} y={y + 16} width={tagWidth} height={18} rx={5} fill="#0B1437" />
          <text x={cx} y={y + 28} textAnchor="middle" fontSize={10} fill="#fff">
            {text}
          </text>
        </g>
      )}
    </g>
  );
};

/**
 * Orders / revenue bar chart. Hover, click or use the arrow keys to pick a bar;
 * the headline above the chart shows that bar's full date and value.
 * chart: one entry of SERIES_CHARTS in analytics.config.js
 */
const SeriesChart = ({ chart }) => {
  const [range, setRange] = useState(DEFAULT_RANGE);
  const [picked, setPicked] = useState(null); // null = latest bar
  const series = useAnalyticsSeries({ metric: chart.metric, range });
  const points = series.data ?? [];
  const selectedIndex = picked != null && picked < points.length ? picked : points.length - 1;
  const selected = points[selectedIndex];

  const changeRange = (next) => {
    setRange(next);
    setPicked(null);
  };

  const handleKeyDown = (e) => {
    if (!points.length) return;
    let next;
    if (e.key === "ArrowRight") next = Math.min(points.length - 1, selectedIndex + 1);
    else if (e.key === "ArrowLeft") next = Math.max(0, selectedIndex - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = points.length - 1;
    else return;
    e.preventDefault();
    setPicked(next);
  };

  const handleExport = (format) =>
    exportRows({
      format,
      rows: points,
      columns: [{ label: range === "12m" ? "Month" : "Date", value: (p) => p.fullLabel, width: 18 }, ...chart.exportColumns],
      title: `${chart.title(range)} (${rangeLabel(range)})`,
      filename: `${chart.metric}-${range}-${new Date().toISOString().slice(0, 10)}`,
    });

  return (
    <ChartCard
      title={chart.title(range)}
      subtitle={chart.subtitle}
      range={range}
      onRangeChange={changeRange}
      onExport={handleExport}
      exportDisabled={!points.length}
    >
      {series.isError ? (
        <ErrorBox title="Error loading chart" error={series.error} onRetry={series.refetch} isRetrying={series.isFetching} />
      ) : series.isLoading ? (
        <div className="h-72 animate-pulse rounded-xl bg-gray-100" />
      ) : (
        <>
          <p className="mb-2 text-sm text-[#343C6A]" aria-live="polite">
            {selected && (
              <>
                {selected.fullLabel} · <span className="font-semibold">{chart.headline(selected.value)}</span>
              </>
            )}
          </p>
          <div
            tabIndex={0}
            role="img"
            aria-label={`${chart.title(range)}, ${rangeLabel(range)}. Use the left and right arrow keys to read each bar.`}
            onKeyDown={handleKeyDown}
            className={`h-64 rounded-lg transition-opacity focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none ${
              series.isPlaceholderData ? "opacity-60" : ""
            }`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={points}
                margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
                onMouseMove={(state) => state?.activeTooltipIndex != null && setPicked(Number(state.activeTooltipIndex))}
                onClick={(state) => state?.activeTooltipIndex != null && setPicked(Number(state.activeTooltipIndex))}
              >
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
                  tickFormatter={chart.axis}
                  width={52}
                />
                {/* Invisible tooltip: recharts only tracks the hovered bar when one is mounted */}
                <Tooltip content={() => null} cursor={{ fill: "#FFF4E8" }} />
                <Bar
                  dataKey="value"
                  maxBarSize={range === "30d" ? 10 : 16}
                  isAnimationActive={false}
                  shape={(props) => <BarShape {...props} selectedIndex={selectedIndex} format={chart.tag} />}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </ChartCard>
  );
};

export default SeriesChart;
