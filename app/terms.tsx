import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../src/components/ui/Screen";
import { Header } from "../src/components/ui/Header";
import { Card } from "../src/components/ui/Card";
import { TERMS_INTRO, TERMS_SECTIONS } from "../src/features/terms/termsContent";
import { colors, fonts, spacing } from "../src/theme/tokens";

export default function TermsScreen() {
  return (
    <Screen
      scroll
      header={<Header title="Terms and Conditions" subtitle="How MedLog protects and manages your information" showBack />}
    >
      <Card style={styles.card}>
        <Text style={styles.title} accessibilityRole="header">
          MedLog Terms and Conditions
        </Text>
        <Text style={styles.updated}>Last Updated: October 2026</Text>
        <Text style={styles.paragraph}>{TERMS_INTRO}</Text>
        {TERMS_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.heading}>{section.title}</Text>
            {section.paragraphs?.map((p) => (
              <Text key={p} style={styles.paragraph}>
                {p}
              </Text>
            ))}
            {section.bullets?.map((b) => (
              <View key={b} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={[styles.paragraph, styles.bulletText]}>{b}</Text>
              </View>
            ))}
            {section.after?.map((p) => (
              <Text key={p} style={styles.paragraph}>
                {p}
              </Text>
            ))}
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.xxl },
  title: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 28, color: colors.heading },
  updated: { fontFamily: fonts.medium, fontSize: 11, color: colors.muted, marginTop: spacing.xs, marginBottom: spacing.lg },
  section: { marginTop: spacing.lg },
  heading: { fontFamily: fonts.semibold, fontSize: 13, color: colors.heading, marginBottom: spacing.sm },
  paragraph: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: colors.textBody, marginBottom: spacing.sm },
  bulletRow: { flexDirection: "row", gap: spacing.sm, paddingLeft: spacing.lg },
  bullet: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: colors.textBody },
  bulletText: { flex: 1, marginBottom: 2 },
});
