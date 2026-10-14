import axios from "axios";

/**
 * apiClient
 * ---------
 * Centralized Axios instance.
 *
 * - Uses Vite dev proxy (/api → http://localhost:8000)
 * - Safe for uploads + ML calls
 * - Preserves FormData correctly
 */
const apiClient = axios.create({
  baseURL: "/api",          // Vite proxy handles backend
  timeout: 60000,           // ⏱ ML + image analysis can be slow
  withCredentials: false,   // no cookies/session needed
});

/* ---------------------------------------------------------- */
/* Response / error handling                                  */
/* ---------------------------------------------------------- */

apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    // 🔴 Backend responded (400/500/etc)
    if (error.response) {
      return Promise.reject({
        status: error.response.status,
        message:
          error.response.data?.detail ||
          error.response.data?.message ||
          error.response.statusText ||
          "Server error",
      });
    }

    // 🔴 Request made but no response (timeout / crash)
    if (error.request) {
      return Promise.reject({
        status: 0,
        message:
          "No response from backend. Server may be down or crashed.",
      });
    }

    // 🔴 Axios configuration / JS error
    return Promise.reject({
      status: -1,
      message: error.message || "Unexpected client error",
    });
  }
);


export const API_BASE_URL = "http://127.0.0.1:8000"; // Fallback if not using proxy
export default apiClient;
