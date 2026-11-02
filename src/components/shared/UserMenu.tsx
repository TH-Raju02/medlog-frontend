import { ComponentProps, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { useResponsive } from "../../hooks/useResponsive";
import { colors, fonts, layout, radius, shadows, spacing } from "../../theme/tokens";

type IconName = ComponentProps<typeof Feather>["name"];

export function UserMenu() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, gutter } = useResponsive();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "ML";
  const sideInset = Math.max(gutter, (width - layout.maxContentWidth) / 2);

  const go = (path: "/profile" | "/settings") => {
    setOpen(false);
    router.push(path);
  };

  const items: Array<{ label: string; icon: IconName; onPress: () => void; danger?: boolean }> = [
    { label: "View Profile", icon: "user", onPress: () => go("/profile") },
    { label: "Settings", icon: "settings", onPress: () => go("/settings") },
    {
      label: "Logout",
      icon: "log-out",
      danger: true,
      onPress: async () => {
        setOpen(false);
        await logout();
        router.replace("/(auth)/login");
      },
    },
  ];

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Open account menu"
        style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
      >
        <View style={styles.initials}>
          <Text style={styles.initialsText}>{initials}</Text>
        </View>
        <Feather name="chevron-down" size={14} color={colors.white} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Close menu">
          <View
            style={[styles.menu, { top: insets.top + 84, right: sideInset }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.menuHeader}>
              <Text style={styles.name} numberOfLines={1}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.role} numberOfLines={1}>
                {[user?.jobTitle ?? (user?.role === "admin" ? "Administrator" : "Clinician"), user?.specialty]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </View>
            {items.map((item) => (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                accessibilityRole="menuitem"
                style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              >
                <Feather name={item.icon} size={16} color={item.danger ? colors.logout : colors.menuText} />
                <Text style={[styles.itemText, item.danger && { color: colors.logout }]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 52,
    minWidth: 76,
    paddingHorizontal: 10,
    borderRadius: radius.xl,
    backgroundColor: colors.userPill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  pressed: { opacity: 0.9 },
  initials: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.userPillInner,
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: { fontFamily: fonts.semibold, fontSize: 11, color: colors.brand },
  backdrop: { flex: 1 },
  menu: {
    position: "absolute",
    width: 200,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadows.raised,
  },
  menuHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  name: { fontFamily: fonts.semibold, fontSize: 13, color: colors.menuName },
  role: { fontFamily: fonts.regular, fontSize: 10, color: colors.mutedLight, marginTop: 2 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  itemPressed: { backgroundColor: colors.iconButtonBg },
  itemText: { fontFamily: fonts.medium, fontSize: 13, color: colors.menuText },
});
