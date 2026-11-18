import React, { useMemo, useState } from "react";
import { Megaphone, Plus } from "lucide-react";
import DataTable from "../../../admin/components/DataTable";
import EmptyState from "../../../admin/components/EmptyState";
import ErrorBox from "../../../admin/components/ErrorBox";
import RowActionsMenu from "../../../admin/components/RowActionsMenu";
import StatusBadge from "../../../admin/components/StatusBadge";
import ConfirmDialog from "../../../admin/components/ConfirmDialog";
import CampaignFormModal from "./CampaignFormModal";
import {
  CAMPAIGN_BADGES,
  DELETE_CAMPAIGN,
  audienceLabel,
  campaignActions,
  campaignState,
  formatCampaignDates,
} from "./campaigns.config";
import { useCampaigns } from "../../../../api/pricing.queries";
import { useCreateCampaign, useDeleteCampaign, useUpdateCampaign } from "../../../../api/pricing.mutations";

// Running first, then upcoming, then finished; within each, by start date
const STATE_ORDER = { active: 0, paused: 1, scheduled: 2, ended: 3 };

/**
 * Promo campaigns table: pause / resume, and create / edit / delete dialogs.
 * dialog: { type: "create" } | { type: "edit", campaign } | { type: "delete", campaign }
 */
const Campaigns = () => {
  const campaigns = useCampaigns();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const deleteCampaign = useDeleteCampaign();
  const setStatus = useUpdateCampaign(); // separate so pause errors don't show in the edit dialog
  const [dialog, setDialog] = useState(null);

  const rows = useMemo(
    () =>
      [...(campaigns.data ?? [])].sort(
        (a, b) =>
          STATE_ORDER[campaignState(a)] - STATE_ORDER[campaignState(b)] || a.startsOn.localeCompare(b.startsOn)
      ),
    [campaigns.data]
  );

  const open = (next, mutation) => {
    mutation.reset();
    setStatus.reset();
    setDialog(next);
  };
  const close = () => setDialog(null);

  const handleAction = (action, campaign) => {
    if (action === "pause" || action === "resume") {
      setStatus.mutate({ id: campaign.id, status: action === "pause" ? "paused" : "active" });
    } else if (action === "edit") open({ type: "edit", campaign }, updateCampaign);
    else open({ type: "delete", campaign }, deleteCampaign);
  };

  const pendingId = setStatus.isPending ? setStatus.variables?.id : null;

  const columns = [
    { key: "name", label: "Campaign", render: (c) => <span className="font-semibold">{c.name}</span> },
    { key: "audience", label: "Who gets it", render: (c) => audienceLabel(c.audience) },
    { key: "discount", label: "Discount", render: (c) => `${c.discount}% off` },
    { key: "dates", label: "Dates", render: formatCampaignDates },
    {
      key: "status",
      label: "Status",
      render: (c) =>
        c.id === pendingId ? (
          <span className="text-xs text-gray-400">Saving...</span>
        ) : (
          <StatusBadge status={campaignState(c)} badges={CAMPAIGN_BADGES} />
        ),
    },
    {
      key: "actions",
      label: "Actions",
      srOnlyLabel: true,
      render: (c) => (
        <div className="flex justify-end">
          <RowActionsMenu label={`Actions for ${c.name}`} actions={campaignActions(c)} onSelect={(a) => handleAction(a, c)} />
        </div>
      ),
    },
  ];

  return (
    <section aria-labelledby="campaigns-title" className="rounded-2xl bg-white p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 id="campaigns-title" className="text-base font-semibold text-[#343C6A]">
          Promo campaigns
        </h3>
        <button
          type="button"
          onClick={() => open({ type: "create" }, createCampaign)}
          className="flex items-center gap-1.5 rounded-lg bg-[#343C6A] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#2a3058] focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none"
        >
          <Plus size={14} aria-hidden="true" />
          Create campaign
        </button>
      </div>

      {setStatus.error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {setStatus.error?.response?.data?.responseMessage || setStatus.error?.message || "Couldn’t update the campaign"}
        </p>
      )}

      {campaigns.isError ? (
        <ErrorBox title="Couldn’t load campaigns" error={campaigns.error} onRetry={campaigns.refetch} isRetrying={campaigns.isFetching} />
      ) : (
        <div className="min-h-[200px] rounded-xl border border-gray-100 px-4 pb-2">
          {!campaigns.isLoading && rows.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No campaigns yet"
              description="Run a discount for a set time, like a welcome month for new customers."
              action={{ label: "Create campaign", onClick: () => open({ type: "create" }, createCampaign) }}
            />
          ) : (
            <DataTable columns={columns} rows={rows} isLoading={campaigns.isLoading} skeletonRows={3} cellClassName="py-3.5 text-xs" />
          )}
        </div>
      )}

      {(dialog?.type === "create" || dialog?.type === "edit") && (
        <CampaignFormModal
          campaign={dialog.campaign}
          isPending={dialog.campaign ? updateCampaign.isPending : createCampaign.isPending}
          error={dialog.campaign ? updateCampaign.error : createCampaign.error}
          onConfirm={(values) =>
            dialog.campaign
              ? updateCampaign.mutate({ id: dialog.campaign.id, ...values }, { onSuccess: close })
              : createCampaign.mutate(values, { onSuccess: close })
          }
          onClose={close}
        />
      )}

      {dialog?.type === "delete" && (
        <ConfirmDialog
          title={DELETE_CAMPAIGN.title}
          description={DELETE_CAMPAIGN.description(dialog.campaign)}
          confirmLabel="Delete"
          tone="danger"
          isPending={deleteCampaign.isPending}
          error={deleteCampaign.error}
          onConfirm={() => deleteCampaign.mutate({ id: dialog.campaign.id }, { onSuccess: close })}
          onClose={close}
        />
      )}
    </section>
  );
};

export default Campaigns;
