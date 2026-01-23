import axios from 'axios';

const api = axios.create({
  baseURL: "/api",
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  
  // Only add token if it exists and endpoint is not signup/login
  const isAuthEndpoint = config.url.includes('/register') || 
                        config.url.includes('/login') || 
                        config.url.includes('/verify');
  
  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor - Handle token refresh and errors
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized/token expired)
    if (error.response?.status === 401) {
      
      // If it's already a retry or refresh token request, don't retry
      if (originalRequest._retry || originalRequest.url.includes("/token/refresh")) {
        // Clear invalid tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Redirect to login
        window.location.href = "/login";
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Try to refresh token
        const res = await axios.post("/api/users/v1/token/refresh/", {
          refresh: refreshToken,
        });

        const newAccessToken = res.data.access;
        localStorage.setItem("accessToken", newAccessToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        
      } catch (err) {
        // Refresh failed - clear everything and redirect
        console.error('Token refresh failed:', err);
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    // Handle other errors normally
    return Promise.reject(error);
  }
);

export default api;