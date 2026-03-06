const LOCAL_API_BASE_URL = "http://localhost:5000";
const PROD_API_BASE_URL = "https://lms-b6ib.onrender.com";

function isLocalHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function normalizeApiBaseUrl(url) {
  return (url || "").trim().replace(/\/+$/, "").replace(/\/api$/, "");
}

function resolveApiBaseUrl() {
  const explicit = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL || "");
  if (explicit) return explicit;

  if (typeof window !== "undefined" && isLocalHost(window.location.hostname)) {
    return normalizeApiBaseUrl(LOCAL_API_BASE_URL);
  }
  return normalizeApiBaseUrl(PROD_API_BASE_URL);
}

export const API_BASE_URL = resolveApiBaseUrl();
