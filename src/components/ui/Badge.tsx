import { StyleSheet, Text, View } from "react-native";
import { colors, radius, typography } from "../../theme/tokens";

type Tone = "brand" | "success" | "warning" | "danger" | "neutral";

const tones: Record<Tone, { bg: string; fg: string }> = {
  brand: { bg: colors.badgeBg, fg: colors.brand },
  success: { bg: colors.successBg, fg: colors.success },
  warning: { bg: colors.warningBg, fg: colors.warning },
  danger: { bg: colors.dangerBg, fg: colors.danger },
  neutral: { bg: colors.inputBg, fg: colors.muted },
};

export function Badge({ label, tone = "brand" }: { label: string; tone?: Tone }) {
  const t = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[typography.badge, { color: t.fg }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
  },
});
