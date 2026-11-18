import { ACCESS, ADMIN_ROLES, MODULES, permissionsFor } from "../../../auth/adminPermissions";
import { panelClass } from "./adminManagement.config";

export default function PermissionScope({ role, permissions, onRole, onPermission }) {
  const scope = permissionsFor(role, permissions);
  return (
    <section className={panelClass}>
      <h2 className="mb-4 font-semibold">2. What can they do? <span className="font-normal text-slate-500">(permission scope)</span></h2>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Admin role">
        {Object.entries(ADMIN_ROLES).map(([id, label]) => (
          <button key={id} type="button" aria-pressed={role === id} onClick={() => onRole(id)}
            className={`rounded-full border border-slate-200 px-3 py-1.5 text-xs ${role === id ? "bg-[#041a3d] text-white" : "hover:bg-slate-50"}`}>
            {label}
          </button>
        ))}
      </div>
      <p className="my-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
        {role === "custom" ? "Choose an access level for each module." : `${ADMIN_ROLES[role]} preset. Select Custom to adjust individual modules.`}
        {role === "superadmin" && " Includes Pricing and Admin Management."}
      </p>
      {Object.entries(MODULES).map(([id, label]) => (
        <div key={id} role="group" aria-label={label} className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 py-2.5 text-sm">
          <span>{label}</span>
          <div className="grid grid-cols-3 rounded-lg bg-slate-100 p-0.5">
            {Object.entries(ACCESS).map(([access, text]) => (
              <button key={access} type="button" aria-label={`${label} – ${text}`} aria-pressed={scope[id] === access}
                disabled={role !== "custom"} onClick={() => onPermission(id, access)}
                className={`rounded-md px-2.5 py-1.5 text-xs ${scope[id] === access ? "bg-white font-medium shadow-sm" : "text-slate-500 hover:enabled:bg-white/60"}`}>
                {text}
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
