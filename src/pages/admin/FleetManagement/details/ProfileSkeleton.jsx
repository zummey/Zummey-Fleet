import React from "react";

const ProfileSkeleton = () => (
  <div className="animate-pulse rounded-2xl bg-white p-6">
    <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
      <div className="h-14 w-14 rounded-full bg-gray-200"></div>
      <div className="space-y-2">
        <div className="h-5 w-40 rounded bg-gray-300"></div>
        <div className="h-3 w-24 rounded bg-gray-200"></div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-5 pt-5 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-16 rounded bg-gray-200"></div>
          <div className="h-4 w-28 rounded bg-gray-300"></div>
        </div>
      ))}
    </div>
  </div>
);

export default ProfileSkeleton;
