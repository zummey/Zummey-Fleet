import React, { useId } from "react";
import RangeToggle from "../../components/RangeToggle";
import ExportMenu from "../../components/ExportMenu";
import { RANGES } from "../analytics.config";

/** White card with title, optional subtitle, the range switch and an Export menu. */
const ChartCard = ({ title, subtitle, range, onRangeChange, onExport, exportDisabled, children }) => {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className="flex min-w-0 flex-col rounded-2xl bg-white p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={titleId} className="text-base font-semibold text-[#343C6A]">
            {title}
          </h2>
          {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <RangeToggle ranges={RANGES} value={range} onChange={onRangeChange} label={`${title} range`} />
          <ExportMenu onExport={onExport} disabled={exportDisabled} />
        </div>
      </div>
      {children}
    </section>
  );
};

export default ChartCard;
