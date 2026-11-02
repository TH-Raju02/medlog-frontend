import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;

const DEFAULT_API_URL = "https://medlog-backend-8buy.onrender.com/api/v1";

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || extra?.apiUrl || DEFAULT_API_URL).replace(/\/+$/, "");
