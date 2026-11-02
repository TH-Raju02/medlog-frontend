import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useResponsive } from "../../hooks/useResponsive";
import { colors, fonts, radius, shadows, spacing, typography } from "../../theme/tokens";
import { Button } from "./Button";

interface Props {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  /** Primary footer action; omit for read-only dialogs. */
  submitLabel?: string;
  onSubmit?: () => void;
  submitting?: boolean;
  submitDisabled?: boolean;
  submitVariant?: "primary" | "danger";
  cancelLabel?: string;
  maxWidth?: number;
}

/** Figma dialog: accent-bar title, round close button, divider, content, Cancel + primary footer. */
export function FormModal({
  visible,
  title,
  subtitle,
  onClose,
  children,
  submitLabel,
  onSubmit,
  submitting,
  submitDisabled,
  submitVariant = "primary",
  cancelLabel = "Cancel",
  maxWidth = 736,
}: Props) {
  const { height, isPhone } = useResponsive();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close dialog" />
        <View
          style={[
            styles.card,
            { maxWidth, maxHeight: height * 0.88 },
            isPhone && styles.cardPhone,
          ]}
          accessibilityViewIsModal
        >
          <View style={styles.header}>
            <View style={styles.titles}>
              <View style={styles.titleRow}>
                <View style={styles.accent} />
                <Text style={styles.title} accessibilityRole="header" numberOfLines={2}>
                  {title}
                </Text>
              </View>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={10}
              style={styles.close}
            >
              <Feather name="x" size={14} color={colors.heading} />
            </Pressable>
          </View>
          <View style={styles.divider} />
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
          {submitLabel && onSubmit ? (
            <>
              <View style={styles.divider} />
              <View style={styles.footer}>
                <Button title={cancelLabel} variant="neutral" onPress={onClose} style={styles.cancel} />
                <Button
                  title={submitLabel}
                  variant={submitVariant}
                  onPress={onSubmit}
                  loading={submitting}
                  disabled={submitDisabled}
                  style={styles.submit}
                />
              </View>
            </>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(23, 52, 60, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    ...shadows.raised,
  },
  cardPhone: { paddingHorizontal: spacing.lg },
  header: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  titles: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  accent: { width: 3, height: 22, borderRadius: 2, backgroundColor: colors.primary },
  title: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24, color: colors.heading, flexShrink: 1 },
  subtitle: { ...typography.caption, color: colors.subHeaderSubtitle, marginTop: spacing.xs },
  close: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.iconButtonBg,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },
  body: { flexGrow: 0 },
  bodyContent: { paddingBottom: spacing.xs },
  footer: { flexDirection: "row", gap: spacing.md },
  cancel: { flex: 0.42 },
  submit: { flex: 1 },
});
