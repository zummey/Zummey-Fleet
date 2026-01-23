import React from 'react';

/**
 * OngoingOrdersSkeleton Component
 * Skeleton loader for Ongoing Orders section
 * Shows animated placeholders for order cards and map
 */
const OngoingOrdersSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
      {/* Left Side - Order Cards Skeleton */}
      <div className="flex flex-col bg-white p-4">
        {/* Header with Search */}
        <div className="mb-4 flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-100 rounded-full w-[45%]"></div>
        </div>

        {/* Order Cards - 3 Skeleton Cards */}
        <div className="flex-1 space-y-3 pr-2">
          {[1, 2, 3].map((index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              {/* Order Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-dashed border-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-300 rounded w-28"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>

              {/* Pickup Location */}
              <div className="flex gap-3 mb-6">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0"></div>
              </div>

              {/* Vertical Line */}
              <div className="flex gap-3 mb-6">
                <div className="flex-shrink-0 ml-1">
                  <div className="w-0.5 h-8 bg-gray-300"></div>
                </div>
              </div>

              {/* Destination */}
              <div className="flex gap-3 mb-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-300 rounded w-36"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
              </div>

              {/* View Details Button */}
              <div className="border-t border-dashed border-gray-300 pt-3">
                <div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Map Skeleton */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="w-full h-full bg-gray-100 flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-32 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-40 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OngoingOrdersSkeleton;