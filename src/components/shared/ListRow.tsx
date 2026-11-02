import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, radius, spacing, typography } from "../../theme/tokens";

interface Props {
  title: string;
  caption?: string;
  icon: ComponentProps<typeof Feather>["name"];
  onPress: () => void;
  first?: boolean;
}

export function ListRow({ title, caption, icon, onPress, first }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.row, !first && styles.divider, pressed && styles.pressed]}
    >
      <View style={styles.tile}>
        <Feather name={icon} size={16} color={colors.iconTile} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {caption ? <Text style={typography.caption}>{caption}</Text> : null}
      </View>
      <Feather name="chevron-right" size={16} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 64,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  divider: { borderTopWidth: 1, borderTopColor: colors.divider },
  pressed: { backgroundColor: colors.iconButtonBg },
  tile: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.iconTileBg,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, minWidth: 0 },
  title: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20, color: colors.text },
});
