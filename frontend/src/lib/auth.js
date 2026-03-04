import apiClient from "./apiClient";
import useAuthStore from "../store/authStore";

export async function login(payload) {
  const res = await apiClient.post("/auth/login", payload);
  useAuthStore.getState().login({
    user: res.data.user,
    accessToken: res.data.access_token,
  });
  return res.data;
}

export async function register(payload) {
  const res = await apiClient.post("/auth/register", payload);
  useAuthStore.getState().login({
    user: res.data.user,
    accessToken: res.data.access_token,
  });
  return res.data;
}

export async function logout() {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    useAuthStore.getState().logout();
  }
}
