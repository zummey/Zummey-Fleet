import React, { useEffect } from "react";

/**
 * Overlay + centred card used by every admin dialog.
 * Escape and backdrop clicks call onClose unless `canClose` is false (e.g. while saving).
 */
const Modal = ({
  onClose,
  canClose = true,
  role = "dialog",
  labelledBy,
  describedBy,
  className = "max-w-sm",
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && canClose) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [canClose, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && canClose && onClose()}
    >
      <div
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        className={`max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-2xl bg-white p-6 font-poppins shadow-xl motion-safe:animate-fade-in-up ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
