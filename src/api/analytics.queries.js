import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getAnalyticsSeries,
  getAnalyticsSummary,
  getFleetUtilization,
  getRiderPerformance,
} from "./analytics.service";

export const useAnalyticsSummary = () => {
  return useQuery({
    queryKey: ["admin", "analytics", "summary"],
    queryFn: getAnalyticsSummary,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

// metric: "orders" | "revenue"; range: "7d" | "30d" | "12m"
export const useAnalyticsSeries = ({ metric, range }) => {
  return useQuery({
    queryKey: ["admin", "analytics", "series", { metric, range }],
    queryFn: () => getAnalyticsSeries({ metric, range }),
    placeholderData: keepPreviousData, // keep the old bars while a new range loads
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useRiderPerformance = ({ range, metric, search }) => {
  return useQuery({
    queryKey: ["admin", "analytics", "riders", { range, metric, search }],
    queryFn: () => getRiderPerformance({ range, metric, search }),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useFleetUtilization = ({ range }) => {
  return useQuery({
    queryKey: ["admin", "analytics", "fleets", { range }],
    queryFn: () => getFleetUtilization({ range }),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
