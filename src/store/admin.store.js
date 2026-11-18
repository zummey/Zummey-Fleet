import { create } from "zustand";
import { persist } from "zustand/middleware";

// Which dashboard is being viewed. Picked from the header dropdown in MainLayout.
// Persisted to localStorage so it survives a page refresh.
//
// TODO: once the backend sends the signed-in user's role, take it from there instead of
// letting anyone pick (the dropdown is a stand-in while the three dashboards are built).

export const ROLES = [
  { id: "fleet", label: "Fleet Manager" },
  { id: "admin", label: "Admin" },
  { id: "superadmin", label: "Super Admin" },
];

const DEFAULT_ROLE = "fleet";
const isRole = (role) => ROLES.some((r) => r.id === role);

// Super admins also get every admin screen, so `isAdmin` is true for both.
// Existing code reads `isAdmin`; super-admin-only screens read `isSuperAdmin`.
const flagsFor = (role) => ({
  role,
  isAdmin: role === "admin" || role === "superadmin",
  isSuperAdmin: role === "superadmin",
});

export const useAdminStore = create(
  persist(
    (set) => ({
      ...flagsFor(DEFAULT_ROLE),
      setRole: (role) => set(flagsFor(isRole(role) ? role : DEFAULT_ROLE)),
    }),
    {
      name: "admin-store",
      version: 1,
      partialize: (state) => ({ role: state.role }),
      // v0 stored { isAdmin: boolean } from the old on/off switch
      migrate: (persisted, version) =>
        version === 0 ? { role: persisted?.isAdmin ? "admin" : DEFAULT_ROLE } : persisted,
      merge: (persisted, current) => ({
        ...current,
        ...flagsFor(isRole(persisted?.role) ? persisted.role : DEFAULT_ROLE),
      }),
    }
  )
);
