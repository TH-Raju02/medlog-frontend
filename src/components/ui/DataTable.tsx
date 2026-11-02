import { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useResponsive } from "../../hooks/useResponsive";
import { colors, fonts, radius, spacing } from "../../theme/tokens";

export interface Column<T> {
  key: string;
  label: string;
  flex?: number;
  render: (row: T) => ReactNode;
  align?: "left" | "center" | "right";
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  keyOf: (row: T) => string;
  emptyText?: string;
  /** Uppercase, letter-spaced header used by the profile/admission tables. */
  caps?: boolean;
  /** Draws the table inside its own rounded border (workspace tables). */
  framed?: boolean;
  footer?: ReactNode;
}

const MIN_COLUMN_WIDTH = 110;

export function DataTable<T>({ columns, rows, keyOf, emptyText, caps, framed = true, footer }: Props<T>) {
  const { isPhone, width } = useResponsive();
  const minWidth = columns.length * MIN_COLUMN_WIDTH;
  const scrollable = isPhone || width < minWidth + 64;

  const table = (
    <View style={[framed && styles.frame, scrollable && { minWidth }]}>
      <View style={[styles.headerRow, caps && styles.headerCaps]}>
        {columns.map((c) => (
          <Text
            key={c.key}
            style={[styles.headerText, caps && styles.capsText, { flex: c.flex ?? 1, textAlign: c.align ?? "left" }]}
            numberOfLines={1}
          >
            {caps ? c.label.toUpperCase() : c.label}
          </Text>
        ))}
      </View>
      {rows.length === 0 && emptyText ? (
        <Text style={styles.empty}>{emptyText}</Text>
      ) : (
        rows.map((row, i) => (
          <View key={keyOf(row)} style={[styles.row, i > 0 && styles.rowDivider]}>
            {columns.map((c) => {
              const content = c.render(row);
              return (
                <View key={c.key} style={[styles.cell, { flex: c.flex ?? 1, alignItems: alignOf(c.align) }]}>
                  {typeof content === "string" || typeof content === "number" ? (
                    <Text style={styles.cellText} numberOfLines={2}>
                      {content === "" ? "—" : content}
                    </Text>
                  ) : (
                    content
                  )}
                </View>
              );
            })}
          </View>
        ))
      )}
      {footer}
    </View>
  );

  if (!scrollable) return table;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {table}
    </ScrollView>
  );
}

const alignOf = (align?: "left" | "center" | "right") =>
  align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  frame: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surface,
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 38,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.tileBg,
  },
  headerCaps: { minHeight: 44, backgroundColor: colors.tableHeaderBg },
  headerText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.tableHeaderText,
    paddingRight: spacing.sm,
  },
  capsText: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.5 },
  row: { flexDirection: "row", alignItems: "center", minHeight: 48, paddingHorizontal: spacing.md },
  rowDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
  cell: { paddingRight: spacing.sm, paddingVertical: spacing.sm, justifyContent: "center" },
  cellText: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.text },
  empty: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.textBody,
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
});
