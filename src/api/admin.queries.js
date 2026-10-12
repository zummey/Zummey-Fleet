import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardStats } from "./admin.service";

export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: getAdminDashboardStats,
    staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
    refetchInterval: 60 * 1000, // Refetch every 1 minute
    retry: 2,
  });
};
