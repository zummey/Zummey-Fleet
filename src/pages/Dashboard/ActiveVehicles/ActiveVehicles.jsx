import React from "react";
import { useAllVehicles } from "../../../api/dashboard.queries";
import Vehicle from "../../../assets/vehicle.png";
import ActiveVehiclesSkeleton from "./ActiveVehiclesSkeleton";

/**
 * Get status badge styling based on status value
 * @param {string} status - Vehicle status (online, offline, maintenance, etc.)
 * @returns {object} - Tailwind classes for background and text color
 */
const getStatusStyle = (status) => {
  const statusLower = status?.toLowerCase() || '';
  
  switch (statusLower) {
    case 'online':
    case 'active':
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
      };
    case 'offline':
    case 'inactive':
      return {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
      };
    case 'maintenance':
    case 'under_maintenance':
      return {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
      };
    case 'unavailable':
    case 'disabled':
      return {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
      };
    default:
      return {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
      };
  }
};

const ActiveVehicles = () => {
  // Fetch all vehicles from backend
  const { data, isLoading, isError, error } = useAllVehicles();

  // Loading state
  if (isLoading) {
    return <ActiveVehiclesSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error loading vehicles</h3>
        <p className="text-red-600 text-sm">{error?.response?.data?.responseMessage || error?.message || 'Something went wrong'}</p>
      </div>
    );
  }

  // Extract vehicles from backend response
  const allVehicles = data?.responseDetails?.results || [];
  
  // Filter only ONLINE vehicles (active vehicles)
  const activeVehicles = allVehicles.filter(vehicle => 
    vehicle.status?.toLowerCase() === 'online'
  );

  console.log('✅ All Vehicles:', allVehicles);
  console.log('✅ Active Vehicles (online only):', activeVehicles);

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <h3 className="text-[0.9rem] font-medium text-gray-900">
          Active Vehicles
        </h3>
        <button className="text-[0.8rem] font-medium text-gray-900 hover:text-purple-600 transition-colors">
          View All
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Bike ID
              </th>
              <th className="px-4 py-5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Bike Name
              </th>
              <th className="px-4 py-5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Manufacturer
              </th>
              <th className="px-4 py-5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                License No.
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                GPS Tracker SN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Assigned Rider
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {activeVehicles.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  No active vehicles found
                </td>
              </tr>
            ) : (
              activeVehicles.map((vehicle) => {
                // Get dynamic status styling
                const statusStyle = getStatusStyle(vehicle.status);
                
                return (
                  <tr
                    key={vehicle.id}
                    className="hover:bg-gray-100 transition-colors shadow-sm rounded-b-lg"
                  >
                    {/* Bike Image */}
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center">
                        <img src={Vehicle} alt="Bike" className="w-full h-full object-cover" />
                      </div>
                    </td>

                    {/* Bike ID - Maps from backend "identifier" */}
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {vehicle.identifier}
                      </span>
                    </td>

                    {/* Bike Name - Maps from backend "vehicle_type" */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {vehicle.vehicle_type || 'N/A'}
                    </td>

                    {/* Manufacturer - Maps from backend "vehicle_make" */}
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {vehicle.vehicle_make}
                    </td>

                    {/* License No - Maps from backend "vehicle_licence_serial" */}
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {vehicle.vehicle_licence_serial}
                    </td>

                    {/* GPS Tracker SN - Maps from backend "gps_tracker_serial" */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {vehicle.gps_tracker_serial}
                    </td>

                    {/* Status - DYNAMIC! */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${statusStyle.bgColor} ${statusStyle.textColor}`}
                      >
                        {vehicle.status}
                      </span>
                    </td>

                    {/* Assigned Rider - Maps from backend "assigned_rider_name" */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {vehicle.assigned_rider_name || 'Unassigned'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActiveVehicles;