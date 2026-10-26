import React from "react";

const initials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** Photo when `src` is set, otherwise initials on the accent tint. */
const Avatar = ({ name, src, size = "h-10 w-10" }) =>
  src ? (
    <img src={src} alt="" className={`${size} shrink-0 rounded-full object-cover`} />
  ) : (
    <span
      aria-hidden="true"
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-[#FFF4E8] text-xs font-semibold text-[#EB4827]`}
    >
      {initials(name)}
    </span>
  );

export default Avatar;
