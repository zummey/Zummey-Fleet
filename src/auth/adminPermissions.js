import { AbilityBuilder, createMongoAbility } from "@casl/ability";

export const MODULES = {
  customers: "Customers",
  riders: "Riders",
  orders: "Orders",
  dispatch: "Dispatch",
  tracking: "Live Tracking",
  incidents: "Incidents",
  communications: "Communication",
  finance: "Finance & Reports",
  analytics: "Analytics",
};

export const LOCKED_MODULES = { pricing: "Pricing", admins: "Admin Management" };
export const ACCESS = { none: "No access", read: "View only", edit: "Can edit" };

export const ADMIN_ROLES = {
  operations: "Operations Admin",
  finance: "Finance Admin",
  support: "Support Admin",
  dispatch: "Dispatch Admin",
  superadmin: "Super Admin",
  custom: "Custom",
};

const presets = {
  operations: {
    customers: "read", riders: "edit", orders: "edit", dispatch: "edit",
    tracking: "edit", incidents: "edit", communications: "read", analytics: "read",
  },
  finance: { customers: "read", riders: "read", orders: "read", finance: "edit", analytics: "edit" },
  support: { customers: "edit", riders: "read", orders: "read", tracking: "read", incidents: "edit", communications: "edit" },
  dispatch: { riders: "read", orders: "read", dispatch: "edit", tracking: "edit" },
};

export const permissionsFor = (role, custom = {}) =>
  Object.fromEntries(Object.keys(MODULES).map((module) => [
    module,
    role === "superadmin" || role === "admin"
      ? "edit"
      : (role === "custom" ? custom : presets[role])?.[module] ?? "none",
  ]));

export function createAdminAbility(role, custom) {
  const { can, build } = new AbilityBuilder(createMongoAbility);
  for (const [module, access] of Object.entries(permissionsFor(role, custom))) {
    if (access === "read" || access === "edit") can("read", module);
    if (access === "edit") can("edit", module);
  }
  if (role === "superadmin" || role === "admin") can(["read", "edit"], "fleets");
  if (role === "superadmin") can(["read", "edit"], Object.keys(LOCKED_MODULES));
  return build();
}

const routeScopes = [
  ["/admin-management", "admins"],
  ["/pricing-management", "pricing"],
  ["/user-management/customers", "customers"],
  ["/user-management/riders", "riders"],
  ["/riders-management", "riders"],
  ["/fleet-management", "fleets"],
  ["/order-management/track-orders", "tracking"],
  ["/live-tracking", "tracking"],
  ["/order-management", "orders"],
  ["/dispatch-management", "dispatch"],
  ["/incident-management", "incidents"],
  ["/communications", "communications"],
  ["/finance-reports", "finance"],
  ["/analytics-management", "analytics"],
];

export const scopeForPath = (path) =>
  routeScopes.find(([prefix]) => path === prefix || path.startsWith(prefix + "/"))?.[1];

const editPaths = [
  /^\/admin-management\/(new|[^/]+\/edit-permissions)$/,
  /^\/fleet-management\/[^/]+\/review$/,
  /^\/user-management\/riders\/[^/]+\/review$/,
  /^\/dispatch-management\/[^/]+\/assign$/,
  /^\/communications\/new-broadcast$/,
];

export const actionForPath = (path) =>
  editPaths.some((pattern) => pattern.test(path)) ? "edit" : "read";

export function normalizeAdminPath(pathname) {
  return pathname.split("/").map((segment) => {
    try {
      return decodeURIComponent(segment).replaceAll("/", "%2f");
    } catch {
      return segment;
    }
  }).join("/").toLowerCase().replace(/\/+$/, "");
}
