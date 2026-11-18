import { useState } from "react";
import { MODULES } from "../../../auth/adminPermissions";
import EmptyState from "../../admin/components/EmptyState";
import AdminBadge from "./AdminBadge";
import { sampleActivity } from "./adminHistory.samples";
import { panelClass } from "./adminManagement.config";

const filters = [
  ["all", "All"],
  ...["orders", "incidents", "riders", "dispatch", "tracking"].map((id) => [id, MODULES[id]]),
];
const localDate = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function ActivityLogs({ admin }) {
  const [filter, setFilter] = useState("all");
  const events = [
    ...(admin.activity ?? []).map((event, index) => ({ ...event, id: `local-${index}` })),
    ...(sampleActivity[admin.id] ?? []),
  ];
  const visible = filter === "all" ? events : events.filter((event) => event.module === filter);

  return (
    <section className={panelClass} aria-labelledby="activity-logs-heading">
      <h2 id="activity-logs-heading" className="mb-4 font-semibold">Activity logs</h2>
      <div role="group" aria-label="Filter activity by module" className="mb-3 flex flex-wrap gap-2">
        {filters.map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${filter === id
              ? "border-[#172443] bg-[#172443] text-white"
              : "border-slate-200 text-[#343C6A] hover:bg-slate-50"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {visible.length ? (
        <ul className="divide-y divide-slate-100 border-y border-slate-100">
          {visible.map(({ id, date, dateLabel, message, module }) => (
            <li key={id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-3 sm:grid-cols-[9rem_minmax(0,1fr)_auto]">
              <time dateTime={date} className="col-span-2 text-xs text-slate-500 sm:col-span-1">
                {dateLabel ?? localDate.format(new Date(date))}
              </time>
              <span className="text-sm">{message}</span>
              <AdminBadge>{MODULES[module] ?? "Admin Management"}</AdminBadge>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={filter === "all" ? "No activity recorded" : `No ${MODULES[filter]} activity recorded`} />
      )}
    </section>
  );
}
