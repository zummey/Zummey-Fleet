export const DIRECTORY = "/admin-management";
export const STATUSES = { active: "Active", invited: "Invited", suspended: "Suspended" };
export const STATUS_FILTERS = [{
  id: "status",
  label: "Status",
  options: [{ value: "all", label: "All" }, ...Object.entries(STATUSES).map(([value, label]) => ({ value, label }))],
}];

export const panelClass = "rounded-2xl border border-slate-200 bg-white p-5 sm:p-6";
export const headingClass = "text-xl font-semibold text-[#343C6A]";
export const primaryClass = "inline-flex items-center justify-center gap-2 rounded-lg bg-[#041a3d] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#142c51]";
export const secondaryClass = "inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-[#343C6A] hover:bg-slate-50";
