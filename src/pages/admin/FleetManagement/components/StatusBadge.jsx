import React from "react";
import { STATUS_BADGES } from "../adminFleet.config";

const StatusBadge = ({ status }) => {
  const badge = STATUS_BADGES[status] ?? { label: status ?? "—", className: "bg-gray-100 text-gray-500" };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}>
      {badge.label}
    </span>
  );
};

export default StatusBadge;
