import React from "react";
import { STATUS_BADGES } from "./statusBadges.config";

/**
 * - badges: per-screen overrides merged over STATUS_BADGES (e.g. payouts show "approved" in blue)
 * - variant: "pill" (default) | "text" (coloured text only, as in the finance transaction tables)
 */
const StatusBadge = ({ status, badges, variant = "pill" }) => {
  const badge = badges?.[status] ??
    STATUS_BADGES[status] ?? { label: status ?? "—", className: "bg-gray-100 text-gray-500" };

  if (variant === "text") {
    const textClass = badge.className.split(" ").filter((c) => c.startsWith("text-")).join(" ");
    return <span className={`text-sm font-medium ${textClass}`}>{badge.label}</span>;
  }

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${badge.className}`}>
      {badge.label}
    </span>
  );
};

export default StatusBadge;
