import { ACCESS, ADMIN_ROLES, createAdminAbility, LOCKED_MODULES, MODULES } from "../../../auth/adminPermissions";
import DataTable from "../../admin/components/DataTable";
import AdminBadge from "./AdminBadge";
import { panelClass } from "./adminManagement.config";

const meanings = {
  none: "Cannot open this module.",
  read: "Can look, but cannot change anything.",
  edit: "Can look and make changes.",
  locked: "Available only to Super Admins.",
};

const columns = [
  { key: "name", label: "Module" },
  { key: "access", label: "Access", render: ({ access, lockedModule }) => (
    <AdminBadge tone={lockedModule && access === "edit" ? "superadmin" : access}>{ACCESS[access] ?? "Locked"}</AdminBadge>
  ) },
  { key: "meaning", label: "What it means", className: "text-slate-500" },
];

export default function AssignedPermissions({ admin }) {
  const ability = createAdminAbility(admin.role, admin.permissions);
  const regular = Object.entries(MODULES).map(([id, name]) => {
    const access = ability.can("edit", id) ? "edit" : ability.can("read", id) ? "read" : "none";
    return { id, name, access, meaning: meanings[access] };
  });
  const restricted = Object.entries(LOCKED_MODULES).map(([id, name]) => {
    const access = ability.can("edit", id) ? "edit" : "locked";
    return { id, name, access, lockedModule: true, meaning: access === "edit" ? "Super Admin only. Full control." : meanings.locked };
  });
  return (
    <section className={panelClass}>
      <h2 className="font-semibold">Assigned permissions</h2>
      <p className="mb-4 mt-1 text-xs text-slate-500">
        {ADMIN_ROLES[admin.role]}. Access to {regular.filter(({ access }) => access !== "none").length} of {regular.length} modules.
        {admin.role === "superadmin" && " Includes Pricing and Admin Management."}
      </p>
      <div className="rounded-xl border border-slate-100 px-3">
        <DataTable columns={columns} rows={[...regular, ...restricted]} minWidth="min-w-[560px]" cellClassName="py-3" />
      </div>
    </section>
  );
}
