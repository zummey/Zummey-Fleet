// Date helpers for the report builder. Dates are typed as DD/MM/YYYY and sent as YYYY-MM-DD.

const DAY_MS = 24 * 60 * 60 * 1000;
const pad = (n) => String(n).padStart(2, "0");

export const toIso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Keep digits only and insert the slashes as the user types: "0911" -> "09/11"
export const maskDate = (input) => {
  const digits = input.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join("/");
};

// "09/11/2026" -> Date, or null when it isn't a real calendar date
export const parseDate = (text) => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!match) return null;
  const [, dd, mm, yyyy] = match.map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  return d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd ? d : null;
};

export const formatShort = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// Presets cover full days ending yesterday
export const presetRange = (days) => {
  const to = new Date(startOfToday().getTime() - DAY_MS);
  const from = new Date(to.getFullYear(), to.getMonth(), to.getDate() - (days - 1));
  return { from, to };
};

const MAX_DAYS = 366;

/**
 * Validate the custom From / To fields.
 * Returns { range: { from, to } } when valid, otherwise { errors: { from?, to? } }.
 * Empty fields aren't errors yet; they just mean "not chosen".
 */
export const checkCustomRange = (fromText, toText) => {
  const errors = {};
  const from = parseDate(fromText);
  const to = parseDate(toText);
  const today = startOfToday();

  if (fromText.length === 10 && !from) errors.from = "That isn’t a real date";
  if (toText.length === 10 && !to) errors.to = "That isn’t a real date";
  if (from && from > today) errors.from = "Can’t be in the future";
  if (to && to > today) errors.to = "Can’t be in the future";
  if (from && to && !errors.from && !errors.to) {
    if (to < from) errors.to = "Must be on or after the start date";
    else if ((to - from) / DAY_MS + 1 > MAX_DAYS) errors.to = "A report can cover at most one year";
  }

  if (Object.keys(errors).length) return { errors };
  return from && to ? { range: { from, to } } : { errors: {} };
};
