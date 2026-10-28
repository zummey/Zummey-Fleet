import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Bell } from "lucide-react";
import DetailTabs from "../components/DetailTabs";
import ErrorBox from "../components/ErrorBox";
import NotificationCard from "./components/NotificationCard";
import {
  NOTIFICATION_TABS,
  INITIAL_ADMIN_NOTIFICATIONS,
} from "./adminNotifications.config";
import {
  getNotifications,
  markNotificationAsRead,
} from "../../../api/notifications.service";

const TAB_QUERY_PARAM = "tab";

const AdminNotifications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTabId =
    searchParams.get(TAB_QUERY_PARAM) || NOTIFICATION_TABS[0].id;

  // Notification state per tab initialized with seed data
  const [notificationsByTab, setNotificationsByTab] = useState(
    INITIAL_ADMIN_NOTIFICATIONS
  );
  const [error, setError] = useState(null);

  // Sync with backend API notifications
  useEffect(() => {
    let isMounted = true;
    const fetchLiveNotifications = async () => {
      try {
        const data = await getNotifications();
        if (!isMounted) return;

        const liveList = Array.isArray(data)
          ? data
          : data?.results || data?.data || [];

        if (liveList.length > 0) {
          setNotificationsByTab((prev) => {
            const updated = { ...prev };
            liveList.forEach((item) => {
              const cat = (item.category || "").toUpperCase();
              let targetTabId = "order-notifications";
              if (cat.includes("APPROV")) targetTabId = "approvals";
              else if (cat.includes("INCIDENT") || cat.includes("DISPUTE"))
                targetTabId = "incidents";
              else if (cat.includes("SYSTEM")) targetTabId = "system-alerts";
              else if (cat.includes("GEO")) targetTabId = "geofence-alert";
              else if (cat.includes("TRANS") || cat.includes("PAY") || cat.includes("WALLET"))
                targetTabId = "transactions";
              else if (cat.includes("BROADCAST")) targetTabId = "broadcasts";

              const currentItems = updated[targetTabId] || [];
              const exists = currentItems.some((n) => n.id === item.id);
              if (!exists) {
                const formatted = {
                  id: item.id,
                  title: item.title || "New Notification",
                  time: item.created_at
                    ? new Date(item.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "JUST NOW",
                  timestamp: item.created_at
                    ? new Date(item.created_at).getTime()
                    : Date.now(),
                  is_read: Boolean(item.is_read),
                  message: item.message || "",
                  category: item.category || "GENERAL",
                };
                updated[targetTabId] = [formatted, ...currentItems];
              }
            });
            return updated;
          });
        }
        setError(null);
      } catch (err) {
        // Fallback gracefully to seed data if endpoint returns error
        if (isMounted) {
          console.warn("Could not load backend notifications:", err);
        }
      }
    };

    fetchLiveNotifications();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute unread counts for each tab
  const tabCounts = useMemo(() => {
    const counts = {};
    NOTIFICATION_TABS.forEach((tab) => {
      const items = notificationsByTab[tab.id] || [];
      counts[tab.id] = items.filter((item) => !item.is_read).length;
    });
    return counts;
  }, [notificationsByTab]);

  // Tab definitions with dynamic badge
  const tabsWithBadges = useMemo(() => {
    return NOTIFICATION_TABS.map((tab) => {
      const unreadCount = tabCounts[tab.id] || 0;
      return {
        ...tab,
        badge: unreadCount > 0 ? unreadCount : null,
      };
    });
  }, [tabCounts]);

  const activeTab =
    NOTIFICATION_TABS.find((t) => t.id === currentTabId) || NOTIFICATION_TABS[0];

  const currentNotifications = notificationsByTab[activeTab.id] || [];

  const handleTabChange = (tabId) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set(TAB_QUERY_PARAM, tabId);
      return next;
    });
  };

  const handleToggleRead = async (notificationId) => {
    const targetItem = currentNotifications.find(
      (item) => item.id === notificationId
    );
    if (!targetItem) return;

    const nextReadState = !targetItem.is_read;

    // Optimistically update local state
    setNotificationsByTab((prev) => ({
      ...prev,
      [activeTab.id]: (prev[activeTab.id] || []).map((item) =>
        item.id === notificationId
          ? { ...item, is_read: nextReadState }
          : item
      ),
    }));

    if (nextReadState && typeof notificationId === "number") {
      try {
        await markNotificationAsRead(notificationId);
      } catch (err) {
        console.warn("Failed to mark as read on server:", err);
      }
    }
  };

  return (
    <div className="space-y-6 motion-safe:animate-fade-in pb-12">
      {/* Page Title matching screens 1 - 7 */}
      <div>
        <h1 className="text-xl md:text-[22px] font-bold text-[#343C6A] tracking-tight">
          Notifications
        </h1>
      </div>

      {/* Tabs navigation with bottom divider bar */}
      <div className="border-b border-[#EAECF0]">
        <DetailTabs
          tabs={tabsWithBadges}
          activeTab={activeTab.id}
          onChange={handleTabChange}
          label="Admin notification categories"
          idPrefix="admin-notifications"
          showBadgeOnlyActive={true}
          activeTabClassName="font-semibold text-[#1E2E48]"
          inactiveTabClassName="font-medium text-[#232323] hover:text-[#EB4827]"
          containerClassName="no-scrollbar flex gap-7 md:gap-9 overflow-x-auto"
        />
      </div>

      {error && (
        <ErrorBox
          message={error.message || "Failed to load latest notifications"}
          onRetry={() => window.location.reload()}
        />
      )}

      {/* Notifications Card List */}
      <div
        id={`admin-notifications-panel-${activeTab.id}`}
        role="tabpanel"
        aria-labelledby={`admin-notifications-tab-${activeTab.id}`}
        className="space-y-3.5"
      >
        {currentNotifications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Bell size={22} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-[#1E2E48]">
              No notifications
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              There are currently no notifications in the {activeTab.label} tab.
            </p>
          </div>
        ) : (
          currentNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onToggleRead={handleToggleRead}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
