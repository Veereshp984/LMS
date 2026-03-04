import { create } from "zustand";

const savedToken = localStorage.getItem("accessToken");
const savedUser = localStorage.getItem("user");

const useAuthStore = create((set) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
  accessToken: savedToken || null,
  isAuthenticated: Boolean(savedToken),
  login: ({ user, accessToken }) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, accessToken, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
  setAccessToken: (accessToken) => {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    set((state) => ({ ...state, accessToken, isAuthenticated: Boolean(accessToken) }));
  },
}));

export default useAuthStore;
