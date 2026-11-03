import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useAuthStore } from "../src/store/authStore";
import { wakeServer } from "../src/services/api/client";
import { colors } from "../src/theme/tokens";
import { Loader } from "../src/components/ui/Loader";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    // Start waking the API while the splash and login screens are shown.
    void wakeServer();
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (fontsLoaded && bootstrapped) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded, bootstrapped]);

  if (!fontsLoaded || !bootstrapped) {
    return <Loader />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
