import React, { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";
import { formatDateDotTime, formatNaira } from "../../components/formatters";
import { TRANSACTION_TYPES } from "../finance.config";

// Money in shows "+" in green; money out shows "−"
const signedAmount = (t, direction) => `${direction === "in" ? "+" : "−"}${formatNaira(t.amount)}`;

const TransactionDetailsModal = ({ transaction, onClose }) => {
  const closeRef = useRef(null);
  const titleId = useId();
  const type = TRANSACTION_TYPES[transaction.type] ?? { label: transaction.type, direction: "in", partyLabel: "Party" };

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const fields = [
    { label: "Date", value: formatDateDotTime(transaction.date) },
    { label: "Reference", value: transaction.reference },
    { label: type.partyLabel, value: transaction.party },
    { label: "Method", value: transaction.method },
  ];

  return (
    <Modal onClose={onClose} labelledBy={titleId} className="max-w-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400">{type.label}</p>
          <h3 id={titleId} className="mt-0.5 text-lg font-semibold text-[#343C6A]">
            {transaction.id}
          </h3>
          <div className="mt-1.5">
            <StatusBadge status={transaction.status} />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>

      <p
        className={`mt-5 text-2xl font-bold tabular-nums ${type.direction === "in" ? "text-green-600" : "text-[#343C6A]"}`}
      >
        {signedAmount(transaction, type.direction)}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
        {fields.map((field) => (
          <div key={field.label}>
            <dt className="text-xs text-gray-400">{field.label}</dt>
            <dd className="mt-0.5 text-sm font-medium break-words text-[#343C6A]">{field.value ?? "—"}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex justify-end">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default TransactionDetailsModal;
