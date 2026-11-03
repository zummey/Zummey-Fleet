import React from "react";
import { useSearchParams } from "react-router-dom";
import PillTabs from "../components/PillTabs";
import FinanceOverview from "./overview/FinanceOverview";
import Transactions from "./transactions/Transactions";
import Payouts from "./payouts/Payouts";
import Refunds from "./refunds/Refunds";
import { FINANCE_TABS, FINANCE_TAB_PARAM, getFinanceTabById } from "./finance.config";

const AdminFinance = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = getFinanceTabById(searchParams.get(FINANCE_TAB_PARAM));

  // Each tab has its own page/search/filters, so switching tabs starts from a clean URL
  const handleTabChange = (id) => setSearchParams({ [FINANCE_TAB_PARAM]: id }, { replace: true });

  return (
    <div className="mb-6 space-y-6 font-poppins">
      <h3 className="text-xl font-semibold text-[#343C6A]">Finance Management</h3>

      <PillTabs
        tabs={FINANCE_TABS}
        activeTab={activeTab.id}
        onChange={handleTabChange}
        label="Finance sections"
        idPrefix="finance"
      />

      <div
        key={activeTab.id}
        id={`finance-panel-${activeTab.id}`}
        role="tabpanel"
        aria-labelledby={`finance-tab-${activeTab.id}`}
        className="motion-safe:animate-fade-in-up"
      >
        {activeTab.id === "overview" && <FinanceOverview onViewAllTransactions={() => handleTabChange("transactions")} />}
        {activeTab.id === "transactions" && <Transactions />}
        {activeTab.id === "payouts" && <Payouts />}
        {activeTab.id === "refunds" && <Refunds />}
      </div>
    </div>
  );
};

export default AdminFinance;
