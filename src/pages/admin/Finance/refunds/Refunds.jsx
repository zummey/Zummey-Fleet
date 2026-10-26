import React from "react";
import { RotateCcw } from "lucide-react";
import InlineActions from "../components/InlineActions";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import TableToolbar from "../../components/TableToolbar";
import Pagination from "../../components/Pagination";
import ErrorBox from "../../components/ErrorBox";
import EmptyState from "../../components/EmptyState";
import { useTableParams } from "../../components/useTableParams";
import { useDecisionDialog } from "../../components/useDecisionDialog";
import { formatMonthDay, formatNaira } from "../../components/formatters";
import {
  FINANCE_PAGE_SIZE,
  REFUND_ACTIONS,
  REFUND_ACTIONS_BY_STATUS,
  REFUND_DIALOGS,
  refundDoneText,
} from "../finance.config";
import { useRefunds } from "../../../../api/admin.queries";
import { useReviewRefund } from "../../../../api/admin.mutations";

const Refunds = () => {
  const { page, setPage } = useTableParams();
  const refunds = useRefunds({ page, pageSize: FINANCE_PAGE_SIZE });
  const rows = refunds.data?.results ?? [];

  const { open, dialog } = useDecisionDialog({
    dialogs: REFUND_DIALOGS,
    mutation: useReviewRefund(),
    toPayload: (decision, refund, { reason, note }) => ({ refundId: refund.id, decision, reason, message: note }),
  });

  const columns = [
    {
      key: "id",
      label: "Refund ID",
      render: (r) => (
        <div>
          <p className="font-semibold">{r.id}</p>
          <p className="text-xs text-gray-400">
            {r.orderId} · {formatMonthDay(r.requestedAt)}
          </p>
        </div>
      ),
    },
    { key: "customer", label: "Customer" },
    { key: "reason", label: "Reason" },
    { key: "amount", label: "Amount", render: (r) => <span className="tabular-nums">{formatNaira(r.amount)}</span> },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      label: "Actions",
      srOnlyLabel: true,
      className: "text-right",
      render: (r) => (
        <InlineActions
          label={`Actions for refund ${r.id}`}
          actionIds={REFUND_ACTIONS_BY_STATUS[r.status] ?? []}
          actions={REFUND_ACTIONS}
          doneText={refundDoneText(r)}
          onSelect={(decision) => open(decision, r)}
        />
      ),
    },
  ];

  return (
    <section className="rounded-2xl bg-white p-5 sm:p-6">
      <TableToolbar title="Refund Requests" count={refunds.data?.count} />

      {refunds.isError ? (
        <ErrorBox
          title="Error loading refunds"
          error={refunds.error}
          onRetry={refunds.refetch}
          isRetrying={refunds.isFetching}
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={rows}
            isLoading={refunds.isLoading}
            isDimmed={refunds.isPlaceholderData}
            minWidth="min-w-[860px]"
          />

          {!refunds.isLoading && rows.length === 0 && (
            <EmptyState icon={RotateCcw} title="No refund requests" description="Customer refund requests will appear here." />
          )}

          {rows.length > 0 && (
            <div className="mt-6">
              <Pagination
                page={page}
                totalPages={refunds.data?.totalPages ?? 1}
                onChange={setPage}
                disabled={refunds.isFetching}
              />
            </div>
          )}
        </>
      )}

      {dialog}
    </section>
  );
};

export default Refunds;
