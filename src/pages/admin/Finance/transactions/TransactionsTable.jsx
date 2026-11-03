import React from "react";
import { Eye } from "lucide-react";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import RowActionsMenu from "../../components/RowActionsMenu";
import { formatNaira, formatTimestamp } from "../../components/formatters";
import { transactionTypeLabel } from "../finance.config";

const ROW_ACTIONS = [{ id: "view", label: "View Details", icon: Eye }];

const BASE_COLUMNS = [
  { key: "id", label: "Transaction ID", render: (t) => <span className="font-medium">{t.id}</span> },
  { key: "date", label: "Date", render: (t) => <span className="tabular-nums">{formatTimestamp(t.date)}</span> },
  { key: "amount", label: "Amount", render: (t) => <span className="tabular-nums">{formatNaira(t.amount)}</span> },
  { key: "type", label: "Type", render: (t) => transactionTypeLabel(t.type) },
  { key: "status", label: "Status", render: (t) => <StatusBadge status={t.status} variant="text" /> },
];

/**
 * Transactions table shared by the Overview (recent, read-only) and the Transactions tab.
 * Pass `onView(transaction)` to add the ••• menu with "View Details".
 */
const TransactionsTable = ({ rows, isLoading, isDimmed, onView, skeletonRows }) => {
  const columns = onView
    ? [
        ...BASE_COLUMNS,
        {
          key: "actions",
          label: "Actions",
          srOnlyLabel: true,
          className: "text-right",
          render: (t) => (
            <RowActionsMenu
              label={`Actions for ${t.id}`}
              actions={ROW_ACTIONS}
              onSelect={(actionId) => actionId === "view" && onView(t)}
            />
          ),
        },
      ]
    : BASE_COLUMNS;

  return (
    <DataTable
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      isDimmed={isDimmed}
      skeletonRows={skeletonRows}
      cellClassName="py-3"
    />
  );
};

export default TransactionsTable;
