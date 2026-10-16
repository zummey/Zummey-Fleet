import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCustomer, submitFleetReview, updateCustomerStatus } from "./admin.service";

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

/**
 * SUSPEND / REACTIVATE CUSTOMER
 * Used in: Customers.jsx (row menu), CustomerDetails.jsx
 * Payload: { customerId, status: "suspended" | "active" }
 */
export const useUpdateCustomerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["admin", "updateCustomerStatus"],
    mutationFn: updateCustomerStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: (error) => {
      console.error("❌ Failed to update customer status:", error.response?.data || error.message);
    },
  });
};

/**
 * DELETE CUSTOMER
 * Used in: Customers.jsx (row menu), CustomerDetails.jsx
 * Payload: { customerId }
 */
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["admin", "deleteCustomer"],
    mutationFn: deleteCustomer,
    onSuccess: (_data, { customerId }) => {
      queryClient.removeQueries({ queryKey: ["admin", "customers", "detail", customerId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: (error) => {
      console.error("❌ Failed to delete customer:", error.response?.data || error.message);
    },
  });
};
