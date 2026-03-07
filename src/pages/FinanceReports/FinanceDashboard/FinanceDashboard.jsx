import React from 'react';
import { Loader2 } from 'lucide-react';
import { useGetFinanceSummary } from '../../../api/financeReport.queries';

/**
 * FinanceDashboard Component
 * Displays 4 key financial metrics fetched from GET /fleet/finance/summary:
 * - Total Earnings       (Red/Orange gradient)
 * - Pending Withdrawals  (Navy Blue gradient)
 * - Refunds to Customers (Dark Gray gradient)
 * - Available Balance    (Green gradient)
 */
const FinanceDashboard = () => {
  const { data: summary, isLoading, isError } = useGetFinanceSummary();

  // Format number to currency using the API's currency field (defaults to NGN)
  const formatCurrency = (amount, currency = 'NGN') => {
    const symbol = currency === 'NGN' ? '₦' : currency;
    const num = typeof amount === 'number' ? amount : 0;
    return `${symbol}${num.toLocaleString('en-NG')}`;
  };

  const currency = summary?.currency || 'NGN';

  const cards = [
    {
      label: 'Total Earnings',
      value: summary?.total_earnings,
      gradient: 'from-[#EF4444] to-[#F97316]',
    },
    {
      label: 'Pending Withdrawals',
      value: summary?.pending_withdrawals,
      gradient: 'from-[#343C6A] to-[#1f57aa]',
    },
    {
      label: 'Refunds to Customers',
      value: summary?.refunds_to_customers,
      gradient: 'from-[#4A4A4A] to-[#3c4049]',
    },
    {
      label: 'Available Balance',
      value: summary?.available_balance,
      gradient: 'from-[#27AE60] to-[#059669]',
    },
  ];

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, gradient }) => (
          <div
            key={label}
            className={`bg-gradient-to-br ${gradient} rounded-xl p-6 text-white shadow-lg`}
          >
            <h3 className="text-sm font-medium opacity-90 mb-3">{label}</h3>
            <div className="flex items-center gap-2">
              <Loader2 size={20} className="animate-spin opacity-70" />
              <span className="text-sm opacity-70">Loading...</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state — still show cards with dashes so layout doesn't break
  if (isError) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, gradient }) => (
          <div
            key={label}
            className={`bg-gradient-to-br ${gradient} rounded-xl p-6 text-white shadow-lg`}
          >
            <h3 className="text-sm font-medium opacity-90 mb-2">{label}</h3>
            <p className="text-2xl font-bold opacity-60">—</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, gradient }) => (
        <div
          key={label}
          className={`bg-gradient-to-br ${gradient} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}
        >
          <div className="space-y-2">
            <h3 className="text-sm font-medium opacity-90">{label}</h3>
            <p className="text-3xl font-bold">{formatCurrency(value, currency)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FinanceDashboard;