// Pricing Configuration sub-tabs. Each ready section is a price list driven by this config:
// table columns, create / edit form fields and dialog copy all come from here.

import { formatNaira } from "../../../admin/components/formatters";

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
  "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
  "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const STATE_INCLUDED_KM = 3; // the base fee covers this many km

/**
 * field types (each has `emptyError`, shown when left blank):
 *  - "choice": dropdown of `options`; options already priced are left out (one price per name)
 *  - "chips":  pick one; the options are the names in another price list (`optionsFrom`),
 *              e.g. a city can only be in a state that has a state price
 *  - "text":   free text up to `maxLength`
 *  - "naira":  whole naira between `min` and RATE_MAX, optional `hint`
 *  - "number": between `min` and `max` with up to `decimals` decimal places; optional
 *              `prefix` / `suffix` shown in the input (e.g. "×", "kg") and `hint`
 *
 * Rows are sorted by `sortBy` (default "name"). Optional per section:
 *  - nameOf(row): display name when rows have no `name` (weight bands: "0 to 5 kg")
 *  - validate(values, otherRows): cross-field / cross-row errors, e.g. overlapping bands
 * Columns show row[key], or `value(row)` when given, formatted by `format`.
 */
export const RATE_MAX = 1_000_000;

export const CONFIG_SECTIONS = [
  {
    id: "state",
    label: "State Pricing",
    ready: true,
    title: "State pricing",
    noun: "state",
    createButton: "Create state price",
    empty: { title: "No state prices yet", description: "Set a delivery price for each state you operate in." },
    fields: [
      {
        key: "name",
        label: "State name",
        type: "choice",
        options: NIGERIAN_STATES,
        placeholder: "Choose a state",
        emptyError: "Choose a state",
      },
      { key: "baseFee", label: "Base delivery fee ₦", type: "naira", min: 1, emptyError: "Enter a base delivery fee" },
      {
        key: "perKm",
        label: `Price per km after the first ${STATE_INCLUDED_KM} km ₦`,
        type: "naira",
        min: 0,
        emptyError: "Enter a price per km",
      },
    ],
    // format: "naira" shows ₦1,200; strong: bold text
    columns: [
      { key: "name", label: "State", strong: true },
      { key: "baseFee", label: "Base delivery fee", format: "naira" },
      { key: "perKm", label: `Price per km after the first ${STATE_INCLUDED_KM} km`, format: "naira" },
    ],
  },
  {
    id: "city",
    label: "City Pricing",
    ready: true,
    title: "City pricing",
    noun: "city",
    createButton: "Create city price",
    empty: {
      title: "No city prices yet",
      description: "Add an extra charge for deliveries in a city or area, on top of its state price.",
    },
    fields: [
      { key: "name", label: "City or area", type: "text", maxLength: 60, emptyError: "Enter a city or area" },
      {
        key: "state",
        label: "State",
        type: "chips",
        optionsFrom: "state",
        emptyError: "Choose a state",
        noOptions: "Add a state price first. A city can only be in a state that has a price.",
      },
      {
        key: "extraCharge",
        label: "Extra charge ₦",
        type: "naira",
        min: 0,
        hint: "Use 0 for no extra charge.",
        emptyError: "Enter an extra charge, or 0",
      },
    ],
    columns: [
      { key: "name", label: "City or area", strong: true },
      { key: "state", label: "State" },
      { key: "extraCharge", label: "Extra charge", format: "naira" },
    ],
  },
  {
    id: "vehicle",
    label: "Vehicle Pricing",
    ready: true,
    title: "Vehicle pricing",
    noun: "vehicle",
    createButton: "Create vehicle price",
    sortBy: "maxWeight", // smallest vehicle first: Bike, Car, Van, Truck
    empty: {
      title: "No vehicle prices yet",
      description: "Add the vehicles riders use and how much each one changes the price.",
    },
    fields: [
      { key: "name", label: "Vehicle", type: "text", maxLength: 30, emptyError: "Enter a vehicle type" },
      {
        key: "multiplier",
        label: "Price multiplier",
        type: "number",
        decimals: 2,
        min: 0.1,
        max: 10,
        prefix: "×",
        hint: "1 keeps the normal price; 1.6 makes it 60% more.",
        emptyError: "Enter a price multiplier",
      },
      {
        key: "maxWeight",
        label: "Maximum weight kg",
        type: "number",
        decimals: 0,
        min: 1,
        max: 50_000,
        suffix: "kg",
        emptyError: "Enter the maximum weight",
      },
    ],
    columns: [
      { key: "name", label: "Vehicle", strong: true },
      { key: "multiplier", label: "Price multiplier", format: "multiplier" },
      { key: "maxWeight", label: "Maximum weight", format: "kg" },
    ],
  },
  {
    id: "weight",
    label: "Weight Pricing",
    ready: true,
    title: "Weight pricing",
    noun: "weight band",
    createButton: "Create weight band",
    sortBy: "from",
    // Bands have no name of their own; "0 to 5 kg" is used in the table, menus and dialogs
    nameOf: (row) => weightBandName(row),
    empty: {
      title: "No weight bands yet",
      description: "Add an extra fee for heavier parcels, e.g. ₦300 for 5 to 15 kg.",
    },
    fields: [
      { key: "from", label: "From (kg)", type: "number", decimals: 1, min: 0, max: 50_000, emptyError: "Enter the starting weight" },
      { key: "to", label: "Up to (kg)", type: "number", decimals: 1, min: 0.1, max: 50_000, emptyError: "Enter the top weight" },
      { key: "extraFee", label: "Extra fee ₦", type: "naira", min: 0, hint: "Use 0 for no extra fee.", emptyError: "Enter an extra fee, or 0" },
    ],
    // A parcel heavier than `from` and up to and including `to` is in the band, so 0–5 and 5–15 don't overlap
    validate: (values, otherRows) => {
      if (values.to <= values.from) return { to: "Must be more than the starting weight" };
      const clash = otherRows.find((r) => values.from < r.to && values.to > r.from);
      return clash ? { to: `Overlaps the ${weightBandName(clash)} band` } : null;
    },
    columns: [
      { key: "band", label: "Weight band", strong: true, value: (row) => weightBandName(row) },
      { key: "extraFee", label: "Extra fee", format: "naira" },
    ],
  },
];

function weightBandName(row) {
  return `${Number(row.from).toLocaleString()} to ${Number(row.to).toLocaleString()} kg`;
}

export const getConfigSection = (id) => CONFIG_SECTIONS.find((s) => s.id === id) ?? CONFIG_SECTIONS[0];

/** Display name of a row: its `name`, or the section's `nameOf` (e.g. weight bands) */
export const rowName = (section, row) => (section.nameOf ? section.nameOf(row) : row.name);

export const CELL_FORMATS = {
  naira: formatNaira,
  multiplier: (value) => `×${Number(value)}`,
  kg: (value) => `${Number(value).toLocaleString()} kg`,
};

export const ROW_ACTIONS = [
  { id: "edit", label: "Edit" },
  { id: "delete", label: "Delete", danger: true },
];

export const priceDialogs = (section) => ({
  create: { title: `Create ${section.noun}`, submit: "Create", pending: "Creating..." },
  edit: { title: `Edit ${section.noun}`, submit: "Save changes", pending: "Saving..." },
  delete: {
    title: `Delete ${section.noun}`,
    description: (row) => `Delete ${rowName(section, row)}? New orders will stop using it. This cannot be undone.`,
    confirmLabel: "Delete",
  },
});

/**
 * Validate form text against the section's fields, then the section's own `validate`
 * (checks across fields / other rows). Returns { values } or { errors }.
 * rows: the section's current rows; editingId: the row being edited, if any.
 */
export const checkPriceForm = (section, form, rows = [], editingId = null) => {
  const result = checkFields(section.fields, form);
  if (result.errors || !section.validate) return result;
  const errors = section.validate(result.values, rows.filter((r) => r.id !== editingId));
  return errors ? { errors } : result;
};

const checkFields = (fields, form) => {
  const errors = {};
  const values = {};
  fields.forEach((field) => {
    // Collapse repeated spaces so "Benin  City" and "Benin City" count as the same name
    const text = (form[field.key] ?? "").trim().replace(/\s+/g, " ");
    if (!text) {
      errors[field.key] = field.emptyError;
      return;
    }
    if (field.type === "number") {
      const pattern = field.decimals ? new RegExp(`^\\d+(\\.\\d{1,${field.decimals}})?$`) : /^\d+$/;
      const value = Number(text.replace(/,/g, ""));
      if (!pattern.test(text.replace(/,/g, ""))) {
        errors[field.key] = field.decimals ? "Use a number like 1.5" : "Use a whole number";
      } else if (value < field.min || value > field.max) {
        errors[field.key] = `Must be between ${field.min} and ${field.max.toLocaleString()}`;
      } else values[field.key] = value;
      return;
    }
    if (field.type !== "naira") {
      values[field.key] = text;
      return;
    }
    const digits = text.replace(/,/g, "");
    if (!/^\d+$/.test(digits)) errors[field.key] = "Use whole naira, e.g. 1200";
    else if (Number(digits) < field.min) errors[field.key] = `Must be at least ₦${field.min}`;
    else if (Number(digits) > RATE_MAX) errors[field.key] = `Must be at most ₦${RATE_MAX.toLocaleString()}`;
    else values[field.key] = Number(digits);
  });
  return Object.keys(errors).length ? { errors } : { values };
};
