import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, spacing, typography } from "../../theme/tokens";

/** Onboarding title + grey helper line (Figma "Create Your Account", "Verify Your OTP", ...). */
export function AuthHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={typography.authTitle} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.xl },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 21,
    color: colors.authSubtitle,
    marginTop: 2,
  },
});
