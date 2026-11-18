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

// ---- Coupons (Promotions & Discounts) ------------------------------------------------------------
// TODO: real endpoints, e.g.
//   getCoupons    -> api.get("/admin/pricing/coupons/")
//   createCoupon  -> api.post("/admin/pricing/coupons/", values)
//   updateCoupon  -> api.patch(`/admin/pricing/coupons/${id}/`, values | { status })
//   deleteCoupon  -> api.delete(`/admin/pricing/coupons/${id}/`)
//
// Coupon: { id, code, type: "percent" | "fixed", value, usageLimit, used, expiresOn: "YYYY-MM-DD",
//           status: "active" | "paused" }. A coupon past its expiry date or used up stops working
// whatever its status; the UI shows that as "Expired" / "Used up".

const isoDaysFromToday = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

let coupons = [
  { id: "coupon-1", code: "WELCOME20", type: "percent", value: 20, usageLimit: 1000, used: 342, expiresOn: isoDaysFromToday(43), status: "active" },
  { id: "coupon-2", code: "FREESHIP", type: "fixed", value: 500, usageLimit: 500, used: 120, expiresOn: isoDaysFromToday(12), status: "active" },
  { id: "coupon-3", code: "BLACKFRI", type: "percent", value: 15, usageLimit: 2000, used: 0, expiresOn: isoDaysFromToday(12), status: "paused" },
  { id: "coupon-4", code: "SALLAH10", type: "percent", value: 10, usageLimit: 800, used: 800, expiresOn: isoDaysFromToday(-29), status: "active" },
];
let nextCouponId = 5;

const codeTaken = (code, exceptId) => coupons.some((c) => c.id !== exceptId && c.code === code.toUpperCase());

export const getCoupons = () => delay(copy(coupons));

/** values: { code, type, value, usageLimit, expiresOn }. New coupons start active and unused. */
export const createCoupon = (values) => {
  if (codeTaken(values.code)) return fail(`The code ${values.code.toUpperCase()} is already in use`);
  const coupon = { id: `coupon-${nextCouponId++}`, ...values, code: values.code.toUpperCase(), used: 0, status: "active" };
  coupons = [...coupons, coupon];
  return delay(copy(coupon), 600);
};

/** { id, ...changes }: any of the create fields, or { status } to pause / resume */
export const updateCoupon = ({ id, ...changes }) => {
  const existing = coupons.find((c) => c.id === id);
  if (!existing) return fail("This coupon no longer exists");
  if (changes.code !== undefined) {
    if (existing.used > 0 && changes.code.toUpperCase() !== existing.code) {
      return fail("A coupon’s code can’t change once customers have used it");
    }
    if (codeTaken(changes.code, id)) return fail(`The code ${changes.code.toUpperCase()} is already in use`);
  }
  if (changes.usageLimit !== undefined && changes.usageLimit < existing.used) {
    return fail(`It has already been used ${existing.used} times`);
  }
  const updated = { ...existing, ...changes, ...(changes.code && { code: changes.code.toUpperCase() }) };
  coupons = coupons.map((c) => (c.id === id ? updated : c));
  return delay(copy(updated), 500);
};

export const deleteCoupon = ({ id }) => {
  coupons = coupons.filter((c) => c.id !== id);
  return delay({ id }, 500);
};

// ---- Promo campaigns ---------------------------------------------------------------------------
// TODO: real endpoints, e.g.
//   getCampaigns    -> api.get("/admin/pricing/campaigns/")
//   createCampaign  -> api.post("/admin/pricing/campaigns/", values)
//   updateCampaign  -> api.patch(`/admin/pricing/campaigns/${id}/`, values | { status })
//   deleteCampaign  -> api.delete(`/admin/pricing/campaigns/${id}/`)
//
// Campaign: { id, name, audience: "all" | "new" | "groups", discount (percent), startsOn, endsOn
//             ("YYYY-MM-DD", inclusive), status: "active" | "paused" }. Before startsOn it's
// "scheduled" and after endsOn "ended", whatever its status.
// TODO: "groups" needs the chosen customer groups once the backend defines them.

let campaigns = [
  { id: "campaign-1", name: "Welcome month", audience: "new", discount: 20, startsOn: isoDaysFromToday(-17), endsOn: isoDaysFromToday(12), status: "active" },
  { id: "campaign-2", name: "Black Friday week", audience: "all", discount: 15, startsOn: isoDaysFromToday(5), endsOn: isoDaysFromToday(12), status: "active" },
  { id: "campaign-3", name: "Back to school", audience: "groups", discount: 10, startsOn: isoDaysFromToday(-78), endsOn: isoDaysFromToday(-64), status: "active" },
];
let nextCampaignId = 4;

const findCampaignByName = (name, exceptId) =>
  campaigns.find((c) => c.id !== exceptId && c.name.toLowerCase() === name.trim().toLowerCase());
const nameClash = (name, exceptId) => {
  const clash = findCampaignByName(name, exceptId);
  return clash && fail(`There’s already a campaign called “${clash.name}”`);
};

export const getCampaigns = () => delay(copy(campaigns));

/** values: { name, audience, discount, startsOn, endsOn }. New campaigns start active. */
export const createCampaign = (values) => {
  const clash = nameClash(values.name);
  if (clash) return clash;
  if (values.endsOn < values.startsOn) return fail("The end date must be on or after the start date");
  const campaign = { id: `campaign-${nextCampaignId++}`, ...values, status: "active" };
  campaigns = [...campaigns, campaign];
  return delay(copy(campaign), 600);
};

/** { id, ...changes }: any of the create fields, or { status } to pause / resume */
export const updateCampaign = ({ id, ...changes }) => {
  const existing = campaigns.find((c) => c.id === id);
  if (!existing) return fail("This campaign no longer exists");
  const clash = changes.name !== undefined && nameClash(changes.name, id);
  if (clash) return clash;
  const updated = { ...existing, ...changes };
  if (updated.endsOn < updated.startsOn) return fail("The end date must be on or after the start date");
  campaigns = campaigns.map((c) => (c.id === id ? updated : c));
  return delay(copy(updated), 500);
};

export const deleteCampaign = ({ id }) => {
  campaigns = campaigns.filter((c) => c.id !== id);
  return delay({ id }, 500);
};

// ---- Discount rules ----------------------------------------------------------------------------
// TODO: real endpoints, e.g.
//   getDiscountRules    -> api.get("/admin/pricing/discount-rules/")
//   createDiscountRule  -> api.post("/admin/pricing/discount-rules/", values)
//   updateDiscountRule  -> api.patch(`/admin/pricing/discount-rules/${id}/`, values | { status })
//   deleteDiscountRule  -> api.delete(`/admin/pricing/discount-rules/${id}/`)
//
// Rule: { id, name, trigger: "first_order" | "above_amount" | "every_nth", threshold, discount
//         (percent), status: "active" | "paused" }. threshold is naira for "above_amount",
// N for "every_nth", and 0 for "first_order".

let discountRules = [
  { id: "rule-1", name: "First order discount", trigger: "first_order", threshold: 0, discount: 10, status: "active" },
  { id: "rule-2", name: "Big order saver", trigger: "above_amount", threshold: 10000, discount: 5, status: "active" },
  { id: "rule-3", name: "Loyalty reward", trigger: "every_nth", threshold: 5, discount: 15, status: "paused" },
];
let nextRuleId = 4;

const ruleNameClash = (name, exceptId) => {
  const clash = discountRules.find((r) => r.id !== exceptId && r.name.toLowerCase() === name.trim().toLowerCase());
  return clash && fail(`There’s already a rule called “${clash.name}”`);
};

export const getDiscountRules = () => delay(copy(discountRules));

/** values: { name, trigger, threshold, discount }. New rules start active. */
export const createDiscountRule = (values) => {
  const clash = ruleNameClash(values.name);
  if (clash) return clash;
  const rule = { id: `rule-${nextRuleId++}`, ...values, status: "active" };
  discountRules = [...discountRules, rule];
  return delay(copy(rule), 600);
};

/** { id, ...changes }: any of the create fields, or { status } to pause / resume */
export const updateDiscountRule = ({ id, ...changes }) => {
  const existing = discountRules.find((r) => r.id === id);
  if (!existing) return fail("This rule no longer exists");
  const clash = changes.name !== undefined && ruleNameClash(changes.name, id);
  if (clash) return clash;
  const updated = { ...existing, ...changes };
  discountRules = discountRules.map((r) => (r.id === id ? updated : r));
  return delay(copy(updated), 500);
};

export const deleteDiscountRule = ({ id }) => {
  discountRules = discountRules.filter((r) => r.id !== id);
  return delay({ id }, 500);
};
