import { requireAdminEdit } from "../auth/useAdminAbility";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addIncidentNote,
  assignIncident,
  closeIncident,
  escalateIncident,
  resolveIncident,
} from "./incidents.service";
import { incidentKeys } from "./incidents.queries";

/**
 * Every incident write returns the updated incident. We put it straight into the
 * details cache (no refetch flash) and refresh the list, counts and assignee load.
 */
const useIncidentMutation = (name, mutationFn, { refreshLists = true } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["admin", name],
    mutationFn: (payload) => {
      requireAdminEdit("incidents");
      return mutationFn(payload);
    },
    onSuccess: (incident) => {
      queryClient.setQueryData(incidentKeys.detail(incident.id), incident);
      if (refreshLists) {
        queryClient.invalidateQueries({
          queryKey: incidentKeys.all,
          predicate: (query) => query.queryKey[2] !== "detail",
        });
        queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      }
    },
    onError: (error) => {
      console.error(`❌ ${name} failed:`, error.response?.data || error.message);
    },
  });
};

/** Payload: { incidentId, adminId } */
export const useAssignIncident = () => useIncidentMutation("assignIncident", assignIncident);

/** Payload: { incidentId, to: "team_lead" | "operations_manager" | "safety_legal", reason } */
export const useEscalateIncident = () => useIncidentMutation("escalateIncident", escalateIncident);

/** Payload: { incidentId, outcome, note? } */
export const useResolveIncident = () => useIncidentMutation("resolveIncident", resolveIncident);

/** Payload: { incidentId } */
export const useCloseIncident = () => useIncidentMutation("closeIncident", closeIncident);

/** Payload: { incidentId, kind: "internal" | "reporter", text } (doesn't change the list) */
export const useAddIncidentNote = () =>
  useIncidentMutation("addIncidentNote", addIncidentNote, { refreshLists: false });
