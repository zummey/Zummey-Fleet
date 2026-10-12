import { create } from "zustand";
import { persist } from "zustand/middleware";

// Global admin-mode flag. Toggled from the header switch in MainLayout;
// Dashboard.jsx reads it to decide between the admin and fleet views.
// Persisted to localStorage so it survives a page refresh.
export const useAdminStore = create(
  persist(
    (set) => ({
      isAdmin: false,
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      toggleIsAdmin: () => set((state) => ({ isAdmin: !state.isAdmin })),
    }),
    {
      name: "admin-store",
      partialize: (state) => ({ isAdmin: state.isAdmin }),
    }
  )
);
