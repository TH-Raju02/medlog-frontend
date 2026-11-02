import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import type { BottomTabBarProps } from "expo-router/tabs";
import { useResponsive } from "../../hooks/useResponsive";
import { colors, fonts, layout, radius, spacing } from "../../theme/tokens";
import { Container } from "../ui/Container";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";

type IconName = ComponentProps<typeof Feather>["name"];

export const PRIMARY_TABS: Array<{ name: string; label: string; short: string; icon: IconName }> = [
  { name: "dashboard", label: "Dashboard", short: "Dashboard", icon: "grid" },
  { name: "admissions", label: "Current Admissions", short: "Admissions", icon: "calendar" },
  { name: "new-admission", label: "New Admission", short: "New", icon: "plus" },
  { name: "patients", label: "Patients", short: "Patients", icon: "user" },
];

/** Figma app header: logo + account menu, then the segmented primary navigation. */
export function AppTabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isPhone } = useResponsive();
  const activeRoute = state.routes[state.index]?.name;

  return (
    <View style={styles.root}>
      {insets.top > 0 ? <View style={{ height: insets.top, backgroundColor: colors.statusBar }} /> : null}
      <View style={styles.header}>
        <Container maxWidth={layout.maxContentWidth}>
          <View style={[styles.brandRow, isPhone && styles.brandRowPhone]}>
            <Logo scale={isPhone ? 0.8 : 1} />
            <UserMenu />
          </View>

          <View style={styles.tabs} accessibilityRole="tablist">
            {PRIMARY_TABS.map((tab) => {
              const route = state.routes.find((r) => r.name === tab.name);
              if (!route) return null;
              const focused = activeRoute === tab.name;
              const color = focused ? colors.tabActiveText : colors.tabText;
              const onPress = () => {
                const event = emitter.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigateToTab(route.key);
              };
              return (
                <Pressable
                  key={tab.name}
                  onPress={onPress}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: focused }}
                  accessibilityLabel={tab.label}
                  style={({ pressed }) => [
                    styles.tab,
                    isPhone && styles.tabPhone,
                    focused && styles.tabActive,
                    pressed && !focused && styles.tabPressed,
                  ]}
                >
                  <Feather name={tab.icon} size={isPhone ? 16 : 14} color={color} />
                  <Text
                    style={[styles.tabText, isPhone && styles.tabTextPhone, { color }]}
                    numberOfLines={1}
                  >
                    {isPhone ? tab.short : tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Container>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.header },
  header: { backgroundColor: colors.header, paddingTop: spacing.xxl, paddingBottom: spacing.md },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 52,
    marginBottom: spacing.lg,
  },
  brandRowPhone: { marginBottom: spacing.md },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 4,
    gap: 4,
    shadowColor: colors.text,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
  },
  tabPhone: { flexDirection: "column", gap: 2, minHeight: 52, paddingHorizontal: 2 },
  tabActive: { backgroundColor: colors.tabActiveBg },
  tabPressed: { backgroundColor: colors.iconButtonBg },
  tabText: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  tabTextPhone: { fontSize: 11, lineHeight: 14 },
});
