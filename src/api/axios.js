import axios from 'axios'; 
import { refreshAccessToken } from './auth.service';


const api = axios.create({
  baseURL: "/api",
    headers: {
    'Content-Type': 'application/json',
    }
});

    
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // If access token expired
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const res = await refreshAccessToken(refreshToken);

        const newAccessToken = res.response_detail.access;

        // Save new token
        localStorage.setItem("accessToken", newAccessToken);

        // Update header & retry request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed ❌", refreshError);

        // Clear auth & redirect to login
        localStorage.clear();
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


export default api;