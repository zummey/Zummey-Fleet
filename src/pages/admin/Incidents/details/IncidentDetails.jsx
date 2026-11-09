import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import ErrorBox from "../../components/ErrorBox";
import ConfirmDialog from "../../components/ConfirmDialog";
import ReasonDialog from "../../components/ReasonDialog";
import DescriptionCard from "./DescriptionCard";
import AttachedImages from "./AttachedImages";
import CommunicationLog from "./CommunicationLog";
import IncidentTimeline from "./IncidentTimeline";
import AssignIncidentModal from "./AssignIncidentModal";
import {
  ACTIONS_BY_STATUS,
  ACTION_BUTTON_STYLES,
  BANNER_STYLES,
  DIALOGS,
  ESCALATION_TARGETS,
  INCIDENTS_PATH,
  INCIDENT_ACTIONS,
  INCIDENT_STATUS_BADGES,
  PRIORITY_BADGES,
  RESOLUTION_OUTCOMES,
  incidentSubtitle,
  statusBanner,
} from "../incidents.config";
import { useIncident } from "../../../../api/incidents.queries";
import {
  useAssignIncident,
  useCloseIncident,
  useEscalateIncident,
  useResolveIncident,
} from "../../../../api/incidents.mutations";

const BackLink = () => (
  <Link
    to={INCIDENTS_PATH}
    aria-label="Back to incidents"
    className="rounded-lg p-1.5 text-[#343C6A] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none"
  >
    <ArrowLeft size={18} />
  </Link>
);

const DetailsSkeleton = () => (
  <div className="grid animate-pulse items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]" aria-hidden="true">
    <div className="space-y-5">
      <div className="h-48 rounded-2xl bg-white" />
      <div className="h-36 rounded-2xl bg-white" />
      <div className="h-56 rounded-2xl bg-white" />
    </div>
    <div className="h-48 rounded-2xl bg-white" />
  </div>
);

const IncidentDetails = () => {
  const { incidentId } = useParams();
  const { data: incident, isLoading, isError, error, refetch, isFetching } = useIncident(incidentId);
  const [dialog, setDialog] = useState(null); // "assign" | "escalate" | "resolve" | "close" | null

  const mutations = {
    assign: useAssignIncident(),
    escalate: useEscalateIncident(),
    resolve: useResolveIncident(),
    close: useCloseIncident(),
  };
  const active = dialog ? mutations[dialog] : null;

  const openDialog = (id) => {
    mutations[id].reset(); // don't show an old error in a fresh popup
    setDialog(id);
  };
  const closeDialog = () => setDialog(null);
  const run = (payload) => active.mutate({ incidentId, ...payload }, { onSuccess: closeDialog });

  if (isError) {
    return (
      <div className="space-y-4 p-4 font-poppins sm:p-6">
        <BackLink />
        <ErrorBox title={`Couldn’t load ${incidentId}`} error={error} onRetry={refetch} isRetrying={isFetching} />
      </div>
    );
  }

  const banner = incident ? statusBanner(incident) : null;
  const actions = incident ? ACTIONS_BY_STATUS[incident.status] ?? [] : [];
  const priority = incident ? PRIORITY_BADGES[incident.priority] : null;
  const dialogProps = { isPending: active?.isPending, error: active?.error, onClose: closeDialog };

  return (
    <div className="space-y-5 p-4 font-poppins sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-2">
          <BackLink />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-[#343C6A]">{incidentId}</h1>
              {incident && <StatusBadge status={incident.status} badges={INCIDENT_STATUS_BADGES} />}
              {priority && (
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${priority.className}`}>{priority.label}</span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {incident ? incidentSubtitle(incident) : <span className="inline-block h-3 w-40 animate-pulse rounded bg-gray-200" />}
            </p>
          </div>
        </div>

        {actions.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {actions.map((id) => {
              const action = INCIDENT_ACTIONS[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => openDialog(id)}
                  className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none ${
                    ACTION_BUTTON_STYLES[action.style]
                  }`}
                >
                  {action.label(incident)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {banner && (
        <p role="status" className={`rounded-xl border px-4 py-3 text-sm ${BANNER_STYLES[banner.tone]}`}>
          <span className="font-semibold">{banner.title}</span> {banner.text}
        </p>
      )}

      {isLoading ? (
        <DetailsSkeleton />
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-5">
            <DescriptionCard incident={incident} />
            <AttachedImages images={incident.images} />
            <CommunicationLog incident={incident} readOnly={incident.status === "closed"} />
          </div>
          <div className="lg:sticky lg:top-4">
            <IncidentTimeline events={incident.timeline} isClosed={incident.status === "closed"} />
          </div>
        </div>
      )}

      {dialog === "assign" && (
        <AssignIncidentModal incident={incident} {...dialogProps} onConfirm={run} />
      )}

      {dialog === "escalate" && (
        <ReasonDialog
          {...DIALOGS.escalate}
          title={DIALOGS.escalate.title(incident)}
          reasons={ESCALATION_TARGETS}
          noteRequiredFor
          tone="warning"
          {...dialogProps}
          onConfirm={({ reason, note }) => run({ to: reason, reason: note })}
        />
      )}

      {dialog === "resolve" && (
        <ReasonDialog
          {...DIALOGS.resolve}
          title={DIALOGS.resolve.title(incident)}
          reasons={RESOLUTION_OUTCOMES}
          layout="chips"
          tone="success"
          {...dialogProps}
          onConfirm={({ reason, note }) => run({ outcome: reason, note })}
        />
      )}

      {dialog === "close" && (
        <ConfirmDialog
          {...DIALOGS.close}
          title={DIALOGS.close.title(incident)}
          tone="dark"
          {...dialogProps}
          onConfirm={() => run({})}
        />
      )}
    </div>
  );
};

export default IncidentDetails;
