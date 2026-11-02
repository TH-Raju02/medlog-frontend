import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { spacing, typography } from "../../theme/tokens";

export function PageTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={typography.pageTitle} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? <Text style={typography.pageSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  text: { flex: 1, minWidth: 200 },
});
