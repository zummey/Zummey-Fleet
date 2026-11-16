// src/pages/admin/Analytics/analytics.config.js
//
// Single source of truth for the admin Analytics Management screen:
// tabs, summary cards, chart cards, rider metrics, and the report builder
// (report types and their columns, date presets and file formats).

import { Package, Truck, Clock, FileText, FileSpreadsheet, Sheet } from "lucide-react";
import { formatNaira } from "../components/formatters";
import NairaIcon from "../components/NairaIcon";

export const ANALYTICS_TABS = [
  { id: "dashboard", label: "Analytics Dashboard" },
  { id: "reports", label: "Reports" },
];
export const getAnalyticsTab = (id) => ANALYTICS_TABS.find((t) => t.id === id) ?? ANALYTICS_TABS[0];

export const RANGES = [
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "12m", label: "Last 12 months" },
];
export const DEFAULT_RANGE = "7d";
export const rangeLabel = (id) => RANGES.find((r) => r.id === id)?.label ?? id;

// ---- Summary cards (rendered with AdminStatCard) ---------------------------------------

export const SUMMARY_CARDS = [
  { key: "totalOrders", label: "Total Orders", icon: Package, iconBg: "bg-blue-50", iconColor: "text-blue-500", format: "number", defaultTone: "positive" },
  { key: "revenue", label: "Revenue", icon: NairaIcon, iconBg: "bg-blue-50", iconColor: "text-green-600", format: "currency", defaultTone: "positive" },
  { key: "onTimeRate", label: "On-time delivery", icon: Truck, iconBg: "bg-fuchsia-50", iconColor: "text-fuchsia-500", format: "percent", defaultTone: "positive" },
  { key: "avgDeliveryTime", label: "Avg. delivery time", icon: Clock, iconBg: "bg-orange-50", iconColor: "text-orange-500", format: "minutes", defaultTone: "positive" },
];

// ---- Orders / revenue charts -------------------------------------------------------------

// 800000 -> "₦800k", 1200000 -> "₦1.2M"
export const compactNaira = (value) => {
  if (value >= 1_000_000) return `₦${+(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₦${Math.round(value / 1_000)}k`;
  return `₦${value}`;
};

export const SERIES_CHARTS = [
  {
    metric: "orders",
    title: (range) => `Orders per ${range === "12m" ? "month" : "day"}`,
    subtitle: "Completed orders",
    axis: (v) => Number(v).toLocaleString(),
    tag: (v) => Number(v).toLocaleString(),
    headline: (v) => `${Number(v).toLocaleString()} orders`,
    exportColumns: [{ label: "Orders", value: (p) => p.value, width: 12 }],
  },
  {
    metric: "revenue",
    title: (range) => `Revenue per ${range === "12m" ? "month" : "day"}`,
    subtitle: "Money earned from completed deliveries",
    axis: compactNaira,
    tag: compactNaira,
    headline: (v) => formatNaira(v),
    exportColumns: [{ label: "Revenue (₦)", value: (p) => p.value, width: 16 }],
  },
];

// ---- Rider performance -------------------------------------------------------------------

// `max` sets the bar scale: null = relative to the best rider
export const RIDER_METRICS = [
  { id: "deliveries", label: "Deliveries", max: null, format: (v) => Number(v).toLocaleString() },
  { id: "onTimeRate", label: "On-time rate", max: 100, format: (v) => `${v}%` },
  { id: "rating", label: "Rating", max: 5, format: (v) => Number(v).toFixed(1) },
];

export const RIDER_EXPORT_COLUMNS = [
  { label: "Rank", value: (r) => r.rank, width: 6 },
  { label: "Rider", value: (r) => r.name, width: 22 },
  { label: "Fleet", value: (r) => r.fleet, width: 18 },
  { label: "Deliveries", value: (r) => r.deliveries, width: 12 },
  { label: "On-time rate (%)", value: (r) => r.onTimeRate, width: 16 },
  { label: "Rating", value: (r) => r.rating, width: 8 },
];

export const FLEET_EXPORT_COLUMNS = [
  { label: "Fleet", value: (f) => f.name, width: 20 },
  { label: "Active riders (avg/day)", value: (f) => f.activeRiders, width: 22 },
  { label: "Total riders", value: (f) => f.totalRiders, width: 12 },
  { label: "Utilization (%)", value: (f) => f.utilization, width: 14 },
];

// ---- Reports -------------------------------------------------------------------------------

const DAILY_DATE = { label: "Date", value: (r) => r.date, width: 12 };

export const REPORT_TYPES = [
  {
    id: "orders_summary",
    label: "Orders summary",
    description: "Orders per day, status mix",
    columns: [
      DAILY_DATE,
      { label: "Orders", value: (r) => r.orders },
      { label: "Delivered", value: (r) => r.delivered },
      { label: "Cancelled", value: (r) => r.cancelled },
      { label: "Failed", value: (r) => r.failed },
    ],
  },
  {
    id: "revenue",
    label: "Revenue report",
    description: "Revenue and average order value",
    columns: [
      DAILY_DATE,
      { label: "Orders", value: (r) => r.orders },
      { label: "Revenue (₦)", value: (r) => r.revenue, width: 16 },
      { label: "Avg. order value (₦)", value: (r) => r.averageOrderValue, width: 20 },
    ],
  },
  {
    id: "rider_performance",
    label: "Rider performance",
    description: "Deliveries, on-time rate, rating",
    columns: RIDER_EXPORT_COLUMNS,
  },
  {
    id: "fleet_utilization",
    label: "Fleet utilization",
    description: "Active riders per fleet",
    columns: FLEET_EXPORT_COLUMNS,
  },
  {
    id: "payouts_refunds",
    label: "Payouts and refunds",
    description: "Money paid out and returned",
    columns: [
      DAILY_DATE,
      { label: "Rider payouts (₦)", value: (r) => r.riderPayouts, width: 18 },
      { label: "Fleet settlements (₦)", value: (r) => r.fleetSettlements, width: 20 },
      { label: "Refunds (₦)", value: (r) => r.refunds, width: 14 },
    ],
  },
];
export const getReportType = (id) => REPORT_TYPES.find((r) => r.id === id);

// `days` = number of full days ending yesterday; "custom" uses the From / To fields
export const DATE_PRESETS = [
  { id: "7d", label: "Last 7 days", days: 7 },
  { id: "30d", label: "Last 30 days", days: 30 },
  { id: "90d", label: "Last 90 days", days: 90 },
  { id: "custom", label: "Custom range" },
];

// `id` is the exporter format in components/exporters.js
export const REPORT_FORMATS = [
  { id: "pdf", label: "PDF", badge: "PDF", description: "A report you can print or share", icon: FileText, tile: "bg-red-50 text-red-500" },
  { id: "csv", label: "CSV", badge: "CSV", description: "Plain data for other tools", icon: Sheet, tile: "bg-green-50 text-green-600" },
  { id: "xlsx", label: "Excel", badge: "Excel", description: "A spreadsheet you can sort and filter", icon: FileSpreadsheet, tile: "bg-blue-50 text-blue-500" },
];
