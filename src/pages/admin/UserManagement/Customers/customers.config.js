// src/pages/admin/UserManagement/Customers/customers.config.js
//
// Single source of truth for the admin Customers screen:
// summary cards source, table columns, filters, export columns and URL params.

import { formatLongDate } from "../../components/formatters";

export const CUSTOMERS_PAGE_SIZE = 10;

// Which admin dashboard stat tab feeds the summary cards (same numbers as the dashboard)
export const CUSTOMERS_SUMMARY_TAB_ID = "customers";

// Table state lives in the URL so refresh/back keeps the same view
export const CUSTOMER_QUERY_PARAMS = { page: "page", search: "q" };

// Filter panel groups. `param` is the URL key; the first option is the default.
export const CUSTOMER_FILTER_GROUPS = [
  {
    id: "status",
    param: "status",
    label: "Status",
    options: [
      { value: "all", label: "All" },
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "suspended", label: "Suspended" },
    ],
  },
  {
    id: "minOrders",
    param: "orders",
    label: "Total Orders",
    options: [
      { value: "any", label: "Any" },
      { value: "10", label: "10+ orders" },
      { value: "20", label: "20+ orders" },
    ],
  },
];

// Filter panel selection -> API query params
export const toCustomerQuery = (filters) => ({
  status: filters.status,
  minOrders: filters.minOrders === "any" ? 0 : Number(filters.minOrders),
});

export const CUSTOMER_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "phone", label: "Phone Number" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
  { key: "totalOrders", label: "Total Orders" },
  { key: "dateJoined", label: "Date Joined" },
];

// Columns for CSV / Excel / PDF export. `width` is the Excel column width in characters.
export const CUSTOMER_EXPORT_COLUMNS = [
  { label: "Customer ID", value: (c) => c.code, width: 14 },
  { label: "Name", value: (c) => c.name, width: 22 },
  { label: "Phone Number", value: (c) => c.phone, width: 16 },
  { label: "Email", value: (c) => c.email, width: 32 },
  { label: "Status", value: (c) => c.status.charAt(0).toUpperCase() + c.status.slice(1), width: 12 },
  { label: "Total Orders", value: (c) => c.totalOrders, width: 13 },
  { label: "Date Joined", value: (c) => formatLongDate(c.dateJoined), width: 18 },
];
