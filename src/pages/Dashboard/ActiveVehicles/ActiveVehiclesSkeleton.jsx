import React from 'react';

/**
 * ActiveVehiclesSkeleton Component
 * Skeleton loader for Active Vehicles table
 * Shows animated placeholders for table rows
 */
const ActiveVehiclesSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="h-5 bg-gray-200 rounded w-32"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left">
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </th>
              <th className="px-4 py-5 text-left">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </th>
              <th className="px-4 py-5 text-left">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </th>
              <th className="px-4 py-5 text-left">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </th>
              <th className="px-2 py-3 text-left">
                <div className="h-3 bg-gray-200 rounded w-28"></div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-3 bg-gray-200 rounded w-28"></div>
              </th>
            </tr>
          </thead>

          {/* Table Body - 3 Skeleton Rows */}
          <tbody className="bg-white">
            {[1, 2, 3].map((index) => (
              <tr key={index} className="border-b border-gray-100">
                {/* Bike Image */}
                <td className="px-6 py-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                </td>

                {/* Bike ID */}
                <td className="px-4 py-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </td>

                {/* Bike Name */}
                <td className="px-4 py-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </td>

                {/* Manufacturer */}
                <td className="px-4 py-2">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </td>

                {/* License No */}
                <td className="px-4 py-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </td>

                {/* GPS Tracker SN */}
                <td className="px-2 py-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </td>

                {/* Status Badge */}
                <td className="px-4 py-4">
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                </td>

                {/* Assigned Rider */}
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActiveVehiclesSkeleton;