import React from "react";

const FORMATS = {
  number: (v) => Number(v).toLocaleString(),
  percent: (v) => `${v}%`,
};

const DispatchStatCard = ({ card, stat }) => {
  const { label, icon: Icon, iconBg, iconColor, format } = card;
  return (
    <div className="flex min-h-[148px] flex-col rounded-2xl bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="pt-2 text-sm text-[#343C6A]">{label}</p>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={iconColor} size={20} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-3xl font-semibold text-[#343C6A] tabular-nums">
        {stat ? (FORMATS[format] ?? FORMATS.number)(stat.value) : "—"}
      </p>
      {stat?.caption && <p className="mt-auto pt-3 text-xs text-gray-400">{stat.caption}</p>}
    </div>
  );
};

export default DispatchStatCard;
