import { ActivityIndicator, StyleSheet, View } from "react-native";
import { colors } from "../../theme/tokens";

export function Loader() {
  return (
    <View style={styles.wrap} accessibilityRole="progressbar" accessibilityLabel="Loading">
      <ActivityIndicator size="small" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
