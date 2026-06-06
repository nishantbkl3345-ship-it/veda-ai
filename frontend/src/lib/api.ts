import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ── Request interceptor ────────────────────────────
api.interceptors.request.use(
  (config) => {
    // TODO: Attach auth token if available
    // const token = getToken();
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ───────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    console.error("[API Error]", message);
    return Promise.reject(error);
  }
);

export default api;
