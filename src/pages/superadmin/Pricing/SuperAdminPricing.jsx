import React from "react";
import { useSearchParams } from "react-router-dom";
import PillTabs from "../../admin/components/PillTabs";
import PricingDashboard from "./dashboard/PricingDashboard";
import PricingConfiguration from "./configuration/PricingConfiguration";
import PromotionsDiscounts from "./promotions/PromotionsDiscounts";
import { PRICING_TABS, getPricingTab } from "./pricing.config";

const PANELS = {
  dashboard: PricingDashboard,
  configuration: PricingConfiguration,
  promotions: PromotionsDiscounts,
};

/** Pricing Management (super admin only): tab kept in ?tab=, sub-tab in ?section= */
const SuperAdminPricing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = getPricingTab(searchParams.get("tab"));
  const Panel = PANELS[tab.id];

  // Switching tabs drops ?section=, since sub-tabs belong to one tab
  const changeTab = (next) =>
    setSearchParams(next === PRICING_TABS[0].id ? {} : { tab: next }, { replace: true });

  return (
    <div className="space-y-5 font-poppins">
      <h1 className="text-xl font-semibold text-[#343C6A]">Pricing Management</h1>

      <PillTabs tabs={PRICING_TABS} activeTab={tab.id} onChange={changeTab} label="Pricing" idPrefix="pricing" />

      <div id={`pricing-panel-${tab.id}`} role="tabpanel" aria-labelledby={`pricing-tab-${tab.id}`}>
        <Panel />
      </div>
    </div>
  );
};

export default SuperAdminPricing;
