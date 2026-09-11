import axios, { AxiosInstance } from "axios";
import { BASE_URL } from "./config";

// export a configured Axios instance
const jwtAxios: AxiosInstance = axios.create({ baseURL: BASE_URL });

// request interceptor to attach JWT
jwtAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// response interceptor for token refresh
jwtAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(
            `${BASE_URL}/api/token/refresh/`,
            { refresh: refreshToken }
          );
          const newAccessToken = refreshResponse.data.access;
          localStorage.setItem("access_token", newAccessToken);
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return jwtAxios(originalRequest);
        } catch (refreshError) {
          // clear tokens here (optional may remove later)
          // localStorage.removeItem("access_token");
          // localStorage.removeItem("refresh_token");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default jwtAxios;
