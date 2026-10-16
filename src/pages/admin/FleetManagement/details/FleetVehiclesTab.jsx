import React from "react";
import SearchableTable from "./SearchableTable";
import StatusBadge from "../../components/StatusBadge";
import { FLEET_VEHICLE_COLUMNS } from "../adminFleet.config";
import { useFleetVehicles } from "../../../../api/admin.queries";
import VehicleThumb from "../../../../assets/avatar.png";

const FleetVehiclesTab = ({ fleetId }) => {
  const vehicles = useFleetVehicles(fleetId);

  return (
    <SearchableTable
      title="Fleet Vehicles"
      columns={FLEET_VEHICLE_COLUMNS}
      query={vehicles}
      searchKeys={["id", "name", "manufacturer", "licenseNo", "gpsTrackerSn"]}
      getRowKey={(v) => v.id}
      emptyText="This fleet has no vehicles yet."
      minWidth="min-w-[760px]"
      renderRow={(vehicle) => [
        <div className="flex items-center gap-3">
          <img src={VehicleThumb} alt="" className="h-6 w-6 rounded-full object-cover" />
          <span>{vehicle.id}</span>
        </div>,
        vehicle.name,
        vehicle.manufacturer,
        vehicle.licenseNo,
        vehicle.gpsTrackerSn,
        <StatusBadge status={vehicle.status} />,
      ]}
    />
  );
};

export default FleetVehiclesTab;
