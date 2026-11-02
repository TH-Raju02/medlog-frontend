import { ComponentProps, ReactNode } from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radius, shadows, spacing, typography } from "../../theme/tokens";

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
  padded?: boolean;
}

export function Card({ children, style, onPress, accessibilityLabel, padded = true }: CardProps) {
  const cardStyle = [styles.card, padded ? styles.padded : null, style];
  if (!onPress) return <View style={cardStyle}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [...cardStyle, pressed ? styles.pressed : null]}
    >
      {children}
    </Pressable>
  );
}

interface SectionCardProps {
  title: string;
  icon?: ComponentProps<typeof Feather>["name"];
  right?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Form/detail section: icon + title, divider, then content (Figma "Profile Information"). */
export function SectionCard({ title, icon, right, children, style }: SectionCardProps) {
  return (
    <Card style={style}>
      <View style={styles.sectionHeader}>
        {icon ? <Feather name={icon} size={16} color={colors.iconTile} /> : null}
        <Text style={[typography.cardTitle, styles.sectionTitle]} numberOfLines={1}>
          {title}
        </Text>
        {right}
      </View>
      <View style={styles.divider} />
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  padded: { padding: spacing.lg },
  pressed: { backgroundColor: colors.iconButtonBg },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  sectionTitle: { flex: 1 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },
});
