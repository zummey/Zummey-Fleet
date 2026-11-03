import React from "react";

const initials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

// Soft tints for `colorful` avatars; a name always maps to the same tint
const TINTS = [
  "bg-blue-50 text-blue-600",
  "bg-pink-50 text-pink-600",
  "bg-green-50 text-green-600",
  "bg-orange-50 text-orange-600",
  "bg-violet-50 text-violet-600",
  "bg-teal-50 text-teal-600",
];

const tintFor = (name = "") => TINTS[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TINTS.length];

/**
 * Photo when `src` is set, otherwise initials.
 * Initials use the accent tint, or a per-name tint when `colorful` is set (e.g. dispatch rider lists).
 */
const Avatar = ({ name, src, size = "h-10 w-10", colorful = false }) =>
  src ? (
    <img src={src} alt="" className={`${size} shrink-0 rounded-full object-cover`} />
  ) : (
    <span
      aria-hidden="true"
      className={`${size} flex shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
        colorful ? tintFor(name) : "bg-[#FFF4E8] text-[#EB4827]"
      }`}
    >
      {initials(name)}
    </span>
  );

export default Avatar;
