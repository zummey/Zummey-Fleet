// Pricing Management (super admin) — tabs, overview cards, surge rule rules and copy

export const PRICING_TABS = [
  { id: "dashboard", label: "Pricing Dashboard" },
  { id: "configuration", label: "Pricing Configuration" },
  { id: "promotions", label: "Promotions & Discounts" },
];

export const getPricingTab = (id) => PRICING_TABS.find((t) => t.id === id) ?? PRICING_TABS[0];

// ---- Base delivery / distance charge cards (both editable) ----------------------------

const km = (n) => `${n} km`;

export const RATE_CARDS = [
  {
    id: "baseFare",
    title: "Base Delivery",
    suffix: null,
    caption: (rates) => `Flat rate, first ${km(rates.baseDistanceKm)}`,
    edit: {
      title: "Edit base delivery price",
      label: "Base delivery price",
      description: (rates) => `The flat price of every delivery. It covers the first ${km(rates.baseDistanceKm)}.`,
    },
  },
  {
    id: "perKm",
    title: "Distance Charges",
    suffix: "/km",
    caption: (rates) => `After first ${km(rates.baseDistanceKm)}`,
    edit: {
      title: "Edit distance charge",
      label: "Price per km",
      description: (rates) => `Added for each km after the first ${km(rates.baseDistanceKm)}.`,
    },
  },
];

export const RATE_LIMITS = { min: 1, max: 1_000_000 };

// Shown in every edit dialog so admins know what a change affects
export const PRICE_CHANGE_NOTICE = "Applies to new orders. Orders already placed keep their price.";

// ---- Surge rules ------------------------------------------------------------------------

export const SURGE_BADGES = {
  active: { label: "Active", className: "bg-green-50 text-green-600" },
  paused: { label: "Paused", className: "bg-amber-50 text-amber-600" },
};

export const MULTIPLIER_LIMITS = { min: 1.01, max: 5 };
export const formatMultiplier = (value) => `×${Number(value)}`;

export const SURGE_FIELD_LIMITS = { name: 40, appliesWhen: 120 };

/** Returns { values } when valid, otherwise { errors } keyed by field. */
export const checkSurgeRule = ({ name, appliesWhen, multiplier }) => {
  const errors = {};
  if (!name.trim()) errors.name = "Enter a name for the rule";
  if (!appliesWhen.trim()) errors.appliesWhen = "Say when the rule applies";

  const text = multiplier.trim();
  const value = Number(text);
  if (!text) errors.multiplier = "Enter a price multiplier";
  else if (!/^\d+(\.\d{1,2})?$/.test(text) || Number.isNaN(value)) errors.multiplier = "Use a number like 1.3";
  else if (value < MULTIPLIER_LIMITS.min || value > MULTIPLIER_LIMITS.max) {
    errors.multiplier = `Must be more than 1 and at most ${MULTIPLIER_LIMITS.max}`;
  }

  return Object.keys(errors).length
    ? { errors }
    : { values: { name: name.trim(), appliesWhen: appliesWhen.trim(), multiplier: value } };
};

export const SURGE_DIALOGS = {
  create: { title: "Create surge rule", submit: "Create", pending: "Creating..." },
  edit: { title: "Edit surge rule", submit: "Save changes", pending: "Saving..." },
  delete: {
    title: "Delete surge rule",
    description: (rule) => `Delete ${rule.name}? New orders will stop using it. This cannot be undone.`,
    confirmLabel: "Delete",
  },
};

export const surgeActions = (rule) => [
  rule.status === "active" ? { id: "pause", label: "Pause" } : { id: "resume", label: "Resume" },
  { id: "edit", label: "Edit" },
  { id: "delete", label: "Delete", danger: true },
];
