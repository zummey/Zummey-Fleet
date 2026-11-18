import React from "react";
import { Plus, Zap } from "lucide-react";
import DataTable from "../../../admin/components/DataTable";
import EmptyState from "../../../admin/components/EmptyState";
import ErrorBox from "../../../admin/components/ErrorBox";
import RowActionsMenu from "../../../admin/components/RowActionsMenu";
import StatusBadge from "../../../admin/components/StatusBadge";
import { SURGE_BADGES, formatMultiplier, surgeActions } from "../pricing.config";

/** Surge pricing rules table. `pendingId` dims a row while its pause / resume is saving. */
const SurgeRules = ({ rules, pendingId, statusError, onAdd, onAction }) => {
  const columns = [
    { key: "name", label: "Rule", render: (r) => <span className="font-semibold">{r.name}</span> },
    { key: "appliesWhen", label: "When it applies", className: "text-gray-600" },
    {
      key: "multiplier",
      label: "Price multiplier",
      render: (r) => formatMultiplier(r.multiplier),
    },
    {
      key: "status",
      label: "Status",
      render: (r) =>
        r.id === pendingId ? (
          <span className="text-xs text-gray-400">Saving...</span>
        ) : (
          <StatusBadge status={r.status} badges={SURGE_BADGES} />
        ),
    },
    {
      key: "actions",
      label: "Actions",
      srOnlyLabel: true,
      render: (r) => (
        <div className="flex justify-end">
          <RowActionsMenu
            label={`Actions for ${r.name}`}
            actions={surgeActions(r)}
            onSelect={(action) => onAction(action, r)}
          />
        </div>
      ),
    },
  ];

  return (
    <section aria-labelledby="surge-rules-title" className="rounded-2xl bg-white p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 id="surge-rules-title" className="text-base font-semibold text-[#343C6A]">
          Surge pricing rules
        </h2>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-lg bg-[#0B1437] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#1c2657] focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none"
        >
          <Plus size={14} aria-hidden="true" />
          Add surge rule
        </button>
      </div>

      {statusError && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {statusError?.response?.data?.responseMessage || statusError?.message || "Couldn’t update the rule"}
        </p>
      )}

      {rules.isError ? (
        <ErrorBox
          title="Couldn’t load surge rules"
          error={rules.error}
          onRetry={rules.refetch}
          isRetrying={rules.isFetching}
        />
      ) : (
        <div className="rounded-xl border border-gray-100 px-4 pb-2">
          {!rules.isLoading && rules.data.length === 0 ? (
            <EmptyState
              icon={Zap}
              title="No surge rules yet"
              description="Surge rules raise prices at busy times, like rush hour."
              action={{ label: "Add surge rule", onClick: onAdd }}
            />
          ) : (
            <DataTable
              columns={columns}
              rows={rules.data ?? []}
              isLoading={rules.isLoading}
              skeletonRows={3}
              cellClassName="py-3.5 text-xs"
            />
          )}
        </div>
      )}
    </section>
  );
};

export default SurgeRules;
