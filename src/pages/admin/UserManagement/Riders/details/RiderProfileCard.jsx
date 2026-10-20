// src/pages/admin/UserManagement/Riders/details/RiderProfileCard.jsx
//
// The shared header card shown on every Rider Details tab.
// Matches the design in screen 1 – 6:
//   • avatar (image or initials fallback) + name + fleet ID
//   • Approve / Suspend / Reactivate action buttons
//   • Rider Type / Fleet / Rating / Deliveries Completed stat row

import React, { useState } from "react";
import { CheckCircle2, CircleX, RotateCcw } from "lucide-react";
import { RIDER_STAT_FIELDS } from "./riderDetails.config";

const initials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const RiderAvatar = ({ rider }) => {
  const [imgError, setImgError] = useState(false);
  const imageUrl = rider?.profile_picture_url || rider?.image || rider?.avatar;

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={rider?.name || "Rider"}
        onError={() => setImgError(true)}
        className="h-14 w-14 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FFF4E8] text-lg font-semibold text-[#EB4827]">
      {initials(rider?.name)}
    </span>
  );
};

const RiderProfileCard = ({ rider, onAction }) => {
  const isApproved = rider.status === "active" || rider.status === "online";
  const isSuspended = rider.status === "suspended";

  const getFieldValue = (field) => {
    if (field.value) return field.value(rider);
    const raw = rider[field.key];
    return raw != null ? raw : "—";
  };

  return (
    <section className="rounded-2xl bg-white p-5 sm:p-6">
      {/* ── Row 1: avatar + name + action buttons ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex flex-wrap items-center gap-4">
          <RiderAvatar rider={rider} />
          <div>
            <h2 className="text-xl font-semibold text-[#343C6A]">{rider.name}</h2>
            <p className="text-xs text-gray-400">Fleet ID: {rider.code}</p>
          </div>

          {/* Approve button */}
          <button
            id="rider-action-approve"
            type="button"
            onClick={() => onAction("approve", rider)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              isApproved
                ? "bg-green-50 text-green-600 cursor-default"
                : "bg-green-50 text-green-600 hover:bg-green-100"
            }`}
          >
            <CheckCircle2 size={15} />
            Approve
          </button>
        </div>

        {/* Suspend + Reactivate buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="rider-action-suspend"
            type="button"
            onClick={() => onAction("suspend", rider)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-100"
          >
            <CircleX size={15} />
            Suspend
          </button>

          <button
            id="rider-action-reactivate"
            type="button"
            onClick={() => onAction("reactivate", rider)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-500 transition-colors hover:bg-blue-100"
          >
            <RotateCcw size={15} />
            Reactivate
          </button>
        </div>
      </div>

      {/* ── Row 2: stat fields (Rider Type / Fleet / Rating / Deliveries) ── */}
      <div className="flex flex-wrap items-start gap-x-10 gap-y-4 pt-5 lg:divide-x lg:divide-gray-100">
        {RIDER_STAT_FIELDS.map((field, i) => (
          <div key={i} className="lg:px-5 lg:first:pl-0 lg:last:pr-0">
            <p className="text-xs text-[#343C6A] opacity-70">{field.label}</p>
            <p className="mt-0.5 text-sm font-semibold text-[#343C6A]">
              {getFieldValue(field)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RiderProfileCard;
