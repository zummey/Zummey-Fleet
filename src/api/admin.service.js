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

// ---------------------------------------------------------------------------
// User management: customers (admin)
// TODO: Replace mocks with real endpoints once the backend is ready, e.g.
//   getCustomers -> api.get("/admin/customers/", { params: { page, page_size, search, status, min_orders } })
// ---------------------------------------------------------------------------

const FIRST_NAMES = ["Uche", "Amina", "Tolu", "Chidi", "Efe", "Kemi", "Osas", "Ngozi", "Ibrahim", "Zainab"];
const LAST_NAMES = ["Kalu", "Bello", "Adeyemi", "Okafor", "Omoregie", "Eze", "Igbinedion", "Usman"];
const CUSTOMER_STATUSES = ["active", "active", "active", "inactive", "active", "suspended"];

const MOCK_CUSTOMERS = Array.from({ length: 57 }, (_, i) => {
  const first = FIRST_NAMES[i % FIRST_NAMES.length];
  const last = LAST_NAMES[(i * 3) % LAST_NAMES.length];
  const joined = new Date(2026, 6, 6);
  joined.setDate(joined.getDate() + i * 2);
  return {
    id: String(10102 + i),
    code: `ZUM-${10102 + i}`,
    name: `${first} ${last}`,
    phone: `0704567${String(9109 + i).padStart(4, "0")}`,
    email: `${first}.${last}${i}@gmail.com`.toLowerCase(),
    status: CUSTOMER_STATUSES[i % CUSTOMER_STATUSES.length],
    totalOrders: (i * 7) % 40,
    dateJoined: joined.toISOString().slice(0, 10),
  };
});

const filterCustomers = ({ search = "", status = "all", minOrders = 0 }) => {
  const term = search.trim().toLowerCase();
  return MOCK_CUSTOMERS.filter(
    (c) =>
      (status === "all" || c.status === status) &&
      c.totalOrders >= minOrders &&
      (!term || [c.name, c.code, c.phone, c.email].some((v) => v.toLowerCase().includes(term)))
  );
};

export const getCustomers = ({ page = 1, pageSize = 10, search, status, minOrders } = {}) => {
  const matches = filterCustomers({ search, status, minOrders });
  const start = (page - 1) * pageSize;
  return delay({
    results: matches.slice(start, start + pageSize),
    count: matches.length,
    totalPages: Math.max(1, Math.ceil(matches.length / pageSize)),
  });
};

// Every customer matching the given search/filters (none = all customers), for export
export const exportCustomers = ({ search, status, minOrders } = {}) =>
  delay(filterCustomers({ search, status, minOrders }), 400);

// ---------------------------------------------------------------------------
// Customer details (admin)
// TODO: Replace mocks with real endpoints once the backend is ready, e.g.
//   getCustomerDetails    -> api.get(`/admin/customers/${id}/`)
//   getCustomerOrders     -> api.get(`/admin/customers/${id}/orders/`, { params: { page, page_size, search } })
//   getCustomerComplaints -> api.get(`/admin/customers/${id}/complaints/`, { params: { search } })
//   getCustomerPayments   -> api.get(`/admin/customers/${id}/payments/`, { params: { page, page_size, search } })
//   updateCustomerStatus  -> api.patch(`/admin/customers/${id}/`, { status })
//   deleteCustomer        -> api.delete(`/admin/customers/${id}/`)
// List responses: { results, count (matching search), total (all for this customer), totalPages }
// ---------------------------------------------------------------------------

const findCustomer = (id) => MOCK_CUSTOMERS.find((c) => c.id === String(id));

const PLACES = ["Ring Road", "New Benin", "Ugbowo", "Sapele Road", "Airport Road", "Uselu", "Ekenwan Road"];
const ORDER_STATUSES = ["delivered", "delivered", "delivered", "in_transit", "cancelled", "delivered", "pending"];
const PAYMENT_METHODS = ["Card", "Card", "Transfer", "Wallet"];
const PAYMENT_STATUSES = ["successful", "successful", "refunded", "successful", "failed", "successful"];
const COMPLAINT_TEMPLATES = [
  ["Late Delivery", "Rider arrived 40 minutes after the estimated time.", "resolved"],
  ["Damaged item", "Package arrived with a torn seal.", "open"],
  ["Wrong address", "Rider went to the wrong drop-off point.", "in_review"],
  ["Overcharged", "Charged twice for the same order.", "resolved"],
];

const daysAgo = (n, hour = 12) => {
  const d = new Date(2026, 9, 9, hour);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

// Deterministic per-customer history so each customer always shows the same data
const historyFor = (customer) => {
  const seed = Number(customer.id);
  const orders = Array.from({ length: Math.max(customer.totalOrders, 3) }, (_, i) => ({
    id: `GHS${String(seed * 7 + i * 13).padStart(5, "0")}HG`,
    pickup: PLACES[(seed + i) % PLACES.length],
    destination: PLACES[(seed + i * 3 + 1) % PLACES.length],
    amount: 2500 + ((seed + i * 37) % 12) * 250,
    status: ORDER_STATUSES[(seed + i) % ORDER_STATUSES.length],
    date: daysAgo(i * 3),
  }));
  const payments = orders.map((order, i) => ({
    id: `PAY-${780120 + seed * 3 + i}`,
    orderId: order.id,
    method: PAYMENT_METHODS[(seed + i) % PAYMENT_METHODS.length],
    amount: order.amount,
    status: PAYMENT_STATUSES[(seed + i) % PAYMENT_STATUSES.length],
    date: order.date,
  }));
  const complaints = Array.from({ length: 1 + (seed % 4) }, (_, i) => {
    const [title, description, status] = COMPLAINT_TEMPLATES[(seed + i) % COMPLAINT_TEMPLATES.length];
    return {
      id: `CMP-${2200 + (seed % 100) + i * 5}`,
      title,
      description,
      status,
      orderId: orders[i]?.id,
      date: daysAgo(6 + i * 17),
    };
  });
  return { orders, payments, complaints };
};

const matchesSearch = (row, keys, search = "") => {
  const term = search.trim().toLowerCase();
  return !term || keys.some((k) => String(row[k] ?? "").toLowerCase().includes(term));
};

const paginate = (all, matches, page = 1, pageSize = 10) => ({
  results: matches.slice((page - 1) * pageSize, page * pageSize),
  count: matches.length,
  total: all.length,
  totalPages: Math.max(1, Math.ceil(matches.length / pageSize)),
});

const withCustomer = (id, fn) => {
  const customer = findCustomer(id);
  return customer ? fn(customer) : Promise.reject(new Error("Customer not found"));
};

export const getCustomerDetails = (id) =>
  withCustomer(id, (customer) =>
    delay({
      ...customer,
      address: PLACES[Number(customer.id) % PLACES.length],
      lastOrderAt: historyFor(customer).orders[0]?.date ?? null,
    })
  );

export const getCustomerOrders = (id, { page, pageSize, search } = {}) =>
  withCustomer(id, (customer) => {
    const { orders } = historyFor(customer);
    const matches = orders.filter((o) => matchesSearch(o, ["id", "pickup", "destination", "status"], search));
    return delay(paginate(orders, matches, page, pageSize));
  });

export const getCustomerPayments = (id, { page, pageSize, search } = {}) =>
  withCustomer(id, (customer) => {
    const { payments } = historyFor(customer);
    const matches = payments.filter((p) => matchesSearch(p, ["id", "orderId", "method", "status"], search));
    return delay(paginate(payments, matches, page, pageSize));
  });

// Complaints are few per customer, so they come back unpaginated
export const getCustomerComplaints = (id, { search } = {}) =>
  withCustomer(id, (customer) => {
    const { complaints } = historyFor(customer);
    const matches = complaints.filter((c) => matchesSearch(c, ["id", "title", "description", "status"], search));
    return delay({ results: matches, count: matches.length, total: complaints.length, totalPages: 1 });
  });

// Full (unsearched) history for "All ..." exports. kind: "orders" | "complaints" | "payments"
export const exportCustomerHistory = (id, kind) =>
  withCustomer(id, (customer) => delay(historyFor(customer)[kind], 300));

export const updateCustomerStatus = ({ customerId, status }) =>
  withCustomer(customerId, (customer) => {
    customer.status = status;
    return delay({ id: customer.id, status }, 500);
  });

export const deleteCustomer = ({ customerId }) =>
  withCustomer(customerId, (customer) => {
    MOCK_CUSTOMERS.splice(MOCK_CUSTOMERS.indexOf(customer), 1);
    return delay({ id: customer.id }, 500);
  });

// ---------------------------------------------------------------------------
// User management: riders (admin)
// Supports search, status, riderType, and minDeliveries filtering.
// Falls back seamlessly to mock riders if backend API is unavailable/empty.
// ---------------------------------------------------------------------------

const RIDER_FIRST_NAMES = [
  "Musa",
  "Emeka",
  "Babatunde",
  "Chinedu",
  "Ibrahim",
  "Taye",
  "Osaze",
  "Femi",
  "Suleiman",
  "Victor",
  "Amina",
  "Kemi",
];

const RIDER_LAST_NAMES = [
  "Bello",
  "Okafor",
  "Adeyemi",
  "Eze",
  "Aliyu",
  "Taiwo",
  "Omoregie",
  "Balogun",
  "Abubakar",
  "Idowu",
  "Nwachukwu",
  "Sanusi",
];

const RIDER_STATUSES = ["active", "online", "active", "offline", "active", "pending", "suspended"];
const RIDER_FLEETS = [
  "Swift Parcel Ltd",
  "Edo Express Logistics",
  "RapidRide Couriers",
  "Benin Dispatch Co.",
  null,
  "GreenLane Movers",
];

export const MOCK_ADMIN_RIDERS = Array.from({ length: 54 }, (_, i) => {
  const first = RIDER_FIRST_NAMES[i % RIDER_FIRST_NAMES.length];
  const last = RIDER_LAST_NAMES[(i * 3) % RIDER_LAST_NAMES.length];
  const fleet = RIDER_FLEETS[i % RIDER_FLEETS.length];
  const joined = new Date(2026, 4, 10);
  joined.setDate(joined.getDate() + i * 3);
  return {
    id: String(8010 + i),
    code: `ZRD-${8010 + i}`,
    firstName: first,
    lastName: last,
    name: `${first} ${last}`,
    phone: `0803456${String(1200 + i).padStart(4, "0")}`,
    email: `${first}.${last}${i}@zummeyrider.com`.toLowerCase(),
    riderType: fleet ? "Fleet Rider" : "Independent",
    fleet: fleet ?? "Independent",
    status: RIDER_STATUSES[i % RIDER_STATUSES.length],
    rating: Number((4.1 + ((i * 7) % 10) * 0.1).toFixed(1)),
    deliveriesCompleted: 12 + ((i * 19) % 220),
    dateJoined: joined.toISOString().slice(0, 10),
    profile_picture_url: null,
  };
});

const normalizeApiRider = (r, i) => {
  const firstName = r.first_name || r.firstName || r.user?.first_name || "";
  const lastName = r.last_name || r.lastName || r.user?.last_name || "";
  const name = `${firstName} ${lastName}`.trim() || r.name || `Rider ${i + 1}`;
  const fleet = r.fleet?.name || r.fleet || null;
  return {
    id: String(r.id || r.profile_id || 8010 + i),
    code: `ZRD-${r.id || r.profile_id || 8010 + i}`,
    firstName,
    lastName,
    name,
    phone: r.user_phone || r.phoneNumber || r.phone_number || r.user?.phone_number || "—",
    email: r.user_email || r.email || r.user?.email || "—",
    riderType: fleet ? "Fleet Rider" : (r.riderType || "Independent"),
    fleet: fleet ?? "Independent",
    status: r.is_online === true ? "online" : r.is_online === false ? "offline" : (r.status || "active").toLowerCase(),
    rating: r.rating ? Number(r.rating) : Number((4.2 + (i % 8) * 0.1).toFixed(1)),
    deliveriesCompleted: r.total_deliveries ?? r.deliveriesCompleted ?? (10 + ((i * 7) % 50)),
    dateJoined: r.created_at?.slice(0, 10) || r.date_joined?.slice(0, 10) || "2026-05-10",
    profile_picture_url: r.profile_picture_url || r.image || null,
  };
};

export const fetchAllAdminRiders = async () => {
  try {
    const { fetchRiders } = await import("./authRiders");
    const response = await fetchRiders();
    const list = Array.isArray(response?.data?.responseDetails?.results)
      ? response.data.responseDetails.results
      : Array.isArray(response?.data?.results)
        ? response.data.results
        : Array.isArray(response?.data)
          ? response.data
          : [];
    if (list.length > 0) {
      return list.map(normalizeApiRider);
    }
  } catch (_) {
    // Backend endpoint not active or returned error — fallback to mock
  }
  return MOCK_ADMIN_RIDERS;
};

const filterRiderList = (riders, { search = "", status = "all", riderType = "all", minDeliveries = 0 } = {}) => {
  const term = search.trim().toLowerCase();
  return riders.filter((r) => {
    if (status !== "all" && r.status.toLowerCase() !== status.toLowerCase()) return false;
    if (riderType !== "all" && r.riderType.toLowerCase() !== riderType.toLowerCase()) return false;
    if (r.deliveriesCompleted < minDeliveries) return false;
    if (term) {
      const match = [r.name, r.code, r.phone, r.email, r.fleet, r.riderType].some((v) =>
        String(v ?? "").toLowerCase().includes(term)
      );
      if (!match) return false;
    }
    return true;
  });
};

export const getAdminRiders = async ({
  page = 1,
  pageSize = 10,
  search = "",
  status = "all",
  riderType = "all",
  minDeliveries = 0,
} = {}) => {
  const allRiders = await fetchAllAdminRiders();
  const matches = filterRiderList(allRiders, { search, status, riderType, minDeliveries });
  const start = (page - 1) * pageSize;
  return delay({
    results: matches.slice(start, start + pageSize),
    count: matches.length,
    totalPages: Math.max(1, Math.ceil(matches.length / pageSize)),
  });
};

export const exportAdminRiders = async ({
  search = "",
  status = "all",
  riderType = "all",
  minDeliveries = 0,
} = {}) => {
  const allRiders = await fetchAllAdminRiders();
  return delay(filterRiderList(allRiders, { search, status, riderType, minDeliveries }), 400);
};

export const getRiderDetails = async (id) => {
  const allRiders = await fetchAllAdminRiders();
  const rider = allRiders.find((r) => String(r.id) === String(id)) || allRiders[0];
  if (!rider) return Promise.reject(new Error("Rider not found"));

  const seed = Number(rider.id) || 8010;

  return delay({
    ...rider,
    code: rider.code || `ZFL - ${rider.id}`,
    fleetName: rider.fleet && rider.fleet !== "Independent" ? rider.fleet : "Falcon Fleet",
    // Profile extras
    gender: "Male",
    dob: "14 Mar 2000",
    address: "22 Airport Road ,Benin City",
    emergencyContact: `090456${String(7890 + seed).slice(-4)}`,
    nin: `5439${String(seed * 1234).slice(0, 8)}`,
    // Vehicle details
    vehicleType: "Motorbike",
    vehicleMakeModel: "Suzuki",
    vehicleYear: "2022",
    vehiclePlate: `BEN -946XY`,
    vehicleColor: "Black",
    gpsTrackerSn: `GPS${64000 + (seed % 1000)}`,
    insuranceExpiry: "2026-12-18",
    roadWorthiness: "Valid till Sep 2026",
    appliedDate: rider.appliedDate || "Applied Oct 12, 2026",
    documents: [
      {
        id: "drivers_license",
        title: "Drivers License",
        category: "license",
        uploadedAt: "Uploaded Oct 8 , 2026",
        status: "verified",
        mimeType: "image/png",
        url: CertificateImage,
      },
      {
        id: "passport_photo",
        title: "Passport Photograph",
        category: "identity",
        uploadedAt: "Uploaded Oct 8 , 2026",
        status: "verified",
        mimeType: "image/png",
        url: CertificateImage,
      },
      {
        id: "government_id",
        title: "Government ID (NIN)",
        category: "identity",
        uploadedAt: "Uploaded Oct 8 , 2026",
        status: "verified",
        mimeType: "image/png",
        url: CertificateImage,
      },
      {
        id: "vehicle_reg",
        title: "Vehicle Registration",
        category: "license",
        uploadedAt: "Uploaded Oct 8 , 2026",
        status: "verified",
        mimeType: "image/png",
        url: CertificateImage,
      },
    ],
    lastReview: rider.lastReview ?? null,
  });
};

const RIDER_REVIEW_STATUS = {
  approve: "active",
  reject: "rejected",
  clarify: "clarification",
};

export const submitRiderReview = async ({
  riderId,
  decision,
  note = "",
  itemsNeeded = [],
  reason = "",
}) => {
  const allRiders = await fetchAllAdminRiders();
  const rider = allRiders.find((r) => String(r.id) === String(riderId)) || allRiders[0];
  if (!rider) return Promise.reject(new Error("Rider not found"));

  rider.status = RIDER_REVIEW_STATUS[decision] || rider.status;
  rider.lastReview = {
    decision,
    note,
    itemsNeeded,
    reason,
    reviewedAt: new Date().toISOString(),
  };

  return delay({ riderId: rider.id, status: rider.status, review: rider.lastReview }, 600);
};

// ---------------------------------------------------------------------------
// Rider details sub-resources: profile extras, deliveries, performance, incidents
// ---------------------------------------------------------------------------

const DELIVERY_PLACES = ["Ring Road", "New Benin", "Ugbowo", "Sapele Road", "Airport Road", "Uselu", "Ekenwan Road"];
const DELIVERY_STATUSES = ["delivered", "delivered", "delivered", "in_transit", "cancelled", "delivered"];

const riderDeliveryHistory = (riderId) => {
  const seed = Number(riderId) || 8010;
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(2026, 5, 1);
    d.setDate(d.getDate() + i * 2);
    return {
      id: `GHS${String(seed * 3 + i * 11).padStart(5, "0")}HG`,
      pickup: DELIVERY_PLACES[(seed + i) % DELIVERY_PLACES.length],
      destination: DELIVERY_PLACES[(seed + i * 3 + 1) % DELIVERY_PLACES.length],
      amount: `${(2500 + ((seed + i * 37) % 12) * 250).toLocaleString()}`,
      status: DELIVERY_STATUSES[(seed + i) % DELIVERY_STATUSES.length],
      date: d.toISOString().slice(0, 10),
    };
  });
};

export const getRiderDeliveries = async (riderId, { page = 1, pageSize = 10, search = "" } = {}) => {
  const all = riderDeliveryHistory(riderId);
  const term = search.trim().toLowerCase();
  const matches = term
    ? all.filter((r) =>
        [r.id, r.pickup, r.destination, r.status].some((v) =>
          String(v ?? "").toLowerCase().includes(term)
        )
      )
    : all;
  const start = (page - 1) * pageSize;
  return delay({
    results: matches.slice(start, start + pageSize),
    count: matches.length,
    total: all.length,
    totalPages: Math.max(1, Math.ceil(matches.length / pageSize)),
  });
};

export const getRiderPerformance = async (riderId) => {
  const seed = Number(riderId) || 8010;
  return delay({
    averageRating: Number((4.2 + (seed % 8) * 0.1).toFixed(1)),
    completedDeliveries: 80 + (seed % 40),
    cancellationRate: 88 + (seed % 10),
    avgDeliveryTime: 20 + (seed % 15),
  });
};

const INCIDENT_TITLES = ["Customer Complaint", "Late Delivery", "Package Damage", "Misconduct"];
const INCIDENT_STATUSES = [
  { status: "under_review", statusLabel: "Under Review" },
  { status: "resolved", statusLabel: "Resolved" },
  { status: "open", statusLabel: "Open" },
];

const riderIncidentHistory = (riderId) => {
  const seed = Number(riderId) || 8010;
  const count = 2 + (seed % 4);
  return Array.from({ length: count }, (_, i) => {
    const st = INCIDENT_STATUSES[(seed + i) % INCIDENT_STATUSES.length];
    const d = new Date(2026, 9, 6);
    d.setDate(d.getDate() - i * 5);
    return {
      id: String(3100 + seed + i),
      incidentId: `INC-${3100 + (seed % 100) + i}`,
      title: INCIDENT_TITLES[(seed + i) % INCIDENT_TITLES.length],
      description: "Customer Reported a rude interaction at drop-off",
      category: "Conduct",
      severity: i === 0 ? "Moderate" : "Low",
      ...st,
      date: d.toISOString().slice(0, 10),
      riderName: `Emeka Nwankwo (RDR-2041)`,
      dateReported: "Oct 6, 2026",
      reportedBy: "Customer",
      relatedDelivery: `DLV-${88150 + i}`,
      actionTaken:
        "Rider contacted by support. Awaiting a written statement within 48 hours.",
      resolutionNotes:
        "Decision on a formal warning is pending the rider statement.",
      timeline: [
        {
          label: "Incident reported by customer",
          timestamp: "Oct 6, 2026 - 09:14",
          state: "done",
        },
        {
          label: "Support review started",
          timestamp: "Oct 6, 2025 - 11:40",
          state: "done",
        },
        {
          label: "Awaiting rider statement",
          timestamp: "In progress",
          state: "in_progress",
        },
      ],
      attachments: [
        { name: "Customer complaint.pdf", url: "#" },
        { name: "Call recording.mp3", url: "#" },
      ],
    };
  });
};

export const getRiderIncidents = async (riderId, { page = 1, pageSize = 10 } = {}) => {
  const all = riderIncidentHistory(riderId);
  const start = (page - 1) * pageSize;
  const underReview = all.filter((r) => r.status === "under_review").length;
  return delay({
    results: all.slice(start, start + pageSize),
    count: all.length,
    total: all.length,
    totalPages: Math.max(1, Math.ceil(all.length / pageSize)),
    summary: {
      total: all.length,
      underReview,
      major: 92,
      mostRecent: "Oct 6, 2026",
    },
  });
};

// Update rider status (approve / suspend / reactivate)
export const updateRiderStatus = async ({ riderId, status }) => {
  const allRiders = await fetchAllAdminRiders();
  const rider = allRiders.find((r) => String(r.id) === String(riderId));
  if (rider) rider.status = status;
  return delay({ riderId, status }, 500);
};

// Rider profile extras (gender, DOB, address etc.) — augments getRiderDetails
export const getRiderProfileExtras = async (riderId) => {
  const seed = Number(riderId) || 8010;
  return delay({
    gender: "Male",
    dob: "14 Mar 2000",
    address: "22 Airport Road ,Benin City",
    emergencyContact: `090456${String(7890 + seed).slice(-4)}`,
    nin: `5439${String(seed * 1234).slice(0, 8)}`,
    vehicleType: "Motorbike",
    vehicleMakeModel: "Suzuki",
    vehicleYear: "2022",
    vehiclePlate: `BEN -946XY`,
    vehicleColor: "Black",
    gpsTrackerSn: `GPS${64000 + (seed % 1000)}`,
    insuranceExpiry: "2026-12-18",
    roadWorthiness: "Valid till Sep 2026",
  });
};


