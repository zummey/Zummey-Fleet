// src/pages/admin/Dashboard/adminDashboard.config.js
//
// Single source of truth for the Admin Dashboard UI.
// - STAT_TABS drives the tab bar and which cards render in each tab.
// - Each card's `key` maps to a field in the API response for that tab
//   (see src/api/admin.service.js for the expected shape).
// To add/remove/reorder a stat, edit this file only.

import {
  Users,
  UserCheck,
  UserPlus,
  Bike,
  Clock,
  Route,
  Home,
  Truck,
  ClipboardList,
  Timer,
  Repeat,
  CircleCheck,
  CircleX,
  Wallet,
  CreditCard,
  Banknote,
  MessageSquare,
  TriangleAlert,
  Ticket,
  ShieldCheck,
} from "lucide-react";

// Icon tile colour presets (matches the design's soft pastel tiles)
const TILE = {
  blue: { iconBg: "bg-blue-50", iconColor: "text-blue-500" },
  green: { iconBg: "bg-green-50", iconColor: "text-green-600" },
  pink: { iconBg: "bg-fuchsia-50", iconColor: "text-fuchsia-500" },
  orange: { iconBg: "bg-orange-50", iconColor: "text-orange-500" },
  red: { iconBg: "bg-red-50", iconColor: "text-red-500" },
  purple: { iconBg: "bg-purple-50", iconColor: "text-purple-500" },
};

// Caption colour by tone. API may send `tone`; otherwise card's `defaultTone` is used.
export const TONE_STYLES = {
  positive: "text-green-500",
  negative: "text-red-500",
  info: "text-green-600",
  neutral: "text-gray-400",
};

// Value formatters referenced by card `format`
export const FORMATTERS = {
  number: (v) => Number(v ?? 0).toLocaleString(),
  currency: (v) => {
    const n = Number(v ?? 0);
    if (n >= 1_000_000_000) return `₦${+(n / 1_000_000_000).toFixed(2)}B`;
    if (n >= 1_000_000) return `₦${+(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `₦${+(n / 1_000).toFixed(1)}K`;
    return `₦${n.toLocaleString()}`;
  },
};

export const STAT_TABS = [
  {
    id: "customers",
    label: "Customers",
    title: "Customer Statistics",
    icon: Users,
    cards: [
      { key: "totalUsers", label: "Total Users", icon: Users, ...TILE.blue, format: "number", defaultTone: "positive" },
      { key: "activeUsers", label: "Active Users", icon: UserCheck, ...TILE.green, format: "number", defaultTone: "positive" },
      { key: "newUsers", label: "New Users", icon: UserPlus, ...TILE.pink, format: "number", defaultTone: "positive" },
    ],
  },
  {
    id: "riders",
    label: "Riders",
    title: "Riders Statistics",
    icon: Bike,
    cards: [
      { key: "totalRiders", label: "Total Riders", icon: Bike, ...TILE.orange, format: "number", defaultTone: "positive" },
      { key: "availableRiders", label: "Available Riders", icon: Clock, ...TILE.green, format: "number", defaultTone: "negative" },
      { key: "ridersOnDelivery", label: "Riders on Delivery", icon: Route, ...TILE.blue, format: "number", defaultTone: "info" },
    ],
  },
  {
    id: "fleet",
    label: "Fleet",
    title: "Fleet Statistics",
    icon: Truck,
    cards: [
      { key: "totalFleetOwners", label: "Total Fleet Owners", icon: Home, ...TILE.pink, format: "number", defaultTone: "positive" },
      { key: "activeFleets", label: "Active Fleets", icon: Truck, ...TILE.green, format: "number", defaultTone: "neutral" },
      { key: "totalVehicles", label: "Total Vehicles", icon: Truck, ...TILE.orange, format: "number", defaultTone: "neutral" },
    ],
  },
  {
    id: "orders",
    label: "Orders",
    title: "Order Statistics",
    icon: ClipboardList,
    cards: [
      { key: "pendingOrders", label: "Pending Orders", icon: Timer, ...TILE.orange, format: "number", defaultTone: "neutral" },
      { key: "activeOrders", label: "Active Orders", icon: Repeat, ...TILE.blue, format: "number", defaultTone: "positive" },
      { key: "completedOrders", label: "Completed Orders", icon: CircleCheck, ...TILE.green, format: "number", defaultTone: "positive" },
      { key: "failedOrders", label: "Failed Orders", icon: CircleX, ...TILE.red, format: "number", defaultTone: "negative" },
    ],
  },
  {
    id: "financial",
    label: "Financial",
    title: "Financial Statistics",
    icon: Wallet,
    cards: [
      { key: "totalRevenue", label: "Total Revenue", icon: Banknote, ...TILE.green, format: "currency", defaultTone: "positive" },
      { key: "settlements", label: "Settlements", icon: CreditCard, ...TILE.purple, format: "currency", defaultTone: "negative" },
      { key: "payouts", label: "Payouts", icon: Wallet, ...TILE.orange, format: "currency", defaultTone: "positive" },
    ],
  },
  {
    id: "operational",
    label: "Operational",
    title: "Operational Statistics",
    icon: ShieldCheck,
    cards: [
      { key: "complaints", label: "Complaints", icon: MessageSquare, ...TILE.orange, format: "number", defaultTone: "negative" },
      { key: "incidents", label: "Incidents", icon: TriangleAlert, ...TILE.orange, format: "number", defaultTone: "neutral" },
      { key: "supportTickets", label: "Support Tickets", icon: Ticket, ...TILE.blue, format: "number", defaultTone: "neutral" },
    ],
  },
];

export const DEFAULT_TAB = STAT_TABS[0].id;

// Active tab is kept in the URL (?tab=riders) so it survives refresh and can be linked to
export const TAB_QUERY_PARAM = "tab";

export const getTabById = (id) => STAT_TABS.find((t) => t.id === id) ?? STAT_TABS[0];
