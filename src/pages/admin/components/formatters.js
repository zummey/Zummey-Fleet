// Shared date/size formatters for admin pages.

// "2026-07-06" is parsed as UTC by Date, which can show the previous day in
// timezones behind UTC — treat date-only strings as local dates instead.
const toDate = (value) => new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);

export const formatLongDate = (value) =>
  value
    ? toDate(value).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "—";

export const formatShortDate = (value) =>
  value
    ? toDate(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

export const formatFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${Math.round(bytes / 1024)}KB`;
};

export const formatDateTime = (value) =>
  value
    ? toDate(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

export const formatNaira = (amount) => (amount == null ? "—" : `₦${Number(amount).toLocaleString()}`);
