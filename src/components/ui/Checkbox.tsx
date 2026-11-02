import { ReactNode } from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, radius, spacing } from "../../theme/tokens";

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  accessibilityLabel: string;
  tone?: "auth" | "form" | "success";
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function Checkbox({
  checked,
  onChange,
  label,
  accessibilityLabel,
  tone = "form",
  size = 18,
  style,
}: Props) {
  const fill = tone === "success" ? colors.checkbox : tone === "auth" ? colors.authLabel : colors.primary;
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={[styles.row, style]}
    >
      <View
        style={[
          styles.box,
          { width: size, height: size, borderColor: checked ? fill : tone === "auth" ? colors.authLabel : colors.checkboxBorder },
          checked && { backgroundColor: fill },
        ]}
      >
        {checked ? <Feather name="check" size={size - 6} color={colors.white} /> : null}
      </View>
      {typeof label === "string" ? <Text style={[styles.label, tone === "auth" && styles.authLabel]}>{label}</Text> : label}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: 28 },
  box: {
    borderWidth: 1.5,
    borderRadius: radius.sm - 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.text, flexShrink: 1 },
  authLabel: { color: colors.authLabel, fontFamily: fonts.semibold },
});
