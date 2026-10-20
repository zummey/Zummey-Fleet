import React, { useEffect, useState } from "react";
import { Search, AlertTriangle, ChevronRight, FileText } from "lucide-react";
import StatusBadge from "../../../components/StatusBadge";
import Pagination from "../../../components/Pagination";
import ErrorBox from "../../../components/ErrorBox";
import { useDebouncedValue } from "../../../components/useDebouncedValue";
import { formatShortDate } from "../../../components/formatters";
import { RIDER_HISTORY_PAGE_SIZE, RIDER_PERSONAL_INFO_FIELDS, RIDER_VEHICLE_FIELDS } from "./riderDetails.config";
import { useRiderDeliveries, useRiderIncidents, useRiderPerformance } from "../../../../../api/admin.queries";
import DocumentViewerModal from "./DocumentViewerModal";
import IncidentDetailModal from "./IncidentDetailModal";

// ─── Helper: render a two-column label → value info table ─────────────────
const InfoTable = ({ fields, data }) => (
  <div className="divide-y divide-gray-100">
    {fields.map((field, idx) => {
      const value = field.value ? field.value(data) : (data[field.key] ?? "—");
      return (
        <div key={idx} className="flex items-baseline justify-between gap-6 py-3.5">
          <span className="shrink-0 text-sm text-gray-400">{field.label}</span>
          <span className="text-right text-sm font-medium text-[#343C6A]">{value}</span>
        </div>
      );
    })}
  </div>
);

// ─── Screen 1: Profile Information ────────────────────────────────────────
const ProfilePanel = ({ rider }) => (
  <div>
    <h4 className="mb-4 text-sm font-semibold text-[#343C6A]">Personal Information</h4>
    <InfoTable fields={RIDER_PERSONAL_INFO_FIELDS} data={rider} />
  </div>
);

// ─── Screen 2: Documents ──────────────────────────────────────────────────
const DocumentsPanel = ({ rider }) => {
  const [viewDoc, setViewDoc] = useState(null);
  const docs = rider.documents ?? [];

  return (
    <>
      <div>
        <h4 className="mb-4 text-sm font-semibold text-[#343C6A]">Rider Documents</h4>
        <div className="space-y-3">
          {docs.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">No documents uploaded yet.</p>
          )}
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-400">
                  <FileText size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#343C6A]">{doc.title}</p>
                  <p className="text-xs text-gray-400">{doc.uploadedAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Status badge — "Verified" maps to our "approved" style */}
                <StatusBadge status={doc.status === "verified" ? "approved" : doc.status} />
                <button
                  id={`doc-view-btn-${doc.id}`}
                  type="button"
                  onClick={() => setViewDoc(doc)}
                  className="rounded-lg border border-gray-200 px-4 py-1.5 text-xs font-medium text-[#343C6A] transition-colors hover:bg-gray-50"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {viewDoc && (
        <DocumentViewerModal
          document={viewDoc}
          allDocuments={docs}
          onClose={() => setViewDoc(null)}
        />
      )}
    </>
  );
};

// ─── Screen 3: Vehicle Details ─────────────────────────────────────────────
const VehiclePanel = ({ rider }) => (
  <div>
    <h4 className="mb-4 text-sm font-semibold text-[#343C6A]">Vehicle Details</h4>
    <InfoTable fields={RIDER_VEHICLE_FIELDS} data={rider} />
  </div>
);

// ─── Screen 4: Performance Metrics ────────────────────────────────────────
const MetricCard = ({ label, value }) => (
  <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="mt-1 text-3xl font-bold text-[#343C6A]">{value}</p>
  </div>
);

const PerformancePanel = ({ riderId }) => {
  const perf = useRiderPerformance(riderId);

  if (perf.isError)
    return (
      <ErrorBox
        title="Error loading performance"
        error={perf.error}
        onRetry={perf.refetch}
        isRetrying={perf.isFetching}
      />
    );

  const data = perf.data ?? {};

  const metrics = [
    { label: "Average Rating", value: data.averageRating ?? "—" },
    { label: "Completed Deliveries", value: data.completedDeliveries ?? "—" },
    { label: "Cancellation Rate", value: data.cancellationRate != null ? `${data.cancellationRate}%` : "—" },
    { label: "Average Delivery Time", value: data.avgDeliveryTime != null ? `${data.avgDeliveryTime} min` : "—" },
  ];

  return (
    <div>
      <h4 className="mb-4 text-sm font-semibold text-[#343C6A]">Performance Metrics</h4>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {perf.isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-gray-100 p-5">
                <div className="h-3 w-24 rounded bg-gray-200" />
                <div className="mt-2 h-8 w-16 rounded bg-gray-300" />
              </div>
            ))
          : metrics.map((m) => <MetricCard key={m.label} label={m.label} value={m.value} />)}
      </div>
    </div>
  );
};

// ─── Screen 5: Delivery History ────────────────────────────────────────────
const DeliveryHistoryPanel = ({ riderId, tab }) => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput).trim();

  useEffect(() => setPage(1), [search]);

  const deliveries = useRiderDeliveries(riderId, { page, pageSize: RIDER_HISTORY_PAGE_SIZE, search });
  const rows = deliveries.data?.results ?? [];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-[#343C6A]">
          Delivery History
          {deliveries.data?.total != null && (
            <span className="ml-2 text-xs font-normal text-gray-400 tabular-nums">
              ({deliveries.data.total})
            </span>
          )}
        </h4>
        <div className="relative w-full sm:w-56">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for something"
            aria-label="Search deliveries"
            className="w-full rounded-full bg-gray-50 py-2 pr-4 pl-9 text-sm placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#FFF4E8] focus:outline-none"
          />
        </div>
      </div>

      {deliveries.isError ? (
        <ErrorBox
          title="Error loading delivery history"
          error={deliveries.error}
          onRetry={deliveries.refetch}
          isRetrying={deliveries.isFetching}
        />
      ) : (
        <div className={`transition-opacity ${deliveries.isPlaceholderData ? "opacity-60" : ""}`}>
          <div className="no-scrollbar overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[#343C6A]">
                  {tab.columns.map((col) => (
                    <th key={col.key} className="py-3 pr-4 font-medium whitespace-nowrap text-gray-500">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deliveries.isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {tab.columns.map((col) => (
                          <td key={col.key} className="py-5 pr-4">
                            <div className="h-4 w-20 rounded bg-gray-200" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : rows.map((row) => (
                      <tr key={row.id} className="text-[#343C6A] hover:bg-gray-50/60">
                        <td className="py-4 pr-4 font-semibold whitespace-nowrap">{row.id}</td>
                        <td className="py-4 pr-4 font-medium text-[#343C6A] whitespace-nowrap">{row.pickup}</td>
                        <td className="py-4 pr-4 font-medium text-[#343C6A] whitespace-nowrap">{row.destination}</td>
                        <td className="py-4 pr-4 tabular-nums">{row.amount}</td>
                        <td className="py-4 pr-4">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="py-4 pr-4 whitespace-nowrap tabular-nums">{formatShortDate(row.date)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {!deliveries.isLoading && rows.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">
              {search ? `No deliveries match "${search}".` : tab.emptyText}
            </p>
          )}

          {deliveries.data?.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                page={page}
                totalPages={deliveries.data.totalPages}
                onChange={setPage}
                disabled={deliveries.isFetching}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Screen 6: Incident History ────────────────────────────────────────────
const INCIDENT_STATUS_COLORS = {
  under_review: "bg-blue-50 text-blue-600",
  "under review": "bg-blue-50 text-blue-600",
  resolved: "bg-green-50 text-green-600",
  open: "bg-red-50 text-red-500",
};

const IncidentHistoryPanel = ({ riderId }) => {
  const [page, setPage] = useState(1);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const incidents = useRiderIncidents(riderId, { page, pageSize: RIDER_HISTORY_PAGE_SIZE });
  const rows = incidents.data?.results ?? [];
  const summary = incidents.data?.summary ?? {};

  const summaryCards = [
    { label: "Total Incidents", value: summary.total ?? rows.length },
    { label: "Under Review", value: summary.underReview ?? 0 },
    { label: "Major Incidents", value: summary.major != null ? `${summary.major}%` : "—" },
    { label: "Most recent", value: summary.mostRecent ?? "—", large: true },
  ];

  const handleResolve = (incident) => {
    // TODO: call mutation to mark as resolved
    setSelectedIncident(null);
  };

  return (
    <>
      <div className="space-y-5">
        <h4 className="text-sm font-semibold text-[#343C6A]">Incident History</h4>

        {/* Summary stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {incidents.isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-gray-100 p-5">
                  <div className="h-3 w-20 rounded bg-gray-200" />
                  <div className="mt-2 h-7 w-14 rounded bg-gray-300" />
                </div>
              ))
            : summaryCards.map((card) => (
                <div key={card.label} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                  <p className="text-xs text-gray-400">{card.label}</p>
                  <p className={`mt-1 font-bold text-[#343C6A] ${card.large ? "text-2xl" : "text-3xl"}`}>
                    {card.value}
                  </p>
                </div>
              ))}
        </div>

        {incidents.isError ? (
          <ErrorBox
            title="Error loading incidents"
            error={incidents.error}
            onRetry={incidents.refetch}
            isRetrying={incidents.isFetching}
          />
        ) : (
          <div className={`space-y-3 transition-opacity ${incidents.isPlaceholderData ? "opacity-60" : ""}`}>
            {incidents.isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl border border-gray-200 p-4">
                    <div className="h-4 w-36 rounded bg-gray-200" />
                    <div className="mt-2 h-3 w-64 rounded bg-gray-100" />
                  </div>
                ))
              : rows.map((row) => {
                  const statusClass =
                    INCIDENT_STATUS_COLORS[row.status?.toLowerCase()] ?? "bg-gray-100 text-gray-500";
                  return (
                    <button
                      key={row.id}
                      id={`incident-row-${row.id}`}
                      type="button"
                      onClick={() => setSelectedIncident(row)}
                      className="flex w-full items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50/60"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-400">
                          <AlertTriangle size={15} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-[#343C6A]">{row.title}</p>
                          <p className="text-xs text-gray-500">{row.description}</p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {row.incidentId} · {formatShortDate(row.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}>
                          {row.statusLabel ?? row.status}
                        </span>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                    </button>
                  );
                })}

            {!incidents.isLoading && rows.length === 0 && (
              <p className="py-10 text-center text-sm text-gray-400">No incidents recorded.</p>
            )}

            {incidents.data?.totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  page={page}
                  totalPages={incidents.data.totalPages}
                  onChange={setPage}
                  disabled={incidents.isFetching}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onResolve={handleResolve}
        />
      )}
    </>
  );
};

// ─── Main dispatcher ───────────────────────────────────────────────────────
const RiderDetailsPanel = ({ riderId, rider, tab }) => {
  switch (tab.layout) {
    case "profile":
      return <ProfilePanel rider={rider} />;
    case "documents":
      return <DocumentsPanel rider={rider} />;
    case "vehicle":
      return <VehiclePanel rider={rider} />;
    case "performance":
      return <PerformancePanel riderId={riderId} />;
    case "table":
      return <DeliveryHistoryPanel riderId={riderId} tab={tab} />;
    case "incidents":
      return <IncidentHistoryPanel riderId={riderId} />;
    default:
      return null;
  }
};

export default RiderDetailsPanel;
