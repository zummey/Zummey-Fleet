// Promo campaigns — display rules, row actions and form checks

import { formatExpiry as formatDmy, parseDate, toIso, todayIso } from "./promotions.config";

export const AUDIENCES = [
  { id: "all", label: "All users" },
  { id: "new", label: "New customers" },
  { id: "groups", label: "Selected groups" },
];
export const audienceLabel = (id) => AUDIENCES.find((a) => a.id === id)?.label ?? id;

/** Dates win over the saved status: not started yet = scheduled, past the end date = ended. */
export const campaignState = (campaign) => {
  const today = todayIso();
  if (campaign.startsOn > today) return "scheduled";
  if (campaign.endsOn < today) return "ended";
  return campaign.status;
};

export const CAMPAIGN_BADGES = {
  active: { label: "Active", className: "bg-green-50 text-green-600" },
  paused: { label: "Paused", className: "bg-amber-50 text-amber-600" },
  scheduled: { label: "Scheduled", className: "bg-blue-50 text-blue-600" },
  ended: { label: "Ended", className: "bg-gray-100 text-gray-500" },
};

export const formatCampaignDates = (c) => `${formatDmy(c.startsOn)} to ${formatDmy(c.endsOn)}`;
export { formatDmy };

// Pause / resume only make sense while the campaign is running
export const campaignActions = (campaign) => {
  const state = campaignState(campaign);
  return [
    ...(state === "active" ? [{ id: "pause", label: "Pause" }] : []),
    ...(state === "paused" ? [{ id: "resume", label: "Resume" }] : []),
    { id: "edit", label: "Edit" },
    { id: "delete", label: "Delete", danger: true },
  ];
};

export const DELETE_CAMPAIGN = {
  title: "Delete campaign",
  description: (c) => `Delete ${c.name}? New orders will stop using it. This cannot be undone.`,
};

export const CAMPAIGN_NAME_MAX = 50;

const checkDate = (text, label) => {
  if (!text) return { error: `Enter ${label}` };
  const date = parseDate(text);
  if (!date) return { error: text.length === 10 ? "That isn’t a real date" : "Use the format DD/MM/YYYY" };
  return { iso: toIso(date) };
};

/**
 * Check the campaign form. `campaign` is the one being edited: dates it already had may stay
 * in the past (e.g. a running campaign's start date); new dates can't be.
 * Returns { values } or { errors }.
 */
export const checkCampaign = (form, campaign) => {
  const errors = {};
  const today = todayIso();
  const name = form.name.trim().replace(/\s+/g, " ");
  if (!name) errors.name = "Enter a campaign name";

  const digits = form.discount.trim();
  const discount = /^\d+$/.test(digits) ? Number(digits) : null;
  if (!digits) errors.discount = "Enter the discount";
  else if (discount === null) errors.discount = "Use a whole number";
  else if (discount < 1 || discount > 100) errors.discount = "Must be between 1 and 100";

  const start = checkDate(form.startsOn, "a start date");
  const end = checkDate(form.endsOn, "an end date");
  if (start.error) errors.startsOn = start.error;
  else if (start.iso < today && start.iso !== campaign?.startsOn) errors.startsOn = "Can’t be in the past";
  if (end.error) errors.endsOn = end.error;
  else if (end.iso < today && end.iso !== campaign?.endsOn) errors.endsOn = "Can’t be in the past";
  else if (start.iso && end.iso < start.iso) errors.endsOn = "Must be on or after the start date";

  if (Object.keys(errors).length) return { errors };
  return {
    values: { name, audience: form.audience, discount, startsOn: start.iso, endsOn: end.iso },
  };
};
