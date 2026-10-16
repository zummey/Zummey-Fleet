import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import { CUSTOMER_CONFIRM_ACTIONS } from "./details/customerDetails.config";
import { useDeleteCustomer, useUpdateCustomerStatus } from "../../../../api/admin.mutations";

const STATUS_FOR_ACTION = { suspend: "suspended", reactivate: "active" };

/**
 * Shared handler for customer actions (row menu on the list, buttons on the details page).
 * Navigation actions run immediately; suspend / reactivate / delete open a confirm dialog.
 *
 * Returns { handleAction(actionId, customer), dialog } — render `dialog` somewhere in the page.
 */
export const useCustomerActions = ({ onDeleted } = {}) => {
  const navigate = useNavigate();
  const updateStatus = useUpdateCustomerStatus();
  const remove = useDeleteCustomer();
  const [pending, setPending] = useState(null); // { actionId, customer }

  const mutation = pending?.actionId === "delete" ? remove : updateStatus;
  const detailsPath = (customer) => `/user-management/customers/${customer.id}`;

  const handleAction = (actionId, customer) => {
    switch (actionId) {
      case "view":
        navigate(detailsPath(customer));
        break;
      case "complaints":
      case "payments":
        navigate(`${detailsPath(customer)}?tab=${actionId}`);
        break;
      case "suspend":
      case "reactivate":
      case "delete":
        updateStatus.reset();
        remove.reset();
        setPending({ actionId, customer });
        break;
      default:
        break;
    }
  };

  const close = () => setPending(null);

  const confirm = () => {
    const { actionId, customer } = pending;
    if (actionId === "delete") {
      remove.mutate(
        { customerId: customer.id },
        {
          onSuccess: () => {
            close();
            onDeleted?.(customer);
          },
        }
      );
    } else {
      updateStatus.mutate({ customerId: customer.id, status: STATUS_FOR_ACTION[actionId] }, { onSuccess: close });
    }
  };

  const copy = pending && CUSTOMER_CONFIRM_ACTIONS[pending.actionId];

  const dialog = copy ? (
    <ConfirmDialog
      title={copy.title}
      description={copy.description(pending.customer)}
      confirmLabel={copy.confirmLabel}
      tone={copy.tone}
      isPending={mutation.isPending}
      error={mutation.error}
      onConfirm={confirm}
      onClose={close}
    />
  ) : null;

  return { handleAction, dialog };
};
