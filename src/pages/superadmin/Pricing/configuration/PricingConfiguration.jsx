import React from "react";
import PillTabs from "../../../admin/components/PillTabs";
import ComingSoon from "../shared/ComingSoon";
import { useSectionParam } from "../shared/useSectionParam";
import PriceList from "./PriceList";
import { CONFIG_SECTIONS } from "./configuration.config";

/** Pricing Configuration tab: State / City / Vehicle / Weight pricing, sub-tab kept in ?section= */
const PricingConfiguration = () => {
  const [section, changeSection] = useSectionParam(CONFIG_SECTIONS);

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-medium text-[#343C6A]">Pricing Configuration</h2>

      <PillTabs
        tabs={CONFIG_SECTIONS}
        activeTab={section.id}
        onChange={changeSection}
        label="Pricing configuration"
        idPrefix="pricing-config"
      />

      <div id={`pricing-config-panel-${section.id}`} role="tabpanel" aria-labelledby={`pricing-config-tab-${section.id}`}>
        {section.ready ? (
          // key resets dialogs when switching sections
          <PriceList key={section.id} section={section} />
        ) : (
          <ComingSoon title={section.label} />
        )}
      </div>
    </div>
  );
};

export default PricingConfiguration;
