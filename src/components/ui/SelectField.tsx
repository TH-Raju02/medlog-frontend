import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, radius, shadows, spacing, typography } from "../../theme/tokens";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface DialogProps<T extends string> {
  visible: boolean;
  title: string;
  subtitle?: string;
  options: SelectOption<T>[];
  value?: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}

/** Figma radio-list dialog ("Select Marital Status", month picker, ...). */
export function OptionsDialog<T extends string>({
  visible,
  title,
  subtitle,
  options,
  value,
  onSelect,
  onClose,
}: DialogProps<T>) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View style={styles.sheet} accessibilityViewIsModal>
          <Text style={styles.sheetTitle}>{title}</Text>
          {subtitle ? <Text style={styles.sheetSubtitle}>{subtitle}</Text> : null}
          <View style={styles.divider} />
          <ScrollView style={styles.options}>
            {options.map((option) => {
              const active = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                >
                  <View style={styles.radio}>{active ? <View style={styles.radioDot} /> : null}</View>
                  <Text style={styles.optionText}>{option.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={styles.divider} />
          <Pressable onPress={onClose} accessibilityRole="button" style={styles.cancel} hitSlop={8}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

interface Props<T extends string> {
  label: string;
  value?: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  dialogTitle?: string;
  dialogSubtitle?: string;
  required?: boolean;
  error?: string;
  tone?: "form" | "auth";
  hideLabel?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

/** Input-styled dropdown that opens the Figma radio-list dialog. */
export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = "Select",
  dialogTitle,
  dialogSubtitle,
  required,
  error,
  tone = "form",
  hideLabel,
  containerStyle,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const isAuth = tone === "auth";
  const selected = options.find((o) => o.value === value);

  return (
    <View style={[styles.container, isAuth && styles.authContainer, containerStyle]}>
      {hideLabel ? null : (
        <Text style={isAuth ? typography.authLabel : typography.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      )}
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? placeholder}`}
        style={[styles.field, isAuth && styles.authField, error ? styles.fieldError : null]}
      >
        <Text
          style={[
            styles.value,
            !selected && { color: isAuth ? colors.authPlaceholder : colors.placeholder },
          ]}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Feather name="chevron-down" size={16} color={colors.authIcon} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <OptionsDialog
        visible={open}
        title={dialogTitle ?? `Select ${label}`}
        subtitle={dialogSubtitle}
        options={options}
        value={value}
        onSelect={onChange}
        onClose={() => setOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg, gap: spacing.sm, minWidth: 0 },
  authContainer: { marginBottom: spacing.md, gap: 6 },
  required: { color: colors.text },
  field: {
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: colors.inputBg,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  authField: { minHeight: 48, borderRadius: radius.lg, backgroundColor: colors.authInputBg },
  fieldError: { borderColor: colors.danger },
  value: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text },
  error: { ...typography.caption, color: colors.danger },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(23, 52, 60, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  sheet: {
    width: "100%",
    maxWidth: 360,
    maxHeight: "80%",
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    paddingVertical: spacing.lg,
    ...shadows.raised,
  },
  sheetTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.heading, paddingHorizontal: spacing.lg },
  sheetSubtitle: { ...typography.caption, color: colors.subHeaderSubtitle, paddingHorizontal: spacing.lg, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.sm },
  options: { flexGrow: 0 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  optionPressed: { backgroundColor: colors.iconButtonBg },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  optionText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textBody },
  cancel: { alignSelf: "flex-end", paddingHorizontal: spacing.lg, minHeight: 36, justifyContent: "center" },
  cancelText: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
});
