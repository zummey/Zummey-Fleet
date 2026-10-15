// import api from "./axios";
import CertificateImage from "../assets/certificate.png";

// TODO: Replace with the real endpoint once the backend is ready, e.g.
//   export const getAdminDashboardStats = async () => {
//     const { data } = await api.get("/admin/dashboard/stats/");
//     return data;
//   };
//
// Expected shape: one object per tab id (see adminDashboard.config.js),
// each stat as { value, caption, tone? } where tone is positive | negative | info | neutral.

const MOCK_ADMIN_STATS = {
  customers: {
    totalUsers: { value: 24308, caption: "+4.2% vs last month" },
    activeUsers: { value: 18942, caption: "+2.1% vs last month" },
    newUsers: { value: 312, caption: "+12% vs last month" },
  },
  riders: {
    totalRiders: { value: 1204, caption: "+3.4% vs last month" },
    availableRiders: { value: 386, caption: "Ready for dispatch" },
    ridersOnDelivery: { value: 214, caption: "Currently Active" },
  },
  fleet: {
    totalFleetOwners: { value: 96, caption: "+5 new this month" },
    activeFleets: { value: 61, caption: "of 96 total" },
    totalVehicles: { value: 47, caption: "27 active • 15 inactive" },
  },
  orders: {
    pendingOrders: { value: 2, caption: "Awaiting dispatch" },
    activeOrders: { value: 8, caption: "+8.6% vs yesterday" },
    completedOrders: { value: 5, caption: "+6.1% this month" },
    failedOrders: { value: 2, caption: "12% vs last week" },
  },
  financial: {
    totalRevenue: { value: 48_200_000, caption: "+9.3% vs last week" },
    settlements: { value: 31_620_000, caption: "142 pending" },
    payouts: { value: 14_900_000, caption: "18% vs last week" },
  },
  operational: {
    complaints: { value: 2, caption: "-2 this week" },
    incidents: { value: 4, caption: "2 unresolved" },
    supportTickets: { value: 312, caption: "18 awaiting reply" },
  },
};

export const getAdminDashboardStats = () =>
  new Promise((resolve) => setTimeout(() => resolve(MOCK_ADMIN_STATS), 600));

// ---------------------------------------------------------------------------
// Fleet management (admin)
// TODO: Replace mocks with real endpoints once the backend is ready, e.g.
//   getFleetOwners      -> api.get("/admin/fleets/", { params: { page, page_size } })
//   getFleetDetails     -> api.get(`/admin/fleets/${id}/`)
//   getFleetRiders      -> api.get(`/admin/fleets/${id}/riders/`)
//   getFleetVehicles    -> api.get(`/admin/fleets/${id}/vehicles/`)
//   getFleetPerformance -> api.get(`/admin/fleets/${id}/performance/`)
//   submitFleetReview   -> api.post(`/admin/fleets/${id}/review/`, payload)
// ---------------------------------------------------------------------------

const delay = (data, ms = 500) => new Promise((resolve) => setTimeout(() => resolve(data), ms));

const COMPANIES = [
  ["Swift Parcel Ltd", "Godwin Ise"],
  ["Edo Express Logistics", "Osaro Igbinosa"],
  ["RapidRide Couriers", "Amaka Obi"],
  ["Benin Dispatch Co.", "Efosa Omoregie"],
  ["GreenLane Movers", "Tunde Bakare"],
  ["Prime Route Ltd", "Ngozi Eze"],
];
const FLEET_STATUSES = ["active", "active", "active", "suspended", "active", "pending"];

const MOCK_FLEETS = Array.from({ length: 24 }, (_, i) => {
  const [companyName, contactPerson] = COMPANIES[i % COMPANIES.length];
  return {
    id: String(230 + i),
    fleetCode: `ZFL - ${230 + i}`,
    companyName,
    contactPerson,
    ridersCount: 12 + (i % 5),
    vehiclesCount: 18 + (i % 7),
    status: FLEET_STATUSES[i % FLEET_STATUSES.length],
  };
});

const findFleet = (id) => MOCK_FLEETS.find((f) => f.id === String(id));

export const getFleetOwners = ({ page = 1, pageSize = 10 } = {}) => {
  const start = (page - 1) * pageSize;
  return delay({
    results: MOCK_FLEETS.slice(start, start + pageSize),
    count: MOCK_FLEETS.length,
    totalPages: Math.max(1, Math.ceil(MOCK_FLEETS.length / pageSize)),
  });
};

export const getFleetDetails = (id) => {
  const fleet = findFleet(id);
  if (!fleet) return Promise.reject(new Error("Fleet not found"));

  return delay({
    ...fleet,
    owner: fleet.contactPerson,
    phone: "08131240611",
    email: "zummey@gmail.com",
    businessAddress: "24 Sub Street, New Lagos Road, Benin City",
    dateJoined: "2026-07-24",
    cac: {
      registrationNumber: "RC 1829374",
      dateRegistered: "2021-08-04",
      registeredName: fleet.companyName,
      document: {
        name: "CAC Certificate",
        mimeType: "image/png",
        sizeBytes: 476134,
        uploadedAt: "2026-10-12T16:09:00",
        url: CertificateImage, // mock asset — backend will supply the real file URL
      },
    },
    logo: { name: "logo.png", url: null },
    lastReview: fleet.lastReview ?? null,
  });
};

// Review decisions: "approve" | "reject" | "clarify".
// TODO: replace with the real endpoint, e.g.
//   api.post(`/admin/fleets/${fleetId}/review/`, { decision, note, checklist })
const REVIEW_RESULT_STATUS = { approve: "active", reject: "rejected", clarify: "clarification" };

export const submitFleetReview = ({ fleetId, decision, note = "", checklist = {} }) => {
  const fleet = findFleet(fleetId);
  if (!fleet) return Promise.reject(new Error("Fleet not found"));
  if (!REVIEW_RESULT_STATUS[decision]) return Promise.reject(new Error(`Unknown decision "${decision}"`));

  // Mutate the mock so the list and details pages reflect the decision after refetch
  fleet.status = REVIEW_RESULT_STATUS[decision];
  fleet.lastReview = { decision, note, checklist, reviewedAt: new Date().toISOString() };
  return delay({ fleetId: fleet.id, status: fleet.status, review: fleet.lastReview }, 700);
};

export const getFleetRiders = (id) =>
  delay(
    Array.from({ length: 8 }, (_, i) => ({
      id: String(563856 + i),
      name: ["Uche Kalu", "Ifeanyi Okafor", "Bola Ade", "Musa Bello"][i % 4],
      phone: `0801234567${i}`,
      assignedVehicle: `BIKE00${1234 + i}`,
      status: i % 3 === 2 ? "offline" : "online",
      fleetId: String(id),
    }))
  );

export const getFleetVehicles = (id) =>
  delay(
    Array.from({ length: 8 }, (_, i) => ({
      id: `BIKE00${123 + i}`,
      name: ["Yamaha FZ-S V3", "Honda CB125F", "Bajaj Boxer 150"][i % 3],
      manufacturer: ["Yamaha", "Honda", "Bajaj"][i % 3],
      licenseNo: `ABJ-${567 + i}XY`,
      gpsTrackerSn: `GPS456${789 + i}`,
      status: i % 4 === 3 ? "offline" : "online",
      fleetId: String(id),
    }))
  );

export const getFleetPerformance = () =>
  delay({ completedOrders: 96, averageRating: 4.7, onTimeRate: 96, revenue: 208_000 });
