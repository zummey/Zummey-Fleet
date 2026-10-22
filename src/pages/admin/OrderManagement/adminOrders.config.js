import {
  Timer,
  Repeat,
  CircleCheck,
  CircleX,
} from "lucide-react";

export const ORDERS_PAGE_SIZE = 7;

export const ORDER_STATUS_CONFIG = {
  in_transit: {
    key: "in_transit",
    label: "In Transit",
    badgeClass: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  },
  pending: {
    key: "pending",
    label: "Pending",
    badgeClass: "bg-amber-50 text-amber-700 border border-amber-100",
  },
  delivered: {
    key: "delivered",
    label: "Delivered",
    badgeClass: "bg-green-50 text-green-700 border border-green-100",
  },
  assigned: {
    key: "assigned",
    label: "Assigned",
    badgeClass: "bg-blue-50 text-blue-600 border border-blue-100",
  },
  failed: {
    key: "failed",
    label: "Failed",
    badgeClass: "bg-red-50 text-red-600 border border-red-100",
  },
  cancelled: {
    key: "cancelled",
    label: "Cancelled",
    badgeClass: "bg-slate-100 text-slate-600 border border-slate-200",
  },
  picked_up: {
    key: "picked_up",
    label: "Picked Up",
    badgeClass: "bg-purple-50 text-purple-600 border border-purple-100",
  },
};

export const normalizeOrderStatus = (status) => {
  if (!status) return "pending";
  const s = String(status).toLowerCase().replace(/[\s-]/g, "_");
  if (s.includes("transit")) return "in_transit";
  if (s.includes("pend")) return "pending";
  if (s.includes("deliver")) return "delivered";
  if (s.includes("assign")) return "assigned";
  if (s.includes("fail")) return "failed";
  if (s.includes("cancel")) return "cancelled";
  if (s.includes("pick")) return "picked_up";
  return ORDER_STATUS_CONFIG[s] ? s : "in_transit";
};

export const ORDER_FILTER_OPTIONS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "assigned", label: "Assigned" },
  { id: "picked_up", label: "Picked up" },
  { id: "in_transit", label: "In Transit" },
  { id: "delivered", label: "Delivered" },
  { id: "failed", label: "Failed" },
  { id: "cancelled", label: "Cancelled" },
];

export const NEARBY_RIDERS = [
  {
    id: "r1",
    name: "Emeka John",
    fleet: "Metro Riders",
    distance: "2.4 km away",
    status: "Available",
    initials: "ZY",
    avatarBg: "bg-emerald-100 text-emerald-800",
    phone: "08031234567",
    code: "RDR-3012",
    rating: 4.9,
  },
  {
    id: "r2",
    name: "Uche Kalu",
    fleet: "Independent",
    distance: "3.1 km away",
    status: "Busy",
    initials: "AB",
    avatarBg: "bg-rose-100 text-rose-800",
    phone: "07039988771",
    code: "RDR-1102",
    rating: 4.7,
  },
  {
    id: "r3",
    name: "Peter Ojo",
    fleet: "Independent",
    distance: "3.8 km away",
    status: "Busy",
    initials: "PO",
    avatarBg: "bg-purple-100 text-purple-800",
    phone: "08123344556",
    code: "RDR-4401",
    rating: 4.6,
  },
  {
    id: "r4",
    name: "Samuel Okafor",
    fleet: "Swift Logistics",
    distance: "4.4 km away",
    status: "Busy",
    initials: "SO",
    avatarBg: "bg-sky-100 text-sky-800",
    phone: "09055443322",
    code: "RDR-2041",
    rating: 4.8,
  },
];

export const INITIAL_ADMIN_ORDERS = [
  {
    id: "ORD-48201",
    orderId: "ORD-48201",
    customer: "Uche Kalu",
    rider: "Emeka Okoli",
    fleet: "Swift Logistics",
    status: "in_transit",
    amount: 4500,
    placedAt: "Placed Oct 20, 2026 · 08:05",
    created_at: "2026-10-20T08:05:00Z",
    distance: "11.4 km",
    paymentMethod: "Card",
    packageType: "Document",
    sender: {
      name: "Uche Kalu",
      phone: "07045679109",
      pickupAddress: "New Benin",
    },
    recipient: {
      name: "Chinedu Okoro",
      phone: "08033441120",
      dropoffAddress: "Oluku",
      deliveryNote: '"Call on arrival"',
    },
    riderDetails: {
      name: "Emeka Nwankwo",
      code: "RDR-2041",
      fleet: "Swift Logistics",
      phone: "08031120045",
      rating: 4.8,
      initials: "EN",
    },
    timeline: [
      {
        title: "Order placed",
        description: "Customer placed the order in the app",
        time: "Oct 20, 2026 · 08:05",
        status: "completed",
      },
      {
        title: "Rider assigned",
        description: "Emeka Nwankwo (Swift Dispatch)",
        time: "08:12",
        status: "completed",
      },
      {
        title: "Picked up",
        description: "Package collected from the sender",
        time: "08:31",
        status: "completed",
      },
      {
        title: "In transit",
        description: "Rider is heading to the recipient",
        time: "08:38",
        status: "completed",
      },
      {
        title: "Delivered",
        description: "Upcoming",
        time: "Not yet",
        status: "pending",
      },
    ],
  },
  {
    id: "ORD-48202",
    orderId: "ORD-48201",
    customer: "Uche Kalu",
    rider: "Unassigned",
    fleet: "—",
    status: "pending",
    amount: 4500,
    placedAt: "Placed Oct 20, 2026 · 08:05",
    created_at: "2026-10-20T08:05:00Z",
    distance: "11.4 km",
    paymentMethod: "Card",
    packageType: "Document",
    sender: {
      name: "Uche Kalu",
      phone: "07045679109",
      pickupAddress: "New Benin",
    },
    recipient: {
      name: "Chinedu Okoro",
      phone: "08033441120",
      dropoffAddress: "Oluku",
      deliveryNote: '"Call on arrival"',
    },
    riderDetails: null,
    timeline: [
      {
        title: "Order placed",
        description: "Customer placed the order in the app",
        time: "Oct 20, 2026 · 08:05",
        status: "completed",
      },
      {
        title: "Rider assigned",
        description: "Emeka Nwankwo (Swift Dispatch)",
        time: "08:12",
        status: "pending",
      },
      {
        title: "Picked up",
        description: "Package collected from the sender",
        time: "08:31",
        status: "pending",
      },
      {
        title: "In transit",
        description: "Rider is heading to the recipient",
        time: "08:38",
        status: "pending",
      },
      {
        title: "Delivered",
        description: "Upcoming",
        time: "Not yet",
        status: "pending",
      },
    ],
  },
  {
    id: "ORD-48203",
    orderId: "ORD-48201",
    customer: "Uche Kalu",
    rider: "Emeka Okoli",
    fleet: "Independent",
    status: "delivered",
    amount: 4500,
    placedAt: "Placed Oct 20, 2026 · 08:05",
    created_at: "2026-10-20T08:05:00Z",
    distance: "11.4 km",
    paymentMethod: "Card",
    packageType: "Document",
    sender: {
      name: "Uche Kalu",
      phone: "07045679109",
      pickupAddress: "New Benin",
    },
    recipient: {
      name: "Chinedu Okoro",
      phone: "08033441120",
      dropoffAddress: "Oluku",
      deliveryNote: '"Call on arrival"',
    },
    riderDetails: {
      name: "Emeka Nwankwo",
      code: "RDR-2041",
      fleet: "Swift Logistics",
      phone: "08031120045",
      rating: 4.8,
      initials: "EN",
    },
    deliveredAt: "Oct 20, 2026 · 09:02",
    deliveryCode: "Verified by recipient",
    locationCheck: "Matched drop-off address",
    signerName: "Funke Bakare",
    timeline: [
      {
        title: "Order placed",
        description: "Customer placed the order in the app",
        time: "Oct 20, 2026 · 08:05",
        status: "completed",
      },
      {
        title: "Rider assigned",
        description: "Kunle Adebayo (Lagos Express)",
        time: "Oct 20, 2026 · 08:12",
        status: "completed",
      },
      {
        title: "Picked up",
        description: "Parcel collected from the sender",
        time: "Oct 20, 2026 · 08:31",
        status: "completed",
      },
      {
        title: "In transit",
        description: "Rider is heading to the recipient",
        time: "Oct 20, 2026 · 08:38",
        status: "completed",
      },
      {
        title: "Delivered",
        description: "Recipient confirmed with the delivery code",
        time: "Oct 20, 2026 · 09:02",
        status: "completed",
      },
    ],
  },
  {
    id: "ORD-48204",
    orderId: "ORD-48201",
    customer: "Uche Kalu",
    rider: "Emeka Okoli",
    fleet: "Swift Logistics",
    status: "assigned",
    amount: 4500,
    placedAt: "Placed Oct 20, 2026 · 08:05",
    created_at: "2026-10-20T08:05:00Z",
    distance: "11.4 km",
    paymentMethod: "Card",
    packageType: "Document",
    sender: {
      name: "Uche Kalu",
      phone: "07045679109",
      pickupAddress: "New Benin",
    },
    recipient: {
      name: "Chinedu Okoro",
      phone: "08033441120",
      dropoffAddress: "Oluku",
      deliveryNote: '"Call on arrival"',
    },
    riderDetails: {
      name: "Emeka Nwankwo",
      code: "RDR-2041",
      fleet: "Swift Logistics",
      phone: "08031120045",
      rating: 4.8,
      initials: "EN",
    },
    timeline: [
      {
        title: "Order placed",
        description: "Customer placed the order in the app",
        time: "Oct 20, 2026 · 08:05",
        status: "completed",
      },
      {
        title: "Rider assigned",
        description: "Grace Eboh (Metro Riders)",
        time: "Oct 20, 2026 · 08:12",
        status: "completed",
      },
      {
        title: "Picked up",
        description: "Parcel collected from the sender",
        time: "Upcoming",
        status: "pending",
      },
      {
        title: "In transit",
        description: "Upcoming",
        time: "Not yet",
        status: "pending",
      },
      {
        title: "Delivered",
        description: "Upcoming",
        time: "Not yet",
        status: "pending",
      },
    ],
  },
  {
    id: "ORD-48205",
    orderId: "ORD-48201",
    customer: "Uche Kalu",
    rider: "Emeka Okoli",
    fleet: "Swift Logistics",
    status: "failed",
    amount: 4500,
    placedAt: "Placed Oct 20, 2026 · 08:05",
    created_at: "2026-10-20T08:05:00Z",
    distance: "11.4 km",
    paymentMethod: "Card",
    packageType: "Document",
    sender: {
      name: "Uche Kalu",
      phone: "07045679109",
      pickupAddress: "New Benin",
    },
    recipient: {
      name: "Chinedu Okoro",
      phone: "08033441120",
      dropoffAddress: "Oluku",
      deliveryNote: '"Call on arrival"',
    },
    riderDetails: {
      name: "Emeka Nwankwo",
      code: "RDR-2041",
      fleet: "Swift Logistics",
      phone: "08031120045",
      rating: 4.8,
      initials: "EN",
    },
    isEscalated: true,
    escalationMessage: "Issue escalated. Recipient unreachable - High priority. The operations team has been notified.",
    failedMessage: "Delivery failed. Recipient was unreachable after three call attempts.",
    timeline: [
      {
        title: "Order placed",
        description: "Customer placed the order in the app",
        time: "Oct 20, 2026 · 08:05",
        status: "completed",
      },
      {
        title: "Rider assigned",
        description: "Peter Ojo (Independent)",
        time: "Oct 20, 2026 · 08:12",
        status: "completed",
      },
      {
        title: "Picked up",
        description: "Parcel collected from the sender",
        time: "Oct 20, 2026 · 08:31",
        status: "completed",
      },
      {
        title: "In transit",
        description: "Rider is heading to the recipient",
        time: "Oct 20, 2026 · 08:38",
        status: "completed",
      },
      {
        title: "Delivery failed",
        description: "Recipient was unreachable after three call attempts.",
        time: "Oct 20, 2026 · 09:20",
        status: "failed",
      },
      {
        title: "Issue escalated",
        description: "Recipient unreachable · High priority",
        time: "Oct 20, 2026 · 09:41",
        status: "escalated",
      },
    ],
  },
  {
    id: "ORD-48206",
    orderId: "ORD-48201",
    customer: "Uche Kalu",
    rider: "Emeka Okoli",
    fleet: "Swift Logistics",
    status: "cancelled",
    amount: 4500,
    placedAt: "Placed Oct 20, 2026 · 08:05",
    created_at: "2026-10-20T08:05:00Z",
    distance: "11.4 km",
    paymentMethod: "Card",
    packageType: "Document",
    sender: {
      name: "Uche Kalu",
      phone: "07045679109",
      pickupAddress: "New Benin",
    },
    recipient: {
      name: "Chinedu Okoro",
      phone: "08033441120",
      dropoffAddress: "Oluku",
      deliveryNote: '"Call on arrival"',
    },
    riderDetails: {
      name: "Emeka Nwankwo",
      code: "RDR-2041",
      fleet: "Swift Logistics",
      phone: "08031120045",
      rating: 4.8,
      initials: "EN",
    },
    cancelledMessage: "Order cancelled. Reason: Customer requested cancellation.",
    timeline: [
      {
        title: "Order placed",
        description: "Customer placed the order in the app",
        time: "Oct 20, 2026 · 08:05",
        status: "completed",
      },
      {
        title: "Rider assigned",
        description: "Aisha Bello (Independent)",
        time: "Oct 20, 2026 · 08:12",
        status: "completed",
      },
      {
        title: "Order cancelled",
        description: "Customer requested cancellation · Refund initiated",
        time: "Oct 20, 2026 · 08:18",
        status: "cancelled",
      },
    ],
  },
  {
    id: "ORD-48207",
    orderId: "ORD-48201",
    customer: "Uche Kalu",
    rider: "Emeka Okoli",
    fleet: "Swift Logistics",
    status: "picked_up",
    amount: 4500,
    placedAt: "Placed Oct 20, 2026 · 08:05",
    created_at: "2026-10-20T08:05:00Z",
    distance: "11.4 km",
    paymentMethod: "Card",
    packageType: "Document",
    sender: {
      name: "Uche Kalu",
      phone: "07045679109",
      pickupAddress: "New Benin",
    },
    recipient: {
      name: "Chinedu Okoro",
      phone: "08033441120",
      dropoffAddress: "Oluku",
      deliveryNote: '"Call on arrival"',
    },
    riderDetails: {
      name: "Emeka Nwankwo",
      code: "RDR-2041",
      fleet: "Swift Logistics",
      phone: "08031120045",
      rating: 4.8,
      initials: "EN",
    },
    timeline: [
      {
        title: "Order placed",
        description: "Customer placed the order in the app",
        time: "Oct 20, 2026 · 08:05",
        status: "completed",
      },
      {
        title: "Rider assigned",
        description: "Grace Eboh (Metro Riders)",
        time: "Oct 20, 2026 · 08:12",
        status: "completed",
      },
      {
        title: "Picked up",
        description: "Parcel collected from the sender",
        time: "Oct 20, 2026 · 08:31",
        status: "completed",
      },
      {
        title: "In transit",
        description: "Upcoming",
        time: "Not yet",
        status: "pending",
      },
      {
        title: "Delivered",
        description: "Upcoming",
        time: "Not yet",
        status: "pending",
      },
    ],
  },
  // Additional orders for realistic multi-page pagination matching "< 1 of 6 >"
  ...Array.from({ length: 35 }, (_, i) => {
    const num = 48208 + i;
    const statuses = ["in_transit", "delivered", "assigned", "picked_up", "pending", "failed", "cancelled"];
    const status = statuses[i % statuses.length];
    const fleets = ["Swift Logistics", "Metro Riders", "Independent", "Edo Express", "Prime Route"];
    const riders = ["Emeka Okoli", "Kunle Adebayo", "Grace Eboh", "Peter Ojo", "Aisha Bello", "Samuel Okafor"];
    const customers = ["Uche Kalu", "Chinedu Okoro", "Tunde Bakare", "Osaro Igbinosa", "Amaka Obi", "Godwin Ise"];
    const amounts = [3500, 4500, 5200, 6000, 4500, 4000, 7500];

    return {
      id: `ORD-${num}`,
      orderId: `ORD-${num}`,
      customer: customers[i % customers.length],
      rider: status === "pending" ? "Unassigned" : riders[i % riders.length],
      fleet: status === "pending" ? "—" : fleets[i % fleets.length],
      status,
      amount: amounts[i % amounts.length],
      placedAt: "Placed Oct 20, 2026 · 08:05",
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
      distance: `${(8 + (i % 8) * 1.3).toFixed(1)} km`,
      paymentMethod: "Card",
      packageType: i % 2 === 0 ? "Document" : "Parcel",
      sender: {
        name: customers[i % customers.length],
        phone: `070${String(45679100 + i).slice(-8)}`,
        pickupAddress: "New Benin",
      },
      recipient: {
        name: customers[(i + 1) % customers.length],
        phone: `080${String(33441100 + i).slice(-8)}`,
        dropoffAddress: "Oluku",
        deliveryNote: '"Call on arrival"',
      },
      riderDetails:
        status === "pending"
          ? null
          : {
              name: riders[i % riders.length],
              code: `RDR-${2040 + i}`,
              fleet: fleets[i % fleets.length],
              phone: `080${String(31120040 + i).slice(-8)}`,
              rating: 4.8,
              initials: riders[i % riders.length]
                .split(" ")
                .map((n) => n[0])
                .join(""),
            },
      timeline: [
        {
          title: "Order placed",
          description: "Customer placed the order in the app",
          time: "Oct 20, 2026 · 08:05",
          status: "completed",
        },
        {
          title: "Rider assigned",
          description: `${riders[i % riders.length]} (${fleets[i % fleets.length]})`,
          time: "08:12",
          status: status === "pending" ? "pending" : "completed",
        },
        {
          title: "Picked up",
          description: "Package collected from the sender",
          time: "08:31",
          status: ["in_transit", "delivered", "picked_up"].includes(status) ? "completed" : "pending",
        },
        {
          title: "In transit",
          description: "Rider is heading to the recipient",
          time: "08:38",
          status: ["in_transit", "delivered"].includes(status) ? "completed" : "pending",
        },
        {
          title: "Delivered",
          description: status === "delivered" ? "Recipient confirmed with delivery code" : "Upcoming",
          time: status === "delivered" ? "09:02" : "Not yet",
          status: status === "delivered" ? "completed" : "pending",
        },
      ],
    };
  }),
];
