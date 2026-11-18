const tones = {
  active: "bg-emerald-50 text-emerald-800",
  edit: "bg-emerald-50 text-emerald-800",
  suspended: "bg-red-50 text-red-700",
  invited: "bg-amber-50 text-amber-800",
  read: "bg-blue-50 text-blue-800",
  superadmin: "bg-violet-50 text-violet-800",
};

export default function AdminBadge({ tone, children }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs ${tones[tone] ?? "bg-slate-100 text-slate-600"}`}>
      {children}
    </span>
  );
}
