// import api from "./axios";

// ---------------------------------------------------------------------------
// Incident management (admin)
// TODO: Replace mocks with real endpoints once the backend is ready, e.g.
//   getIncidents       -> api.get("/admin/incidents/", { params: { page, page_size, search, status } })
//   getIncident        -> api.get(`/admin/incidents/${id}/`)
//   getIncidentAdmins  -> api.get("/admin/incidents/assignees/")
//   assignIncident     -> api.post(`/admin/incidents/${id}/assign/`, { adminId })
//   escalateIncident   -> api.post(`/admin/incidents/${id}/escalate/`, { to, reason })
//   resolveIncident    -> api.post(`/admin/incidents/${id}/resolve/`, { outcome, note })
//   closeIncident      -> api.post(`/admin/incidents/${id}/close/`)
//   addIncidentNote    -> api.post(`/admin/incidents/${id}/notes/`, { kind, text })
//
// Incident shape:
//   { id, type, status: "open" | "pending" | "escalated" | "resolved" | "closed", priority: "normal" | "high",
//     reportedAt, description, relatedOrder, reportedBy: { name, role }, rider, assignedAdmin: { id, name } | null,
//     images: [{ name }], escalation: { to, reason } | null, resolution: { outcome, note } | null,
//     log: [{ id, author, role: "customer" | "rider" | "admin", kind: "message" | "internal" | "reporter", text, at }],
//     timeline: [{ id, label, at, by? }] }
// The backend writes the timeline and the acting admin; the mocks below fake that.
// ---------------------------------------------------------------------------

const delay = (data, ms = 500) => new Promise((resolve) => setTimeout(() => resolve(data), ms));

const ADMINS = [
  { id: "adm-1", name: "Ezekiel Samuel", role: "Super Admin" },
  { id: "adm-2", name: "Tolu Adeyemi", role: "Support lead" },
  { id: "adm-3", name: "Chika Obi", role: "Support agent" },
  { id: "adm-4", name: "Musa Ibrahim", role: "Operations" },
  { id: "adm-5", name: "Gift Segun", role: "Support agent" },
];

const admin = (name) => {
  const found = ADMINS.find((a) => a.name === name);
  return found ? { id: found.id, name: found.name } : null;
};

// Whoever is signed in; the real API takes this from the auth token
const actorName = () => {
  try {
    return JSON.parse(localStorage.getItem("user"))?.fullName || "Admin";
  } catch {
    return "Admin";
  }
};

const at = (month, day, hour, minute) => new Date(2026, month - 1, day, hour, minute).toISOString();

let nextId = 1;
const entry = (fields) => ({ id: `e${nextId++}`, ...fields });

// The five incidents from the designs, one per status
const SEEDED = [
  {
    id: "INC-2041",
    type: "package_damage",
    status: "open",
    priority: "normal",
    reportedAt: at(10, 22, 9, 2),
    description:
      "The customer says the box arrived dented and the item inside, a ceramic vase, was broken. They want a full refund and a replacement.",
    relatedOrder: "ORD-48201",
    reportedBy: { name: "Uche Kalu", role: "customer" },
    rider: "Emeka Nwankwo",
    assignedAdmin: null,
    images: [{ name: "damaged-box.jpg" }, { name: "broken-vase.jpg" }, { name: "delivery-note.jpg" }],
    log: [
      entry({ author: "Uche Kalu", role: "customer", kind: "message", text: "The box arrived dented and the vase inside is broken. I have sent photos.", at: at(10, 22, 9, 3) }),
    ],
    timeline: [
      entry({ label: "Incident reported", at: at(10, 22, 9, 2), by: "Uche Kalu" }),
      entry({ label: "Photos uploaded", at: at(10, 22, 9, 3), detail: "3 images" }),
    ],
  },
  {
    id: "INC-2042",
    type: "late_delivery",
    status: "pending",
    priority: "normal",
    reportedAt: at(10, 22, 8, 41),
    description: "The food arrived more than an hour late and was cold. The customer is asking for a partial refund.",
    relatedOrder: "ORD-48202",
    reportedBy: { name: "Amaka Obi", role: "customer" },
    rider: "Aisha Bello",
    assignedAdmin: admin("Tolu Adeyemi"),
    images: [{ name: "order-screenshot.jpg" }],
    log: [
      entry({ author: "Amaka Obi", role: "customer", kind: "message", text: "My food was over an hour late and cold.", at: at(10, 22, 8, 41) }),
      entry({ author: "Tolu Adeyemi", role: "admin", kind: "internal", text: "Asked the rider for a statement about the delay.", at: at(10, 22, 9, 25) }),
    ],
    timeline: [
      entry({ label: "Incident reported", at: at(10, 22, 8, 41), by: "Amaka Obi" }),
      entry({ label: "Assigned to Tolu Adeyemi", at: at(10, 22, 9, 10), by: "Ezekiel Samuel" }),
      entry({ label: "Waiting for rider statement", at: at(10, 22, 9, 25) }),
    ],
  },
  {
    id: "INC-2044",
    type: "rider_misconduct",
    status: "escalated",
    priority: "high",
    reportedAt: at(10, 20, 18, 5),
    description: "The customer reports that the rider was rude and demanded extra cash at the door.",
    relatedOrder: "ORD-48207",
    reportedBy: { name: "Segun Adeyemi", role: "customer" },
    rider: "Kunle Adebayo",
    assignedAdmin: admin("Musa Ibrahim"),
    images: [],
    escalation: { to: "operations_manager", reason: "Possible payment violation by the rider." },
    log: [
      entry({ author: "Segun Adeyemi", role: "customer", kind: "message", text: "The rider was rude and demanded extra cash at the door.", at: at(10, 20, 18, 5) }),
      entry({ author: "Musa Ibrahim", role: "admin", kind: "internal", text: "Escalating because it involves a possible payment violation.", at: at(10, 21, 10, 0) }),
    ],
    timeline: [
      entry({ label: "Incident reported", at: at(10, 20, 18, 5), by: "Segun Adeyemi" }),
      entry({ label: "Assigned to Musa Ibrahim", at: at(10, 20, 18, 40) }),
      entry({ label: "Escalated to Operations manager", at: at(10, 21, 10, 0) }),
    ],
  },
  {
    id: "INC-2045",
    type: "payment_dispute",
    status: "resolved",
    priority: "normal",
    reportedAt: at(10, 19, 10, 3),
    description: "The customer was charged twice for the same delivery. Both charges appear on the bank statement.",
    relatedOrder: "ORD-48210",
    reportedBy: { name: "Amaka Obi", role: "customer" },
    rider: "Uche Kalu",
    assignedAdmin: admin("Gift Segun"),
    images: [{ name: "statement.jpg" }],
    resolution: {
      outcome: "refund_issued",
      note: "The duplicate ₦8,600 charge was returned to the card.",
    },
    log: [
      entry({ author: "Amaka Obi", role: "customer", kind: "message", text: "I can see the same charge twice on my statement.", at: at(10, 19, 10, 3) }),
      entry({ author: "Gift Segun", role: "admin", kind: "internal", text: "Confirmed the duplicate charge. Refund approved.", at: at(10, 21, 15, 22) }),
    ],
    timeline: [
      entry({ label: "Incident reported", at: at(10, 19, 10, 3), by: "Amaka Obi" }),
      entry({ label: "Assigned to Gift Segun", at: at(10, 19, 10, 20), by: "Ezekiel Samuel" }),
      entry({ label: "Resolved: Refund issued", at: at(10, 21, 15, 22) }),
    ],
  },
  {
    id: "INC-2049",
    type: "package_damage",
    status: "closed",
    priority: "normal",
    reportedAt: at(10, 12, 13, 40),
    description: "The parcel was crushed in transit. A replacement was sent and the customer confirmed receipt.",
    relatedOrder: "ORD-48170",
    reportedBy: { name: "Chiamaka Nwosu", role: "customer" },
    rider: "Peter Ojo",
    assignedAdmin: admin("Ezekiel Samuel"),
    images: [{ name: "crushed-box.jpg" }],
    resolution: { outcome: "replacement_sent", note: "" },
    log: [
      entry({ author: "Chiamaka Nwosu", role: "customer", kind: "message", text: "The replacement has arrived. Thank you.", at: at(10, 14, 15, 50) }),
    ],
    timeline: [
      entry({ label: "Incident reported", at: at(10, 12, 13, 40), by: "Chiamaka Nwosu" }),
      entry({ label: "Replacement sent", at: at(10, 13, 10, 10) }),
      entry({ label: "Incident closed", at: at(10, 14, 16, 5), by: "Ezekiel Samuel" }),
    ],
  },
];

// Filler so the list pages and filters have something to show
const FILLER_TYPES = ["package_damage", "late_delivery", "lost_item", "payment_dispute", "rider_misconduct"];
const FILLER_STATUSES = ["open", "pending", "escalated", "resolved", "closed", "pending", "open"];
const FILLER_PEOPLE = ["Ngozi Usman", "Ibrahim Bello", "Kemi Adeyemi", "Osas Igbinedion", "Zainab Eze", "Efe Omoregie"];
const FILLER_RIDERS = ["John Israel", "Salem Mike", "Chidi Eze", "Bisi Adebayo", "Tunde Balogun"];
const FILLER_TEXT = {
  package_damage: "The package arrived damaged and the customer wants a replacement.",
  late_delivery: "The delivery arrived much later than the estimated time.",
  lost_item: "One item from the order never arrived.",
  payment_dispute: "The customer says they were charged the wrong amount.",
  rider_misconduct: "The customer reported the rider's behaviour at drop-off.",
};
const FILLER_ESCALATION = ["team_lead", "operations_manager", "safety_legal"];
const FILLER_OUTCOMES = ["refund_issued", "replacement_sent", "rider_warned", "no_action_needed"];

const FILLER = Array.from({ length: 49 }, (_, i) => {
  const type = FILLER_TYPES[i % FILLER_TYPES.length];
  const status = FILLER_STATUSES[i % FILLER_STATUSES.length];
  const reporter = FILLER_PEOPLE[i % FILLER_PEOPLE.length];
  const reportedAt = at(10, 18 - (i % 17), 8 + (i % 10), (i * 7) % 60);
  const assignee = status === "open" ? null : admin(ADMINS[i % ADMINS.length].name);
  const timeline = [entry({ label: "Incident reported", at: reportedAt, by: reporter })];
  if (assignee) timeline.push(entry({ label: `Assigned to ${assignee.name}`, at: reportedAt }));

  return {
    id: `INC-${2000 - i}`,
    type,
    status,
    priority: i % 6 === 0 ? "high" : "normal",
    reportedAt,
    description: FILLER_TEXT[type],
    relatedOrder: `ORD-${48100 - i * 13}`,
    reportedBy: { name: reporter, role: "customer" },
    rider: FILLER_RIDERS[i % FILLER_RIDERS.length],
    assignedAdmin: assignee,
    images: i % 3 === 0 ? [] : [{ name: "photo.jpg" }],
    escalation: status === "escalated" ? { to: FILLER_ESCALATION[i % 3], reason: "Needs a decision above support level." } : null,
    resolution: ["resolved", "closed"].includes(status) ? { outcome: FILLER_OUTCOMES[i % 4], note: "" } : null,
    log: [entry({ author: reporter, role: "customer", kind: "message", text: FILLER_TEXT[type], at: reportedAt })],
    timeline,
  };
});

let MOCK_INCIDENTS = [...SEEDED, ...FILLER].map((inc) => ({ escalation: null, resolution: null, ...inc }));

// Labels the mock writes into the timeline; the screen has its own copy in incidents.config.js
const ESCALATION_LABELS = { team_lead: "Team lead", operations_manager: "Operations manager", safety_legal: "Safety and legal" };
const OUTCOME_LABELS = {
  refund_issued: "Refund issued",
  replacement_sent: "Replacement sent",
  rider_warned: "Rider warned",
  no_action_needed: "No action needed",
  other: "Other",
};
const TYPE_LABELS = {
  package_damage: "Package Damage",
  late_delivery: "Late Delivery",
  lost_item: "Lost Item",
  payment_dispute: "Payment Dispute",
  rider_misconduct: "Rider Misconduct",
};

const ACTIVE = ["open", "pending", "escalated"];

const toRow = (inc) => ({
  id: inc.id,
  reportedAt: inc.reportedAt,
  type: inc.type,
  relatedOrder: inc.relatedOrder,
  assignedAdmin: inc.assignedAdmin,
  status: inc.status,
  priority: inc.priority,
});

const findIncident = (id) => MOCK_INCIDENTS.find((inc) => inc.id === id);

// Copy on every write so React Query sees new objects
const update = (id, fn) => {
  const current = findIncident(id);
  if (!current) return Promise.reject(new Error(`Incident ${id} was not found`));
  if (current.status === "closed") return Promise.reject(new Error(`${id} is closed and can’t be changed`));
  let next;
  try {
    next = fn(structuredClone(current));
  } catch (error) {
    return Promise.reject(error);
  }
  MOCK_INCIDENTS = MOCK_INCIDENTS.map((inc) => (inc.id === id ? next : inc));
  return delay(structuredClone(next), 600);
};

const now = () => new Date().toISOString();

// ---- Reads -------------------------------------------------------------------

export const getIncidents = ({ page = 1, pageSize = 10, search = "", status = "all" } = {}) => {
  const term = search.trim().toLowerCase();
  const matches = MOCK_INCIDENTS.filter(
    (inc) =>
      (status === "all" || inc.status === status) &&
      (!term ||
        [inc.id, inc.relatedOrder, inc.assignedAdmin?.name ?? "unassigned", TYPE_LABELS[inc.type]].some((v) =>
          String(v).toLowerCase().includes(term)
        ))
  ).sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));

  return delay({
    results: matches.slice((page - 1) * pageSize, page * pageSize).map(toRow),
    count: matches.length,
    total: MOCK_INCIDENTS.length,
    totalPages: Math.max(1, Math.ceil(matches.length / pageSize)),
  });
};

export const getIncident = (id) => {
  const inc = findIncident(id);
  return inc ? delay(structuredClone(inc), 400) : Promise.reject(new Error(`Incident ${id} was not found`));
};

// Admins who can own an incident, with how many active incidents each already has
export const getIncidentAdmins = () =>
  delay(
    ADMINS.map((a) => ({
      ...a,
      openCount: MOCK_INCIDENTS.filter((inc) => inc.assignedAdmin?.id === a.id && ACTIVE.includes(inc.status)).length,
    })),
    300
  );

// ---- Writes ------------------------------------------------------------------

// Assigning an open incident moves it to pending; pending/escalated keep their status
export const assignIncident = ({ incidentId, adminId }) => {
  const target = ADMINS.find((a) => a.id === adminId);
  if (!target) return Promise.reject(new Error("That admin no longer exists"));
  return update(incidentId, (inc) => {
    if (!ACTIVE.includes(inc.status)) throw new Error(`${inc.id} is already resolved`);
    inc.assignedAdmin = { id: target.id, name: target.name };
    if (inc.status === "open") inc.status = "pending";
    inc.timeline.push(entry({ label: `Assigned to ${target.name}`, at: now(), by: actorName() }));
    return inc;
  });
};

export const escalateIncident = ({ incidentId, to, reason }) =>
  update(incidentId, (inc) => {
    inc.status = "escalated";
    inc.escalation = { to, reason };
    inc.timeline.push(entry({ label: `Escalated to ${ESCALATION_LABELS[to] ?? to}`, at: now(), by: actorName() }));
    inc.log.push(entry({ author: actorName(), role: "admin", kind: "internal", text: reason, at: now() }));
    return inc;
  });

export const resolveIncident = ({ incidentId, outcome, note = "" }) =>
  update(incidentId, (inc) => {
    inc.status = "resolved";
    inc.resolution = { outcome, note };
    inc.timeline.push(entry({ label: `Resolved: ${OUTCOME_LABELS[outcome] ?? outcome}`, at: now(), by: actorName() }));
    return inc;
  });

export const closeIncident = ({ incidentId }) =>
  update(incidentId, (inc) => {
    if (inc.status !== "resolved") throw new Error("Only resolved incidents can be closed");
    inc.status = "closed";
    inc.timeline.push(entry({ label: "Incident closed", at: now(), by: actorName() }));
    return inc;
  });

// kind: "internal" (admins only) | "reporter" (sent to the person who reported it)
export const addIncidentNote = ({ incidentId, kind, text }) =>
  update(incidentId, (inc) => {
    inc.log.push(entry({ author: actorName(), role: "admin", kind, text, at: now() }));
    return inc;
  });
