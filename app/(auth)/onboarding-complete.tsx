import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { AuthLayout } from "../../src/components/shared/AuthLayout";
import { Logo } from "../../src/components/shared/Logo";
import { Button } from "../../src/components/ui/Button";
import { useResponsive } from "../../src/hooks/useResponsive";
import { colors, fonts, spacing } from "../../src/theme/tokens";

/** Figma "Welcome to MedLog." frame shown once onboarding (verification + plan) is done. */
export default function OnboardingCompleteScreen() {
  const router = useRouter();
  const { isPhone } = useResponsive();
  return (
    <AuthLayout>
      <View style={styles.hero}>
        <Logo variant="stacked" scale={isPhone ? 0.55 : 0.75} />
        <Text style={[styles.title, isPhone && styles.titlePhone]} accessibilityRole="header">
          Welcome to MedLog.
        </Text>
      </View>
      <Button
        title="Go To Dashboard"
        variant="gradient"
        icon="arrow-right"
        iconPosition="right"
        onPress={() => router.replace("/(tabs)/dashboard")}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", marginBottom: spacing.xxl },
  title: {
    fontFamily: fonts.bold,
    fontSize: 40,
    lineHeight: 48,
    color: colors.logo,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  titlePhone: { fontSize: 28, lineHeight: 36 },
});
