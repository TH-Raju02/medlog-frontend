import { ReactNode, useState } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, radius, spacing, typography } from "../../theme/tokens";

interface Props extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  /** "auth" matches the onboarding screens (lighter fill, teal labels). */
  tone?: "form" | "auth";
  /** Keeps the label for screen readers when a shared group label is shown instead. */
  hideLabel?: boolean;
  /** Password field with the Figma show/hide eye icon. */
  secureToggle?: boolean;
  right?: ReactNode;
}

export function TextField({
  label,
  required,
  error,
  containerStyle,
  style,
  tone = "form",
  editable = true,
  hideLabel,
  secureToggle,
  right,
  multiline,
  ...rest
}: Props) {
  const isAuth = tone === "auth";
  const [hidden, setHidden] = useState(true);
  const accessory = secureToggle ? (
    <Pressable
      onPress={() => setHidden((v) => !v)}
      accessibilityRole="button"
      accessibilityLabel={hidden ? "Show password" : "Hide password"}
      hitSlop={10}
      style={styles.accessory}
    >
      <Feather name={hidden ? "eye" : "eye-off"} size={16} color={colors.authIcon} />
    </Pressable>
  ) : right ? (
    <View style={styles.accessory}>{right}</View>
  ) : null;

  return (
    <View style={[styles.container, isAuth && styles.authContainer, containerStyle]}>
      {hideLabel ? null : (
        <Text style={isAuth ? typography.authLabel : typography.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      )}
      <View>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={isAuth ? colors.authPlaceholder : colors.placeholder}
          editable={editable}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          secureTextEntry={secureToggle ? hidden : rest.secureTextEntry}
          style={[
            styles.input,
            isAuth ? styles.authInput : null,
            multiline ? styles.multiline : null,
            accessory ? styles.withAccessory : null,
            !editable ? styles.readOnly : null,
            error ? styles.inputError : null,
            style,
          ]}
          {...rest}
        />
        {accessory}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg, gap: spacing.sm, minWidth: 0 },
  authContainer: { marginBottom: spacing.md, gap: 6 },
  required: { color: colors.text },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: colors.inputBg,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  authInput: { minHeight: 48, borderRadius: radius.lg, backgroundColor: colors.authInputBg, fontSize: 14 },
  multiline: { minHeight: 96, paddingTop: 12 },
  withAccessory: { paddingRight: 44 },
  accessory: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  readOnly: { color: colors.muted },
  inputError: { borderColor: colors.danger },
  error: { ...typography.caption, color: colors.danger },
});
