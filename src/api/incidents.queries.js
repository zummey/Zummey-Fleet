import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getIncident, getIncidentAdmins, getIncidents } from "./incidents.service";

export const incidentKeys = {
  all: ["admin", "incidents"],
  list: (params) => ["admin", "incidents", "list", params],
  count: (params) => ["admin", "incidents", "count", params],
  detail: (id) => ["admin", "incidents", "detail", id],
  admins: ["admin", "incidents", "admins"],
};

export const useIncidents = ({ page, pageSize, search, status }) => {
  return useQuery({
    queryKey: incidentKeys.list({ page, pageSize, search, status }),
    queryFn: () => getIncidents({ page, pageSize, search, status }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    retry: 2,
  });
};

// Result count for a not-yet-applied filter selection ("Show N Results")
export const useIncidentCount = ({ search, status }, { enabled = true } = {}) => {
  return useQuery({
    queryKey: incidentKeys.count({ search, status }),
    // TODO: swap for a dedicated count endpoint if the backend provides one
    queryFn: () => getIncidents({ page: 1, pageSize: 1, search, status }),
    select: (data) => data.count,
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};

export const useIncident = (incidentId) => {
  return useQuery({
    queryKey: incidentKeys.detail(incidentId),
    queryFn: () => getIncident(incidentId),
    enabled: !!incidentId,
    staleTime: 30 * 1000,
    retry: 1,
  });
};

// Fetched when the assign popup opens
export const useIncidentAdmins = ({ enabled = true } = {}) => {
  return useQuery({
    queryKey: incidentKeys.admins,
    queryFn: getIncidentAdmins,
    enabled,
    staleTime: 60 * 1000,
    retry: 1,
  });
};
