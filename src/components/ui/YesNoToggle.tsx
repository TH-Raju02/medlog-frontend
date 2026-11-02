import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, fonts, radius, spacing, typography } from "../../theme/tokens";

interface Props {
  label?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  required?: boolean;
  /** "alert" paints the Yes state red (Figma allergy toggle). */
  tone?: "default" | "alert";
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function YesNoToggle({ label, value, onChange, required, tone = "default", compact, style }: Props) {
  const option = (optionValue: boolean, text: string) => {
    const active = value === optionValue;
    const alert = tone === "alert" && active && optionValue;
    return (
      <Pressable
        key={text}
        onPress={() => onChange(optionValue)}
        accessibilityRole="radio"
        accessibilityState={{ selected: active }}
        accessibilityLabel={`${label ?? ""} ${text}`.trim()}
        style={[
          styles.option,
          compact && styles.optionCompact,
          active && styles.active,
          alert && styles.alert,
        ]}
      >
        <Text style={[styles.text, active && styles.activeText, alert && styles.alertText]}>{text}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.wrap, style]}>
      {label ? (
        <Text style={typography.label}>
          {label}
          {required ? <Text style={{ color: colors.text }}> *</Text> : null}
        </Text>
      ) : null}
      <View style={[styles.track, compact && styles.trackCompact]} accessibilityRole="radiogroup">
        {option(false, "No")}
        {option(true, "Yes")}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, minWidth: 0 },
  track: {
    flexDirection: "row",
    backgroundColor: colors.inputBg,
    borderRadius: radius.md,
    padding: 2,
    minHeight: 40,
  },
  trackCompact: { minHeight: 32, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  option: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: radius.sm, minHeight: 36 },
  optionCompact: { minHeight: 28, paddingHorizontal: spacing.md },
  active: { backgroundColor: colors.primary },
  alert: { backgroundColor: colors.allergyBg, borderWidth: 1, borderColor: colors.allergyBorder },
  text: { fontFamily: fonts.regular, fontSize: 13, color: colors.textBody },
  activeText: { color: colors.white, fontFamily: fonts.medium },
  alertText: { color: colors.danger },
});
