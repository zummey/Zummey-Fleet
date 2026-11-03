import React from "react";

/** Centered icon + message for empty tables. `action` is { label, onClick }. */
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center py-12 text-center">
    {Icon && (
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Icon size={22} />
      </span>
    )}
    <p className="text-sm font-medium text-[#343C6A]">{title}</p>
    {description && <p className="mt-1 text-xs text-gray-400">{description}</p>}
    {action && (
      <button
        type="button"
        onClick={action.onClick}
        className="mt-3 text-sm font-medium text-[#EB4827] hover:underline"
      >
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;
