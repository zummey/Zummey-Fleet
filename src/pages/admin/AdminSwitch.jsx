import { useAdminStore } from "../../store/admin.store";

/**
 * Renders `admin` when the global isAdmin flag is on, otherwise `fallback`.
 * Used in AppRoutes so admin and fleet-owner pages can share a URL.
 */
const AdminSwitch = ({ admin, fallback = null }) => {
  const isAdmin = useAdminStore((state) => state.isAdmin);
  return isAdmin ? admin : fallback;
};

export default AdminSwitch;
