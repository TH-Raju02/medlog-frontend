import { Pressable, StyleSheet, Text } from "react-native";
import { colors, fonts, radius } from "../../theme/tokens";

interface Props {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      hitSlop={6}
      style={[styles.chip, selected ? styles.selected : null]}
    >
      <Text style={[styles.text, selected ? styles.selectedText : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 28,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    backgroundColor: colors.surface,
    justifyContent: "center",
  },
  selected: { backgroundColor: colors.chipSelectedBg, borderColor: colors.accent },
  text: { fontFamily: fonts.medium, fontSize: 12, color: colors.chipText },
  selectedText: { color: colors.brand },
});
