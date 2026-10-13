// src/pages/admin/FleetManagement/adminFleet.config.js
//
// Single source of truth for the Admin Fleet Management UI:
// list page (columns, row actions, page size), status badges,
// detail tabs, and performance metric cards.

import { Eye, ClipboardCheck, Ban, Trash2 } from "lucide-react";
import { FORMATTERS } from "../Dashboard/adminDashboard.config";

// ---- List page --------------------------------------------------------------

export const FLEET_PAGE_SIZE = 10;
export const PAGE_QUERY_PARAM = "page";

// Which dashboard stat tab feeds the summary cards at the top of the list page
export const FLEET_SUMMARY_TAB_ID = "fleet";

export const FLEET_OWNER_COLUMNS = [
  { key: "companyName", label: "Company Name" },
  { key: "contactPerson", label: "Contact Person" },
  { key: "ridersCount", label: "No. of Riders" },
  { key: "vehiclesCount", label: "No. of Vehicles" },
  { key: "status", label: "Status" },
];

// `id` is what AdminFleetManagement switches on when an action is clicked
export const FLEET_ROW_ACTIONS = [
  { id: "view", label: "View Details", icon: Eye },
  { id: "review", label: "Review Fleet", icon: ClipboardCheck },
  { id: "suspend", label: "Suspend Fleet", icon: Ban },
  { id: "delete", label: "Delete Fleet", icon: Trash2, danger: true },
];

// ---- Status badges ----------------------------------------------------------

export const STATUS_BADGES = {
  active: { label: "Active", className: "bg-green-50 text-green-600" },
  approved: { label: "Approved", className: "bg-green-50 text-green-600" },
  online: { label: "Online", className: "bg-green-50 text-green-600" },
  offline: { label: "Offline", className: "bg-red-50 text-red-500" },
  suspended: { label: "Suspended", className: "bg-red-50 text-red-500" },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-600" },
};

// ---- Details page -----------------------------------------------------------

export const DETAIL_TAB_QUERY_PARAM = "tab";

export const FLEET_DETAIL_TABS = [
  { id: "cac", label: "CAC Details" },
  { id: "riders", label: "Fleet Riders" },
  { id: "vehicles", label: "Fleet Vehicles" },
  { id: "performance", label: "Performance Metrics" },
];

export const DEFAULT_DETAIL_TAB = FLEET_DETAIL_TABS[0].id;

export const getDetailTabById = (id) =>
  FLEET_DETAIL_TABS.find((t) => t.id === id) ?? FLEET_DETAIL_TABS[0];

export const FLEET_RIDER_COLUMNS = ["Rider", "Phone Number", "Assigned Vehicle", "Status"];

export const FLEET_VEHICLE_COLUMNS = [
  "Bike ID",
  "Bike Name",
  "Manufacturer",
  "License No.",
  "GPS Tracker SN",
  "Status",
];

// Performance tab is still being designed — add cards here as the design grows
export const PERFORMANCE_METRICS = [
  { key: "completedOrders", label: "Completed Orders", format: FORMATTERS.number },
  { key: "averageRating", label: "Average Rating", format: (v) => Number(v ?? 0).toFixed(1) },
  { key: "onTimeRate", label: "On-time Rating", format: (v) => `${v ?? 0}%` },
  { key: "revenue", label: "Revenue", format: FORMATTERS.currency },
];

// ---- Shared formatting --------------------------------------------------------

export const formatLongDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "—";

export const formatShortDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";
