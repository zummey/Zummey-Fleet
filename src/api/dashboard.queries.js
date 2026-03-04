import { useQuery } from "@tanstack/react-query";
import {
  getDashboardMetrics,
  getAllVehicles,
  getOngoingOrders,
} from "./fleet.service";

export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ["dashboard", "metrics"],
    queryFn: getDashboardMetrics,
    staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
    refetchInterval: 60 * 1000, // Refetch every 1 minute
    retry: 2,
  });
};

export const useAllVehicles = () => {
  return useQuery({
    queryKey: ["vehicles", "all"],
    queryFn: getAllVehicles,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every 1 minute
    retry: 2,
  });
};

export const useOngoingOrders = () => {
  return useQuery({
    queryKey: ["orders", "ongoing"],
    queryFn: getOngoingOrders,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every 1 minute
    retry: 2,
  });
};
