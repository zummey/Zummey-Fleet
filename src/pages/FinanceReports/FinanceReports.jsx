import React from 'react';
import FinanceDashboard from './FinanceDashboard/FinanceDashboard';
import EarningOverview from './EarningOverview/EarningOverview';
import TransactionHistory from './TransactionHistory/TransactionHistory';

/**
 * FinanceReports Component
 * Main container for Finance & Reports page
 * Contains: Dashboard stats, Earning Overview, Transaction History
 */
const FinanceReports = () => {
  return (
    <div className="space-y-6 font-poppins">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[1.5rem] font-semibold text-[#343C6A]">
          Finance & Reports
        </h1>
      </div>

      {/* Dashboard Stats Cards */}
      <FinanceDashboard />

      {/* Earning Overview Chart */}
      <EarningOverview />

      {/* Transaction History Table */}
      <TransactionHistory />
    </div>
  );
};

export default FinanceReports;