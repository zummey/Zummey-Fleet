// src/pages/admin/FleetManagement/adminFleet.config.js
//
// Single source of truth for the Admin Fleet Management UI:
// list page (columns, row actions, page size), status badges,
// detail tabs, and performance metric cards.

import { Eye, ClipboardCheck, Ban, Trash2, CircleCheck, CircleX, MessageCircleQuestion } from "lucide-react";
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
  rejected: { label: "Rejected", className: "bg-red-50 text-red-500" },
  clarification: { label: "Needs Clarification", className: "bg-blue-50 text-blue-600" },
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

// ---- Review page --------------------------------------------------------------

// All items must be ticked before "Approve" is enabled.
// Unticked items pre-fill the "Request Clarification" message.
export const REVIEW_CHECKLIST = [
  { id: "certificateLegible", label: "Certificate is legible" },
  { id: "registrationMatches", label: "Registration number matches" },
  { id: "addressProvided", label: "Business address provided" },
  { id: "logoAcceptable", label: "Logo is acceptable" },
];

// Order here is the button order on the page
export const REVIEW_DECISIONS = [
  {
    id: "approve",
    label: "Approve",
    icon: CircleCheck,
    buttonClass: "bg-green-500 text-white hover:bg-green-600 disabled:bg-green-200",
    confirmClass: "bg-green-500 text-white hover:bg-green-600",
    title: "Approve this fleet?",
    description: "The fleet owner will be notified and can start operating on Zummey.",
    requiresNote: false,
    requiresChecklist: true,
    notePlaceholder: "Optional note to the fleet owner",
    successMessage: "Fleet approved",
  },
  {
    id: "reject",
    label: "Reject",
    icon: CircleX,
    buttonClass: "border border-red-400 bg-white text-red-500 hover:bg-red-50",
    confirmClass: "bg-red-500 text-white hover:bg-red-600",
    title: "Reject this fleet?",
    description: "Tell the fleet owner why their application was rejected.",
    requiresNote: true,
    notePlaceholder: "Reason for rejection",
    successMessage: "Fleet rejected",
  },
  {
    id: "clarify",
    label: "Request Clarification",
    icon: MessageCircleQuestion,
    buttonClass: "bg-blue-500 text-white hover:bg-blue-600",
    confirmClass: "bg-blue-500 text-white hover:bg-blue-600",
    title: "Request clarification",
    description: "The fleet owner will be asked to update their documents.",
    requiresNote: true,
    notePlaceholder: "What does the fleet owner need to fix or clarify?",
    successMessage: "Clarification requested",
  },
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

export const formatFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${Math.round(bytes / 1024)}KB`;
};

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
