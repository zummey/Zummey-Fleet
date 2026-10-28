import React, { useState } from "react";

const toInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

/**
 * Circular avatar. Falls back to the user's initials when there is no photo —
 * the circle keeps the same size either way and the initials scale with it.
 */
const ProfileAvatar = ({ name, src, size = 112, className = "" }) => {
  const [imgError, setImgError] = useState(false);
  const hasPhoto = Boolean(src) && !imgError;

  return (
    <div
      className={`overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      {hasPhoto ? (
        <img
          src={src}
          alt={name || "Profile"}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center bg-[#FFF4E8] font-semibold text-[#EB4827] select-none"
          style={{ fontSize: Math.round(size * 0.36) }}
        >
          {toInitials(name) || "?"}
        </span>
      )}
    </div>
  );
};

export default ProfileAvatar;
