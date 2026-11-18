import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ADMIN_ROLES } from "../../../auth/adminPermissions";
import { requireAdminEdit } from "../../../auth/useAdminAbility";
import { OWNER_ID, useAdminDirectory } from "../../../store/adminDirectory.store";
import Avatar from "../../admin/components/Avatar";
import ConfirmDialog from "../../admin/components/ConfirmDialog";
import DetailTabs from "../../admin/components/DetailTabs";
import EmptyState from "../../admin/components/EmptyState";
import AdminBadge from "./AdminBadge";
import ActivityLogs from "./ActivityLogs";
import LoginHistory from "./LoginHistory";
import AssignedPermissions from "./AssignedPermissions";
import { DIRECTORY, headingClass, panelClass, secondaryClass, STATUSES } from "./adminManagement.config";

const tabs = [
  { id: "permissions", label: "Assigned permissions" },
  { id: "activity", label: "Activity logs" },
  { id: "logins", label: "Login history" },
];
const dateLabel = (date) => new Date(date).toLocaleDateString(undefined, { dateStyle: "medium" });

function AdminProfile({ admin }) {
  const [tab, setTab] = useState("permissions");
  const [confirm, setConfirm] = useState(false);
  const { state } = useLocation();
  const toggleStatus = useAdminDirectory((store) => store.toggleStatus);
  const action = admin.status === "suspended" ? "Reactivate" : "Suspend";

  return (
    <div className="space-y-5 text-[#172443]">
      <div className="flex items-center justify-between gap-3">
        <h1 className={headingClass}>Admin details</h1>
        <Link to={DIRECTORY} className="text-sm text-[#343C6A] hover:underline">All admins</Link>
      </div>
      {state?.message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{state.message}</p>}
      <section className={`${panelClass} flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <Avatar name={admin.name} size="h-14 w-14" colorful />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">{admin.name}</h2>
              <AdminBadge tone={admin.role === "superadmin" ? admin.role : "read"}>{ADMIN_ROLES[admin.role]}</AdminBadge>
              <AdminBadge tone={admin.status}>{STATUSES[admin.status]}</AdminBadge>
            </div>
            <p className="text-sm text-slate-600">{admin.email}{admin.phone && ` · ${admin.phone}`}</p>
            <p className="text-xs text-slate-500">Last login {admin.lastLogin ?? "—"} · Created {dateLabel(admin.createdAt)}</p>
          </div>
        </div>
        {admin.id !== OWNER_ID && (
          <div className="flex flex-wrap gap-2">
            <Link className={secondaryClass} to={`${DIRECTORY}/${admin.id}/edit-permissions`}>Edit permissions</Link>
            <button type="button" onClick={() => setConfirm(true)} className={`${secondaryClass} border-red-200 text-red-700`}>{action} admin</button>
          </div>
        )}
      </section>
      <div className="border-b border-slate-200 pt-4">
        <DetailTabs tabs={tabs} activeTab={tab} onChange={setTab} idPrefix="admin-details" label="Admin details" />
      </div>
      <div role="tabpanel" id={`admin-details-panel-${tab}`} aria-labelledby={`admin-details-tab-${tab}`} tabIndex={0}>
        {tab === "permissions" && <AssignedPermissions admin={admin} />}
        {tab === "activity" && <ActivityLogs admin={admin} />}
        {tab === "logins" && <LoginHistory admin={admin} />}
      </div>
      {confirm && <ConfirmDialog title={`${action} admin?`} confirmLabel={`${action} admin`}
        description={`${action} ${admin.name}’s admin record.`} tone={action === "Suspend" ? "danger" : "default"}
        onClose={() => setConfirm(false)} onConfirm={() => {
          requireAdminEdit("admins");
          toggleStatus(admin.id);
          setConfirm(false);
        }} />}
    </div>
  );
}

export default function AdminDetails() {
  const { adminId } = useParams();
  const admin = useAdminDirectory((state) => state.records.find((record) => record.id === adminId));
  if (!admin) return <EmptyState title="Admin record unavailable" description="Return to Admin Management to select an admin." />;
  return <AdminProfile key={adminId} admin={admin} />;
}
