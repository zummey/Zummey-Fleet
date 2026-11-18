import React, { useId } from "react";
import { ChevronDown } from "lucide-react";
import { useAdminDirectory } from "../../store/adminDirectory.store";
import { ROLES, useAdminStore } from "../../store/admin.store";

/** Header dropdown for previewing dashboard permissions. */
const RoleSelect = () => {
  const role = useAdminStore((state) => state.role);
  const setRole = useAdminStore((state) => state.setRole);
  const id = useId();
  const records = useAdminDirectory((state) => state.records);
  const custom = records.filter((admin) => admin.role === "custom" && admin.status !== "suspended");
  const options = [...ROLES, ...custom.map((admin) => ({ id: "custom:" + admin.id, label: "Custom · " + admin.name }))];
  const selectionAvailable = options.some((option) => option.id === role);

  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        View as
      </label>
      <select
        id={id}
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="h-10 cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white pr-9 pl-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 focus:border-[#EB4827]/60 focus:ring-2 focus:ring-[#FFF4E8] focus:outline-none"
      >
        {!selectionAvailable && <option value={role} disabled>Role unavailable</option>}
        {options.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
      />
    </div>
  );
};

export default RoleSelect;
