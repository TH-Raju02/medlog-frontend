import { ComponentProps, ReactNode, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card } from "../../components/ui/Card";
import { longDay } from "../../utils/dates";
import { colors, fonts, radius, spacing } from "../../theme/tokens";

export function WorkspaceCard({
  title,
  action,
  children,
  titleSize = 14,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  titleSize?: number;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: titleSize }]}>{title}</Text>
        {action}
      </View>
      {children}
    </Card>
  );
}

/** Small light-blue header action ("Edit", "+ Add Medication"). */
export function HeaderAction({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: ComponentProps<typeof Feather>["name"];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
    >
      <Feather name={icon} size={12} color={colors.softActionText} />
      <Text style={styles.headerActionText}>{label}</Text>
    </Pressable>
  );
}

/** Square edit / delete buttons used in table "Actions" columns. */
export function RowActions({ onEdit, onDelete, label }: { onEdit?: () => void; onDelete?: () => void; label: string }) {
  return (
    <View style={styles.rowActions}>
      {onEdit ? (
        <Pressable onPress={onEdit} accessibilityRole="button" accessibilityLabel={`Edit ${label}`} style={styles.iconBtn}>
          <Feather name="edit-2" size={12} color={colors.softActionText} />
        </Pressable>
      ) : null}
      {onDelete ? (
        <Pressable
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${label}`}
          style={[styles.iconBtn, styles.iconBtnDanger]}
        >
          <Feather name="trash-2" size={12} color={colors.danger} />
        </Pressable>
      ) : null}
    </View>
  );
}

/** Full-width light bar with a plus icon ("⊕ Plans / Recommendations", "⊕ Add Row"). */
export function AddBar({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.addBar, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Feather name="plus-circle" size={14} color={colors.softActionText} />
      <Text style={styles.addBarText}>{label}</Text>
    </Pressable>
  );
}

/** Items grouped under "22 October 2026  2 Recommendations" headings with a collapse chevron. */
export function DateGroups<T>({
  items,
  dateOf,
  noun,
  render,
  emptyText,
}: {
  items: T[];
  dateOf: (item: T) => string;
  noun: string;
  render: (item: T) => ReactNode;
  emptyText: string;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = longDay(dateOf(item));
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  if (groups.size === 0) return <Text style={styles.empty}>{emptyText}</Text>;
  return (
    <View style={styles.groups}>
      {[...groups.entries()].map(([day, list]) => {
        const isCollapsed = collapsed[day];
        return (
          <View key={day} style={styles.group}>
            <Pressable
              onPress={() => setCollapsed((c) => ({ ...c, [day]: !c[day] }))}
              accessibilityRole="button"
              accessibilityLabel={`${day}, ${list.length} ${noun}. ${isCollapsed ? "Expand" : "Collapse"}`}
              style={styles.groupHeader}
            >
              <Text style={styles.groupDay}>{day}</Text>
              <Text style={styles.groupCount}>
                {list.length} {noun}
              </Text>
              <Feather name={isCollapsed ? "chevron-up" : "chevron-down"} size={16} color={colors.heading} />
            </Pressable>
            {isCollapsed ? null : list.map((item) => render(item))}
          </View>
        );
      })}
    </View>
  );
}

export function ItemCard({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.itemCard}>
      <View style={styles.itemBody}>{children}</View>
      {right}
    </View>
  );
}

export function SubHeading({ children }: { children: string }) {
  return <Text style={styles.subHeading}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: { padding: spacing.md },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md, minHeight: 28 },
  title: { flex: 1, fontFamily: fonts.semibold, color: colors.heading },
  headerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 32,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.softActionBg,
  },
  headerActionText: { fontFamily: fonts.medium, fontSize: 12, color: colors.softActionText },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
  rowActions: { flexDirection: "row", gap: spacing.sm },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: radius.md,
    backgroundColor: colors.softActionBg,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnDanger: { backgroundColor: colors.dangerSoftBg },
  addBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: 40,
    borderRadius: radius.md,
    backgroundColor: colors.softActionBg,
    marginTop: spacing.sm,
  },
  addBarText: { fontFamily: fonts.medium, fontSize: 12, color: colors.softActionText },
  empty: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, paddingVertical: spacing.sm },
  groups: { gap: spacing.md },
  group: { gap: spacing.sm },
  groupHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: 32 },
  groupDay: { fontFamily: fonts.semibold, fontSize: 14, color: colors.heading },
  groupCount: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  itemBody: { flex: 1, minWidth: 0, gap: 4 },
  subHeading: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 0.5,
    color: colors.tableHeaderText,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
});
