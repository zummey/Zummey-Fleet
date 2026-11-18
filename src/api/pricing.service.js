// import api from "./axios";

// ---------------------------------------------------------------------------
// Pricing management (super admin)
// TODO: Replace mocks with real endpoints once the backend is ready, e.g.
//   getPricingRates     -> api.get("/admin/pricing/rates/")
//   updatePricingRates  -> api.patch("/admin/pricing/rates/", { baseFare } | { perKm })
//   getSurgeRules       -> api.get("/admin/pricing/surge-rules/")
//   createSurgeRule     -> api.post("/admin/pricing/surge-rules/", { name, appliesWhen, multiplier })
//   updateSurgeRule     -> api.patch(`/admin/pricing/surge-rules/${id}/`, { name?, appliesWhen?, multiplier?, status? })
//   deleteSurgeRule     -> api.delete(`/admin/pricing/surge-rules/${id}/`)
//
// Amounts are whole naira. A surge rule's multiplier scales the whole delivery price
// (e.g. 1.3 = 30% more). status: "active" | "paused".
// ---------------------------------------------------------------------------

const delay = (data, ms = 450) => new Promise((resolve) => setTimeout(() => resolve(data), ms));
const fail = (message, ms = 450) => new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));
const copy = (value) => JSON.parse(JSON.stringify(value));

let rates = {
  baseFare: 800, // flat price for every delivery...
  baseDistanceKm: 1, // ...which covers this many km
  perKm: 150, // charged for each km after that
};

let rules = [
  { id: "surge-1", name: "Rush hour", appliesWhen: "Weekdays, 7 am to 9 am and 5 pm to 8 pm", multiplier: 1.3, status: "active" },
  { id: "surge-2", name: "Weekend nights", appliesWhen: "Friday to Sunday, 8 pm to 2 am", multiplier: 1.2, status: "active" },
  { id: "surge-3", name: "Public holidays", appliesWhen: "On the dates you list", multiplier: 1.4, status: "paused" },
];
let nextId = 4;

export const getPricingRates = () => delay(copy(rates));

/** patch: { baseFare } or { perKm }. Returns the updated rates. */
export const updatePricingRates = (patch) => {
  rates = { ...rates, ...patch };
  return delay(copy(rates), 600);
};

export const getSurgeRules = () => delay(copy(rules));

const nameTaken = (name, exceptId) =>
  rules.some((r) => r.id !== exceptId && r.name.trim().toLowerCase() === name.trim().toLowerCase());

/** { name, appliesWhen, multiplier }. New rules start active. */
export const createSurgeRule = ({ name, appliesWhen, multiplier }) => {
  if (nameTaken(name)) return fail(`There’s already a rule called “${name.trim()}”`);
  const rule = { id: `surge-${nextId++}`, name: name.trim(), appliesWhen: appliesWhen.trim(), multiplier, status: "active" };
  rules = [...rules, rule];
  return delay(copy(rule), 600);
};

/** { id, ...changes } where changes is any of name, appliesWhen, multiplier, status */
export const updateSurgeRule = ({ id, ...changes }) => {
  const existing = rules.find((r) => r.id === id);
  if (!existing) return fail("This rule no longer exists");
  if (changes.name !== undefined && nameTaken(changes.name, id)) {
    return fail(`There’s already a rule called “${changes.name.trim()}”`);
  }
  const updated = {
    ...existing,
    ...changes,
    ...(changes.name !== undefined && { name: changes.name.trim() }),
    ...(changes.appliesWhen !== undefined && { appliesWhen: changes.appliesWhen.trim() }),
  };
  rules = rules.map((r) => (r.id === id ? updated : r));
  return delay(copy(updated), 500);
};

export const deleteSurgeRule = ({ id }) => {
  rules = rules.filter((r) => r.id !== id);
  return delay({ id }, 500);
};

// ---- Price configuration lists (state, city, vehicle, weight) -------------------------------
// TODO: real endpoints, e.g.
//   getPriceList    -> api.get(`/admin/pricing/${section}-prices/`)
//   createPrice     -> api.post(`/admin/pricing/${section}-prices/`, values)
//   updatePrice     -> api.patch(`/admin/pricing/${section}-prices/${id}/`, values)
//   deletePrice     -> api.delete(`/admin/pricing/${section}-prices/${id}/`)
//
// section "state": { id, name, baseFee, perKm } — perKm is charged after the first 3 km.
// section "city":  { id, name, state, extraCharge } — added on top of the state's price.
// section "vehicle": { id, name, multiplier, maxWeight } — maxWeight in kg; multiplier scales the price.
// section "weight": { id, from, to, extraFee } — kg; a parcel over `from` and up to `to` pays extraFee.

const priceLists = {
  state: [
    { id: "state-1", name: "Edo", baseFee: 1200, perKm: 150 },
    { id: "state-2", name: "Lagos", baseFee: 1500, perKm: 180 },
    { id: "state-3", name: "FCT", baseFee: 1400, perKm: 170 },
    { id: "state-4", name: "Oyo", baseFee: 1000, perKm: 130 },
    { id: "state-5", name: "Rivers", baseFee: 1300, perKm: 160 },
  ],
  city: [
    { id: "city-1", name: "Benin City", state: "Edo", extraCharge: 150 },
    { id: "city-2", name: "Lekki", state: "Lagos", extraCharge: 300 },
    { id: "city-3", name: "Ikeja", state: "Lagos", extraCharge: 200 },
    { id: "city-4", name: "Wuse", state: "FCT", extraCharge: 100 },
  ],
  vehicle: [
    { id: "vehicle-1", name: "Bike", multiplier: 1, maxWeight: 15 },
    { id: "vehicle-2", name: "Car", multiplier: 1.6, maxWeight: 60 },
    { id: "vehicle-3", name: "Van", multiplier: 2.4, maxWeight: 200 },
    { id: "vehicle-4", name: "Truck", multiplier: 4, maxWeight: 1000 },
  ],
  weight: [
    { id: "weight-1", from: 0, to: 5, extraFee: 0 },
    { id: "weight-2", from: 5, to: 15, extraFee: 300 },
    { id: "weight-3", from: 15, to: 30, extraFee: 700 },
    { id: "weight-4", from: 30, to: 60, extraFee: 1500 },
  ],
};
let nextPriceId = 100;

const listFor = (section) => {
  if (!priceLists[section]) throw new Error(`Unknown price list "${section}"`);
  return priceLists[section];
};

// One price per state / vehicle; one price per city within a state (two states can share a city name)
const sameName = (a, b) => a.name.toLowerCase() === b.name.toLowerCase();
const sameEntry = {
  state: sameName,
  city: (a, b) => sameName(a, b) && a.state === b.state,
  vehicle: sameName,
  // Bands cover (from, to]; two bands clash when they overlap, touching ends are fine
  weight: (a, b) => a.from < b.to && a.to > b.from,
};
const bandName = (v) => `${v.from} to ${v.to} kg`;
const describe = {
  state: (v) => v.name,
  city: (v) => `${v.name}, ${v.state}`,
  vehicle: (v) => v.name,
  weight: bandName,
};

const duplicateMessage = (section, duplicate) =>
  section === "weight" ? `Overlaps the ${bandName(duplicate)} band` : `${describe[section](duplicate)} already has a price`;

const findDuplicate = (section, values, exceptId) =>
  listFor(section).find((p) => p.id !== exceptId && sameEntry[section](p, values));

export const getPriceList = (section) => {
  try {
    return delay(copy(listFor(section)));
  } catch (e) {
    return fail(e.message);
  }
};

export const createPrice = ({ section, values }) => {
  const duplicate = findDuplicate(section, values);
  if (duplicate) return fail(duplicateMessage(section, duplicate));
  const entry = { id: `${section}-${nextPriceId++}`, ...values };
  priceLists[section] = [...listFor(section), entry];
  return delay(copy(entry), 600);
};

export const updatePrice = ({ section, id, values }) => {
  const existing = listFor(section).find((p) => p.id === id);
  if (!existing) return fail("This price no longer exists");
  const updated = { ...existing, ...values };
  const duplicate = findDuplicate(section, updated, id);
  if (duplicate) return fail(duplicateMessage(section, duplicate));
  priceLists[section] = listFor(section).map((p) => (p.id === id ? updated : p));
  return delay(copy(updated), 500);
};

export const deletePrice = ({ section, id }) => {
  priceLists[section] = listFor(section).filter((p) => p.id !== id);
  return delay({ id }, 500);
};
