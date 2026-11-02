import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, spacing, typography } from "../../theme/tokens";

export function ItemRow({ title, lines, first }: { title: string; lines: string[]; first?: boolean }) {
  return (
    <View style={[styles.row, !first && styles.divider]}>
      <Text style={styles.title}>{title}</Text>
      {lines.filter(Boolean).map((line) => (
        <Text key={line} style={typography.caption}>
          {line}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: spacing.md, gap: 2 },
  divider: { borderTopWidth: 1, borderTopColor: colors.divider },
  title: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
});
