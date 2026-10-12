import React from "react";

/**
 * Skeleton for a tab's stat cards. `count` matches the active tab's card count
 * so the layout doesn't jump when data arrives.
 */
const AdminStatsSkeleton = ({ count = 3, gridClass }) => {
  return (
    <div className={`grid gap-5 animate-pulse ${gridClass}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="flex items-start justify-between">
            <div className="mt-2 h-4 w-24 rounded bg-gray-200"></div>
            <div className="h-11 w-11 rounded-lg bg-gray-200"></div>
          </div>
          <div className="mt-5 h-8 w-28 rounded bg-gray-300"></div>
          <div className="mt-6 h-3 w-32 rounded bg-gray-200"></div>
        </div>
      ))}
    </div>
  );
};

export default AdminStatsSkeleton;
