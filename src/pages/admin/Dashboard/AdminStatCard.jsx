import React from "react";
import { FORMATTERS, TONE_STYLES } from "./adminDashboard.config";

const AdminStatCard = ({ card, stat }) => {
  const { label, icon: Icon, iconBg, iconColor, format, defaultTone } = card;
  const formatValue = FORMATTERS[format] ?? FORMATTERS.number;
  const tone = stat?.tone ?? defaultTone;

  return (
    <div className="flex flex-col rounded-xl border border-gray-100 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="pt-2 text-sm font-medium text-[#343C6A]">{label}</p>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={iconColor} size={20} />
        </div>
      </div>

      <p className=" text-3xl font-bold text-[#343C6A] tabular-nums">
        {stat ? formatValue(stat.value) : "—"}
      </p>

      <p className={`mt-2 text-xs ${TONE_STYLES[tone] ?? TONE_STYLES.neutral}`}>
        {stat?.caption ?? "No data yet"}
      </p>
    </div>
  );
};

export default AdminStatCard;
