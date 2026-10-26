import React from "react";
import { Wallet } from "lucide-react";
import InlineActions from "../components/InlineActions";
import Avatar from "../../components/Avatar";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import TableToolbar from "../../components/TableToolbar";
import Pagination from "../../components/Pagination";
import ErrorBox from "../../components/ErrorBox";
import EmptyState from "../../components/EmptyState";
import { useTableParams } from "../../components/useTableParams";
import { useDecisionDialog } from "../../components/useDecisionDialog";
import { formatNaira } from "../../components/formatters";
import {
  FINANCE_PAGE_SIZE,
  PAYOUT_ACTIONS,
  PAYOUT_ACTIONS_BY_STATUS,
  PAYOUT_DIALOGS,
  PAYOUT_STATUS_BADGES,
  RECIPIENT_TYPE_LABELS,
  payoutDoneText,
} from "../finance.config";
import { usePayouts } from "../../../../api/admin.queries";
import { useUpdatePayout } from "../../../../api/admin.mutations";

const Payouts = () => {
  const { page, setPage } = useTableParams();
  const payouts = usePayouts({ page, pageSize: FINANCE_PAGE_SIZE });
  const rows = payouts.data?.results ?? [];

  const { open, dialog } = useDecisionDialog({
    dialogs: PAYOUT_DIALOGS,
    mutation: useUpdatePayout(),
    toPayload: (action, payout, { reason, note }) => ({ payoutId: payout.id, action, reason, note }),
  });

  const columns = [
    {
      key: "recipient",
      label: "Recipient",
      render: (p) => (
        <div className="flex items-center gap-3">
          <Avatar name={p.recipient.name} src={p.recipient.avatar} />
          <div>
            <p className="font-semibold">{p.recipient.name}</p>
            <p className="text-xs text-gray-400">{p.recipient.code}</p>
          </div>
        </div>
      ),
    },
    { key: "type", label: "Type", render: (p) => RECIPIENT_TYPE_LABELS[p.recipientType] ?? p.recipientType },
    { key: "deliveries", label: "Deliveries", render: (p) => <span className="tabular-nums">{p.deliveries}</span> },
    { key: "amount", label: "Amount", render: (p) => <span className="tabular-nums">{formatNaira(p.amount)}</span> },
    { key: "status", label: "Status", render: (p) => <StatusBadge status={p.status} badges={PAYOUT_STATUS_BADGES} /> },
    {
      key: "actions",
      label: "Actions",
      srOnlyLabel: true,
      className: "text-right",
      render: (p) => (
        <InlineActions
          label={`Actions for ${p.recipient.name}'s payout`}
          actionIds={PAYOUT_ACTIONS_BY_STATUS[p.status] ?? []}
          actions={PAYOUT_ACTIONS}
          doneText={payoutDoneText(p)}
          onSelect={(action) => open(action, p)}
        />
      ),
    },
  ];

  return (
    <section className="rounded-2xl bg-white p-5 sm:p-6">
      <TableToolbar title="Payout History" count={payouts.data?.count} />

      {payouts.isError ? (
        <ErrorBox
          title="Error loading payouts"
          error={payouts.error}
          onRetry={payouts.refetch}
          isRetrying={payouts.isFetching}
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={rows}
            isLoading={payouts.isLoading}
            isDimmed={payouts.isPlaceholderData}
            minWidth="min-w-[860px]"
          />

          {!payouts.isLoading && rows.length === 0 && (
            <EmptyState icon={Wallet} title="No payouts yet" description="Rider and fleet payouts will appear here." />
          )}

          {rows.length > 0 && (
            <div className="mt-6">
              <Pagination
                page={page}
                totalPages={payouts.data?.totalPages ?? 1}
                onChange={setPage}
                disabled={payouts.isFetching}
              />
            </div>
          )}
        </>
      )}

      {dialog}
    </section>
  );
};

export default Payouts;
