import React, { useState } from "react";
import ConfirmDialog from "../../../admin/components/ConfirmDialog";
import PricingOverview from "./PricingOverview";
import SurgeRules from "./SurgeRules";
import EditRateModal from "./EditRateModal";
import SurgeRuleModal from "./SurgeRuleModal";
import { SURGE_DIALOGS } from "../pricing.config";
import { usePricingRates, useSurgeRules } from "../../../../api/pricing.queries";
import {
  useCreateSurgeRule,
  useDeleteSurgeRule,
  useUpdatePricingRates,
  useUpdateSurgeRule,
} from "../../../../api/pricing.mutations";

/**
 * Pricing Dashboard tab: rate cards and surge rules.
 * dialog: { type: "rate", card } | { type: "create" } | { type: "edit", rule } | { type: "delete", rule }
 */
const PricingDashboard = () => {
  const rates = usePricingRates();
  const rules = useSurgeRules();
  const [dialog, setDialog] = useState(null);

  const updateRates = useUpdatePricingRates();
  const createRule = useCreateSurgeRule();
  const updateRule = useUpdateSurgeRule();
  const deleteRule = useDeleteSurgeRule();
  const setStatus = useUpdateSurgeRule(); // separate instance so pause errors don't show in the edit dialog

  const open = (next, mutation) => {
    mutation?.reset();
    setStatus.reset();
    setDialog(next);
  };
  const close = () => setDialog(null);

  const handleAction = (action, rule) => {
    if (action === "pause" || action === "resume") {
      setStatus.mutate({ id: rule.id, status: action === "pause" ? "paused" : "active" });
    } else if (action === "edit") open({ type: "edit", rule }, updateRule);
    else if (action === "delete") open({ type: "delete", rule }, deleteRule);
  };

  return (
    <div className="space-y-5">
      <PricingOverview rates={rates} rules={rules} onEditRate={(card) => open({ type: "rate", card }, updateRates)} />

      <SurgeRules
        rules={rules}
        pendingId={setStatus.isPending ? setStatus.variables?.id : null}
        statusError={setStatus.error}
        onAdd={() => open({ type: "create" }, createRule)}
        onAction={handleAction}
      />

      {dialog?.type === "rate" && (
        <EditRateModal
          card={dialog.card}
          rates={rates.data}
          isPending={updateRates.isPending}
          error={updateRates.error}
          onConfirm={(patch) => updateRates.mutate(patch, { onSuccess: close })}
          onClose={close}
        />
      )}

      {dialog?.type === "create" && (
        <SurgeRuleModal
          isPending={createRule.isPending}
          error={createRule.error}
          onConfirm={(values) => createRule.mutate(values, { onSuccess: close })}
          onClose={close}
        />
      )}

      {dialog?.type === "edit" && (
        <SurgeRuleModal
          rule={dialog.rule}
          isPending={updateRule.isPending}
          error={updateRule.error}
          onConfirm={(values) => updateRule.mutate({ id: dialog.rule.id, ...values }, { onSuccess: close })}
          onClose={close}
        />
      )}

      {dialog?.type === "delete" && (
        <ConfirmDialog
          title={SURGE_DIALOGS.delete.title}
          description={SURGE_DIALOGS.delete.description(dialog.rule)}
          confirmLabel={SURGE_DIALOGS.delete.confirmLabel}
          tone="danger"
          isPending={deleteRule.isPending}
          error={deleteRule.error}
          onConfirm={() => deleteRule.mutate({ id: dialog.rule.id }, { onSuccess: close })}
          onClose={close}
        />
      )}
    </div>
  );
};

export default PricingDashboard;
