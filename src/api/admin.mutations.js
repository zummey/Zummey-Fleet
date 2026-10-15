import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitFleetReview } from "./admin.service";

/**
 * SUBMIT FLEET REVIEW MUTATION
 * Used in: pages/admin/FleetManagement/review/FleetReview.jsx
 * Payload: { fleetId, decision: "approve" | "reject" | "clarify", note?, checklist? }
 */
export const useSubmitFleetReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["admin", "submitFleetReview"],
    mutationFn: submitFleetReview,
    onSuccess: () => {
      // Status changes affect the fleet list, the details page and the dashboard counts
      queryClient.invalidateQueries({ queryKey: ["admin", "fleets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: (error) => {
      console.error("❌ Failed to submit fleet review:", error.response?.data || error.message);
    },
  });
};
