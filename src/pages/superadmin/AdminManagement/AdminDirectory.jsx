import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, Pencil, Plus } from "lucide-react";
import { ADMIN_ROLES } from "../../../auth/adminPermissions";
import { OWNER_ID, useAdminDirectory } from "../../../store/adminDirectory.store";
import Avatar from "../../admin/components/Avatar";
import DataTable from "../../admin/components/DataTable";
import EmptyState from "../../admin/components/EmptyState";
import FilterPanel from "../../admin/components/FilterPanel";
import RowActionsMenu from "../../admin/components/RowActionsMenu";
import AdminBadge from "./AdminBadge";
import { DIRECTORY, headingClass, panelClass, primaryClass, STATUSES, STATUS_FILTERS } from "./adminManagement.config";

const filterRecords = (records, status) =>
  status === "all" ? records : records.filter((record) => record.status === status);

export default function AdminDirectory() {
  const records = useAdminDirectory((state) => state.records);
  const [filter, setFilter] = useState({ status: "all" });
  const [draft, setDraft] = useState(null);
  const navigate = useNavigate();
  const { state } = useLocation();
  const rows = filterRecords(records, filter.status);
  const columns = [
    {
      key: "name", label: "Name", render: (record) => (
        <Link to={`${DIRECTORY}/${record.id}`} className="flex items-center gap-2 font-semibold hover:underline">
          <Avatar name={record.name} colorful size="h-8 w-8" />
          {record.name}
          {record.id === OWNER_ID && <AdminBadge>You</AdminBadge>}
        </Link>
      ),
    },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", render: ({ role }) => <AdminBadge tone={role === "superadmin" ? role : "read"}>{ADMIN_ROLES[role]}</AdminBadge> },
    { key: "status", label: "Status", render: ({ status }) => <AdminBadge tone={status}>{STATUSES[status]}</AdminBadge> },
    { key: "lastLogin", label: "Last login" },
    {
      key: "actions", label: "Actions", srOnlyLabel: true, render: (record) => (
        <RowActionsMenu
          label={`Actions for ${record.name}`}
          actions={[
            { id: "details", label: "View details", icon: Eye },
            ...(record.id === OWNER_ID ? [] : [{ id: "edit", label: "Edit permissions", icon: Pencil }]),
          ]}
          onSelect={(action) => navigate(`${DIRECTORY}/${record.id}${action === "edit" ? "/edit-permissions" : ""}`)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className={headingClass}>Admin Management</h1>
      {state?.message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{state.message}</p>}
      <section className={panelClass}>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className={headingClass}>All admins</h2>
            <p className="mt-1 text-xs text-slate-500">Showing {rows.length} of {records.length} admins</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to={DIRECTORY + "/new"} className={primaryClass}><Plus size={16} />Create admin</Link>
            <FilterPanel groups={STATUS_FILTERS} value={filter} onApply={setFilter} onDraftChange={setDraft}
              resultCount={draft ? filterRecords(records, draft.status).length : null} />
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 px-3">
          <DataTable columns={columns} rows={rows} cellClassName="py-3" />
          {!rows.length && <EmptyState title="No admins found" action={{ label: "Clear filter", onClick: () => setFilter({ status: "all" }) }} />}
        </div>
      </section>
    </div>
  );
}
