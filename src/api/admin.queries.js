import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getAdminDashboardStats,
  getFleetOwners,
  getFleetDetails,
  getFleetRiders,
  getFleetVehicles,
  getFleetPerformance,
} from "./admin.service";

export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: getAdminDashboardStats,
    staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
    refetchInterval: 60 * 1000, // Refetch every 1 minute
    retry: 2,
  });
};

export const useFleetOwners = ({ page, pageSize }) => {
  return useQuery({
    queryKey: ["admin", "fleets", { page, pageSize }],
    queryFn: () => getFleetOwners({ page, pageSize }),
    placeholderData: keepPreviousData, // keep current page visible while the next loads
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};

export const useFleetDetails = (fleetId) => {
  return useQuery({
    queryKey: ["admin", "fleets", fleetId],
    queryFn: () => getFleetDetails(fleetId),
    enabled: !!fleetId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

export const useFleetRiders = (fleetId) => {
  return useQuery({
    queryKey: ["admin", "fleets", fleetId, "riders"],
    queryFn: () => getFleetRiders(fleetId),
    enabled: !!fleetId,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};

export const useFleetVehicles = (fleetId) => {
  return useQuery({
    queryKey: ["admin", "fleets", fleetId, "vehicles"],
    queryFn: () => getFleetVehicles(fleetId),
    enabled: !!fleetId,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};

export const useFleetPerformance = (fleetId) => {
  return useQuery({
    queryKey: ["admin", "fleets", fleetId, "performance"],
    queryFn: () => getFleetPerformance(fleetId),
    enabled: !!fleetId,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};
