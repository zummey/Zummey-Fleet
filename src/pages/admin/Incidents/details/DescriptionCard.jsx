import React from "react";
import { Link } from "react-router-dom";

const Field = ({ label, children }) => (
  <div className="min-w-0">
    <dt className="text-[11px] text-gray-400">{label}</dt>
    <dd className="mt-1 truncate text-xs font-medium text-[#343C6A]">{children}</dd>
  </div>
);

const DescriptionCard = ({ incident }) => (
  <section aria-labelledby="incident-description-title" className="rounded-2xl bg-white p-5">
    <h2 id="incident-description-title" className="text-sm font-semibold text-[#343C6A]">
      Description
    </h2>
    <p className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm leading-relaxed text-[#343C6A]">
      {incident.description}
    </p>

    <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Field label="Related order">
        <Link to={`/order-management/${incident.relatedOrder}`} className="text-blue-500 hover:underline">
          {incident.relatedOrder}
        </Link>
      </Field>
      <Field label="Reported by">{incident.reportedBy.name}</Field>
      <Field label="Rider involved">{incident.rider ?? "—"}</Field>
      <Field label="Assigned admin">
        {incident.assignedAdmin?.name ?? <span className="font-normal text-gray-400">Unassigned</span>}
      </Field>
    </dl>
  </section>
);

export default DescriptionCard;
