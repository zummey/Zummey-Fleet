import React from "react";
import { useSearchParams } from "react-router-dom";
import { Construction } from "lucide-react";
import PillTabs from "../../admin/components/PillTabs";
import EmptyState from "../../admin/components/EmptyState";
import PricingDashboard from "./dashboard/PricingDashboard";
import PricingConfiguration from "./configuration/PricingConfiguration";
import { PRICING_TABS, getPricingTab } from "./pricing.config";

// Promotions is the next flow to build
const ComingSoon = ({ title }) => (
  <div className="rounded-2xl bg-white">
    <EmptyState icon={Construction} title={`${title} is coming soon`} description="This section is still being built." />
  </div>
);

/** Pricing Management (super admin only): tab kept in ?tab= */
const SuperAdminPricing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = getPricingTab(searchParams.get("tab"));

  const changeTab = (next) =>
    setSearchParams(next === PRICING_TABS[0].id ? {} : { tab: next }, { replace: true });

  return (
    <div className="space-y-5 font-poppins">
      <h1 className="text-xl font-semibold text-[#343C6A]">Pricing Management</h1>

      <PillTabs tabs={PRICING_TABS} activeTab={tab.id} onChange={changeTab} label="Pricing" idPrefix="pricing" />

      <div id={`pricing-panel-${tab.id}`} role="tabpanel" aria-labelledby={`pricing-tab-${tab.id}`}>
        {tab.id === "dashboard" ? (
          <PricingDashboard />
        ) : tab.id === "configuration" ? (
          <PricingConfiguration />
        ) : (
          <ComingSoon title={tab.label} />
        )}
      </div>
    </div>
  );
};

export default SuperAdminPricing;
