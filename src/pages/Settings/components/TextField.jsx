import React from "react";

const TextField = ({
  label,
  value,
  onChange,
  readOnly = false,
  placeholder,
  type = "text",
}) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-[#343C6A]">{label}</label>
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      readOnly={readOnly}
      placeholder={placeholder}
      className={`w-full rounded-lg bg-[#F7F7F8] px-4 py-2.5 text-sm placeholder-[#979797] focus:outline-none ${
        readOnly
          ? "cursor-default text-gray-500"
          : "text-gray-900 focus:ring-2 focus:ring-[#FFF4E8]"
      }`}
    />
  </div>
);

export default TextField;
