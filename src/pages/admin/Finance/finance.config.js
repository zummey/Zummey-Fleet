// src/pages/admin/Finance/finance.config.js
//
// Single source of truth for the admin Finance & Reports screen:
// tabs, overview cards, chart ranges, transaction types / filters / export columns,
// payout and refund actions, and the copy for every confirm dialog.

import { TrendingUp, Banknote, Truck, RotateCcw } from "lucide-react";
import { formatMonthDay, formatNaira, formatTimestamp } from "../components/formatters";

export const FINANCE_TAB_PARAM = "tab";
export const FINANCE_PAGE_SIZE = 10;

export const FINANCE_TABS = [
  { id: "overview", label: "Overview" },
  { id: "transactions", label: "Transactions" },
  { id: "payouts", label: "Payouts" },
  { id: "refunds", label: "Refunds" },
];

export const getFinanceTabById = (id) => FINANCE_TABS.find((t) => t.id === id) ?? FINANCE_TABS[0];

// ---- Overview -----------------------------------------------------------------

// Same card shape as the admin dashboard (rendered with AdminStatCard)
export const OVERVIEW_CARDS = [
  { key: "revenue", label: "Revenue", icon: TrendingUp, iconBg: "bg-blue-50", iconColor: "text-blue-500", format: "currency", defaultTone: "positive" },
  { key: "riderPayouts", label: "Rider Payouts", icon: Banknote, iconBg: "bg-green-50", iconColor: "text-green-600", format: "currency", defaultTone: "positive" },
  { key: "fleetSettlements", label: "Fleet Settlements", icon: Truck, iconBg: "bg-fuchsia-50", iconColor: "text-fuchsia-500", format: "currency", defaultTone: "positive" },
  { key: "refunds", label: "Refunds", icon: RotateCcw, iconBg: "bg-orange-50", iconColor: "text-orange-500", format: "currency", defaultTone: "negative" },
];

export const REVENUE_RANGES = [
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "12m", label: "Last 12 months" },
];
export const DEFAULT_REVENUE_RANGE = "12m";

export const RECENT_TRANSACTIONS_COUNT = 5;

// ---- Transactions ---------------------------------------------------------------

// direction: "in" money received by Zummey (+, green) | "out" money paid out (−)
// partyLabel: what the other side is called in the details modal
export const TRANSACTION_TYPES = {
  order_payment: { label: "Order Payment", direction: "in", partyLabel: "Customer" },
  refund: { label: "Refund", direction: "out", partyLabel: "Customer" },
  rider_payout: { label: "Rider Payout", direction: "out", partyLabel: "Rider" },
  fleet_settlement: { label: "Fleet Settlement", direction: "out", partyLabel: "Fleet" },
  withdrawal: { label: "Withdrawal", direction: "out", partyLabel: "Account holder" },
};

export const transactionTypeLabel = (type) => TRANSACTION_TYPES[type]?.label ?? type;

// Filter panel groups. `param` is the URL key; the first option is the default.
// Values are sent to the API as-is (see admin.service.js filterTransactions).
export const TRANSACTION_FILTER_GROUPS = [
  {
    id: "type",
    param: "type",
    label: "Type",
    options: [
      { value: "all", label: "All" },
      { value: "order_payment", label: "Order Payment" },
      { value: "rider_payout", label: "Rider Payout" },
      { value: "fleet_settlement", label: "Fleet Settlement" },
      { value: "refund", label: "Refund" },
      { value: "withdrawal", label: "Withdrawal" },
    ],
  },
  {
    id: "status",
    param: "status",
    label: "Status",
    options: [
      { value: "any", label: "Any" },
      { value: "completed", label: "Successful" },
      { value: "processing", label: "Pending" },
      { value: "failed", label: "Failed" },
    ],
  },
];

export const TRANSACTION_EXPORT_COLUMNS = [
  { label: "Transaction ID", value: (t) => t.id, width: 16 },
  { label: "Date", value: (t) => formatTimestamp(t.date), width: 20 },
  { label: "Type", value: (t) => transactionTypeLabel(t.type), width: 16 },
  { label: "Amount (₦)", value: (t) => t.amount, width: 12 },
  { label: "Status", value: (t) => t.status.charAt(0).toUpperCase() + t.status.slice(1), width: 12 },
  { label: "Reference", value: (t) => t.reference, width: 14 },
  { label: "Party", value: (t) => t.party, width: 22 },
  { label: "Method", value: (t) => t.method, width: 14 },
];

// ---- Payouts --------------------------------------------------------------------

// Payout "approved" is blue in the design (refund "approved" stays green)
export const PAYOUT_STATUS_BADGES = {
  approved: { label: "Approved", className: "bg-blue-50 text-blue-500" },
};

export const RECIPIENT_TYPE_LABELS = { rider: "Rider", fleet: "Fleet" };

// Button styles for the inline row actions (payouts and refunds)
export const ACTION_BUTTON_STYLES = {
  approve: "bg-green-500 text-white hover:bg-green-600",
  release: "bg-blue-500 text-white hover:bg-blue-600",
  hold: "border border-orange-400 text-orange-500 hover:bg-orange-50",
  reject: "border border-red-400 text-red-500 hover:bg-red-50",
};

export const PAYOUT_ACTIONS = {
  approve: { label: "Approve Payout", style: "approve" },
  hold: { label: "Hold Payout", style: "hold" },
  release: { label: "Release Payout", style: "release" },
};

// Which buttons each status shows; statuses without actions show `doneText` instead
export const PAYOUT_ACTIONS_BY_STATUS = {
  pending_approval: ["approve", "hold"],
  approved: ["release", "hold"],
  on_hold: ["release"],
  released: [],
};
export const payoutDoneText = (p) => (p.status === "released" ? `Paid ${formatMonthDay(p.paidAt)}` : null);

export const PAYOUT_DIALOGS = {
  approve: {
    title: (p) => `Approve ${formatNaira(p.amount)} payout to ${p.recipient.name}?`,
    description: () => "The funds are reserved for this payout. You can release them when you are ready.",
    confirmLabel: "Approve payout",
    tone: "success",
  },
  release: {
    title: (p) => `Release ${formatNaira(p.amount)} to ${p.recipient.name}?`,
    description: (p) => `The money is sent to ${p.bank.name} account ending ${p.bank.last4}. This cannot be undone.`,
    confirmLabel: "Release payout",
    tone: "info",
  },
  hold: {
    title: (p) => `Hold payout for ${p.recipient.name}?`,
    description: () => "The money stays with Zummey until you release it. The payee is not told unless you add a note.",
    confirmLabel: "Hold payout",
    tone: "warning",
    noteLabel: "Internal note (optional)",
    notePlaceholder: "Add context for other admins",
    reasons: [
      { value: "open_complaint", label: "Open customer complaint" },
      { value: "bank_verification", label: "Bank details need verification" },
      { value: "suspected_fraud", label: "Suspected fraud" },
      { value: "incident_review", label: "Pending incident review" },
      { value: "other", label: "Other" },
    ],
  },
};

// ---- Refunds --------------------------------------------------------------------

export const REFUND_ACTIONS = {
  approve: { label: "Approve Refund", style: "approve" },
  reject: { label: "Reject Refund", style: "reject" },
};

export const REFUND_ACTIONS_BY_STATUS = {
  pending_approval: ["approve", "reject"],
  approved: [],
  rejected: [],
};
export const refundDoneText = (r) =>
  r.status === "approved"
    ? `Approved ${formatMonthDay(r.decidedAt)}`
    : r.status === "rejected"
      ? `Rejected ${formatMonthDay(r.decidedAt)}`
      : null;

// How long the money takes to show, by original payment method
const REFUND_ARRIVAL = {
  Card: "Card refunds can take 3 to 5 working days to show.",
  Transfer: "Bank transfers usually arrive within 24 hours.",
  Wallet: "Wallet refunds show instantly.",
};

export const REFUND_DIALOGS = {
  approve: {
    title: (r) => `Approve ${formatNaira(r.amount)} refund for ${r.customer}?`,
    description: (r) =>
      `The money returns to the original payment method (${r.method}). ${REFUND_ARRIVAL[r.method] ?? ""}`.trim(),
    confirmLabel: "Approve refund",
    tone: "success",
  },
  reject: {
    title: (r) => `Reject refund ${r.id}?`,
    description: () => "The customer is told the refund was not approved and why.",
    confirmLabel: "Reject refund",
    tone: "danger",
    noteLabel: "Message to customer (optional)",
    notePlaceholder: "Explain the decision in a sentence or two",
    reasons: [
      { value: "delivery_confirmed", label: "Delivery was confirmed by the recipient" },
      { value: "outside_window", label: "Outside the refund window" },
      { value: "not_enough_evidence", label: "Not enough evidence" },
      { value: "item_matches", label: "Item matches the order" },
      { value: "other", label: "Other" },
    ],
  },
};
