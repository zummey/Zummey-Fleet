import React, { useEffect, useRef, useState } from "react";
import { EXPORT_FORMATS } from "./exporters";

/**
 * Small "Export" text button with a CSV / Excel / PDF menu (chart cards).
 * onExport(format) may return a promise; the button shows progress and any error.
 */
const ExportMenu = ({ onExport, label = "Export", disabled = false }) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | working | error
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const run = async (format) => {
    setOpen(false);
    setStatus("working");
    try {
      await onExport(format);
      setStatus("idle");
    } catch (error) {
      console.error("❌ Export failed:", error);
      setStatus("error");
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled || status === "working"}
        onClick={() => setOpen((v) => !v)}
        className={`rounded px-1 text-xs font-medium hover:underline focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50 ${
          status === "error" ? "text-red-500" : "text-blue-600"
        }`}
      >
        {status === "working" ? "Exporting..." : status === "error" ? "Export failed, retry" : label}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-20 mt-1.5 min-w-[120px] rounded-xl border border-gray-100 bg-white py-1.5 shadow-lg motion-safe:animate-fade-in-up"
        >
          {EXPORT_FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="menuitem"
              onClick={() => run(f.id)}
              className="block w-full px-4 py-2 text-left text-sm text-[#343C6A] hover:bg-gray-50"
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExportMenu;
