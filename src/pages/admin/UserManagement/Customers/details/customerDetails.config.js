// src/pages/admin/UserManagement/Customers/details/customerDetails.config.js
//
// Single source of truth for the admin Customer Details screen and the
// customer row actions: tabs, table columns (by cell type), export columns,
// and the confirm-dialog copy for each action.

import { Eye, MessageSquareWarning, ReceiptText, Ban, RotateCcw, Trash2 } from "lucide-react";
import { formatLongDate, formatShortDate, formatNaira } from "../../../components/formatters";

export const DETAIL_TAB_QUERY_PARAM = "tab";
export const HISTORY_PAGE_SIZE = 10;

const titleCase = (value = "") =>
  value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// Column `type` decides how a cell renders: id | text | money | status | date
export const CUSTOMER_DETAIL_TABS = [
  {
    id: "orders",
    label: "Order History",
    kind: "orders",
    layout: "table",
    noun: { one: "Order", other: "Orders" },
    searchPlaceholder: "Search order ID, location or status",
    emptyText: "This customer hasn't placed any orders yet.",
    columns: [
      { key: "id", label: "Order ID", type: "id" },
      { key: "pickup", label: "Pick Up", type: "text" },
      { key: "destination", label: "Destination", type: "text" },
      { key: "amount", label: "Amount", type: "money" },
      { key: "status", label: "Status", type: "status" },
      { key: "date", label: "Date", type: "date" },
    ],
    exportColumns: [
      { label: "Order ID", value: (o) => o.id, width: 14 },
      { label: "Pick Up", value: (o) => o.pickup, width: 18 },
      { label: "Destination", value: (o) => o.destination, width: 18 },
      { label: "Amount (₦)", value: (o) => o.amount, width: 12 },
      { label: "Status", value: (o) => titleCase(o.status), width: 12 },
      { label: "Date", value: (o) => formatShortDate(o.date), width: 14 },
    ],
  },
  {
    id: "complaints",
    label: "Complaints History",
    kind: "complaints",
    layout: "cards",
    noun: { one: "Complaint", other: "Complaints" },
    searchPlaceholder: "Search complaint ID, title or status",
    emptyText: "This customer hasn't made any complaints.",
    exportColumns: [
      { label: "Complaint ID", value: (c) => c.id, width: 14 },
      { label: "Title", value: (c) => c.title, width: 20 },
      { label: "Description", value: (c) => c.description, width: 48 },
      { label: "Order ID", value: (c) => c.orderId ?? "", width: 14 },
      { label: "Status", value: (c) => titleCase(c.status), width: 12 },
      { label: "Date", value: (c) => formatShortDate(c.date), width: 14 },
    ],
  },
  {
    id: "payments",
    label: "Payment History",
    kind: "payments",
    layout: "table",
    noun: { one: "Payment", other: "Payments" },
    searchPlaceholder: "Search transaction, order, method",
    emptyText: "No payments recorded for this customer.",
    columns: [
      { key: "id", label: "Transaction ID", type: "id" },
      { key: "orderId", label: "Order", type: "id" },
      { key: "method", label: "Method", type: "text" },
      { key: "date", label: "Date", type: "date" },
      { key: "amount", label: "Amount", type: "money" },
      { key: "status", label: "Status", type: "status" },
    ],
    exportColumns: [
      { label: "Transaction ID", value: (p) => p.id, width: 16 },
      { label: "Order", value: (p) => p.orderId, width: 14 },
      { label: "Method", value: (p) => p.method, width: 12 },
      { label: "Date", value: (p) => formatShortDate(p.date), width: 14 },
      { label: "Amount (₦)", value: (p) => p.amount, width: 12 },
      { label: "Status", value: (p) => titleCase(p.status), width: 12 },
    ],
  },
];

export const getDetailTabById = (id) =>
  CUSTOMER_DETAIL_TABS.find((t) => t.id === id) ?? CUSTOMER_DETAIL_TABS[0];

// Profile card fields, laid out in columns like the design
export const CUSTOMER_PROFILE_FIELDS = [
  [
    { label: "Phone Number", value: (c) => c.phone },
    { label: "Customer ID", value: (c) => c.code },
  ],
  [
    { label: "Email", value: (c) => c.email },
    { label: "Address", value: (c) => c.address },
  ],
  [
    { label: "Date Joined", value: (c) => formatLongDate(c.dateJoined) },
    { label: "Last Order", value: (c) => (c.lastOrderAt ? formatLongDate(c.lastOrderAt) : "No orders yet") },
  ],
  [{ label: "Total Orders", value: (c) => c.totalOrders }],
];

export const formatCell = {
  money: formatNaira,
  date: formatShortDate,
};

// ---- Row actions + confirm dialogs ------------------------------------------

// Suspend and Reactivate swap based on the customer's current status
export const getCustomerRowActions = (customer) => [
  { id: "view", label: "View Details", icon: Eye },
  { id: "complaints", label: "View Complaints", icon: MessageSquareWarning },
  { id: "payments", label: "View Payments", icon: ReceiptText },
  customer.status === "suspended"
    ? { id: "reactivate", label: "Reactivate Customer", icon: RotateCcw }
    : { id: "suspend", label: "Suspend Customer", icon: Ban },
  { id: "delete", label: "Delete Customer", icon: Trash2, danger: true },
];

export const CUSTOMER_CONFIRM_ACTIONS = {
  suspend: {
    title: "Suspend this customer?",
    description: (c) => `${c.name} won't be able to place orders until they're reactivated.`,
    confirmLabel: "Suspend",
    tone: "danger",
  },
  reactivate: {
    title: "Reactivate this customer?",
    description: (c) => `${c.name} will be able to place orders again.`,
    confirmLabel: "Reactivate",
    tone: "default",
  },
  delete: {
    title: "Delete this customer?",
    description: (c) => `${c.name}'s account will be permanently removed. This can't be undone.`,
    confirmLabel: "Delete",
    tone: "danger",
  },
};
