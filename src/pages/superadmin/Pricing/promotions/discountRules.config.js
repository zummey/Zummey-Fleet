// Discount rules — automatic discounts triggered by the order (first order, big order, every Nth)

const MAX_AMOUNT = 10_000_000;
const MAX_NTH = 1000;

/**
 * Each trigger says what its threshold means. "First order" has none, so its field is hidden
 * (the design's single "Amount or number" field asked for 0 there).
 */
export const TRIGGERS = [
  { id: "first_order", label: "First order", threshold: null },
  {
    id: "above_amount",
    label: "Order above an amount",
    threshold: {
      label: "Order amount ₦",
      prefix: "₦",
      placeholder: "10,000",
      hint: "Orders costing more than this get the discount.",
      min: 1,
      max: MAX_AMOUNT,
      emptyError: "Enter the order amount",
      rangeError: `Must be between ₦1 and ₦${MAX_AMOUNT.toLocaleString()}`,
    },
  },
  {
    id: "every_nth",
    label: "Every Nth order",
    threshold: {
      label: "Every how many orders (N)",
      prefix: null,
      placeholder: "5",
      hint: "e.g. 5 gives the discount on a customer’s 5th, 10th, 15th order and so on.",
      min: 2,
      max: MAX_NTH,
      emptyError: "Enter N",
      rangeError: `Must be between 2 and ${MAX_NTH}`,
    },
  },
];

export const triggerOf = (id) => TRIGGERS.find((t) => t.id === id) ?? TRIGGERS[0];

// "first_order" -> "First order"; "above_amount" 10000 -> "Orders above ₦10,000"; "every_nth" 5 -> "Every 5th order"
const ordinal = (n) => {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th");
  return `${n}${suffix}`;
};
export const describeTrigger = (rule) => {
  if (rule.trigger === "above_amount") return `Orders above ₦${rule.threshold.toLocaleString()}`;
  if (rule.trigger === "every_nth") return `Every ${ordinal(rule.threshold)} order`;
  return "First order";
};

export const RULE_BADGES = {
  active: { label: "Active", className: "bg-green-50 text-green-600" },
  paused: { label: "Paused", className: "bg-amber-50 text-amber-600" },
};

export const ruleActions = (rule) => [
  rule.status === "active" ? { id: "pause", label: "Pause" } : { id: "resume", label: "Resume" },
  { id: "edit", label: "Edit" },
  { id: "delete", label: "Delete", danger: true },
];

export const DELETE_RULE = {
  title: "Delete discount rule",
  description: (r) => `Delete ${r.name}? New orders will stop using it. This cannot be undone.`,
};

export const RULE_NAME_MAX = 50;

const wholeNumber = (text) => {
  const digits = text.replace(/,/g, "").trim();
  return /^\d+$/.test(digits) ? Number(digits) : null;
};

/** Returns { values } or { errors }. */
export const checkDiscountRule = (form) => {
  const errors = {};
  const name = form.name.trim().replace(/\s+/g, " ");
  if (!name) errors.name = "Enter a rule name";

  const { threshold: spec } = triggerOf(form.trigger);
  let threshold = 0;
  if (spec) {
    threshold = wholeNumber(form.threshold);
    if (!form.threshold.trim()) errors.threshold = spec.emptyError;
    else if (threshold === null) errors.threshold = "Use a whole number";
    else if (threshold < spec.min || threshold > spec.max) errors.threshold = spec.rangeError;
  }

  const discount = wholeNumber(form.discount);
  if (!form.discount.trim()) errors.discount = "Enter the discount";
  else if (discount === null) errors.discount = "Use a whole number";
  else if (discount < 1 || discount > 100) errors.discount = "Must be between 1 and 100";

  if (Object.keys(errors).length) return { errors };
  return { values: { name, trigger: form.trigger, threshold, discount } };
};
