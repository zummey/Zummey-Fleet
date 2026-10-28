import React from "react";

/**
 * Pixel-accurate Delivery Truck Icon matching Screens 1 - 7.
 * Renders an illustrated delivery truck with orange cabin, yellow container box,
 * cyan window, and detailed wheels.
 */
const DeliveryTruckIcon = ({ className = "w-6 h-6", ...props }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Container / Cargo Box (Rear - Yellow/Amber) */}
      <rect
        x="13"
        y="9"
        width="15"
        height="12"
        rx="1"
        fill="#F6B83D"
      />
      {/* Box panel lines */}
      <path
        d="M20 9.5V20.5"
        stroke="#E09F24"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <rect
        x="14"
        y="11"
        width="4.5"
        height="8"
        rx="0.5"
        fill="#F9C75D"
        opacity="0.6"
      />

      {/* Front Cabin (Orange) */}
      <path
        d="M13 11H8.5C7.6 11 6.8 11.5 6.4 12.3L4.4 16.2C4.1 16.7 4 17.3 4 17.9V21H13V11Z"
        fill="#F25C3B"
      />

      {/* Cabin Window (Soft Blue) */}
      <path
        d="M11.5 12.5H8.7C8.2 12.5 7.8 12.8 7.5 13.3L6.3 15.7C6.1 16 6.3 16.5 6.7 16.5H11.5V12.5Z"
        fill="#93C5FD"
      />

      {/* Front Headlight */}
      <rect
        x="3.6"
        y="18.5"
        width="1.2"
        height="2"
        rx="0.6"
        fill="#FEF08A"
      />

      {/* Rear Taillight */}
      <rect
        x="27.4"
        y="18.5"
        width="1"
        height="2"
        rx="0.5"
        fill="#EF4444"
      />

      {/* Chassis / Undercarriage */}
      <rect
        x="5"
        y="21"
        width="22"
        height="1.5"
        fill="#334155"
      />

      {/* Front Wheel */}
      <circle cx="9" cy="22.5" r="3" fill="#1E293B" />
      <circle cx="9" cy="22.5" r="1.3" fill="#E2E8F0" />
      <circle cx="9" cy="22.5" r="0.6" fill="#0F172A" />

      {/* Rear Wheel */}
      <circle cx="23" cy="22.5" r="3" fill="#1E293B" />
      <circle cx="23" cy="22.5" r="1.3" fill="#E2E8F0" />
      <circle cx="23" cy="22.5" r="0.6" fill="#0F172A" />
    </svg>
  );
};

export default DeliveryTruckIcon;
