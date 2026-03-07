import React from 'react';
import { Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGetEarningOverview } from '../../../api/financeReport.queries';

/**
 * EarningOverview Component
 * Displays monthly earnings in a bar chart from GET /fleet/finance/earning-overview
 */
const EarningOverview = () => {
  const { data: overview, isLoading, isError } = useGetEarningOverview();

  const currency = overview?.currency || 'NGN';
  const currencySymbol = currency === 'NGN' ? '₦' : currency;

  // Map API shape { month, amount } → chart shape { month, earnings }
  const chartData = (overview?.monthly_earnings || []).map(item => ({
    month: item.month,
    earnings: item.amount,
  }));

  // Dynamic Y-axis ceiling — round up to nearest 100k above max value
  const maxEarnings = chartData.length
    ? Math.max(...chartData.map(d => d.earnings))
    : 800000;
  const yAxisMax = Math.ceil(maxEarnings / 100000) * 100000 + 100000;
  const yAxisTicks = Array.from(
    { length: Math.floor(yAxisMax / 100000) + 1 },
    (_, i) => i * 100000
  );

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2">
          <p className="text-sm font-semibold text-gray-900">
            {payload[0].payload.month}
          </p>
          <p className="text-sm text-gray-600">
            {currencySymbol}{payload[0].value.toLocaleString('en-NG')}
          </p>
        </div>
      );
    }
    return null;
  };

  // Format Y-axis labels (e.g., 800000 → ₦800k)
  const formatYAxis = (value) => {
    if (value >= 1000) return `${currencySymbol}${(value / 1000).toFixed(0)}k`;
    return `${currencySymbol}${value}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[#1E293B]">Earning Overview</h2>
        {overview?.year && (
          <span className="text-sm text-gray-500 font-medium">{overview.year}</span>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="w-full h-[400px] flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-sm">Loading earnings data...</span>
          </div>
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="w-full h-[400px] flex items-center justify-center">
          <p className="text-sm text-gray-400">Could not load earnings data. Please try again.</p>
        </div>
      )}

      {/* Chart */}
      {!isLoading && !isError && (
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={formatYAxis}
                domain={[0, yAxisMax]}
                ticks={yAxisTicks}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(239, 68, 68, 0.1)' }} />

              <Bar dataKey="earnings" fill="#EF4444" radius={[8, 8, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Total yearly earnings footer */}
      {overview?.total_yearly_earnings !== undefined && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">Total Yearly Earnings</span>
          <span className="text-base font-semibold text-[#1E293B]">
            {currencySymbol}{overview.total_yearly_earnings.toLocaleString('en-NG')}
          </span>
        </div>
      )}
    </div>
  );
};

export default EarningOverview;