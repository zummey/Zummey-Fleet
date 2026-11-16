import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import TableToolbar from "../components/TableToolbar";
import DataTable from "../components/DataTable";
import Pagination from "../components/Pagination";
import ErrorBox from "../components/ErrorBox";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import RowActionsMenu from "../components/RowActionsMenu";
import { useTableParams } from "../components/useTableParams";
import { formatMonthDayTime } from "../components/formatters";
import {
  INCIDENTS_PAGE_SIZE,
  INCIDENTS_PATH,
  INCIDENT_FILTER_GROUPS,
  INCIDENT_ROW_ACTIONS,
  INCIDENT_STATUS_BADGES,
  incidentTypeLabel,
} from "./incidents.config";
import { useIncidentCount, useIncidents } from "../../../api/incidents.queries";

const AdminIncidents = () => {
  const navigate = useNavigate();
  const table = useTableParams({ filterGroups: INCIDENT_FILTER_GROUPS });
  const { page, search, filters } = table;
  const incidents = useIncidents({ page, pageSize: INCIDENTS_PAGE_SIZE, search, ...filters });
  const rows = incidents.data?.results ?? [];

  // Live count for the filter panel's unapplied selection
  const [draftFilters, setDraftFilters] = useState(null);
  const draftCount = useIncidentCount({ search, ...(draftFilters ?? filters) }, { enabled: draftFilters !== null });

  const columns = [
    {
      key: "id",
      label: "Incident ID",
      render: (inc) => (
        <Link to={`${INCIDENTS_PATH}/${inc.id}`} className="group block">
          <span className="block font-semibold group-hover:text-[#EB4827] group-hover:underline">{inc.id}</span>
          <span className="block text-[11px] text-gray-400">{formatMonthDayTime(inc.reportedAt)}</span>
        </Link>
      ),
    },
    { key: "type", label: "Type", className: "font-medium", render: (inc) => incidentTypeLabel(inc.type) },
    { key: "relatedOrder", label: "Related Order", className: "font-medium" },
    {
      key: "assignedAdmin",
      label: "Assigned Admin",
      className: "font-medium",
      render: (inc) => inc.assignedAdmin?.name ?? <span className="text-gray-400">Unassigned</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (inc) => <StatusBadge status={inc.status} badges={INCIDENT_STATUS_BADGES} />,
    },
    {
      key: "actions",
      label: "Actions",
      srOnlyLabel: true,
      className: "text-right",
      render: (inc) => (
        <RowActionsMenu
          label={`Actions for ${inc.id}`}
          actions={INCIDENT_ROW_ACTIONS}
          onSelect={(action) => action === "view" && navigate(`${INCIDENTS_PATH}/${inc.id}`)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-5 p-4 font-poppins sm:p-6">
      <h1 className="text-xl font-semibold text-[#343C6A]">Incident Management</h1>

      <section className="rounded-2xl bg-white p-5 sm:p-6">
        <TableToolbar
          title="All Incidents"
          search={{
            value: table.searchInput,
            onChange: table.setSearchInput,
            placeholder: "Search ID, order, type or admin",
            label: "Search incidents",
          }}
          filter={{
            groups: INCIDENT_FILTER_GROUPS,
            value: filters,
            onApply: table.applyFilters,
            onDraftChange: setDraftFilters,
            resultCount: draftCount.data,
            isCounting: draftCount.isFetching,
          }}
        />

        {incidents.isError ? (
          <ErrorBox
            title="Error loading incidents"
            error={incidents.error}
            onRetry={incidents.refetch}
            isRetrying={incidents.isFetching}
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={rows}
              isLoading={incidents.isLoading}
              isDimmed={incidents.isPlaceholderData}
            />

            {!incidents.isLoading && rows.length === 0 && (
              <EmptyState
                icon={ShieldCheck}
                title={table.isFiltered ? "No incidents match" : "No incidents yet"}
                description={
                  table.isFiltered
                    ? "Try a different search term or filter."
                    : "Problems reported by customers and riders will appear here."
                }
                action={table.isFiltered ? { label: "Clear search and filters", onClick: table.clearAll } : undefined}
              />
            )}

            {rows.length > 0 && (
              <div className="mt-6">
                <Pagination
                  page={page}
                  totalPages={incidents.data?.totalPages ?? 1}
                  onChange={table.setPage}
                  disabled={incidents.isFetching}
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default AdminIncidents;
