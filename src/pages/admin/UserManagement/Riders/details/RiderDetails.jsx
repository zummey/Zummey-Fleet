// src/pages/admin/UserManagement/Riders/details/RiderDetails.jsx
//
// Entry page for a single rider — wires together:
//   • "Riders Details" back-link header
//   • RiderProfileCard  (shared header card with actions)
//   • DetailTabs        (Profile / Documents / Vehicle / Performance / Delivery / Incident)
//   • RiderDetailsPanel (tab content, screens 1-6)

import React, { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import RiderProfileCard from "./RiderProfileCard";
import RiderDetailsPanel from "./RiderDetailsPanel";
import DetailTabs from "../../../components/DetailTabs";
import ErrorBox from "../../../components/ErrorBox";
import ProfileSkeleton from "../../../components/ProfileSkeleton";
import ConfirmDialog from "../../../components/ConfirmDialog";
import {
  RIDER_DETAIL_TABS,
  RIDER_DETAIL_TAB_QUERY_PARAM,
  getRiderDetailTabById,
} from "./riderDetails.config";
import { useAdminRiderDetails } from "../../../../../api/admin.queries";
import { updateRiderStatus } from "../../../../../api/admin.service";

// ─── Action confirm dialogs ────────────────────────────────────────────────
const ACTION_DIALOGS = {
  approve: {
    title: "Approve this rider?",
    description: (r) => `${r.name} will be marked as an approved rider.`,
    confirmLabel: "Approve",
    tone: "default",
  },
  suspend: {
    title: "Suspend this rider?",
    description: (r) => `${r.name} won't be able to take deliveries until reactivated.`,
    confirmLabel: "Suspend",
    tone: "danger",
  },
  reactivate: {
    title: "Reactivate this rider?",
    description: (r) => `${r.name} will be able to accept deliveries again.`,
    confirmLabel: "Reactivate",
    tone: "default",
  },
};

const RiderDetails = () => {
  const { riderId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = getRiderDetailTabById(searchParams.get(RIDER_DETAIL_TAB_QUERY_PARAM));

  const rider = useAdminRiderDetails(riderId);

  // ── Status mutation ───────────────────────────────────────────────────
  const [pendingAction, setPendingAction] = useState(null); // { actionId, rider }
  const statusMutation = useMutation({
    mutationFn: ({ actionId, rider }) => {
      const statusMap = { approve: "active", suspend: "suspended", reactivate: "active" };
      return updateRiderStatus({ riderId: rider.id, status: statusMap[actionId] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "riders"] });
      setPendingAction(null);
    },
  });

  const handleAction = (actionId, riderData) => {
    setPendingAction({ actionId, rider: riderData });
  };

  const handleTabChange = (id) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(RIDER_DETAIL_TAB_QUERY_PARAM, id);
        return next;
      },
      { replace: true }
    );
  };

  // ── Confirm dialog state ───────────────────────────────────────────────
  const actionConfig = pendingAction ? ACTION_DIALOGS[pendingAction.actionId] : null;

  return (
    <div className="mb-6 space-y-6 font-poppins">
      {/* Back link */}
      <Link
        to="/user-management/riders"
        className="inline-flex items-center gap-1 text-xl font-semibold text-[#343C6A] hover:text-[#EB4827]"
      >
        <ChevronLeft size={20} />
        Riders Details
      </Link>

      {rider.isLoading ? (
        <ProfileSkeleton />
      ) : rider.isError ? (
        <ErrorBox
          title="Error loading rider"
          error={rider.error}
          onRetry={rider.refetch}
          isRetrying={rider.isFetching}
        />
      ) : (
        <>
          {/* ── Profile card header ── */}
          <RiderProfileCard rider={rider.data} onAction={handleAction} />

          {/* ── Tab bar ── */}
          <div className="rounded-2xl bg-white px-5 pt-5 pb-0 sm:px-6">
            <DetailTabs
              tabs={RIDER_DETAIL_TABS}
              activeTab={activeTab.id}
              onChange={handleTabChange}
              label="Rider details"
              idPrefix="rider"
            />
          </div>

          {/* ── Active tab panel ── */}
          <section
            key={activeTab.id}
            id={`rider-panel-${activeTab.id}`}
            role="tabpanel"
            aria-labelledby={`rider-tab-${activeTab.id}`}
            className="rounded-2xl bg-white p-5 motion-safe:animate-fade-in-up sm:p-6"
          >
            <RiderDetailsPanel riderId={riderId} rider={rider.data} tab={activeTab} />
          </section>
        </>
      )}

      {/* ── Confirm dialog ── */}
      {pendingAction && actionConfig && (
        <ConfirmDialog
          title={actionConfig.title}
          description={actionConfig.description(pendingAction.rider)}
          confirmLabel={actionConfig.confirmLabel}
          tone={actionConfig.tone}
          isPending={statusMutation.isPending}
          error={statusMutation.error}
          onConfirm={() => statusMutation.mutate(pendingAction)}
          onClose={() => setPendingAction(null)}
        />
      )}
    </div>
  );
};

export default RiderDetails;
