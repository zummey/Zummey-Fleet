import api from "./axios";

export const getNotifications = async () => {
  const response = await api.get("/notifications/notifications-list");
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  if (!id && id !== 0) {
    return Promise.reject(new Error("Notification id is required"));
  }
  const response = await api.post(`/notifications/mark-read/${id}`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.post("/notifications/mark-all-read/");
  return response.data;
};

