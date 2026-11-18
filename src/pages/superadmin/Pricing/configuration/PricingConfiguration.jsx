import React from "react";
import { useSearchParams } from "react-router-dom";
import { Construction } from "lucide-react";
import PillTabs from "../../../admin/components/PillTabs";
import EmptyState from "../../../admin/components/EmptyState";
import PriceList from "./PriceList";
import { CONFIG_SECTIONS, getConfigSection } from "./configuration.config";

/** Pricing Configuration tab: State / City / Vehicle / Weight pricing, sub-tab kept in ?section= */
const PricingConfiguration = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const section = getConfigSection(searchParams.get("section"));

  const changeSection = (next) =>
    setSearchParams(
      (params) => {
        const updated = new URLSearchParams(params);
        if (next === CONFIG_SECTIONS[0].id) updated.delete("section");
        else updated.set("section", next);
        return updated;
      },
      { replace: true }
    );

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
          <div className="rounded-2xl bg-white">
            <EmptyState icon={Construction} title={`${section.label} is coming soon`} description="This section is still being built." />
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingConfiguration;
