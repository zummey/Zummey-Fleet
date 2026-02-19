import VehicleRow from "./VehicleRow";

const VehicleTable = ({ vehicles = [], loading, onAssign, onEdit, onDelete }) => {
  if (loading) return <p>Loading vehicles...</p>;

  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    return <p className="text-gray-500">No vehicles found</p>;
  }

  return (
    <div className="rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-max w-full text-sm border-separate [border-spacing:0_10px]">
        <thead className="bg-gray-50">
          <tr className="text-left">
            <th className="w-12" />
            <th className="p-4">Bike ID</th>
            <th className="p-4">Bike Type</th>
            <th className="p-4">Bike Name</th>
            <th className="p-4">Manufacturer</th>
            <th className="p-4">License No.</th>
            <th className="p-4">GPS Tracker SN</th>
            <th className="p-4">Status</th>
            <th className="p-4">Assigned Rider</th>
            <th className="w-12" />
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <VehicleRow
              key={vehicle.id || vehicle.bike_id}
              vehicle={vehicle}
              onAssign={onAssign}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
};
export default VehicleTable;
