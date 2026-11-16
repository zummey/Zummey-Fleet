// src/pages/admin/Incidents/incidents.config.js
//
// Single source of truth for the admin Incident Management screens:
// list filters, labels and badges, which actions each status allows,
// the status banners, and the copy for every popup.

import { formatMonthDayTime } from "../components/formatters";

export const INCIDENTS_PATH = "/incident-management";
export const INCIDENTS_PAGE_SIZE = 10;

export const INCIDENT_TYPES = {
  package_damage: "Package Damage",
  late_delivery: "Late Delivery",
  lost_item: "Lost Item",
  payment_dispute: "Payment Dispute",
  rider_misconduct: "Rider Misconduct",
};
export const incidentTypeLabel = (type) => INCIDENT_TYPES[type] ?? type;

// Incident colours differ from the shared defaults (e.g. "open" is blue here, not red)
export const INCIDENT_STATUS_BADGES = {
  open: { label: "Open", className: "bg-blue-50 text-blue-500" },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-600" },
  escalated: { label: "Escalated", className: "bg-orange-50 text-orange-500" },
  resolved: { label: "Resolved", className: "bg-green-50 text-green-600" },
  closed: { label: "Closed", className: "bg-gray-100 text-gray-500" },
};

export const PRIORITY_BADGES = {
  high: { label: "High priority", className: "bg-red-50 text-red-500" },
};

export const INCIDENT_FILTER_GROUPS = [
  {
    id: "status",
    param: "status",
    label: "Status",
    options: [
      { value: "all", label: "All" },
      { value: "open", label: "Open" },
      { value: "pending", label: "Pending" },
      { value: "resolved", label: "Resolved" },
      { value: "escalated", label: "Escalated" },
      { value: "closed", label: "Closed" },
    ],
  },
];

export const INCIDENT_ROW_ACTIONS = [{ id: "view", label: "View details" }];

// ---- Details: header actions per status ------------------------------------------

// style: "outline" | "warning" | "success" | "dark"
export const INCIDENT_ACTIONS = {
  assign: { label: (inc) => (inc.assignedAdmin ? "Reassign" : "Assign"), style: "outline" },
  escalate: { label: () => "Escalate", style: "warning" },
  resolve: { label: () => "Resolve", style: "success" },
  close: { label: () => "Close incident", style: "dark" },
};

export const ACTIONS_BY_STATUS = {
  open: ["assign", "escalate", "resolve"],
  pending: ["assign", "escalate", "resolve"],
  escalated: ["assign", "resolve"],
  resolved: ["close"],
  closed: [],
};

export const ACTION_BUTTON_STYLES = {
  outline: "border border-gray-300 bg-white text-[#343C6A] hover:bg-gray-50",
  warning: "border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100",
  success: "bg-green-600 text-white hover:bg-green-700",
  dark: "bg-[#0B1437] text-white hover:bg-[#1c2657]",
};

// ---- Escalate / resolve options ---------------------------------------------------

export const ESCALATION_TARGETS = [
  { value: "team_lead", label: "Team lead" },
  { value: "operations_manager", label: "Operations manager" },
  { value: "safety_legal", label: "Safety and legal" },
];

export const RESOLUTION_OUTCOMES = [
  { value: "refund_issued", label: "Refund issued" },
  { value: "replacement_sent", label: "Replacement sent" },
  { value: "rider_warned", label: "Rider warned" },
  { value: "no_action_needed", label: "No action needed" },
  { value: "other", label: "Other" },
];

const labelFrom = (options, value) => options.find((o) => o.value === value)?.label ?? value;
export const escalationLabel = (value) => labelFrom(ESCALATION_TARGETS, value);
export const outcomeLabel = (value) => labelFrom(RESOLUTION_OUTCOMES, value);

// ---- Status banners -----------------------------------------------------------------

// Returns { tone, title, text } or null. tone: "warning" | "success" | "neutral"
export const statusBanner = (inc) => {
  if (inc.status === "escalated" && inc.escalation) {
    return { tone: "warning", title: `Escalated to ${escalationLabel(inc.escalation.to)}.`, text: inc.escalation.reason };
  }
  if (inc.status === "resolved" && inc.resolution) {
    const note = inc.resolution.note ? `${inc.resolution.note} ` : "";
    return {
      tone: "success",
      title: `Resolved: ${outcomeLabel(inc.resolution.outcome)}.`,
      text: `${note}Close the incident once the customer has confirmed.`,
    };
  }
  if (inc.status === "closed") {
    return { tone: "neutral", title: "This incident is closed.", text: "No further actions can be taken." };
  }
  return null;
};

export const BANNER_STYLES = {
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  success: "border-green-200 bg-green-50 text-green-700",
  neutral: "border-gray-200 bg-gray-100 text-gray-600",
};

// ---- Details: description fields, log, composer ----------------------------------------

// "Package damage · reported Oct 22, 09:02"
export const incidentSubtitle = (inc) => {
  const type = incidentTypeLabel(inc.type);
  return `${type.charAt(0)}${type.slice(1).toLowerCase()} · reported ${formatMonthDayTime(inc.reportedAt)}`;
};

export const LOG_ROLE_BADGES = {
  customer: { label: "Customer", className: "bg-blue-50 text-blue-500" },
  rider: { label: "Rider", className: "bg-green-50 text-green-600" },
  admin: { label: "Admin", className: "bg-violet-50 text-violet-500" },
};

// Shown next to admin entries so it's clear who could see them
export const LOG_KIND_LABELS = {
  internal: "Internal note",
  reporter: "Sent to reporter",
};

export const NOTE_KINDS = [
  { id: "internal", label: "Internal note", placeholder: "Only admins can see this note" },
  { id: "reporter", label: "Message to reporter", placeholder: "The person who reported this will get this message" },
];

// ---- Popup copy -----------------------------------------------------------------------

export const DIALOGS = {
  assign: {
    title: (inc) => `Assign ${inc.id}`,
    description: "The admin you choose will be notified and becomes responsible for this incident.",
  },
  escalate: {
    title: (inc) => `Escalate ${inc.id}`,
    description: "Send this incident to someone with more authority. The status changes to Escalated.",
    reasonsLabel: "Escalate to",
    noteLabel: "Why is this being escalated?",
    notePlaceholder: "Give the person the context they need",
    noteHint: "Add the reason so the person knows what they’re picking up.",
    confirmLabel: "Escalate",
  },
  resolve: {
    title: (inc) => `Resolve ${inc.id}`,
    description: "Record what was done so the case is clear to anyone who reads it later.",
    reasonsLabel: "Outcome",
    noteLabel: "Resolution note (optional)",
    notePlaceholder: "Describe what you did",
    noteHint: "Describe what you did when choosing “Other”.",
    confirmLabel: "Mark as resolved",
  },
  close: {
    title: (inc) => `Close ${inc.id}?`,
    description: "Closing archives the incident. It stays in the list as Closed, but no one can add notes or change it.",
    notice: "This cannot be undone.",
    confirmLabel: "Close incident",
  },
};
