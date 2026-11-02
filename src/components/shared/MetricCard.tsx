import { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { fonts, metricTones, radius, spacing } from "../../theme/tokens";

interface Props {
  label: string;
  value: string | number;
  tone: keyof typeof metricTones;
  icon: ComponentProps<typeof Feather>["name"];
}

export function MetricCard({ label, value, tone, icon }: Props) {
  const t = metricTones[tone];
  const display = typeof value === "number" ? String(value).padStart(2, "0") : value;
  return (
    <View style={[styles.card, { backgroundColor: t.bg }]} accessible accessibilityLabel={`${label}: ${value}`}>
      <Feather name={icon} size={18} color={t.fg} />
      <Text style={[styles.value, { color: t.fg }]}>{display}</Text>
      <Text style={[styles.label, { color: t.fg }]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: "45%",
    minHeight: 96,
    borderRadius: radius.lg,
    padding: spacing.md,
    justifyContent: "space-between",
  },
  value: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30, marginTop: spacing.xs },
  label: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14 },
});
