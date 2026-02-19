import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Bell, Check, CheckCheck, Truck } from "lucide-react";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../api/notifications.service";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [markingAll, setMarkingAll] = useState(false);
  const [markingOne, setMarkingOne] = useState({});

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      const list = Array.isArray(data)
        ? data
        : data?.results || data?.data || [];
      setNotifications(list);
      setError(null);
    } catch (err) {
      setError(err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "unread") {
      return notifications.filter((item) => !item.is_read);
    }
    if (activeFilter === "read") {
      return notifications.filter((item) => item.is_read);
    }
    return notifications;
  }, [activeFilter, notifications]);

  const formatTimestamp = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  const handleMarkOne = async (id) => {
    if (!id && id !== 0) return;
    const current = notifications.find((item) => item.id === id);
    if (!current || current.is_read) return;

    setMarkingOne((prev) => ({ ...prev, [id]: true }));
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)),
    );

    try {
      await markNotificationAsRead(id);
    } catch (err) {
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_read: false } : item,
        ),
      );
      setError(err);
    } finally {
      setMarkingOne((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleMarkAll = async () => {
    if (unreadCount === 0) return;
    const prev = notifications;
    setMarkingAll(true);
    setNotifications((curr) =>
      curr.map((item) => ({ ...item, is_read: true })),
    );

    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      setNotifications(prev);
      setError(err);
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#001940]">Notifications</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track alerts and updates across your fleet activity.
            </p>
          </div>
          <button
            onClick={handleMarkAll}
            disabled={markingAll || unreadCount === 0}
            className="px-4 py-2 rounded-lg bg-[#001940] text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCheck size={16} />
            {markingAll ? "Marking..." : "Mark all as read"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          <div className="rounded-xl border border-gray-200 p-4 bg-gradient-to-r from-[#F8FAFC] to-white">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Total
            </p>
            <p className="text-2xl font-bold text-[#001940] mt-1">
              {notifications.length}
            </p>
          </div>
          <div className="rounded-xl border border-orange-200 p-4 bg-gradient-to-r from-[#FFF7ED] to-white">
            <p className="text-xs text-orange-600 uppercase tracking-wide">
              Unread
            </p>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              {unreadCount}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "unread", "read"].map((tab) => {
          const isActive = activeFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                isActive
                  ? "bg-[#001940] text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5" />
          <div>
            {error.response?.data?.responseMessage ||
              error.message ||
              "Unable to load notifications."}
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          Loading notifications...
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
          <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Bell size={20} className="text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            No notifications
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Notifications will appear here as activity happens.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((item) => {
            const itemLoading = !!markingOne[item.id];
            return (
              <article
                key={item.id}
                className={`rounded-2xl border p-4 bg-white shadow-sm transition ${
                  item.is_read
                    ? "border-gray-200"
                    : "border-orange-200 bg-gradient-to-r from-[#FFFDF8] to-white"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-6">
                    <div className="rounded-full bg-gray-200 p-3">
                      <Truck size={25} className="text-orange-500 " />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold text-gray-900">
                          {item.title || "Notification"}
                        </h2>
                        {!item.is_read && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                            Unread
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{item.message}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                          {item.category || "GENERAL"}
                        </span>
                        <span>{formatTimestamp(item.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {!item.is_read && (
                    <button
                      onClick={() => handleMarkOne(item.id)}
                      disabled={itemLoading}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 flex items-center gap-2"
                    >
                      <Check size={14} />
                      {itemLoading ? "Marking..." : "Mark as read"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
