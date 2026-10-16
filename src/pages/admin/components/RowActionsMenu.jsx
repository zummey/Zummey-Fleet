import React, { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

/**
 * RowActionsMenu
 * "•••" button with a dropdown. The menu uses fixed positioning so it isn't
 * clipped by the table's horizontal-scroll container.
 */
const RowActionsMenu = ({ actions, onSelect, label = "Row actions" }) => {
  const [position, setPosition] = useState(null); // null = closed
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const close = () => setPosition(null);

  const toggle = () => {
    if (position) return close();
    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
  };

  useEffect(() => {
    if (!position) return;

    const handlePointerDown = (e) => {
      if (!menuRef.current?.contains(e.target) && !buttonRef.current?.contains(e.target)) close();
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        close();
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    // Fixed menus drift on scroll/resize, so just close them
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [position]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={!!position}
        onClick={toggle}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
          position ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-[#718EBF] hover:bg-blue-50 hover:text-blue-600"
        }`}
      >
        <MoreHorizontal size={18} />
      </button>

      {position && (
        <div
          ref={menuRef}
          role="menu"
          style={{ top: position.top, right: position.right }}
          className="fixed z-50 min-w-[160px] rounded-xl border border-gray-100 bg-white py-1.5 shadow-lg motion-safe:animate-fade-in-up"
        >
          {actions.map(({ id, label: actionLabel, icon: Icon, danger }) => (
            <button
              key={id}
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                onSelect(id);
              }}
              className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors ${
                danger ? "text-red-500 hover:bg-red-50" : "text-[#343C6A] hover:bg-gray-50"
              }`}
            >
              {Icon && <Icon size={15} className={danger ? "text-red-400" : "text-gray-400"} />}
              {actionLabel}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default RowActionsMenu;
