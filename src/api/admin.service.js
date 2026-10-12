// import api from "./axios";

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
