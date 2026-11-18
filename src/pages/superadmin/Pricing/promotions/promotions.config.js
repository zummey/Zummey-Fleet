// Promotions & Discounts — sub-tabs, coupon display rules, filters and form checks

import { maskDate, parseDate, toIso } from "../../../admin/Analytics/reports/reportDates";

export { maskDate, parseDate, toIso };

export const PROMO_SECTIONS = [
  { id: "coupons", label: "Coupon Creation", ready: true },
  { id: "campaigns", label: "Promo Campaigns", ready: true },
  { id: "rules", label: "Discount Rules", ready: true },
];

// ---- Display -------------------------------------------------------------------------------

export const todayIso = () => toIso(new Date());

/**
 * What customers see: a coupon past its expiry date or used up stops working whatever its
 * saved status, so those win over active / paused.
 */
export const couponState = (coupon) => {
  if (coupon.expiresOn < todayIso()) return "expired";
  if (coupon.used >= coupon.usageLimit) return "used_up";
  return coupon.status;
};

export const COUPON_BADGES = {
  active: { label: "Active", className: "bg-green-50 text-green-600" },
  paused: { label: "Paused", className: "bg-amber-50 text-amber-600" },
  expired: { label: "Expired", className: "bg-gray-100 text-gray-500" },
  used_up: { label: "Used up", className: "bg-gray-100 text-gray-500" },
};

export const formatDiscount = (coupon) =>
  coupon.type === "percent" ? `${coupon.value}% off` : `₦${coupon.value.toLocaleString()} off`;

// "2026-12-31" -> "31/12/2026"
export const formatExpiry = (iso) => iso.split("-").reverse().join("/");

export const couponActions = (coupon) => {
  const state = couponState(coupon);
  return [
    ...(state === "active" ? [{ id: "pause", label: "Pause" }] : []),
    ...(state === "paused" ? [{ id: "resume", label: "Resume" }] : []),
    { id: "edit", label: "Edit" },
    { id: "delete", label: "Delete", danger: true },
  ];
};

export const COUPON_FILTERS = [
  {
    id: "state",
    label: "Status",
    options: [
      { value: "all", label: "All" },
      { value: "active", label: "Active" },
      { value: "paused", label: "Paused" },
      { value: "expired", label: "Expired" },
      { value: "used_up", label: "Used up" },
    ],
  },
  {
    id: "type",
    label: "Type of discount",
    options: [
      { value: "all", label: "All" },
      { value: "percent", label: "Percent off" },
      { value: "fixed", label: "Fixed amount off" },
    ],
  },
];

export const filterCoupons = (coupons, { state, type }) =>
  coupons.filter(
    (c) => (state === "all" || couponState(c) === state) && (type === "all" || c.type === type)
  );

export const DELETE_COUPON = {
  title: "Delete coupon",
  description: (coupon) =>
    `Delete ${coupon.code}? Customers will no longer be able to use this code. This cannot be undone.`,
};

// ---- Form ------------------------------------------------------------------------------------

export const DISCOUNT_TYPES = [
  { id: "percent", label: "Percent off" },
  { id: "fixed", label: "Fixed amount off" },
];

export const CODE_LIMITS = { min: 3, max: 20 };
const MAX_FIXED = 1_000_000;
const MAX_USES = 10_000_000;

// Codes are typed by customers, so keep them to capital letters and digits
export const cleanCode = (text) => text.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LIMITS.max);

const wholeNumber = (text) => {
  const digits = text.replace(/,/g, "").trim();
  return /^\d+$/.test(digits) ? Number(digits) : null;
};

/**
 * Check the coupon form. `coupon` is the one being edited (its usage limits the new values).
 * Returns { values } or { errors }.
 */
export const checkCoupon = (form, coupon) => {
  const errors = {};

  if (!form.code) errors.code = "Enter a coupon code";
  else if (form.code.length < CODE_LIMITS.min) errors.code = `Use at least ${CODE_LIMITS.min} letters or numbers`;

  const value = wholeNumber(form.value);
  if (!form.value.trim()) errors.value = "Enter the discount";
  else if (value === null) errors.value = "Use a whole number";
  else if (form.type === "percent" && (value < 1 || value > 100)) errors.value = "Must be between 1 and 100";
  else if (form.type === "fixed" && (value < 1 || value > MAX_FIXED)) {
    errors.value = `Must be between ₦1 and ₦${MAX_FIXED.toLocaleString()}`;
  }

  const usageLimit = wholeNumber(form.usageLimit);
  const used = coupon?.used ?? 0;
  if (!form.usageLimit.trim()) errors.usageLimit = "Enter how many times it can be used";
  else if (usageLimit === null) errors.usageLimit = "Use a whole number";
  else if (usageLimit < Math.max(1, used)) {
    errors.usageLimit = used ? `It has already been used ${used.toLocaleString()} times` : "Must be at least 1";
  } else if (usageLimit > MAX_USES) errors.usageLimit = `Must be at most ${MAX_USES.toLocaleString()}`;

  const expiry = parseDate(form.expiresOn);
  if (!form.expiresOn) errors.expiresOn = "Enter an expiry date";
  else if (!expiry) errors.expiresOn = form.expiresOn.length === 10 ? "That isn’t a real date" : "Use the format DD/MM/YYYY";
  // An expired coupon can still be edited without moving its date; a new date can't be in the past
  else if (toIso(expiry) < todayIso() && toIso(expiry) !== coupon?.expiresOn) errors.expiresOn = "Can’t be in the past";

  if (Object.keys(errors).length) return { errors };
  return { values: { code: form.code, type: form.type, value, usageLimit, expiresOn: toIso(expiry) } };
};
