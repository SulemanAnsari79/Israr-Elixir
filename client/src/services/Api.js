import axios from "axios";

const RAW_BASE_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? "http://localhost:4000" : "");
const TRIMMED_BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");
const API_BASE_URL = TRIMMED_BASE_URL.endsWith("/api") ? TRIMMED_BASE_URL : `${TRIMMED_BASE_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof config.url === "string" && config.url.startsWith("/api/")) {
    config.url = config.url.replace(/^\/api\//, "/");
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.skipAuthRedirect &&
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
