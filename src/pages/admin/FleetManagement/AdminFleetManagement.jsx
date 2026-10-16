import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminStatCard from "../Dashboard/AdminStatCard";
import AdminStatsSkeleton from "../Dashboard/AdminStatsSkeleton";
import { getTabById } from "../Dashboard/adminDashboard.config";
import StatusBadge from "../components/StatusBadge";
import RowActionsMenu from "../components/RowActionsMenu";
import Pagination from "../components/Pagination";
import ErrorBox from "../components/ErrorBox";
import {
  FLEET_OWNER_COLUMNS,
  FLEET_PAGE_SIZE,
  FLEET_ROW_ACTIONS,
  FLEET_SUMMARY_TAB_ID,
  PAGE_QUERY_PARAM,
} from "./adminFleet.config";
import { useAdminDashboardStats, useFleetOwners } from "../../../api/admin.queries";
import CompanyLogo from "../../../assets/avatar.png";

const summaryTab = getTabById(FLEET_SUMMARY_TAB_ID);

const AdminFleetManagement = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get(PAGE_QUERY_PARAM)) || 1);

  const stats = useAdminDashboardStats();
  const fleets = useFleetOwners({ page, pageSize: FLEET_PAGE_SIZE });

  const setPage = (next) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set(PAGE_QUERY_PARAM, String(next));
      return params;
    });
  };

  const handleAction = (actionId, fleet) => {
    switch (actionId) {
      case "view":
        navigate(`/fleet-management/${fleet.id}`);
        break;
      case "review":
        navigate(`/fleet-management/${fleet.id}/review`);
        break;
      case "suspend":
      case "delete":
        // TODO: wire to admin mutations once the backend endpoints exist
        break;
      default:
        break;
    }
  };

  const rows = fleets.data?.results ?? [];
  const totalPages = fleets.data?.totalPages ?? 1;

  return (
    <div className="mb-6 space-y-6 font-poppins">
      <h3 className="text-xl font-semibold text-[#343C6A]">Fleet Management</h3>

      {/* Summary cards (shared with the admin dashboard "Fleet" tab) */}
      {stats.isLoading ? (
        <AdminStatsSkeleton count={summaryTab.cards.length} gridClass="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {summaryTab.cards.map((card) => (
            <AdminStatCard key={card.key} card={card} stat={stats.data?.[FLEET_SUMMARY_TAB_ID]?.[card.key]} />
          ))}
        </div>
      )}

      {/* Fleet owners table */}
      <section className="rounded-2xl bg-white p-5 sm:p-6">
        <h4 className="mb-4 text-base font-semibold text-[#343C6A]">Fleet Owners</h4>

        {fleets.isError ? (
          <ErrorBox
            title="Error loading fleet owners"
            error={fleets.error}
            onRetry={fleets.refetch}
            isRetrying={fleets.isFetching}
          />
        ) : (
          <>
            <div className="no-scrollbar overflow-x-auto">
              <table className={`w-full min-w-[720px] text-left text-sm transition-opacity ${fleets.isPlaceholderData ? "opacity-60" : ""}`}>
                <thead>
                  <tr className="border-b border-gray-100 text-[#718EBF]">
                    {FLEET_OWNER_COLUMNS.map((col) => (
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
                  {fleets.isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          {FLEET_OWNER_COLUMNS.map((col) => (
                            <td key={col.key} className="py-4 pr-4">
                              <div className="h-4 w-24 rounded bg-gray-200"></div>
                            </td>
                          ))}
                          <td className="py-4">
                            <div className="h-8 w-8 rounded-lg bg-gray-200"></div>
                          </td>
                        </tr>
                      ))
                    : rows.map((fleet) => (
                        <tr key={fleet.id} className="text-[#343C6A] hover:bg-gray-50/60">
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-3">
                              <img src={CompanyLogo} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                              <span className="font-semibold whitespace-nowrap">{fleet.companyName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 pr-4 whitespace-nowrap">{fleet.contactPerson}</td>
                          <td className="py-3.5 pr-4 tabular-nums">{fleet.ridersCount}</td>
                          <td className="py-3.5 pr-4 tabular-nums">{fleet.vehiclesCount}</td>
                          <td className="py-3.5 pr-4">
                            <StatusBadge status={fleet.status} />
                          </td>
                          <td className="py-3.5 text-right">
                            <RowActionsMenu
                              label={`Actions for ${fleet.companyName}`}
                              actions={FLEET_ROW_ACTIONS}
                              onSelect={(actionId) => handleAction(actionId, fleet)}
                            />
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            {!fleets.isLoading && rows.length === 0 && (
              <p className="py-10 text-center text-sm text-gray-400">No fleet owners yet.</p>
            )}

            <div className="mt-6">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} disabled={fleets.isFetching} />
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default AdminFleetManagement;
