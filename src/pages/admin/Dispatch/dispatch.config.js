// src/pages/admin/Dispatch/dispatch.config.js
//
// Single source of truth for the admin Dispatch Management screen:
// stat cards, order priorities, the assign-order tabs and the manual-assignment reasons.

import { Package, UserRound, Truck } from "lucide-react";

export const DISPATCH_PAGE_SIZE = 10;
export const AVAILABLE_RIDERS_PREVIEW = 4;

// value formats: "number" | "percent"
export const DISPATCH_CARDS = [
  { key: "unassignedOrders", label: "Unassigned orders", icon: Package, iconBg: "bg-red-50", iconColor: "text-red-400", format: "number" },
  { key: "availableRiders", label: "Available Riders", icon: UserRound, iconBg: "bg-green-50", iconColor: "text-green-600", format: "number" },
  { key: "fleetAvailability", label: "Fleet availability", icon: Truck, iconBg: "bg-blue-50", iconColor: "text-blue-500", format: "percent" },
];

// Badge overrides for StatusBadge on the unassigned orders table
export const PRIORITY_BADGES = {
  pending: { label: "Pending", className: "bg-orange-50 text-orange-500" },
  urgent: { label: "Urgent", className: "bg-red-50 text-red-500" },
};

// A fleet is "Full" when none of its riders are free
export const fleetAvailabilityBadge = (fleet) =>
  fleet.freeRiders > 0
    ? { label: "Available", className: "bg-green-50 text-green-600", bar: "bg-green-600" }
    : { label: "Full", className: "bg-red-50 text-red-500", bar: "bg-red-400" };

// ---- Assign order -------------------------------------------------------------

// `kind` is what the API calls the assignee type
export const ASSIGN_TABS = [
  { id: "rider", label: "Suggested riders", manualLabel: "Rider", noun: "rider" },
  { id: "fleet", label: "Suggested fleets", manualLabel: "Fleet", noun: "fleet" },
];

export const getAssignTab = (id) => ASSIGN_TABS.find((t) => t.id === id) ?? ASSIGN_TABS[0];

export const SUGGESTION_HINT = "Ranked by distance, rating and speed";

export const MANUAL_REASONS = [
  { value: "customer_request", label: "Customer request" },
  { value: "knows_area", label: "Rider knows the area" },
  { value: "special_handling", label: "Special handling" },
  { value: "other", label: "Other" },
];

// Reasons that need a written note before the assignment can be saved
export const NOTE_REQUIRED_REASONS = ["other"];

// "Order details" strip at the top of the assign page
export const ORDER_FIELDS = [
  { key: "pickup", label: "Pickup" },
  { key: "dropoff", label: "Drop-off" },
  { key: "distanceKm", label: "Distance", format: (v) => `${v} km` },
  { key: "package", label: "Package" },
];

// Second line under a candidate's name.
// Suggestions show distance ("Swift Dispatch · 1.4 km from pickup"); the manual list shows rating.
// A rider's fleet ("Independent" when none), or how many riders a fleet has free
export const candidateAffiliation = (candidate) =>
  candidate.kind === "fleet" ? `${candidate.freeRiders} riders free` : candidate.fleet;

export const candidateSubtitle = (candidate, { compact = false } = {}) => {
  const who = candidateAffiliation(candidate);
  return compact ? `${who} · ★ ${candidate.rating}` : `${who} · ${candidate.distanceKm} km from pickup`;
};

// "Expected delivery by 15:47"
export const expectedBy = (etaMinutes, from = new Date()) =>
  new Date(from.getTime() + etaMinutes * 60_000).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
