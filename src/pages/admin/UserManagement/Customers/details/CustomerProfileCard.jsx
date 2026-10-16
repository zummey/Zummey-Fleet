import React from "react";
import { CircleX, RotateCcw } from "lucide-react";
import StatusBadge from "../../../components/StatusBadge";
import { CUSTOMER_PROFILE_FIELDS } from "./customerDetails.config";

const initials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const CustomerProfileCard = ({ customer, onAction }) => {
  const isSuspended = customer.status === "suspended";

  return (
    <section className="rounded-2xl bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF4E8] text-lg font-semibold text-[#EB4827]">
            {initials(customer.name)}
          </span>
          <div>
            <h2 className="text-xl font-semibold text-[#343C6A]">{customer.name}</h2>
            <p className="text-xs text-gray-400">User ID: {customer.code}</p>
          </div>
          <StatusBadge status={customer.status} />
        </div>

        <button
          type="button"
          onClick={() => onAction(isSuspended ? "reactivate" : "suspend", customer)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
            isSuspended ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-red-50 text-red-500 hover:bg-red-100"
          }`}
        >
          {isSuspended ? <RotateCcw size={16} /> : <CircleX size={16} />}
          {isSuspended ? "Reactivate" : "Suspend"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 pt-5 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-gray-100">
        {CUSTOMER_PROFILE_FIELDS.map((column, i) => (
          <div key={i} className="space-y-4 lg:px-5 lg:first:pl-0 lg:last:pr-0">
            {column.map((field) => (
              <div key={field.label}>
                <p className="text-sm text-gray-400">{field.label}</p>
                <p className="text-sm font-semibold break-words text-[#343C6A]">{field.value(customer) ?? "—"}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default CustomerProfileCard;
