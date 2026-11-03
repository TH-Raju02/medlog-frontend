import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_URL } from "../../config/env";
import { secureStorage } from "../storage/secureStorage";

const ACCESS_KEY = "medlog_access_token";
const REFRESH_KEY = "medlog_refresh_token";

// "Remember me" off: tokens live only in memory and disappear when the app is closed.
let sessionTokens: { access: string; refresh: string } | null = null;

export const tokenStorage = {
  getAccess: async () => sessionTokens?.access ?? secureStorage.getItem(ACCESS_KEY),
  getRefresh: async () => sessionTokens?.refresh ?? secureStorage.getItem(REFRESH_KEY),
  setTokens: async (access: string, refresh: string, persist?: boolean) => {
    const keep = persist ?? sessionTokens === null;
    if (keep) {
      sessionTokens = null;
      await secureStorage.setItem(ACCESS_KEY, access);
      await secureStorage.setItem(REFRESH_KEY, refresh);
    } else {
      sessionTokens = { access, refresh };
      await secureStorage.deleteItem(ACCESS_KEY);
      await secureStorage.deleteItem(REFRESH_KEY);
    }
  },
  clear: async () => {
    sessionTokens = null;
    await secureStorage.deleteItem(ACCESS_KEY);
    await secureStorage.deleteItem(REFRESH_KEY);
  },
};

// The API runs on Render's free plan, which sleeps when idle and takes up to about a minute to wake.
const REQUEST_TIMEOUT_MS = 75000;

export const api = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

let waking: Promise<boolean> | null = null;

/** Pings the API so a sleeping server starts booting; resolves false when it can't be reached. */
export function wakeServer(): Promise<boolean> {
  waking =
    waking ??
    axios
      .get(`${API_URL}/health`, { timeout: REQUEST_TIMEOUT_MS })
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        waking = null;
      });
  return waking;
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await tokenStorage.getRefresh();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
    const tokens = data.data.tokens;
    await tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    return tokens.accessToken as string;
  } catch {
    await tokenStorage.clear();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _networkRetry?: boolean;
    };
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      refreshing = refreshing ?? refreshAccessToken();
      const newToken = await refreshing;
      refreshing = null;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }
    // Only reads are retried: a write may already have reached the server.
    const isRead = (original?.method ?? "get").toLowerCase() === "get";
    if (!error.response && original && isRead && !original._networkRetry) {
      original._networkRetry = true;
      if (await wakeServer()) return api(original);
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error: unknown, fallback = "Something went wrong") => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
        ? "The server is taking too long to respond. Please try again in a moment."
        : "Can't reach the MedLog server. Check your internet connection and try again.";
    }
    return (error.response.data as { message?: string })?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};
