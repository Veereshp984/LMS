const LOCAL_API_BASE_URL = "http://localhost:5000";
const PROD_API_BASE_URL = "https://lms-b6ib.onrender.com";

function isLocalHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function resolveApiBaseUrl() {
  const explicit = (import.meta.env.VITE_API_BASE_URL || "").trim();
  if (explicit) return explicit;

  if (typeof window !== "undefined" && isLocalHost(window.location.hostname)) {
    return LOCAL_API_BASE_URL;
  }
  return PROD_API_BASE_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();
