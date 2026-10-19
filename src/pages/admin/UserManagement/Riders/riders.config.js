// src/pages/admin/UserManagement/Riders/riders.config.js
//
// Single source of truth for the admin Riders screen:
// summary cards source, table columns, filters, row actions, export columns and URL params.

import { Eye, ClipboardCheck } from "lucide-react";
import { formatLongDate } from "../../components/formatters";

export const RIDERS_PAGE_SIZE = 10;

// Which admin dashboard stat tab feeds the summary cards (same tab id as adminDashboard.config.js)
export const RIDERS_SUMMARY_TAB_ID = "riders";

// Table state lives in the URL so refresh/back keeps the same view
export const RIDER_QUERY_PARAMS = { page: "page", search: "q" };

// Filter panel groups. `param` is the URL key; the first option is the default.
export const RIDER_FILTER_GROUPS = [
  {
    id: "status",
    param: "status",
    label: "Status",
    options: [
      { value: "all", label: "All" },
      { value: "active", label: "Active" },
      { value: "online", label: "Online" },
      { value: "offline", label: "Offline" },
      { value: "pending", label: "Pending" },
      { value: "suspended", label: "Suspended" },
    ],
  },
  {
    id: "riderType",
    param: "type",
    label: "Rider Type",
    options: [
      { value: "all", label: "All" },
      { value: "Independent", label: "Independent" },
      { value: "Fleet Rider", label: "Fleet Rider" },
    ],
  },
  {
    id: "minDeliveries",
    param: "deliveries",
    label: "Deliveries Completed",
    options: [
      { value: "any", label: "Any" },
      { value: "10", label: "10+ deliveries" },
      { value: "50", label: "50+ deliveries" },
      { value: "100", label: "100+ deliveries" },
    ],
  },
];

// Filter panel selection -> API query params
export const toRiderQuery = (filters) => ({
  status: filters.status,
  riderType: filters.riderType,
  minDeliveries: filters.minDeliveries === "any" ? 0 : Number(filters.minDeliveries),
});

// Table columns
export const RIDER_COLUMNS = [
  { key: "name", label: "Rider Name" },
  { key: "riderType", label: "Rider Type" },
  { key: "fleet", label: "Fleet" },
  { key: "status", label: "Status" },
  { key: "rating", label: "Rating" },
  { key: "deliveriesCompleted", label: "Deliveries Completed" },
  { key: "dateJoined", label: "Date Joined" },
];

// Action dropdown options — exactly two options per requirement: "View details" and "review"
export const RIDER_ROW_ACTIONS = [
  { id: "view", label: "View Details", icon: Eye },
  { id: "review", label: "Review", icon: ClipboardCheck },
];

// Columns for CSV / Excel / PDF export. `width` is Excel column width in characters.
export const RIDER_EXPORT_COLUMNS = [
  { label: "Rider ID", value: (r) => r.code || r.id, width: 14 },
  { label: "Rider Name", value: (r) => r.name, width: 22 },
  { label: "Phone Number", value: (r) => r.phone, width: 16 },
  { label: "Email", value: (r) => r.email, width: 28 },
  { label: "Rider Type", value: (r) => r.riderType, width: 16 },
  { label: "Fleet", value: (r) => r.fleet || "Independent", width: 22 },
  {
    label: "Status",
    value: (r) => (r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : ""),
    width: 12,
  },
  { label: "Rating", value: (r) => (r.rating != null ? Number(r.rating).toFixed(1) : "—"), width: 10 },
  { label: "Deliveries Completed", value: (r) => r.deliveriesCompleted ?? 0, width: 20 },
  { label: "Date Joined", value: (r) => formatLongDate(r.dateJoined), width: 18 },
];
