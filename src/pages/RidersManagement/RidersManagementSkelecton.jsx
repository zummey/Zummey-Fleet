import React from 'react';

/**
 * RidersManagementSkeleton Component
 * Skeleton loader for Riders Management table
 * Shows animated placeholders while data is loading
 */
const RidersManagementSkeleton = () => {
  return (
    <div className="space-y-6 font-poppins animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        {/* Title */}
        <div className="h-7 bg-gray-200 rounded w-48"></div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            {/* Table Body - 5 Skeleton Rows */}
            <tbody className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {/* Avatar */}
                  <td className="px-2 py-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  </td>

                  {/* Name + ID */}
                  <td className="px-2 py-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-2 py-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-28"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-2 py-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-40"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-2 py-4">
                    <div className="h-7 bg-gray-200 rounded-full w-20"></div>
                  </td>

                  {/* Action Button */}
                  <td className="px-2 py-4">
                    <div className="h-10 bg-gray-200 rounded-3xl w-28"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default RidersManagementSkeleton;