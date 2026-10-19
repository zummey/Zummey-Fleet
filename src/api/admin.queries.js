import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getAdminDashboardStats,
  getFleetOwners,
  getFleetDetails,
  getFleetRiders,
  getFleetVehicles,
  getFleetPerformance,
  getCustomers,
  getCustomerDetails,
  getCustomerOrders,
  getCustomerComplaints,
  getCustomerPayments,
  getAdminRiders,
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

export const useCustomers = ({ page, pageSize, search, status, minOrders }) => {
  return useQuery({
    queryKey: ["admin", "customers", "list", { page, pageSize, search, status, minOrders }],
    queryFn: () => getCustomers({ page, pageSize, search, status, minOrders }),
    placeholderData: keepPreviousData, // keep the table visible while the next page/filter loads
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};

// Result count for a not-yet-applied filter selection ("Show N Results")
export const useCustomerCount = ({ search, status, minOrders }, { enabled = true } = {}) => {
  return useQuery({
    queryKey: ["admin", "customers", "count", { search, status, minOrders }],
    // TODO: swap for a dedicated count endpoint if the backend provides one
    queryFn: () => getCustomers({ page: 1, pageSize: 1, search, status, minOrders }),
    select: (data) => data.count,
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCustomerDetails = (customerId) => {
  return useQuery({
    queryKey: ["admin", "customers", "detail", customerId],
    queryFn: () => getCustomerDetails(customerId),
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

// Order / complaint / payment history tabs share one shape: { results, count, total, totalPages }
const CUSTOMER_HISTORY_FETCHERS = {
  orders: getCustomerOrders,
  complaints: getCustomerComplaints,
  payments: getCustomerPayments,
};

export const useCustomerHistory = (customerId, kind, { page, pageSize, search }) => {
  return useQuery({
    queryKey: ["admin", "customers", "detail", customerId, kind, { page, pageSize, search }],
    queryFn: () => CUSTOMER_HISTORY_FETCHERS[kind](customerId, { page, pageSize, search }),
    enabled: !!customerId,
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};

export const useAdminRiders = ({ page, pageSize, search, status, riderType, minDeliveries }) => {
  return useQuery({
    queryKey: ["admin", "riders", "list", { page, pageSize, search, status, riderType, minDeliveries }],
    queryFn: () => getAdminRiders({ page, pageSize, search, status, riderType, minDeliveries }),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};

export const useAdminRiderCount = (
  { search, status, riderType, minDeliveries },
  { enabled = true } = {}
) => {
  return useQuery({
    queryKey: ["admin", "riders", "count", { search, status, riderType, minDeliveries }],
    queryFn: () => getAdminRiders({ page: 1, pageSize: 1, search, status, riderType, minDeliveries }),
    select: (data) => data.count,
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  });
};

