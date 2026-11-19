import { Navigate, Outlet, useLocation } from "react-router-dom";
import { actionForPath, normalizeAdminPath, scopeForPath } from "../auth/adminPermissions";
import { useAdminAbility } from "../auth/useAdminAbility";
import { useAdminStore } from "../store/admin.store";

export function AdminPermissionsRoute() {
  const { pathname } = useLocation();
  const role = useAdminStore((state) => state.role);
  const isAdmin = useAdminStore((state) => state.isAdmin);
  const ability = useAdminAbility();
  const path = normalizeAdminPath(pathname);
  const scope = scopeForPath(path);

  if (!isAdmin && (/^\/(admin-management|platform-settings|pricing-management|live-tracking|admin)(\/|$)/i.test(path))) {
    return <Navigate to="/dashboard" replace />;
  }
  if (isAdmin && path.startsWith("/riders-management/add-rider/")) {
    return <Navigate to="/dashboard" replace />;
  }
  if (isAdmin && scope && ability.cannot(actionForPath(path), scope)) {
    const parent = path.endsWith("/assign") ? "/dispatch-management"
      : path.endsWith("/new-broadcast") ? "/communications"
      : path.split("/").slice(0, -1).join("/");
    const destination = scopeForPath(parent) === scope && ability.can("read", scope) ? parent : "/dashboard";
    return <Navigate to={destination} replace />;
  }
  return <Outlet key={role} />;
}

export function UserManagementIndex() {
  const ability = useAdminAbility();
  const module = ["customers", "riders"].find((subject) => ability.can("read", subject));
  return <Navigate to={module ? "/user-management/" + module : "/dashboard"} replace />;
}
