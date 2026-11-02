import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../../theme/tokens";

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <View
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <Text style={[styles.text, { fontSize: size * 0.36 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { backgroundColor: colors.avatarBg, alignItems: "center", justifyContent: "center" },
  text: { color: colors.avatarText, fontFamily: fonts.semibold },
});
