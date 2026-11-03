import React, { useId, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SegmentedTabs from "../../components/SegmentedTabs";
import ErrorBox from "../../components/ErrorBox";
import CandidateOption from "./CandidateOption";
import AssignmentSummary from "./AssignmentSummary";
import ManualAssignmentModal from "./ManualAssignmentModal";
import { ASSIGN_TABS, ORDER_FIELDS, SUGGESTION_HINT, getAssignTab } from "../dispatch.config";
import { useDispatchOrder, useDispatchSuggestions } from "../../../../api/admin.queries";
import { useAssignOrder } from "../../../../api/admin.mutations";

const BACK_PATH = "/dispatch-management";

const OrderStrip = ({ order, isLoading }) => (
  <dl className="grid grid-cols-2 gap-4 rounded-2xl bg-white px-5 py-4 sm:grid-cols-4">
    {ORDER_FIELDS.map((field) => (
      <div key={field.key} className="min-w-0">
        <dt className="text-xs text-gray-400">{field.label}</dt>
        <dd className="mt-1 truncate text-sm text-[#343C6A]">
          {isLoading ? (
            <span className="block h-4 w-24 animate-pulse rounded bg-gray-200" />
          ) : field.format ? (
            field.format(order[field.key])
          ) : (
            order[field.key]
          )}
        </dd>
      </div>
    ))}
  </dl>
);

/** Assign one unassigned order to a suggested (or manually chosen) rider or fleet. */
const AssignOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [kind, setKind] = useState(ASSIGN_TABS[0].id);
  const [selection, setSelection] = useState(null);
  const [manualOpen, setManualOpen] = useState(false);
  const groupName = useId();

  const order = useDispatchOrder(orderId);
  const suggestions = useDispatchSuggestions(order.data ? orderId : null, kind);
  const assign = useAssignOrder();

  const finish = (candidate) =>
    navigate(BACK_PATH, { state: { assigned: { orderId, name: candidate.name } } });

  const confirmSuggested = () => {
    if (!selection) return;
    assign.mutate(
      { orderId, kind: selection.kind, candidateId: selection.id, mode: "suggested" },
      { onSuccess: () => finish(selection) }
    );
  };

  const confirmManual = ({ kind: manualKind, candidate, reason, note }) =>
    assign.mutate(
      { orderId, kind: manualKind, candidateId: candidate.id, mode: "manual", reason, note },
      { onSuccess: () => finish(candidate) }
    );

  const openManual = () => {
    assign.reset(); // don't carry a failed suggested assignment's error into the popup
    setManualOpen(true);
  };

  const closeManual = () => {
    assign.reset();
    setManualOpen(false);
  };

  if (order.isError) {
    return (
      <div className="space-y-4 p-4 font-poppins sm:p-6">
        <Link to={BACK_PATH} className="inline-flex items-center gap-2 text-sm text-[#343C6A] hover:text-[#EB4827]">
          <ArrowLeft size={16} /> Back to dispatch
        </Link>
        <ErrorBox
          title={`Can’t assign ${orderId}`}
          error={order.error}
          onRetry={order.refetch}
          isRetrying={order.isFetching}
        />
      </div>
    );
  }

  const rows = suggestions.data ?? [];
  const tab = getAssignTab(kind);

  return (
    <div className="space-y-5 p-4 font-poppins sm:p-6">
      <div className="flex items-center gap-3">
        <Link
          to={BACK_PATH}
          aria-label="Back to dispatch"
          className="rounded-lg p-1.5 text-[#343C6A] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-semibold text-[#343C6A]">Assign order {orderId}</h1>
      </div>

      <OrderStrip order={order.data ?? {}} isLoading={order.isLoading} />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-label="Suggestions" className="rounded-2xl bg-white p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <SegmentedTabs
              tabs={ASSIGN_TABS}
              activeTab={kind}
              onChange={setKind}
              label="Suggestions"
              idPrefix="assign"
            />
            <p className="text-xs text-gray-400">{SUGGESTION_HINT}</p>
          </div>

          <fieldset id="assign-panel" role="tabpanel" aria-labelledby={`assign-tab-${kind}`} disabled={assign.isPending}>
            <legend className="sr-only">Choose a {tab.noun}</legend>
            <div className={`space-y-3 transition-opacity ${suggestions.isFetching && !suggestions.isLoading ? "opacity-60" : ""}`}>
              {order.isLoading || suggestions.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-[70px] animate-pulse rounded-xl bg-gray-100" />
                ))
              ) : suggestions.isError ? (
                <ErrorBox
                  title={`Error loading suggested ${tab.noun}s`}
                  error={suggestions.error}
                  onRetry={suggestions.refetch}
                  isRetrying={suggestions.isFetching}
                />
              ) : rows.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-400">
                  No {tab.noun}s are free near the pickup. Try manual assignment.
                </p>
              ) : (
                rows.map((candidate) => (
                  <CandidateOption
                    key={candidate.id}
                    candidate={candidate}
                    name={groupName}
                    selected={selection?.kind === candidate.kind && selection?.id === candidate.id}
                    onSelect={(c) => {
                      assign.reset();
                      setSelection(c);
                    }}
                  />
                ))
              )}
            </div>
          </fieldset>
        </section>

        <AssignmentSummary
          selection={selection}
          isPending={assign.isPending && !manualOpen}
          error={manualOpen ? null : assign.error}
          onConfirm={confirmSuggested}
          onManual={openManual}
        />
      </div>

      {manualOpen && (
        <ManualAssignmentModal
          orderId={orderId}
          initialSelection={selection}
          isPending={assign.isPending}
          error={assign.error}
          onConfirm={confirmManual}
          onClose={closeManual}
        />
      )}
    </div>
  );
};

export default AssignOrder;
