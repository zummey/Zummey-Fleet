import React from "react";
import { X, File } from "lucide-react";

const SEVERITY_COLORS = {
  moderate: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-600",
  low: "bg-green-100 text-green-700",
};

const STATUS_COLORS = {
  under_review: "bg-blue-100 text-blue-600",
  "under review": "bg-blue-100 text-blue-600",
  resolved: "bg-green-100 text-green-600",
  open: "bg-red-100 text-red-500",
};

const TimelineDot = ({ color }) => (
  <span
    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${color}`}
  />
);

const IncidentDetailModal = ({ incident, onClose, onResolve }) => {
  if (!incident) return null;

  const severityClass =
    SEVERITY_COLORS[incident.severity?.toLowerCase()] ?? "bg-gray-100 text-gray-600";
  const statusClass =
    STATUS_COLORS[incident.status?.toLowerCase()] ?? "bg-gray-100 text-gray-500";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="incident-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        {/* ── Header ── */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400">
              {incident.incidentId} · {incident.category}
            </p>
            <h3 id="incident-modal-title" className="mt-1 text-xl font-bold text-[#343C6A]">
              {incident.title}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${severityClass}`}>
                {incident.severity ?? "Moderate"}
              </span>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}>
                {incident.statusLabel ?? incident.status ?? "Under review"}
              </span>
            </div>
          </div>
          <button
            id="incident-modal-close-btn"
            type="button"
            onClick={onClose}
            aria-label="Close incident modal"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Meta grid ── */}
        <div className="mb-5 grid grid-cols-2 gap-y-3 rounded-xl bg-gray-50 p-4 text-sm">
          <div>
            <p className="text-xs text-gray-400">Rider</p>
            <p className="font-medium text-[#343C6A]">{incident.riderName ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Date reported</p>
            <p className="font-medium text-[#343C6A]">{incident.dateReported ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Reported by</p>
            <p className="font-medium text-[#343C6A]">{incident.reportedBy ?? "Customer"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Related delivery</p>
            <p className="font-medium text-[#343C6A]">{incident.relatedDelivery ?? "—"}</p>
          </div>
        </div>

        {/* ── What happened ── */}
        <div className="mb-4">
          <h4 className="mb-1 text-sm font-semibold text-[#343C6A]">What happened</h4>
          <p className="text-sm leading-relaxed text-gray-600">{incident.description}</p>
        </div>

        {/* ── Action taken ── */}
        <div className="mb-4">
          <h4 className="mb-1 text-sm font-semibold text-[#343C6A]">Action taken</h4>
          <p className="text-sm leading-relaxed text-gray-600">
            {incident.actionTaken ?? "No action recorded."}
          </p>
        </div>

        {/* ── Resolution notes ── */}
        <div className="mb-5">
          <h4 className="mb-1 text-sm font-semibold text-[#343C6A]">Resolution notes</h4>
          <p className="text-sm leading-relaxed text-gray-600">
            {incident.resolutionNotes ?? "No notes yet."}
          </p>
        </div>

        {/* ── Timeline ── */}
        {incident.timeline?.length > 0 && (
          <div className="mb-5">
            <h4 className="mb-3 text-sm font-semibold text-[#343C6A]">Timeline</h4>
            <ul className="space-y-3">
              {incident.timeline.map((entry, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <TimelineDot
                    color={
                      entry.state === "done"
                        ? "bg-blue-500"
                        : entry.state === "in_progress"
                          ? "bg-amber-400"
                          : "bg-gray-300"
                    }
                  />
                  <div>
                    <p className="text-sm font-medium text-[#343C6A]">{entry.label}</p>
                    <p className="text-xs text-gray-400">{entry.timestamp}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Attachments ── */}
        {incident.attachments?.length > 0 && (
          <div className="mb-6">
            <h4 className="mb-2 text-sm font-semibold text-[#343C6A]">Attachments</h4>
            <div className="flex flex-wrap gap-2">
              {incident.attachments.map((att, idx) => (
                <a
                  key={idx}
                  href={att.url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-[#343C6A] transition-colors hover:bg-gray-100"
                >
                  <File size={13} />
                  {att.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer actions ── */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            id="incident-modal-close-footer-btn"
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Close
          </button>
          {incident.status?.toLowerCase() !== "resolved" && (
            <button
              id="incident-modal-resolve-btn"
              type="button"
              onClick={() => onResolve?.(incident)}
              className="rounded-lg bg-[#1D7A3A] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#165e2c]"
            >
              Mark as resolved
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailModal;
