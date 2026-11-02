import { Redirect } from "expo-router";
import { Tabs } from "expo-router/tabs";
import { useAuthStore } from "../../src/store/authStore";
import { AppTabBar } from "../../src/components/shared/AppTabBar";
import { colors } from "../../src/theme/tokens";

export default function TabsLayout() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Redirect href="/(auth)/welcome" />;

  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarPosition: "top",
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="admissions" options={{ title: "Current Admissions" }} />
      <Tabs.Screen name="new-admission" options={{ title: "New Admission" }} />
      <Tabs.Screen name="patients" options={{ title: "Patients" }} />
    </Tabs>
  );
}
