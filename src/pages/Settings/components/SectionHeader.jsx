import React from "react";

/**
 * Title + supporting copy on the left, action buttons on the right.
 */
const SectionHeader = ({ title, description, children }) => (
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div>
      <h2 className="text-base font-semibold text-[#343C6A]">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
    </div>
    {children && <div className="flex items-center gap-3">{children}</div>}
  </div>
);

export default SectionHeader;
