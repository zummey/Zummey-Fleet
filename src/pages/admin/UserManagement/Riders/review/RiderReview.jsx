import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ExternalLink,
  FileText,
  X,
} from "lucide-react";
import { useAdminRiderDetails } from "../../../../../api/admin.queries";
import { useSubmitRiderReview } from "../../../../../api/admin.mutations";
import ProfileSkeleton from "../../../components/ProfileSkeleton";
import ErrorBox from "../../../components/ErrorBox";
import RequestMoreInfoModal from "./RequestMoreInfoModal";
import RejectRiderModal from "./RejectRiderModal";
import ApproveRiderModal from "./ApproveRiderModal";
import CarImg from "../../../../../assets/car-01.png";

const DEFAULT_DOCUMENTS = [
  {
    id: "drivers_license",
    title: "Drivers License",
    category: "license",
    uploadedAt: "Uploaded Oct 8 , 2026",
  },
  {
    id: "passport_photo",
    title: "Passport Photograph",
    category: "identity",
    uploadedAt: "Uploaded Oct 8 , 2026",
  },
  {
    id: "government_id",
    title: "Government ID(NIN)",
    category: "identity",
    uploadedAt: "Uploaded Oct 8 , 2026",
  },
  {
    id: "vehicle_reg",
    title: "Vehicle Registration",
    category: "license",
    uploadedAt: "Uploaded Oct 8 , 2026",
  },
];

const RiderReview = () => {
  const { riderId } = useParams();
  const navigate = useNavigate();

  const { data: rider, isLoading, isError, error, refetch } = useAdminRiderDetails(riderId);
  const submitReview = useSubmitRiderReview();

  // Verification states for each document: "verified" | "flagged" | null
  const [docStatuses, setDocStatuses] = useState({});

  // Background check statuses
  const [bgChecks, setBgChecks] = useState({
    criminal: false,
    reference: false,
    driving: false,
  });

  // Modals
  const [isRequestInfoOpen, setIsRequestInfoOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);

  const toggleVerify = (docId) => {
    setDocStatuses((prev) => ({
      ...prev,
      [docId]: prev[docId] === "verified" ? null : "verified",
    }));
  };

  const toggleFlag = (docId) => {
    setDocStatuses((prev) => ({
      ...prev,
      [docId]: prev[docId] === "flagged" ? null : "flagged",
    }));
  };

  const toggleBgCheck = (key) => {
    setBgChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const documents = rider?.documents || DEFAULT_DOCUMENTS;

  // Counts for Verification Status panel
  const identityDocs = documents.filter((d) => d.category === "identity");
  const licenseDocs = documents.filter((d) => d.category === "license");

  const identityVerifiedCount = identityDocs.filter(
    (d) => docStatuses[d.id] === "verified"
  ).length;
  const licenseVerifiedCount = licenseDocs.filter(
    (d) => docStatuses[d.id] === "verified"
  ).length;

  // Decision actions
  const handleApprove = () => {
    submitReview.mutate(
      { riderId, decision: "approve" },
      {
        onSuccess: () => {
          setIsApproveOpen(false);
          setActionFeedback({
            type: "success",
            title: "Rider Approved",
            message: `${rider?.name || "Rider"} has been approved and activated.`,
          });
        },
      }
    );
  };

  const handleReject = ({ reasons, note }) => {
    submitReview.mutate(
      { riderId, decision: "reject", reason: reasons.join(", "), note },
      {
        onSuccess: () => {
          setIsRejectOpen(false);
          setActionFeedback({
            type: "danger",
            title: "Application Rejected",
            message: `${rider?.name || "Rider"}'s application has been closed.`,
          });
        },
      }
    );
  };

  const handleRequestMoreInfo = ({ itemsNeeded, message }) => {
    submitReview.mutate(
      { riderId, decision: "clarify", itemsNeeded, note: message },
      {
        onSuccess: () => {
          setIsRequestInfoOpen(false);
          setActionFeedback({
            type: "info",
            title: "Information Requested",
            message: `A re-submission request was sent to ${rider?.name || "the rider"}.`,
          });
        },
      }
    );
  };

  const initials = rider
    ? (
        (rider.firstName?.[0] || rider.first_name?.[0] || rider.name?.split(" ")[0]?.[0] || "") +
        (rider.lastName?.[0] || rider.last_name?.[0] || rider.name?.split(" ")[1]?.[0] || "")
      ).toUpperCase()
    : "R";

  return (
    <div className="mb-6 space-y-6 font-poppins">
      {/* Page Title & Back Link */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-[#1E2A5E]">Riders Approval</h3>
        </div>
        <Link
          to="/user-management/riders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#EB4827] transition-colors"
        >
          <ChevronLeft size={18} />
          Back to Riders
        </Link>
      </div>

      {isLoading ? (
        <ProfileSkeleton />
      ) : isError ? (
        <ErrorBox
          title="Error loading rider details"
          error={error}
          onRetry={refetch}
          isRetrying={isLoading}
        />
      ) : (
        <>
          {/* Action Feedback Banner */}
          {actionFeedback && (
            <div
              className={`flex items-center justify-between rounded-2xl p-4 transition-all ${
                actionFeedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : actionFeedback.type === "danger"
                    ? "bg-rose-50 text-rose-800 border border-rose-200"
                    : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}
            >
              <div className="flex items-center gap-3">
                {actionFeedback.type === "success" ? (
                  <CheckCircle2 size={20} className="text-emerald-600" />
                ) : (
                  <AlertCircle size={20} className="text-current" />
                )}
                <div>
                  <p className="text-sm font-semibold">{actionFeedback.title}</p>
                  <p className="text-xs">{actionFeedback.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/user-management/riders")}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold underline hover:no-underline"
                >
                  Return to list
                </button>
                <button
                  type="button"
                  onClick={() => setActionFeedback(null)}
                  className="rounded-lg p-1 hover:bg-black/5"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Rider Header Card */}
          <section className="rounded-2xl bg-white p-5 sm:p-6 shadow-xs border border-gray-100 flex items-center gap-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
              {rider?.profile_picture_url ? (
                <img
                  src={rider.profile_picture_url}
                  alt={rider.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={CarImg}
                  alt={rider.name}
                  className="h-9 w-9 object-contain"
                />
              )}
            </div>

            <div>
              <h4 className="text-xl font-bold text-[#1E2A5E]">{rider?.name}</h4>
              <p className="mt-0.5 text-sm font-normal text-gray-400 flex flex-wrap items-center gap-2 sm:gap-3">
                <span>RDR ID: {rider?.code || `ZFL - ${rider?.id}`}</span>
                <span className="hidden sm:inline">•</span>
                <span>{rider?.vehicleType || "Motorbike"}</span>
                <span className="hidden sm:inline">•</span>
                <span>{rider?.fleetName || rider?.fleet || "Swift Logistics"}</span>
                <span className="hidden sm:inline">•</span>
                <span>{rider?.appliedDate || "Applied Oct 12, 2026"}</span>
              </p>
            </div>
          </section>

          {/* Two-Column Review Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Uploaded Documents */}
            <div className="lg:col-span-8 space-y-4">
              <h4 className="text-base font-semibold text-[#1E2A5E]">
                Uploaded Documents
              </h4>

              <div className="space-y-3.5">
                {documents.map((doc) => {
                  const status = docStatuses[doc.id];
                  const isVerified = status === "verified";
                  const isFlagged = status === "flagged";

                  return (
                    <div
                      key={doc.id}
                      className="rounded-2xl bg-white border border-gray-100 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-xs hover:border-gray-200 transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          onClick={() => setPreviewDoc(doc)}
                          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                          title="Click to preview document"
                        >
                          <FileText size={20} />
                        </div>
                        <div>
                          <p
                            onClick={() => setPreviewDoc(doc)}
                            className="text-sm font-semibold text-[#1E2A5E] hover:text-[#0088FF] cursor-pointer transition-colors"
                          >
                            {doc.title}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {doc.uploadedAt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => toggleVerify(doc.id)}
                          className={`rounded-lg px-4 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                            isVerified
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "border border-[#10B981] text-[#10B981] hover:bg-emerald-50"
                          }`}
                        >
                          {isVerified ? "Verified ✓" : "Verify"}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleFlag(doc.id)}
                          className={`rounded-lg px-4 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                            isFlagged
                              ? "bg-rose-600 text-white shadow-xs"
                              : "border border-[#F43F5E] text-[#F43F5E] hover:bg-rose-50"
                          }`}
                        >
                          {isFlagged ? "Flagged ✕" : "Flag"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Verification Status & Background Checks */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-xs space-y-6">
                {/* Verification Status */}
                <div>
                  <h4 className="text-sm font-bold text-[#1E2A5E] mb-3.5">
                    Verification Status
                  </h4>

                  <div className="space-y-3.5">
                    {/* Identity and Passport */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                          identityVerifiedCount === identityDocs.length && identityDocs.length > 0
                            ? "bg-emerald-100 text-emerald-600"
                            : "border-2 border-amber-500 text-amber-500"
                        }`}
                      >
                        <Check size={13} className="stroke-[3]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#1E2A5E]">
                          Identity and Passport
                        </p>
                        <p className="text-xs text-gray-400">
                          {identityVerifiedCount} of {identityDocs.length} verified
                        </p>
                      </div>
                    </div>

                    {/* License and Vehicle documents */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                          licenseVerifiedCount === licenseDocs.length && licenseDocs.length > 0
                            ? "bg-emerald-100 text-emerald-600"
                            : "border-2 border-amber-500 text-amber-500"
                        }`}
                      >
                        <Check size={13} className="stroke-[3]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#1E2A5E]">
                          License and Vehicle documents
                        </p>
                        <p className="text-xs text-gray-400">
                          {licenseVerifiedCount} of {licenseDocs.length} verified
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Background Check Status */}
                <div className="border-t border-gray-100 pt-5">
                  <h4 className="text-sm font-bold text-[#1E2A5E] mb-3">
                    Background Check Status
                  </h4>

                  <div className="space-y-2.5">
                    <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={bgChecks.criminal}
                        onChange={() => toggleBgCheck("criminal")}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span>Criminal record check</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={bgChecks.reference}
                        onChange={() => toggleBgCheck("reference")}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span>Reference Check</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={bgChecks.driving}
                        onChange={() => toggleBgCheck("driving")}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span>Driving Record</span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-100 pt-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsApproveOpen(true)}
                      className="rounded-lg bg-[#059669] hover:bg-[#047857] px-4 py-2 text-xs font-medium text-white transition-colors cursor-pointer shadow-xs"
                    >
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsRejectOpen(true)}
                      className="rounded-lg border border-[#EF4444] text-[#EF4444] hover:bg-red-50 px-4 py-2 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Reject
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsRequestInfoOpen(true)}
                      className="rounded-lg bg-[#0088FF] hover:bg-blue-600 px-4 py-2 text-xs font-medium text-white transition-colors cursor-pointer shadow-xs"
                    >
                      Request more info.
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Document Preview Modal */}
          {previewDoc && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-poppins"
              onMouseDown={(e) => e.target === e.currentTarget && setPreviewDoc(null)}
            >
              <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#1E2A5E]">
                      {previewDoc.title}
                    </h3>
                    <p className="text-xs text-gray-400">{previewDoc.uploadedAt}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(null)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-4 flex min-h-[300px] items-center justify-center rounded-xl bg-gray-50 p-4 border border-gray-200">
                  {previewDoc.url ? (
                    <img
                      src={previewDoc.url}
                      alt={previewDoc.title}
                      className="max-h-[400px] max-w-full rounded-lg object-contain"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <FileText size={40} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm font-medium">Document Preview</p>
                      <p className="text-xs text-gray-400">
                        {previewDoc.title} is on file.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(null)}
                    className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Decision Modals */}
          <RequestMoreInfoModal
            riderName={rider?.name}
            isOpen={isRequestInfoOpen}
            onClose={() => setIsRequestInfoOpen(false)}
            onSubmit={handleRequestMoreInfo}
            isSubmitting={submitReview.isPending}
          />

          <RejectRiderModal
            riderName={rider?.name}
            isOpen={isRejectOpen}
            onClose={() => setIsRejectOpen(false)}
            onSubmit={handleReject}
            isSubmitting={submitReview.isPending}
          />

          <ApproveRiderModal
            riderName={rider?.name}
            isOpen={isApproveOpen}
            onClose={() => setIsApproveOpen(false)}
            onConfirm={handleApprove}
            isSubmitting={submitReview.isPending}
          />
        </>
      )}
    </div>
  );
};

export default RiderReview;
