import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  assignOrder,
  deleteCustomer,
  reviewRefund,
  submitFleetReview,
  submitRiderReview,
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
 * SUBMIT RIDER REVIEW MUTATION
 * Used in: pages/admin/UserManagement/Riders/review/RiderReview.jsx
 * Payload: { riderId, decision: "approve" | "reject" | "clarify", note?, itemsNeeded?, reason? }
 */
export const useSubmitRiderReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["admin", "submitRiderReview"],
    mutationFn: submitRiderReview,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "riders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "riders", "detail", variables.riderId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: (error) => {
      console.error("❌ Failed to submit rider review:", error.response?.data || error.message);
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

/**
 * ASSIGN AN ORDER TO A RIDER OR FLEET
 * Used in: pages/admin/Dispatch/assign/AssignOrder.jsx (suggested + manual assignment)
 * Payload: { orderId, kind: "rider" | "fleet", candidateId, mode: "suggested" | "manual", reason?, note? }
 */
export const useAssignOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["admin", "assignOrder"],
    mutationFn: assignOrder,
    onSuccess: (_data, { orderId }) => {
      // Mark the order stale without refetching it: the assign page is still mounted and
      // the order is no longer "waiting for dispatch", so a refetch would flash an error.
      queryClient.invalidateQueries({ queryKey: ["admin", "dispatch", "order", orderId], refetchType: "none" });
      ["overview", "orders", "riders", "fleets"].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: ["admin", "dispatch", key] })
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: (error) => {
      console.error("❌ Failed to assign order:", error.response?.data || error.message);
    },
  });
};
