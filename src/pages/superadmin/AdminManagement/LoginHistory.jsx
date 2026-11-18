import DataTable from "../../admin/components/DataTable";
import EmptyState from "../../admin/components/EmptyState";
import AdminBadge from "./AdminBadge";
import { sampleLogins } from "./adminHistory.samples";
import { panelClass } from "./adminManagement.config";

const columns = [
  { key: "dateLabel", label: "Date and time" },
  { key: "device", label: "Device", className: "text-slate-500" },
  { key: "place", label: "Place", className: "text-slate-500" },
  { key: "ip", label: "IP address", className: "text-slate-500" },
  {
    key: "result",
    label: "Result",
    render: ({ result }) => <AdminBadge tone={result === "Signed in" ? "active" : "invited"}>{result}</AdminBadge>,
  },
];

export default function LoginHistory({ admin }) {
  const rows = sampleLogins[admin.id] ?? (admin.lastLogin
    ? [{ id: "last-login", dateLabel: admin.lastLogin, result: "Signed in" }]
    : []);

  return (
    <section className={panelClass} aria-labelledby="login-history-heading">
      <h2 id="login-history-heading" className="mb-4 font-semibold">Login history</h2>
      {rows.length ? (
        <div className="overflow-hidden rounded-xl border border-slate-100 [&_th]:bg-slate-50 [&_th]:pl-3">
          <DataTable columns={columns} rows={rows} minWidth="min-w-[580px]" cellClassName="py-3 pl-3" />
        </div>
      ) : (
        <EmptyState title="No logins recorded" />
      )}
    </section>
  );
}
