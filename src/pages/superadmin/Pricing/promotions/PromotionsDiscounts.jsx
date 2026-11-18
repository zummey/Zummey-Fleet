import React from "react";
import PillTabs from "../../../admin/components/PillTabs";
import ComingSoon from "../shared/ComingSoon";
import { useSectionParam } from "../shared/useSectionParam";
import Coupons from "./Coupons";
import Campaigns from "./Campaigns";
import DiscountRules from "./DiscountRules";
import { PROMO_SECTIONS } from "./promotions.config";

const PANELS = { coupons: Coupons, campaigns: Campaigns, rules: DiscountRules };

/** Promotions & Discounts tab: Coupons / Promo Campaigns / Discount Rules, sub-tab kept in ?section= */
const PromotionsDiscounts = () => {
  const [section, changeSection] = useSectionParam(PROMO_SECTIONS);
  const Panel = section.ready ? PANELS[section.id] : null;

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-medium text-[#343C6A]">Promotions &amp; Discounts</h2>

      <PillTabs
        tabs={PROMO_SECTIONS}
        activeTab={section.id}
        onChange={changeSection}
        label="Promotions and discounts"
        idPrefix="pricing-promo"
      />

      <div id={`pricing-promo-panel-${section.id}`} role="tabpanel" aria-labelledby={`pricing-promo-tab-${section.id}`}>
        {Panel ? <Panel /> : <ComingSoon title={section.label} />}
      </div>
    </div>
  );
};

export default PromotionsDiscounts;
