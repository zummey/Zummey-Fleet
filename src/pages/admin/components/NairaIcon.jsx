import React from "react";

/** "₦" drawn like a lucide icon (lucide has no naira sign). Accepts the same `size` / `className`. */
const NairaIcon = ({ className = "", size = 20 }) => (
  <span aria-hidden="true" className={`font-bold leading-none ${className}`} style={{ fontSize: size }}>
    ₦
  </span>
);

export default NairaIcon;
