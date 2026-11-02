import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useResponsive } from "../../hooks/useResponsive";
import { gradients, layout, spacing } from "../../theme/tokens";

/** Onboarding background: Figma vertical gradient with a centred form column. */
export function AuthLayout({ children, center = true }: { children: ReactNode; center?: boolean }) {
  const { gutter, isPhone } = useResponsive();
  return (
    <LinearGradient
      colors={[...gradients.auth]}
      locations={[...gradients.authStops]}
      style={styles.fill}
    >
      <SafeAreaView style={styles.fill}>
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            contentContainerStyle={[
              styles.scroll,
              center ? styles.center : null,
              { paddingHorizontal: gutter, paddingVertical: isPhone ? spacing.xxl : spacing.xxxl * 2 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.column}>{children}</View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1 },
  center: { justifyContent: "center" },
  column: { width: "100%", maxWidth: layout.authFormWidth, alignSelf: "center" },
});
