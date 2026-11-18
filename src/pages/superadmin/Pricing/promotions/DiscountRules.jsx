import React, { useState } from "react";
import { BadgePercent, Plus } from "lucide-react";
import DataTable from "../../../admin/components/DataTable";
import EmptyState from "../../../admin/components/EmptyState";
import ErrorBox from "../../../admin/components/ErrorBox";
import RowActionsMenu from "../../../admin/components/RowActionsMenu";
import StatusBadge from "../../../admin/components/StatusBadge";
import ConfirmDialog from "../../../admin/components/ConfirmDialog";
import DiscountRuleFormModal from "./DiscountRuleFormModal";
import { DELETE_RULE, RULE_BADGES, describeTrigger, ruleActions } from "./discountRules.config";
import { useDiscountRules } from "../../../../api/pricing.queries";
import { useCreateDiscountRule, useDeleteDiscountRule, useUpdateDiscountRule } from "../../../../api/pricing.mutations";

/**
 * Discount rules table: pause / resume, and create / edit / delete dialogs.
 * dialog: { type: "create" } | { type: "edit", rule } | { type: "delete", rule }
 */
const DiscountRules = () => {
  const rules = useDiscountRules();
  const createRule = useCreateDiscountRule();
  const updateRule = useUpdateDiscountRule();
  const deleteRule = useDeleteDiscountRule();
  const setStatus = useUpdateDiscountRule(); // separate so pause errors don't show in the edit dialog
  const [dialog, setDialog] = useState(null);

  const open = (next, mutation) => {
    mutation.reset();
    setStatus.reset();
    setDialog(next);
  };
  const close = () => setDialog(null);

  const handleAction = (action, rule) => {
    if (action === "pause" || action === "resume") {
      setStatus.mutate({ id: rule.id, status: action === "pause" ? "paused" : "active" });
    } else if (action === "edit") open({ type: "edit", rule }, updateRule);
    else open({ type: "delete", rule }, deleteRule);
  };

  const pendingId = setStatus.isPending ? setStatus.variables?.id : null;

  const columns = [
    { key: "name", label: "Rule", render: (r) => <span className="font-semibold">{r.name}</span> },
    { key: "trigger", label: "Applies when", render: describeTrigger },
    { key: "discount", label: "Discount", render: (r) => `${r.discount}% off` },
    {
      key: "status",
      label: "Status",
      render: (r) =>
        r.id === pendingId ? (
          <span className="text-xs text-gray-400">Saving...</span>
        ) : (
          <StatusBadge status={r.status} badges={RULE_BADGES} />
        ),
    },
    {
      key: "actions",
      label: "Actions",
      srOnlyLabel: true,
      render: (r) => (
        <div className="flex justify-end">
          <RowActionsMenu label={`Actions for ${r.name}`} actions={ruleActions(r)} onSelect={(a) => handleAction(a, r)} />
        </div>
      ),
    },
  ];

  return (
    <section aria-labelledby="discount-rules-title" className="rounded-2xl bg-white p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 id="discount-rules-title" className="text-base font-semibold text-[#343C6A]">
          Discount rules
        </h3>
        <button
          type="button"
          onClick={() => open({ type: "create" }, createRule)}
          className="flex items-center gap-1.5 rounded-lg bg-[#343C6A] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#2a3058] focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none"
        >
          <Plus size={14} aria-hidden="true" />
          Create discount rule
        </button>
      </div>

      {setStatus.error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {setStatus.error?.response?.data?.responseMessage || setStatus.error?.message || "Couldn’t update the rule"}
        </p>
      )}

      {rules.isError ? (
        <ErrorBox title="Couldn’t load discount rules" error={rules.error} onRetry={rules.refetch} isRetrying={rules.isFetching} />
      ) : (
        <div className="min-h-[200px] rounded-xl border border-gray-100 px-4 pb-2">
          {!rules.isLoading && rules.data.length === 0 ? (
            <EmptyState
              icon={BadgePercent}
              title="No discount rules yet"
              description="Give automatic discounts, like 10% off a customer’s first order."
              action={{ label: "Create discount rule", onClick: () => open({ type: "create" }, createRule) }}
            />
          ) : (
            <DataTable columns={columns} rows={rules.data ?? []} isLoading={rules.isLoading} skeletonRows={3} cellClassName="py-3.5 text-xs" />
          )}
        </div>
      )}

      {(dialog?.type === "create" || dialog?.type === "edit") && (
        <DiscountRuleFormModal
          rule={dialog.rule}
          isPending={dialog.rule ? updateRule.isPending : createRule.isPending}
          error={dialog.rule ? updateRule.error : createRule.error}
          onConfirm={(values) =>
            dialog.rule
              ? updateRule.mutate({ id: dialog.rule.id, ...values }, { onSuccess: close })
              : createRule.mutate(values, { onSuccess: close })
          }
          onClose={close}
        />
      )}

      {dialog?.type === "delete" && (
        <ConfirmDialog
          title={DELETE_RULE.title}
          description={DELETE_RULE.description(dialog.rule)}
          confirmLabel="Delete"
          tone="danger"
          isPending={deleteRule.isPending}
          error={deleteRule.error}
          onConfirm={() => deleteRule.mutate({ id: dialog.rule.id }, { onSuccess: close })}
          onClose={close}
        />
      )}
    </section>
  );
};

export default DiscountRules;
