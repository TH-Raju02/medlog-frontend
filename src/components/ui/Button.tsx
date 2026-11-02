import { ComponentProps } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, gradients, radius, spacing } from "../../theme/tokens";

type Variant =
  | "primary"
  | "strong"
  | "secondary"
  | "ghost"
  | "danger"
  | "gradient"
  | "neutral"
  | "authBack"
  | "soft"
  | "outline";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  icon?: ComponentProps<typeof Feather>["name"];
  iconPosition?: "left" | "right";
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const palette: Record<Variant, { bg: string; fg: string }> = {
  primary: { bg: colors.primary, fg: colors.white },
  strong: { bg: colors.primaryStrong, fg: colors.white },
  secondary: { bg: colors.softButtonBg, fg: colors.softButtonText },
  neutral: { bg: colors.inputBg, fg: colors.heading },
  ghost: { bg: "transparent", fg: colors.primaryStrong },
  danger: { bg: colors.danger, fg: colors.white },
  gradient: { bg: "transparent", fg: colors.white },
  authBack: { bg: colors.authBackBg, fg: colors.authBackText },
  soft: { bg: colors.softActionBg, fg: colors.softActionText },
  outline: { bg: colors.surface, fg: colors.heading },
};

export function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  icon,
  iconPosition = "left",
  style,
  accessibilityLabel,
}: Props) {
  const isDisabled = disabled || loading;
  const { bg, fg } = palette[variant];
  const isGradient = variant === "gradient";
  const isPill = isGradient || variant === "authBack";
  const keepsColor = variant === "ghost" || isGradient || variant === "authBack" || variant === "outline";
  const background = isDisabled && !keepsColor ? colors.primaryDisabled : bg;

  const content = loading ? (
    <ActivityIndicator color={fg} />
  ) : (
    <View style={styles.row}>
      {icon && iconPosition === "left" ? <Feather name={icon} size={16} color={fg} /> : null}
      <Text style={[styles.text, { color: fg }]} numberOfLines={1}>
        {title}
      </Text>
      {icon && iconPosition === "right" ? <Feather name={icon} size={16} color={fg} /> : null}
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        isPill ? styles.pill : null,
        variant === "outline" ? styles.outline : null,
        { backgroundColor: background },
        pressed && !isDisabled ? styles.pressed : null,
        isGradient && isDisabled ? styles.disabledGradient : null,
        style,
      ]}
    >
      {isGradient ? (
        <LinearGradient
          colors={[...gradients.button]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[StyleSheet.absoluteFill, styles.pill]}
        />
      ) : null}
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    overflow: "hidden",
  },
  pill: { borderRadius: radius.full, minHeight: 48 },
  outline: { borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  pressed: { opacity: 0.88 },
  disabledGradient: { opacity: 0.5 },
  text: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
});
