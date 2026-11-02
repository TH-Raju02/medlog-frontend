import { ComponentRef, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, fonts, radius, spacing } from "../../theme/tokens";

interface Props {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  onComplete?: (value: string) => void;
  error?: boolean;
}

/** Four separate digit boxes backed by one hidden input, so paste and autofill still work. */
export function OtpInput({ value, onChange, length = 4, onComplete, error }: Props) {
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(false);

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, length);
    onChange(digits);
    if (digits.length === length) onComplete?.(digits);
  };

  return (
    <Pressable
      onPress={() => input.current?.focus()}
      accessibilityRole="none"
      style={styles.row}
    >
      {Array.from({ length }).map((_, i) => {
        const char = value[i];
        const active = focused && i === Math.min(value.length, length - 1);
        return (
          <View key={i} style={[styles.box, active && styles.boxActive, error && styles.boxError]}>
            <Text style={[styles.digit, !char && styles.placeholder]}>{char ?? "•"}</Text>
          </View>
        );
      })}
      <TextInput
        ref={input}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={`Verification code, ${length} digits`}
        style={styles.hidden}
        caretHidden
        autoFocus
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm },
  box: {
    flex: 1,
    height: 52,
    borderRadius: radius.xl,
    backgroundColor: colors.authInputBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  boxActive: { borderColor: colors.primary },
  boxError: { borderColor: colors.danger },
  digit: { fontFamily: fonts.semibold, fontSize: 18, color: colors.muted },
  placeholder: { color: colors.mutedLight, fontSize: 14 },
  hidden: { position: "absolute", width: "100%", height: "100%", opacity: 0.01 },
});
