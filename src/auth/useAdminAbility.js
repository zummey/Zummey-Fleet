import { useMemo } from "react";
import { createAdminAbility } from "./adminPermissions";
import { useAdminStore } from "../store/admin.store";
import { useAdminDirectory } from "../store/adminDirectory.store";

function abilityForSelection(role, record) {
  if (!role.startsWith("custom:")) return createAdminAbility(role);
  return createAdminAbility(record?.role === "custom" && record.status !== "suspended" ? "custom" : "fleet", record?.permissions);
}

export function useAdminAbility() {
  const role = useAdminStore((state) => state.role);
  const record = useAdminDirectory((state) => state.records.find(({ id }) => role === "custom:" + id));
  return useMemo(() => abilityForSelection(role, record), [role, record]);
}

export function requireAdminEdit(module) {
  const { role } = useAdminStore.getState();
  const record = useAdminDirectory.getState().records.find(({ id }) => role === "custom:" + id);
  if (abilityForSelection(role, record).cannot("edit", module)) {
    throw new Error("Your current role cannot edit this module.");
  }
}
