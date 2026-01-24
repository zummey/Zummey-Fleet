import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllVehicles, createVehicle } from "./fleet.service";

// QUERIES
export const useGetAllVehicles = () =>
  useQuery({
    queryKey: ["vehicles"],
    queryFn: getAllVehicles,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });

// MUTATIONS
export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      // Invalidate and refetch vehicles
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};
