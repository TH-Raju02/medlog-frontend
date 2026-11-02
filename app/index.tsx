import { Redirect } from "expo-router";
import { useAuthStore } from "../src/store/authStore";

export default function Index() {
  const user = useAuthStore((s) => s.user);
  if (user) return <Redirect href="/(tabs)/dashboard" />;
  return <Redirect href="/(auth)/welcome" />;
}
