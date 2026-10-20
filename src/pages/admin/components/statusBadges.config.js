// Shared status -> badge styles for every admin table (fleets, customers, riders, vehicles).

export const STATUS_BADGES = {
  active: { label: "Active", className: "bg-green-50 text-green-600" },
  approved: { label: "Approved", className: "bg-green-50 text-green-600" },
  verified: { label: "Verified", className: "bg-green-50 text-green-600" },
  online: { label: "Online", className: "bg-green-50 text-green-600" },
  offline: { label: "Offline", className: "bg-red-50 text-red-500" },
  inactive: { label: "Inactive", className: "bg-gray-100 text-gray-500" },
  suspended: { label: "Suspended", className: "bg-red-50 text-red-500" },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-600" },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-500" },
  clarification: { label: "Needs Clarification", className: "bg-blue-50 text-blue-600" },
  // orders
  delivered: { label: "Delivered", className: "bg-green-50 text-green-600" },
  in_transit: { label: "In Transit", className: "bg-blue-50 text-blue-600" },
  cancelled: { label: "Cancelled", className: "bg-red-50 text-red-500" },
  // payments
  successful: { label: "Successful", className: "bg-green-50 text-green-600" },
  refunded: { label: "Refunded", className: "bg-fuchsia-50 text-fuchsia-500" },
  failed: { label: "Failed", className: "bg-red-50 text-red-500" },
  // complaints / incidents
  open: { label: "Open", className: "bg-red-50 text-red-500" },
  in_review: { label: "In Review", className: "bg-amber-50 text-amber-600" },
  under_review: { label: "Under Review", className: "bg-blue-50 text-blue-600" },
  resolved: { label: "Resolved", className: "bg-green-50 text-green-600" },
};
