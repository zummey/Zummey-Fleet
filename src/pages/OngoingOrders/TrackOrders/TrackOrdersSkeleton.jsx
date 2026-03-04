import React from "react";

/**
 * Loading skeleton for Track Orders page
 * Shows placeholder for header, order list, and map
 */
const TrackOrdersSkeleton = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-80 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
        {/* Left Side - Order List Skeleton */}
        <div className="bg-white border-r border-gray-200 p-6 space-y-4 overflow-y-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>

              {/* Pickup */}
              <div className="flex gap-3 mb-6">
                <div className="w-3 h-3 bg-gray-300 rounded-full mt-1"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
              </div>

              {/* Destination */}
              <div className="flex gap-3">
                <div className="w-3 h-3 bg-gray-300 rounded-full mt-1"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side - Map Skeleton */}
        <div className="bg-gray-100 relative flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrdersSkeleton;