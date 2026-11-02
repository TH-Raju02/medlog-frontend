import axios from "axios";
import { create } from "zustand";
import { api, tokenStorage } from "../services/api/client";
import { AuthTokens, AuthUser } from "../types/api";

interface AuthState {
  user: AuthUser | null;
  bootstrapped: boolean;
  loading: boolean;
  setSession: (user: AuthUser, tokens: AuthTokens, remember?: boolean) => Promise<void>;
  bootstrap: () => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  bootstrapped: false,
  loading: false,

  setSession: async (user, tokens, remember = true) => {
    await tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken, remember);
    set({ user });
  },

  bootstrap: async () => {
    try {
      const access = await tokenStorage.getAccess();
      if (!access) {
        set({ user: null, bootstrapped: true });
        return;
      }
      const { data } = await api.get("/auth/me");
      set({ user: data.data, bootstrapped: true });
    } catch (error) {
      // Only an auth failure ends the session; offline or rate-limited starts keep the tokens.
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await tokenStorage.clear();
      }
      set({ user: null, bootstrapped: true });
    }
  },

  refreshUser: async () => {
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data.data });
    } catch {
      // keep the cached profile
    }
  },

  logout: async () => {
    try {
      const refreshToken = await tokenStorage.getRefresh();
      await api.post("/auth/logout", { refreshToken });
    } catch {
      // ignore network logout failures
    }
    await tokenStorage.clear();
    set({ user: null });
  },

  updateUser: (user) => set({ user }),
}));
