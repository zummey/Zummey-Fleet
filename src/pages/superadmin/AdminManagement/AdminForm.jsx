import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ADMIN_ROLES, MODULES, permissionsFor } from "../../../auth/adminPermissions";
import { requireAdminEdit } from "../../../auth/useAdminAbility";
import { OWNER_ID, useAdminDirectory } from "../../../store/adminDirectory.store";
import FormField from "../Pricing/shared/FormField";
import PermissionScope from "./PermissionScope";
import { DIRECTORY, headingClass, panelClass, primaryClass, secondaryClass } from "./adminManagement.config";

const fields = [
  { key: "name", label: "Full name", placeholder: "For example: Chidi Okafor", autoComplete: "name", required: true },
  { key: "email", label: "Work email", placeholder: "name@zummey.com", autoComplete: "email", type: "email", required: true },
  { key: "phone", label: "Phone number", placeholder: "0803 123 4567", autoComplete: "tel", type: "tel" },
];

function AdminFormFields({ admin }) {
  const [identity, setIdentity] = useState(() => ({ name: admin?.name ?? "", email: admin?.email ?? "", phone: admin?.phone ?? "" }));
  const [role, setRole] = useState(admin?.role ?? "custom");
  const [permissions, setPermissions] = useState(() => permissionsFor(admin?.role, admin?.permissions));
  const [error, setError] = useState("");
  const saveAdmin = useAdminDirectory((state) => state.saveAdmin);
  const navigate = useNavigate();
  const accessCount = Object.values(permissionsFor(role, permissions)).filter((access) => access !== "none").length;
  const cancelUrl = admin ? `${DIRECTORY}/${admin.id}` : DIRECTORY;

  const submit = (event) => {
    event.preventDefault();
    try {
      requireAdminEdit("admins");
      const values = Object.fromEntries(Object.entries(identity).map(([key, value]) => [key, value.trim()]));
      if (!values.name) throw new Error("Enter the admin’s full name.");
      const id = saveAdmin(admin?.id, { ...values, role, permissions: permissionsFor(role, permissions) });
      navigate(`${DIRECTORY}/${id}`, {
        replace: true,
        state: { message: admin ? "Admin details saved." : "Admin invitation recorded in this browser." },
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6 text-[#172443]">
      <h1 className={headingClass}>{admin ? "Admin details" : "Create Admin"}</h1>
      <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] lg:items-start">
        <div className="space-y-5">
          <section className={panelClass}>
            <h2 className="mb-4 font-semibold">1. Who is this admin?</h2>
            <div className="space-y-4">
              {fields.map(({ key, ...field }) => (
                <FormField key={key} {...field} value={identity[key]} onChange={(value) => setIdentity({ ...identity, [key]: value })} />
              ))}
            </div>
          </section>
          <PermissionScope role={role} permissions={permissions} onRole={(next) => {
            if (next === "custom" && role !== "custom") setPermissions(permissionsFor(role));
            setRole(next);
          }} onPermission={(id, access) => setPermissions((prev) => ({ ...prev, [id]: access }))} />
        </div>
        <aside className={panelClass}>
          <h2 className="mb-3 font-semibold">Summary</h2>
          <dl className="mb-4 divide-y divide-slate-100 text-sm">
            {[
              ["Name", identity.name], ["Email", identity.email], ["Role", ADMIN_ROLES[role]],
              ["Access to", `${accessCount} of ${Object.keys(MODULES).length} modules${role === "superadmin" ? " + 2 Super Admin modules" : ""}`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2.5">
                <dt className="shrink-0 text-slate-500">{label}</dt><dd className="break-all text-right">{value || "—"}</dd>
              </div>
            ))}
          </dl>
          {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
          {!admin && <p className="mb-3 text-xs text-slate-500">Invitations are recorded locally in this preview.</p>}
          <div className="grid gap-2">
            <button type="submit" className={primaryClass}>{admin ? "Save changes" : "Create admin"}</button>
            <Link to={cancelUrl} className={secondaryClass}>Cancel</Link>
          </div>
        </aside>
      </form>
    </div>
  );
}

export default function AdminForm() {
  const { adminId } = useParams();
  const admin = useAdminDirectory((state) => state.records.find((record) => record.id === adminId));
  if (adminId && (!admin || adminId === OWNER_ID)) return <Navigate to={admin ? `${DIRECTORY}/${adminId}` : DIRECTORY} replace />;
  return <AdminFormFields key={adminId ?? "new"} admin={admin} />;
}
