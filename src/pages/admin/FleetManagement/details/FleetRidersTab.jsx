import React from "react";
import SearchableTable from "./SearchableTable";
import StatusBadge from "../components/StatusBadge";
import { FLEET_RIDER_COLUMNS } from "../adminFleet.config";
import { useFleetRiders } from "../../../../api/admin.queries";

const initials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const FleetRidersTab = ({ fleetId }) => {
  const riders = useFleetRiders(fleetId);

  return (
    <SearchableTable
      title="Fleet Riders"
      columns={FLEET_RIDER_COLUMNS}
      query={riders}
      searchKeys={["name", "id", "phone", "assignedVehicle"]}
      getRowKey={(r) => r.id}
      emptyText="This fleet has no riders yet."
      renderRow={(rider) => [
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF4E8] text-xs font-semibold text-[#EB4827]">
            {initials(rider.name)}
          </span>
          <div>
            <p className="font-semibold">{rider.name}</p>
            <p className="text-xs text-gray-400">ID: {rider.id}</p>
          </div>
        </div>,
        <span className="font-medium tabular-nums">{rider.phone}</span>,
        <span className="font-medium">{rider.assignedVehicle ?? "—"}</span>,
        <StatusBadge status={rider.status} />,
      ]}
    />
  );
};

export default FleetRidersTab;
