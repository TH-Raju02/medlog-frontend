import { StyleSheet, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, radius, spacing } from "../../theme/tokens";

interface Props {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  onSubmit?: () => void;
}

export function SearchField({ value, onChangeText, placeholder, onSubmit }: Props) {
  return (
    <View style={styles.wrap}>
      <Feather name="search" size={14} color={colors.placeholder} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        accessibilityLabel={placeholder}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.searchBg,
  },
  input: { flex: 1, minWidth: 0, fontFamily: fonts.regular, fontSize: 13, color: colors.text, paddingVertical: 8 },
});
