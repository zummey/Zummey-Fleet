import React from 'react';

/**
 * OrderListSkeleton Component
 * Skeleton loader for Order List table
 * Shows animated placeholders while data is loading
 */
const OrderListSkeleton = () => {
  return (
    <div className="space-y-4 font-poppins animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        {/* Title */}
        <div className="h-7 bg-gray-200 rounded w-32"></div>

        {/* Filter Button */}
        <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div>
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-2 py-3 text-left">
                  <div className="h-3 bg-gray-200 rounded w-8"></div>
                </th>
                <th className="px-2 py-3 text-left">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </th>
                <th className="px-2 py-3 text-left">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </th>
                <th className="px-2 py-3 text-left">
                  <div className="h-3 bg-gray-200 rounded w-28"></div>
                </th>
                <th className="px-2 py-3 text-left">
                  <div className="h-3 bg-gray-200 rounded w-28"></div>
                </th>
                <th className="px-2 py-3 text-left">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </th>
                <th className="px-2 py-3 text-left">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </th>
                <th className="px-2 py-3 text-left">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </th>
                <th className="px-2 py-3"></th>
              </tr>
            </thead>

            {/* Table Body - 5 Skeleton Rows */}
            <tbody className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {/* Vehicle Image */}
                  <td className="px-2 py-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  </td>

                  {/* Order ID */}
                  <td className="px-2 py-4">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </td>

                  {/* Rider's Name */}
                  <td className="px-2 py-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>

                  {/* Pickup Location */}
                  <td className="px-2 py-4">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </td>

                  {/* Drop-off Location */}
                  <td className="px-2 py-4">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </td>

                  {/* Vehicle Number */}
                  <td className="px-2 py-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-2 py-4">
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  </td>

                  {/* Date & Time */}
                  <td className="px-2 py-4">
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                  </td>

                  {/* Actions Dropdown */}
                  <td className="px-2 py-4">
                    <div className="h-4 bg-gray-200 rounded w-6"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end mt-10">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderListSkeleton;