import React from "react";
import { CircleCheck, CircleX, Clock, MessageCircleQuestion, RotateCcw } from "lucide-react";
import { formatLongDate } from "../adminFleet.config";
import CompanyLogo from "../../../../assets/avatar.png";

const APPROVAL = {
  active: { label: "Approved", icon: CircleCheck, className: "bg-green-50 text-green-600" },
  suspended: { label: "Suspended", icon: CircleX, className: "bg-red-50 text-red-500" },
  pending: { label: "Pending", icon: Clock, className: "bg-amber-50 text-amber-600" },
  rejected: { label: "Rejected", icon: CircleX, className: "bg-red-50 text-red-500" },
  clarification: { label: "Needs Clarification", icon: MessageCircleQuestion, className: "bg-blue-50 text-blue-600" },
};

const Field = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-400">{label}</p>
    <p className="text-sm font-semibold text-[#343C6A]">{value ?? "—"}</p>
  </div>
);

const FleetProfileCard = ({ fleet, onToggleSuspend }) => {
  const approval = APPROVAL[fleet.status] ?? APPROVAL.pending;
  const ApprovalIcon = approval.icon;
  const isSuspended = fleet.status === "suspended";

  return (
    <section className="rounded-2xl bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex flex-wrap items-center gap-4">
          <img src={CompanyLogo} alt="" className="h-14 w-14 rounded-full object-cover" />
          <div>
            <h2 className="text-xl font-semibold text-[#343C6A]">{fleet.companyName}</h2>
            <p className="text-xs text-gray-400">Fleet ID: {fleet.fleetCode}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${approval.className}`}>
            <ApprovalIcon size={16} />
            {approval.label}
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleSuspend}
          className={`inline-flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
            isSuspended ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-red-50 text-red-500 hover:bg-red-100"
          }`}
        >
          {isSuspended ? <RotateCcw size={16} /> : <CircleX size={16} />}
          {isSuspended ? "Reactivate" : "Suspend"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 pt-5 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-gray-100">
        <div className="space-y-4 lg:pr-5">
          <Field label="Owner" value={fleet.owner} />
          <Field label="Total Riders" value={fleet.ridersCount} />
        </div>
        <div className="space-y-4 lg:px-5">
          <Field label="Phone" value={fleet.phone} />
          <Field label="Total Vehicles" value={fleet.vehiclesCount} />
        </div>
        <div className="space-y-4 lg:px-5">
          <Field label="Email" value={fleet.email} />
          <Field label="Business Address" value={fleet.businessAddress} />
        </div>
        <div className="lg:pl-5">
          <Field label="Date Joined" value={formatLongDate(fleet.dateJoined)} />
        </div>
      </div>
    </section>
  );
};

export default FleetProfileCard;
