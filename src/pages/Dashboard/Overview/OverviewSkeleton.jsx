import React from 'react';

/**
 * OverviewSkeleton Component
 * Skeleton loader for Dashboard Overview section
 * Shows animated placeholders for stat cards
 */
const OverviewSkeleton = () => {
  return (
    <div className="space-y-6 font-poppins animate-pulse">
      {/* Page Title Skeleton */}
      <div>
        <div className="h-8 bg-gray-200 rounded-lg w-32"></div>
      </div>

      {/* Stats Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Label skeleton */}
              <div className="h-4 bg-gray-200 rounded w-28 mb-3"></div>
              {/* Value skeleton */}
              <div className="h-9 bg-gray-300 rounded w-16"></div>
            </div>
            {/* Icon skeleton */}
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-28 mb-3"></div>
              <div className="h-9 bg-gray-300 rounded w-16"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-28 mb-3"></div>
              <div className="h-9 bg-gray-300 rounded w-16"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewSkeleton;