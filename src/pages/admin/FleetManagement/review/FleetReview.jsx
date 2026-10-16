import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import FleetProfileCard from "../details/FleetProfileCard";
import ProfileSkeleton from "../../components/ProfileSkeleton";
import ErrorBox from "../../components/ErrorBox";
import DocumentPreview from "./DocumentPreview";
import VerificationPanel from "./VerificationPanel";
import ReviewDecisionModal from "./ReviewDecisionModal";
import { REVIEW_CHECKLIST, REVIEW_DECISIONS, formatDateTime } from "../adminFleet.config";
import { useFleetDetails } from "../../../../api/admin.queries";
import { useSubmitFleetReview } from "../../../../api/admin.mutations";

const BANNER_STYLES = {
  approve: "border-green-200 bg-green-50 text-green-700",
  reject: "border-red-200 bg-red-50 text-red-600",
  clarify: "border-blue-200 bg-blue-50 text-blue-700",
};

// Unticked checklist items become the starting point of a clarification request
const buildClarificationNote = (checklist) => {
  const missing = REVIEW_CHECKLIST.filter((item) => !checklist[item.id]);
  if (missing.length === 0) return "";
  return `Please review the following and resubmit:\n${missing.map((item) => `• ${item.label}`).join("\n")}`;
};

const FleetReview = () => {
  const { fleetId } = useParams();
  const fleet = useFleetDetails(fleetId);
  const review = useSubmitFleetReview();

  const [checklist, setChecklist] = useState({});
  const [activeDecision, setActiveDecision] = useState(null);

  const toggleCheck = (id) => setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));

  const openDecision = (decision) => {
    review.reset(); // clear any error from a previous attempt
    setActiveDecision(decision);
  };

  const closeDecision = () => setActiveDecision(null);

  const confirmDecision = (note) => {
    review.mutate(
      { fleetId, decision: activeDecision.id, note, checklist },
      { onSuccess: closeDecision }
    );
  };

  const lastReview = fleet.data?.lastReview;
  const lastDecision = REVIEW_DECISIONS.find((d) => d.id === lastReview?.decision);

  return (
    <div className="mb-6 space-y-6 font-poppins">
      <Link
        to="/fleet-management"
        className="inline-flex items-center gap-1 text-xl font-semibold text-[#343C6A] hover:text-[#EB4827]"
      >
        <ChevronLeft size={20} />
        Fleet Management
      </Link>

      {fleet.isLoading ? (
        <ProfileSkeleton />
      ) : fleet.isError ? (
        <ErrorBox title="Error loading fleet" error={fleet.error} onRetry={fleet.refetch} isRetrying={fleet.isFetching} />
      ) : (
        <>
          <FleetProfileCard
            fleet={fleet.data}
            onToggleSuspend={() => {
              // TODO: suspend/reactivate mutation once the backend endpoint exists
            }}
          />

          {lastDecision && (
            <div
              role="status"
              className={`flex flex-wrap items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm motion-safe:animate-fade-in-up ${BANNER_STYLES[lastDecision.id]}`}
            >
              <div>
                <p className="font-semibold">{lastDecision.successMessage}</p>
                {lastReview.note && <p className="mt-1 whitespace-pre-line opacity-90">{lastReview.note}</p>}
              </div>
              <div className="flex items-center gap-4 text-xs opacity-80">
                <span>{formatDateTime(lastReview.reviewedAt)}</span>
                <Link to={`/fleet-management/${fleetId}`} className="font-medium underline-offset-2 hover:underline">
                  View fleet details
                </Link>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <DocumentPreview document={fleet.data.cac?.document} />
            <VerificationPanel
              fleet={fleet.data}
              checklist={checklist}
              onToggleCheck={toggleCheck}
              onDecision={openDecision}
              disabled={review.isPending}
            />
          </div>
        </>
      )}

      {activeDecision && (
        <ReviewDecisionModal
          key={activeDecision.id}
          decision={activeDecision}
          initialNote={activeDecision.id === "clarify" ? buildClarificationNote(checklist) : ""}
          isSubmitting={review.isPending}
          error={review.error}
          onConfirm={confirmDecision}
          onClose={closeDecision}
        />
      )}
    </div>
  );
};

export default FleetReview;
