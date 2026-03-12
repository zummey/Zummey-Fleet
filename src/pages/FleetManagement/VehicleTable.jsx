import VehicleRow from "./VehicleRow";

const VehicleTable = ({ vehicles = [], loading, onAssign, onEdit, onDelete }) => {
  if (loading) return <p>Loading vehicles...</p>;

  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    return <p className="text-gray-500">No vehicles found</p>;
  }

  return (
    <div className="rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-max w-full text-md border-separate [border-spacing:0_10px]">
        <thead className="bg-gray-50">
          <tr className="text-left">
            <th className="w-12" />
            <th className="p-4 font-normal">Bike ID</th>
            <th className="p-4 font-normal">Bike Type</th>
            <th className="p-4 font-normal">Bike Name</th>
            <th className="p-4 font-normal">Manufacturer</th>
            <th className="p-4 font-normal">License No.</th>
            <th className="p-4 font-normal">GPS Tracker SN</th>
            <th className="p-4 font-normal">Status</th>
            <th className="p-4 font-normal">Assigned Rider</th>
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
