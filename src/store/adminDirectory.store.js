import { create } from "zustand";
import { persist } from "zustand/middleware";

export const OWNER_ID = "nosa-okoro";

const samples = [
  ["Nosa Okoro", "nosa", "superadmin", "active", "Nov 18, 09:42"],
  ["Amara Eze", "amara.eze", "operations", "active", "Nov 18, 08:15", "0802 114 7701"],
  ["Tolu Adeyemi", "tolu.adeyemi", "finance", "active", "Nov 17, 17:30"],
  ["Ibrahim Musa", "ibrahim.musa", "support", "active", "Nov 13, 11:02"],
  ["Chiamaka Obi", "chiamaka.obi", "dispatch", "active", "Nov 18, 07:50"],
  ["Segun Ajayi", "segun.ajayi", "finance", "suspended", "Oct 29, 14:20"],
  ["Hadiza Bello", "hadiza.bello", "support", "active", "Nov 12, 16:05"],
  ["Chidi Okafor", "chidi.okafor", "operations", "invited"],
  ["Amina Yusuf", "amina.yusuf", "dispatch", "active", "Nov 17, 12:30"],
  ["Femi Ojo", "femi.ojo", "operations", "active", "Nov 16, 09:20"],
  ["Ngozi Eke", "ngozi.eke", "support", "invited"],
  ["Kemi Balogun", "kemi.balogun", "finance", "active", "Nov 17, 08:40"],
];

const initialRecords = samples.map(([name, username, role, status, lastLogin, phone]) => ({
  id: name.toLowerCase().replaceAll(" ", "-"),
  name, email: username + "@zummey.com", phone, role, status,
  createdAt: "2026-04-12T12:00:00Z",
  lastLogin,
  activity: [],
}));

const event = (message) => ({ message, date: new Date().toISOString() });

export const useAdminDirectory = create(persist((set, get) => ({
  records: initialRecords,
  saveAdmin: (id, values) => {
    const records = get().records;
    if (id === OWNER_ID) throw new Error("The current Super Admin account is protected.");
    if (records.some((record) => record.id !== id && record.email.toLowerCase() === values.email.toLowerCase())) {
      throw new Error("An admin with this email already exists.");
    }
    if (id && !records.some((record) => record.id === id)) throw new Error("Admin record unavailable.");
    const adminId = id ?? crypto.randomUUID();
    set({
      records: id
        ? records.map((record) => record.id === id
          ? { ...record, ...values, activity: [event("Admin details updated"), ...record.activity] }
          : record)
        : [...records, { ...values, id: adminId, status: "invited", createdAt: new Date().toISOString(), activity: [event("Admin invitation recorded")] }],
    });
    return adminId;
  },
  toggleStatus: (id) => set(({ records }) => ({
    records: records.map((record) => {
      if (record.id !== id || id === OWNER_ID) return record;
      const status = record.status === "suspended" ? record.previousStatus ?? "active" : "suspended";
      return {
        ...record, status, previousStatus: record.status,
        activity: [event(status === "suspended" ? "Admin suspended" : "Admin reactivated"), ...record.activity],
      };
    }),
  })),
}), { name: "admin-directory", partialize: ({ records }) => ({ records }) }));
