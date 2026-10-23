import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hireflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh and 401s
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('hireflow_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          if (res.data?.success && res.data?.data?.accessToken) {
            const newToken = res.data.data.accessToken;
            const newRefreshToken = res.data.data.refreshToken;
            localStorage.setItem('hireflow_token', newToken);
            if (newRefreshToken) {
              localStorage.setItem('hireflow_refresh_token', newRefreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem('hireflow_token');
          localStorage.removeItem('hireflow_refresh_token');
          localStorage.removeItem('hireflow_user');
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
