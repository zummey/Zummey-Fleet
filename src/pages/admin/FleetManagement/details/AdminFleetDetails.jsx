import React from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import FleetProfileCard from "./FleetProfileCard";
import DetailTabs from "./DetailTabs";
import CacDetailsTab from "./CacDetailsTab";
import FleetRidersTab from "./FleetRidersTab";
import FleetVehiclesTab from "./FleetVehiclesTab";
import PerformanceMetricsTab from "./PerformanceMetricsTab";
import ErrorBox from "../components/ErrorBox";
import ProfileSkeleton from "./ProfileSkeleton";
import { DETAIL_TAB_QUERY_PARAM, FLEET_DETAIL_TABS, getDetailTabById } from "../adminFleet.config";
import { useFleetDetails } from "../../../../api/admin.queries";

const AdminFleetDetails = () => {
  const { fleetId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = getDetailTabById(searchParams.get(DETAIL_TAB_QUERY_PARAM));

  const fleet = useFleetDetails(fleetId);

  const handleTabChange = (id) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(DETAIL_TAB_QUERY_PARAM, id);
        return next;
      },
      { replace: true }
    );
  };

  const handleToggleSuspend = () => {
    // TODO: call suspend/reactivate mutation once the backend endpoint exists,
    // then invalidate ["admin", "fleets"] so the list and this page refresh.
  };

  const renderTab = () => {
    switch (activeTab.id) {
      case "riders":
        return <FleetRidersTab fleetId={fleetId} />;
      case "vehicles":
        return <FleetVehiclesTab fleetId={fleetId} />;
      case "performance":
        return <PerformanceMetricsTab fleetId={fleetId} />;
      default:
        return <CacDetailsTab cac={fleet.data?.cac} />;
    }
  };

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
          <FleetProfileCard fleet={fleet.data} onToggleSuspend={handleToggleSuspend} />

          <DetailTabs tabs={FLEET_DETAIL_TABS} activeTab={activeTab.id} onChange={handleTabChange} />

          <section
            key={activeTab.id}
            id={`fleet-panel-${activeTab.id}`}
            role="tabpanel"
            aria-labelledby={`fleet-tab-${activeTab.id}`}
            className={`rounded-2xl p-5 motion-safe:animate-fade-in-up sm:p-6 ${
              activeTab.id === "riders" || activeTab.id === "vehicles" ? "bg-gray-100/70" : "bg-white"
            }`}
          >
            {renderTab()}
          </section>
        </>
      )}
    </div>
  );
};

export default AdminFleetDetails;
