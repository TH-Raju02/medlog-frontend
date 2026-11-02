import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors, layout, spacing, typography } from "../../theme/tokens";
import { Container } from "./Container";

interface Props {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: ReactNode;
}

/** Sub-page header used by detail, form and settings screens in the Figma file. */
export function Header({ title, subtitle, showBack, right }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/dashboard");
  };

  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]}>
      <Container maxWidth={layout.maxContentWidth}>
        <View style={styles.row}>
          {showBack ? (
            <Pressable
              onPress={goBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
              style={({ pressed }) => [styles.back, pressed && styles.pressed]}
            >
              <Feather name="chevron-left" size={18} color={colors.heading} />
            </Pressable>
          ) : null}
          <View style={styles.titles}>
            <Text style={typography.subHeaderTitle} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {right ? <View style={styles.right}>{right}</View> : null}
        </View>
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.subHeaderBorder,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 64,
    paddingVertical: spacing.md,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.subHeaderBorder,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { backgroundColor: colors.iconButtonBg },
  titles: { flex: 1, minWidth: 0 },
  subtitle: { ...typography.caption, color: colors.subHeaderSubtitle, marginTop: 2 },
  right: { flexShrink: 0 },
});
