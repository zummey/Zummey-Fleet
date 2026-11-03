import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Bike, Search, Star } from "lucide-react";
import AdminStatCard from "../../Dashboard/AdminStatCard";
import AdminStatsSkeleton from "../../Dashboard/AdminStatsSkeleton";
import { getTabById } from "../../Dashboard/adminDashboard.config";
import StatusBadge from "../../components/StatusBadge";
import RowActionsMenu from "../../components/RowActionsMenu";
import Pagination from "../../components/Pagination";
import ErrorBox from "../../components/ErrorBox";
import FilterPanel from "../../components/FilterPanel";
import { defaultsFor, filtersFromParams, filtersToParams } from "../../components/filters";
import ExportPanel from "../../components/ExportPanel";
import { exportRows } from "../../components/exporters";
import { formatLongDate } from "../../components/formatters";
import { useDebouncedValue } from "../../components/useDebouncedValue";
import {
  RIDERS_PAGE_SIZE,
  RIDERS_SUMMARY_TAB_ID,
  RIDER_COLUMNS,
  RIDER_EXPORT_COLUMNS,
  RIDER_FILTER_GROUPS,
  RIDER_QUERY_PARAMS as P,
  RIDER_ROW_ACTIONS,
  toRiderQuery,
} from "./riders.config";
import { useAdminDashboardStats, useAdminRiderCount, useAdminRiders } from "../../../../api/admin.queries";
import { exportAdminRiders } from "../../../../api/admin.service";

const summaryTab = getTabById(RIDERS_SUMMARY_TAB_ID);

/**
 * RiderAvatar
 * Displays the rider's profile image if provided; on error or absent image,
 * falls back to a badge with the first letter of first name and last name.
 */
const RiderAvatar = ({ rider }) => {
  const [imgError, setImgError] = useState(false);
  const imageUrl = rider?.profile_picture_url || rider?.image || rider?.avatar;

  const firstName = rider?.firstName || rider?.first_name || rider?.name?.split(" ")[0] || "";
  const lastName = rider?.lastName || rider?.last_name || rider?.name?.split(" ").slice(1).join(" ") || "";

  const initials = (
    (firstName?.[0] || "") + (lastName?.[0] || "")
  ).toUpperCase() || (rider?.name?.[0] || "R").toUpperCase();

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={rider?.name || "Rider"}
        onError={() => setImgError(true)}
        className="h-11 w-11 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFF4E8] text-xs font-semibold text-[#EB4827]">
      {initials}
    </span>
  );
};

const AdminRiders = ({ onAction }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get(P.page)) || 1);
  const search = searchParams.get(P.search) ?? "";
  const filters = filtersFromParams(RIDER_FILTER_GROUPS, searchParams);
  const query = { search, ...toRiderQuery(filters) };

  // Input updates immediately; the URL (and query) follows once typing pauses
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput);

  // Merge param changes into the URL. Changing search/filter always returns to page 1.
  const updateParams = (changes, { resetPage = true } = {}) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(changes).forEach(([key, value]) => {
          if (value === "" || value == null) next.delete(key);
          else next.set(key, String(value));
        });
        if (resetPage) next.delete(P.page);
        return next;
      },
      { replace: true }
    );
  };

  useEffect(() => {
    if (debouncedSearch.trim() !== search) updateParams({ [P.search]: debouncedSearch.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the debounced input
  }, [debouncedSearch]);

  const stats = useAdminDashboardStats();
  const riders = useAdminRiders({ page, pageSize: RIDERS_PAGE_SIZE, ...query });

  // Live count for the filter panel's unapplied selection
  const [draftFilters, setDraftFilters] = useState(null);
  const draftCount = useAdminRiderCount(
    { search, ...toRiderQuery(draftFilters ?? filters) },
    { enabled: draftFilters !== null }
  );

  const rows = riders.data?.results ?? [];

  // Export: "All Riders" ignores filters/search; "Current View" is current page rows
  const [exportOpen, setExportOpen] = useState(false);
  const totalCount = useAdminRiderCount(
    { search: "", status: "all", riderType: "all", minDeliveries: 0 },
    { enabled: exportOpen }
  );

  const exporter = useMutation({
    mutationKey: ["admin", "exportRiders"],
    mutationFn: async ({ scope, format }) => {
      const exportData = scope === "all" ? await exportAdminRiders() : rows;
      await exportRows({
        format,
        rows: exportData,
        columns: RIDER_EXPORT_COLUMNS,
        title: scope === "all" ? "All Riders" : "Riders (current view)",
        filename: `riders-${scope === "all" ? "all" : "current-view"}-${new Date().toISOString().slice(0, 10)}`,
      });
    },
  });

  const totalPages = riders.data?.totalPages ?? 1;
  const isFiltered = !!search || JSON.stringify(filters) !== JSON.stringify(defaultsFor(RIDER_FILTER_GROUPS));

  const handleAction = (actionId, rider) => {
    if (onAction) {
      onAction(actionId, rider);
      return;
    }
    switch (actionId) {
      case "view":
        // Route placeholder / navigation for view details
        navigate(`/user-management/riders/${rider.id}`);
        break;
      case "review":
        // Route placeholder / navigation for review
        navigate(`/user-management/riders/${rider.id}/review`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="mb-6 space-y-6 font-poppins">
      <h3 className="text-xl font-semibold text-[#343C6A]">Riders Management</h3>

      {/* Summary cards (shared with the admin dashboard "Riders" tab) */}
      {stats.isLoading ? (
        <AdminStatsSkeleton count={summaryTab.cards.length} gridClass="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {summaryTab.cards.map((card) => (
            <AdminStatCard key={card.key} card={card} stat={stats.data?.[RIDERS_SUMMARY_TAB_ID]?.[card.key]} />
          ))}
        </div>
      )}

      <section className="rounded-2xl bg-white p-5 sm:p-6">
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-base font-semibold text-[#343C6A]">
            All Riders
            {riders.data && (
              <span className="ml-2 text-sm font-normal text-gray-400 tabular-nums">
                ({riders.data.count.toLocaleString()})
              </span>
            )}
          </h4>

          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
              <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name, ID, phone or fleet"
                aria-label="Search riders"
                className="w-full rounded-full bg-gray-50 py-2 pr-4 pl-9 text-sm placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#FFF4E8] focus:outline-none"
              />
            </div>

            <FilterPanel
              groups={RIDER_FILTER_GROUPS}
              value={filters}
              onApply={(selection) => updateParams(filtersToParams(RIDER_FILTER_GROUPS, selection))}
              onDraftChange={setDraftFilters}
              resultCount={draftCount.data}
              isCounting={draftCount.isFetching}
            />

            <ExportPanel
              title="Export Riders"
              noun={{ one: "Rider", other: "Riders" }}
              onOpenChange={setExportOpen}
              onExport={exporter.mutateAsync}
              scopes={[
                {
                  id: "all",
                  label: "All Riders",
                  count: totalCount.data,
                  description: `${(totalCount.data ?? 0).toLocaleString()} Riders in total`,
                },
                {
                  id: "current",
                  label: "Current View",
                  count: riders.isLoading ? undefined : rows.length,
                  description: `${rows.length} Rider${rows.length === 1 ? "" : "s"} shown in this page`,
                },
              ]}
            />
          </div>
        </div>

        {riders.isError ? (
          <ErrorBox
            title="Error loading riders"
            error={riders.error}
            onRetry={riders.refetch}
            isRetrying={riders.isFetching}
          />
        ) : (
          <>
            <div className="no-scrollbar overflow-x-auto">
              <table
                className={`w-full min-w-[880px] text-left text-sm transition-opacity ${riders.isPlaceholderData ? "opacity-60" : ""}`}
              >
                <thead>
                  <tr className="border-b border-gray-100 text-[#343C6A]">
                    {RIDER_COLUMNS.map((col) => (
                      <th key={col.key} className="py-3 pr-4 font-medium whitespace-nowrap">
                        {col.label}
                      </th>
                    ))}
                    <th className="relative py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {riders.isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 rounded-full bg-gray-200"></div>
                              <div className="space-y-1.5">
                                <div className="h-4 w-28 rounded bg-gray-200"></div>
                                <div className="h-3 w-16 rounded bg-gray-100"></div>
                              </div>
                            </div>
                          </td>
                          {RIDER_COLUMNS.slice(1).map((col) => (
                            <td key={col.key} className="py-4 pr-4">
                              <div className="h-4 w-20 rounded bg-gray-200"></div>
                            </td>
                          ))}
                          <td className="py-4">
                            <div className="ml-auto h-8 w-8 rounded-lg bg-gray-200"></div>
                          </td>
                        </tr>
                      ))
                    : rows.map((rider) => (
                        <tr key={rider.id} className="text-[#343C6A] hover:bg-gray-50/60">
                          {/* Rider Name */}
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <RiderAvatar rider={rider} />
                              <div>
                                <p className="font-semibold whitespace-nowrap">{rider.name}</p>
                                <p className="text-xs text-gray-400">{rider.code || `ID ${rider.id}`}</p>
                              </div>
                            </div>
                          </td>

                          {/* Rider Type */}
                          <td className="py-4 pr-4 font-medium whitespace-nowrap text-gray-600">
                            {rider.riderType}
                          </td>

                          {/* Fleet */}
                          <td className="py-4 pr-4 font-medium whitespace-nowrap">
                            {rider.fleet || "Independent"}
                          </td>

                          {/* Status */}
                          <td className="py-4 pr-4">
                            <StatusBadge status={rider.status} />
                          </td>

                          {/* Rating */}
                          <td className="py-4 pr-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 font-medium">
                              <Star size={15} className="fill-amber-400 text-amber-400" />
                              <span className="tabular-nums">
                                {rider.rating != null ? Number(rider.rating).toFixed(1) : "—"}
                              </span>
                            </div>
                          </td>

                          {/* Deliveries Completed */}
                          <td className="py-4 pr-4 tabular-nums font-medium">
                            {rider.deliveriesCompleted ?? 0}
                          </td>

                          {/* Date Joined */}
                          <td className="py-4 pr-4 font-medium whitespace-nowrap">
                            {formatLongDate(rider.dateJoined)}
                          </td>

                          {/* Action Dropdown (Only "View details" and "Review") */}
                          <td className="py-4 text-right">
                            <RowActionsMenu
                              label={`Actions for ${rider.name}`}
                              actions={RIDER_ROW_ACTIONS}
                              onSelect={(actionId) => handleAction(actionId, rider)}
                            />
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            {!riders.isLoading && rows.length === 0 && (
              <div className="flex flex-col items-center py-12 text-center">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <Bike size={22} />
                </span>
                <p className="text-sm font-medium text-[#343C6A]">
                  {isFiltered ? "No riders match" : "No riders yet"}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {isFiltered ? "Try a different search term or filter." : "Riders will appear here once they register."}
                </p>
                {isFiltered && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      updateParams({
                        [P.search]: "",
                        ...filtersToParams(RIDER_FILTER_GROUPS, defaultsFor(RIDER_FILTER_GROUPS)),
                      });
                    }}
                    className="mt-3 text-sm font-medium text-[#EB4827] hover:underline"
                  >
                    Clear search and filters
                  </button>
                )}
              </div>
            )}

            {rows.length > 0 && (
              <div className="mt-6">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={(next) => updateParams({ [P.page]: next }, { resetPage: false })}
                  disabled={riders.isFetching}
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default AdminRiders;
