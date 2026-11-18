import { useAdminStore } from "../../store/admin.store";

/** Renders `superAdmin` when viewing as Super Admin, otherwise `fallback`. Used in AppRoutes. */
const SuperAdminSwitch = ({ superAdmin, fallback = null }) => {
  const isSuperAdmin = useAdminStore((state) => state.isSuperAdmin);
  return isSuperAdmin ? superAdmin : fallback;
};

export default SuperAdminSwitch;
