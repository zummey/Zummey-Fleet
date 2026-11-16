// import api from "./axios";

// ---------------------------------------------------------------------------
// Analytics management (admin)
// TODO: Replace mocks with real endpoints once the backend is ready, e.g.
//   getAnalyticsSummary   -> api.get("/admin/analytics/summary/")
//   getAnalyticsSeries    -> api.get("/admin/analytics/series/", { params: { metric, range } })
//   getRiderPerformance   -> api.get("/admin/analytics/riders/", { params: { range, metric, search } })
//   getFleetUtilization   -> api.get("/admin/analytics/fleets/", { params: { range } })
//   generateReport        -> api.get(`/admin/analytics/reports/${report}/`, { params: { from, to } })
//                            (or a backend-generated file: { params: { from, to, format }, responseType: "blob" })
//
// range: "7d" | "30d" | "12m". Series points: { date, label, fullLabel, value }
// Dates are ISO "YYYY-MM-DD"; the last full day is yesterday.
// ---------------------------------------------------------------------------

const delay = (data, ms = 450) => new Promise((resolve) => setTimeout(() => resolve(data), ms));

const DAY_MS = 24 * 60 * 60 * 1000;
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const yesterday = () => new Date(startOfDay(new Date()).getTime() - DAY_MS);
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

// Stable 0..1 "random" number per seed, so a given day always has the same figures
const noise = (seed) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};
const daySeed = (d) => d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate();

const ordersOn = (d) => {
  const weekend = d.getDay() === 5 || d.getDay() === 6 ? 40 : 0; // Fri/Sat are busier
  return Math.round(200 + weekend + noise(daySeed(d)) * 110);
};
const averageOrderValue = (d) => Math.round(3600 + noise(daySeed(d) + 7) * 900);
const revenueOn = (d) => ordersOn(d) * averageOrderValue(d);

const dayRow = (d) => {
  const orders = ordersOn(d);
  const cancelled = Math.round(orders * (0.03 + noise(daySeed(d) + 3) * 0.04));
  const failed = Math.round(orders * noise(daySeed(d) + 5) * 0.02);
  const revenue = revenueOn(d);
  return {
    date: iso(d),
    orders,
    delivered: orders - cancelled - failed,
    cancelled,
    failed,
    revenue,
    averageOrderValue: Math.round(revenue / orders),
    riderPayouts: Math.round(revenue * 0.55),
    fleetSettlements: Math.round(revenue * 0.2),
    refunds: Math.round(revenue * (0.01 + noise(daySeed(d) + 9) * 0.02)),
  };
};

const daysBetween = (from, to) => {
  const out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
};

// ---- Summary cards ---------------------------------------------------------------

const changeCaption = (today, before) => {
  const pct = before ? ((today - before) / before) * 100 : 0;
  return {
    caption: `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% vs yesterday`,
    tone: pct > 0 ? "positive" : pct < 0 ? "negative" : "neutral",
  };
};

export const getAnalyticsSummary = () => {
  const today = yesterday(); // last full day
  const before = addDays(today, -1);
  const onTime = (d) => Math.round(88 + noise(daySeed(d) + 11) * 9);
  const avgTime = (d) => Math.round(28 + noise(daySeed(d) + 13) * 10);

  return delay({
    totalOrders: { value: ordersOn(today), ...changeCaption(ordersOn(today), ordersOn(before)) },
    revenue: { value: revenueOn(today), ...changeCaption(revenueOn(today), revenueOn(before)) },
    onTimeRate: { value: onTime(today), ...changeCaption(onTime(today), onTime(before)) },
    // Shorter is better, so a drop is good news
    avgDeliveryTime: (() => {
      const c = changeCaption(avgTime(today), avgTime(before));
      const flipped = { positive: "negative", negative: "positive", neutral: "neutral" };
      return { value: avgTime(today), caption: c.caption, tone: flipped[c.tone] };
    })(),
  });
};

// ---- Orders / revenue series --------------------------------------------------------

const METRIC_VALUE = { orders: ordersOn, revenue: revenueOn };

export const getAnalyticsSeries = ({ metric = "orders", range = "7d" } = {}) => {
  const valueOn = METRIC_VALUE[metric];
  if (!valueOn) return Promise.reject(new Error(`Unknown metric "${metric}"`));
  const end = yesterday();

  if (range === "12m") {
    const points = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(end.getFullYear(), end.getMonth() - 11 + i, 1);
      const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      const days = daysBetween(month, last < end ? last : end);
      return {
        date: iso(month),
        label: month.toLocaleDateString("en-US", { month: "short" }),
        fullLabel: month.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        value: days.reduce((sum, d) => sum + valueOn(d), 0),
      };
    });
    return delay(points);
  }

  const count = range === "30d" ? 30 : 7;
  return delay(
    daysBetween(addDays(end, -(count - 1)), end).map((d) => ({
      date: iso(d),
      label:
        count === 7
          ? d.toLocaleDateString("en-US", { weekday: "short" })
          : d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullLabel: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      value: valueOn(d),
    }))
  );
};

// ---- Rider performance --------------------------------------------------------------

const RIDERS = [
  ["Emeka Nwankwo", "Swift Dispatch"],
  ["Aisha Bello", "Island Couriers"],
  ["Zainab Yusuf", "Express"],
  ["Ifeanyi Obi", "Swift Dispatch"],
  ["Halima Sani", "Metro Riders"],
  ["Tunde Bakare", "Quick Move"],
  ["Grace Eboh", "Express"],
  ["Segun Adeyemi", "Island Couriers"],
  ["Chidi Okafor", "Metro Riders"],
  ["Kemi Adeyemi", "Swift Dispatch"],
  ["Peter Ojo", "Independent"],
  ["Joy John", "Quick Move"],
].map(([name, fleet], i) => ({ id: `rider-${i + 1}`, name, fleet }));

const RANGE_SCALE = { "7d": 1, "30d": 4.3, "12m": 52 };

const riderStats = (rider, i, range) => {
  const seed = i * 31 + range.length * 7;
  return {
    id: rider.id,
    name: rider.name,
    fleet: rider.fleet,
    deliveries: Math.round((98 - i * 3 - noise(seed) * 4) * RANGE_SCALE[range]),
    onTimeRate: Math.round(99 - noise(seed + 1) * 14),
    rating: Number((5 - noise(seed + 2) * 0.9).toFixed(1)),
  };
};

// metric: "deliveries" | "onTimeRate" | "rating" — results are ranked by it, best first
export const getRiderPerformance = ({ range = "7d", metric = "deliveries", search = "" } = {}) => {
  const term = search.trim().toLowerCase();
  const ranked = RIDERS.map((r, i) => riderStats(r, i, range))
    .sort((a, b) => b[metric] - a[metric])
    .map((r, i) => ({ ...r, rank: i + 1 }));
  return delay(term ? ranked.filter((r) => r.name.toLowerCase().includes(term)) : ranked, 350);
};

// ---- Fleet utilization ------------------------------------------------------------------

const FLEETS = [
  { id: "fl-1", name: "Swift Dispatch", totalRiders: 24 },
  { id: "fl-2", name: "Island Couriers", totalRiders: 10 },
  { id: "fl-3", name: "Express", totalRiders: 18 },
  { id: "fl-4", name: "Metro Riders", totalRiders: 15 },
  { id: "fl-5", name: "Quick Move", totalRiders: 12 },
];
const BASE_UTILIZATION = [0.63, 0.6, 0.5, 0.33, 0.25];

// activeRiders is the average number of riders active per day over the range
export const getFleetUtilization = ({ range = "7d" } = {}) =>
  delay(
    FLEETS.map((fleet, i) => {
      const drift = range === "7d" ? 0 : (noise(i + range.length) - 0.5) * 0.12;
      const activeRiders = Math.max(0, Math.round(fleet.totalRiders * (BASE_UTILIZATION[i] + drift)));
      return { ...fleet, activeRiders, utilization: Math.round((activeRiders / fleet.totalRiders) * 100) };
    }).sort((a, b) => b.utilization - a.utilization)
  );

// ---- Reports -------------------------------------------------------------------------------

const parseIso = (value) => {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const MAX_REPORT_DAYS = 366;

// report: "orders_summary" | "revenue" | "rider_performance" | "fleet_utilization" | "payouts_refunds"
// from / to: "YYYY-MM-DD" (inclusive). Returns { rows } — column layout lives in analytics.config.js
export const generateReport = ({ report, from, to }) => {
  const start = parseIso(from);
  const end = parseIso(to);
  if (end < start) return Promise.reject(new Error("The start date must be before the end date"));
  const days = daysBetween(start, end);
  if (days.length > MAX_REPORT_DAYS) return Promise.reject(new Error("Reports can cover at most one year"));

  switch (report) {
    case "orders_summary":
    case "revenue":
    case "payouts_refunds":
      return delay({ rows: days.map(dayRow) }, 800);
    case "rider_performance": {
      const range = days.length <= 7 ? "7d" : days.length <= 31 ? "30d" : "12m";
      return getRiderPerformance({ range }).then((rows) => ({ rows }));
    }
    case "fleet_utilization": {
      const range = days.length <= 7 ? "7d" : days.length <= 31 ? "30d" : "12m";
      return getFleetUtilization({ range }).then((rows) => ({ rows }));
    }
    default:
      return Promise.reject(new Error(`Unknown report "${report}"`));
  }
};
