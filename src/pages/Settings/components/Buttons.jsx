import React from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#FFF4E8] focus-visible:outline-none disabled:cursor-not-allowed";

export const PrimaryButton = ({ type = "button", className = "", ...props }) => (
  <button
    type={type}
    className={`${base} bg-[#001940] text-white hover:bg-[#012c6e] disabled:bg-[#A3A3A3] disabled:hover:bg-[#A3A3A3] ${className}`}
    {...props}
  />
);

export const OutlineButton = ({ type = "button", className = "", ...props }) => (
  <button
    type={type}
    className={`${base} border border-[#001940] bg-white text-[#001940] hover:bg-gray-50 disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-white ${className}`}
    {...props}
  />
);
