import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteCustomer,
  reviewRefund,
  submitFleetReview,
  updateCustomerStatus,
  updatePayout,
} from "./admin.service";

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

/**
 * APPROVE / HOLD / RELEASE PAYOUT
 * Used in: pages/admin/Finance/payouts/usePayoutActions.jsx
 * Payload: { payoutId, action: "approve" | "hold" | "release", reason?, note? }
 */
export const useUpdatePayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["admin", "updatePayout"],
    mutationFn: updatePayout,
    onSuccess: () => {
      // Releasing records a transaction and changes the overview totals
      queryClient.invalidateQueries({ queryKey: ["admin", "finance"] });
    },
    onError: (error) => {
      console.error("❌ Failed to update payout:", error.response?.data || error.message);
    },
  });
};

/**
 * APPROVE / REJECT REFUND
 * Used in: pages/admin/Finance/refunds/useRefundActions.jsx
 * Payload: { refundId, decision: "approve" | "reject", reason?, message? }
 */
export const useReviewRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["admin", "reviewRefund"],
    mutationFn: reviewRefund,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "finance"] });
    },
    onError: (error) => {
      console.error("❌ Failed to review refund:", error.response?.data || error.message);
    },
  });
};
