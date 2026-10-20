import { formatLongDate, formatShortDate } from "../../../components/formatters";

export const RIDER_DETAIL_TAB_QUERY_PARAM = "tab";
export const RIDER_HISTORY_PAGE_SIZE = 10;

// ─── Tab definitions ────────────────────────────────────────────────────────
export const RIDER_DETAIL_TABS = [
  {
    id: "profile",
    label: "Profile Information",
    kind: "profile",
    layout: "profile",
  },
  {
    id: "documents",
    label: "Documents",
    kind: "documents",
    layout: "documents",
  },
  {
    id: "vehicle",
    label: "Vehicle Details",
    kind: "vehicle",
    layout: "vehicle",
  },
  {
    id: "performance",
    label: "Performance Metrics",
    kind: "performance",
    layout: "performance",
  },
  {
    id: "deliveries",
    label: "Delivery History",
    kind: "deliveries",
    layout: "table",
    noun: { one: "Delivery", other: "Deliveries" },
    searchPlaceholder: "Search order ID, location or status",
    emptyText: "No deliveries recorded yet.",
    columns: [
      { key: "id", label: "Order ID", type: "id" },
      { key: "pickup", label: "Pick Up", type: "text" },
      { key: "destination", label: "Destination", type: "text" },
      { key: "amount", label: "Amount", type: "text" },
      { key: "status", label: "Status", type: "status" },
      { key: "date", label: "Date", type: "date" },
    ],
  },
  {
    id: "incidents",
    label: "Incident History",
    kind: "incidents",
    layout: "incidents",
    noun: { one: "Incident", other: "Incidents" },
    searchPlaceholder: "Search incident ID, type or status",
    emptyText: "No incidents recorded.",
  },
];

export const getRiderDetailTabById = (id) =>
  RIDER_DETAIL_TABS.find((t) => t.id === id) ?? RIDER_DETAIL_TABS[0];

// ─── Profile card fields (Personal Information section) ────────────────────
export const RIDER_PERSONAL_INFO_FIELDS = [
  { label: "Full Name", key: "name" },
  { label: "Phone Number", key: "phone" },
  { label: "Email Address", key: "email" },
  { label: "Gender", key: "gender" },
  { label: "Date of Birth", key: "dob" },
  { label: "Home Address", key: "address" },
  { label: "Emergency Contact", key: "emergencyContact" },
  { label: "NIN", key: "nin" },
  { label: "Fleet Affiliation", key: "fleet" },
  { label: "Date Joined", value: (r) => formatLongDate(r.dateJoined) },
];

// ─── Vehicle detail fields ─────────────────────────────────────────────────
export const RIDER_VEHICLE_FIELDS = [
  { label: "Vehicle Type", key: "vehicleType" },
  { label: "Make & Model", key: "vehicleMakeModel" },
  { label: "Year", key: "vehicleYear" },
  { label: "Plate/ License Number", key: "vehiclePlate" },
  { label: "Colour", key: "vehicleColor" },
  { label: "GPS Tracker SN", key: "gpsTrackerSn" },
  { label: "Insurance Expiry", value: (r) => formatShortDate(r.insuranceExpiry) },
  { label: "Road Worthiness Cert", key: "roadWorthiness" },
];

// ─── Stat card header fields (shown below the rider avatar row) ───────────
export const RIDER_STAT_FIELDS = [
  { label: "Rider Type", key: "riderType" },
  { label: "Fleet", key: "fleetName" },
  { label: "Rating", key: "rating" },
  { label: "Deliveries Completed", key: "deliveriesCompleted" },
];
