import { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, radius, spacing } from "../../theme/tokens";
import { Button } from "./Button";

interface Props {
  title: string;
  description?: string;
  icon?: ComponentProps<typeof Feather>["name"];
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, icon = "inbox", actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <View style={styles.tile}>
        <Feather name={icon} size={20} color={colors.emptyTileIcon} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} style={styles.btn} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingVertical: spacing.xxxl, paddingHorizontal: spacing.lg },
  tile: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.emptyTileBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20, color: colors.emptyTitle, textAlign: "center" },
  description: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.emptyText,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  btn: { marginTop: spacing.xl, minWidth: 180 },
});
