import React from "react";
import DeliveryTruckIcon from "./DeliveryTruckIcon";

/**
 * Individual Notification Card matching Screens 1 - 7.
 * Shows left unread navy border bar, truck avatar, title, timestamp, bullet message, and Read/Unread status.
 */
const NotificationCard = ({ notification, onToggleRead }) => {
  const isUnread = !notification.is_read;

  return (
    <article
      className="relative rounded-md bg-white border border-gray-200/90 overflow-hidden p-5 md:px-6 md:py-5.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all duration-150"
    >
      {/* Left indicator bar for unread cards matching screens 1 - 7 */}
      {isUnread && (
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 bottom-0 w-[3.5px] bg-[#001940]"
        />
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Left Section: Avatar + Content */}
        <div className="flex items-start gap-4 md:gap-5 min-w-0 flex-1">
          {/* Circular Truck Avatar */}
          <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#EBF0F5] flex items-center justify-center shrink-0">
            <DeliveryTruckIcon className="w-6 h-6 md:w-7 md:h-7" />
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <h3 className="text-base md:text-[17px] font-bold text-[#343C6A] tracking-tight">
              {notification.title}
            </h3>
            <p className="mt-0.5 text-[11px] md:text-xs font-semibold uppercase tracking-wider text-gray-400">
              {notification.time}
            </p>

            {notification.message && (
              <p className="mt-3 text-sm text-[#334155] leading-relaxed flex items-start gap-2">
                <span className="text-gray-900 select-none font-bold text-xs mt-[3px]">•</span>
                <span>{notification.message}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right Section: Read / Unread Status */}
        <div className="shrink-0 text-right pt-0.5">
          <button
            type="button"
            onClick={() => onToggleRead && onToggleRead(notification.id)}
            title={isUnread ? "Click to mark as read" : "Click to mark as unread"}
            className=" text-sm font-medium text-[#EB4827] hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 rounded px-1 transition-opacity cursor-pointer select-none"
          >
            {isUnread ? "Unread" : "Read"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default NotificationCard;
