import React from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, X } from "lucide-react";
import DispatchStatCard from "./overview/DispatchStatCard";
import UnassignedOrders from "./overview/UnassignedOrders";
import AvailableRidersCard from "./overview/AvailableRidersCard";
import FleetAvailabilityCard from "./overview/FleetAvailabilityCard";
import AdminStatsSkeleton from "../Dashboard/AdminStatsSkeleton";
import ErrorBox from "../components/ErrorBox";
import { DISPATCH_CARDS } from "./dispatch.config";
import { useDispatchOverview } from "../../../api/admin.queries";

const GRID = "grid-cols-1 sm:grid-cols-3";

const AdminDispatch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const overview = useDispatchOverview();

  // Set by AssignOrder after a successful assignment
  const assigned = location.state?.assigned;
  const dismissBanner = () => navigate({ search: location.search }, { replace: true, state: null });

  const setPage = (next) =>
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (next > 1) params.set("page", String(next));
        else params.delete("page");
        return params;
      },
      { state: location.state }
    );

  return (
    <div className="space-y-6 p-4 font-poppins sm:p-6">
      <h1 className="text-xl font-semibold text-[#343C6A]">Dispatch Management</h1>

      {assigned && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p className="flex-1">
            <span className="font-medium">{assigned.orderId}</span> was assigned to{" "}
            <span className="font-medium">{assigned.name}</span>.
          </p>
          <button
            type="button"
            onClick={dismissBanner}
            aria-label="Dismiss"
            className="rounded p-0.5 hover:bg-green-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {overview.isLoading ? (
        <AdminStatsSkeleton count={DISPATCH_CARDS.length} gridClass={GRID} />
      ) : overview.isError ? (
        <ErrorBox
          title="Error loading dispatch summary"
          error={overview.error}
          onRetry={overview.refetch}
          isRetrying={overview.isFetching}
        />
      ) : (
        <div className={`grid gap-5 ${GRID}`}>
          {DISPATCH_CARDS.map((card) => (
            <DispatchStatCard key={card.key} card={card} stat={overview.data?.[card.key]} />
          ))}
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <UnassignedOrders page={page} onPageChange={setPage} />
        <aside className="space-y-5 lg:mt-10" aria-label="Rider and fleet availability">
          <AvailableRidersCard />
          <FleetAvailabilityCard />
        </aside>
      </div>
    </div>
  );
};

export default AdminDispatch;
