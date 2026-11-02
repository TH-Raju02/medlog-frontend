import { useCallback, useMemo, useState } from "react";
import { Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Screen } from "../../src/components/ui/Screen";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Loader } from "../../src/components/ui/Loader";
import { OptionsDialog } from "../../src/components/ui/SelectField";
import { MetricCard } from "../../src/components/shared/MetricCard";
import { AdmissionsTable } from "../../src/components/shared/AdmissionsTable";
import { RemindersCard } from "../../src/features/dashboard/RemindersCard";
import { dashboardApi } from "../../src/services/api/medlogApi";
import { getErrorMessage } from "../../src/services/api/client";
import { DashboardMetrics } from "../../src/types/api";
import { useResponsive } from "../../src/hooks/useResponsive";
import { formatDate } from "../../src/utils/format";
import { monthKey, monthLabel } from "../../src/utils/dates";
import { colors, fonts, radius, spacing, typography } from "../../src/theme/tokens";

const lastTwelveMonths = () => {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const key = monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1));
    return { value: key, label: monthLabel(key) };
  });
};

export default function DashboardScreen() {
  const router = useRouter();
  const { isWide } = useResponsive();
  const months = useMemo(lastTwelveMonths, []);
  const [month, setMonth] = useState(months[0].value);
  const [monthOpen, setMonthOpen] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const { data } = await dashboardApi.metrics(month);
      setMetrics(data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [month]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading && !metrics && !error) return <Loader />;

  const current = metrics?.currentAdmissions ?? [];

  const metricsColumn = (
    <View>
      <View style={styles.metricsHeader}>
        <Text style={typography.sectionTitle}>Key Metrics</Text>
        <Pressable
          onPress={() => setMonthOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Month: ${monthLabel(month)}. Change`}
          style={styles.monthPill}
        >
          <Text style={styles.monthText}>{monthLabel(month)}</Text>
          <Feather name="chevron-down" size={13} color={colors.textBody} />
        </Pressable>
      </View>
      <View style={styles.tiles}>
        <MetricCard tone="teal" icon="plus-square" label="Medication Reconciliation" value={metrics?.medicationReconciliation ?? 0} />
        <MetricCard tone="red" icon="user" label="Drug Therapy Problems" value={metrics?.drugTherapyProblems ?? 0} />
        <MetricCard tone="brown" icon="user" label="Discharge Counseling" value={metrics?.dischargeCounseling ?? 0} />
        <MetricCard tone="green" icon="clipboard" label="Cases this month" value={metrics?.casesThisMonth ?? 0} />
      </View>
      <Text style={styles.totalsCaption}>
        Monthly totals · {metrics?.monthEnd ? formatDate(metrics.monthEnd) : "—"}
      </Text>

      <Text style={[typography.sectionTitle, styles.quickTitle]}>Quick Actions</Text>
      <Pressable
        onPress={() => router.push("/protocols")}
        accessibilityRole="button"
        style={({ pressed }) => [styles.quickAction, pressed && styles.quickPressed]}
      >
        <Text style={styles.quickText}>Protocol and References</Text>
      </Pressable>
    </View>
  );

  return (
    <Screen scroll refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      {error ? (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" variant="secondary" onPress={load} style={styles.smallBtn} />
        </Card>
      ) : null}

      {isWide ? (
        <View style={styles.topRow}>
          <View style={styles.leftCol}>
            <RemindersCard />
          </View>
          <View style={styles.rightCol}>{metricsColumn}</View>
        </View>
      ) : (
        <View style={styles.stack}>
          <RemindersCard />
          {metricsColumn}
        </View>
      )}

      <Card padded={false} style={styles.tableCard}>
        <View style={styles.cardHeader}>
          <Text style={[typography.cardTitle, styles.flex, { color: colors.brandSection }]}>Current admissions</Text>
          <Button
            title="View all"
            variant="secondary"
            icon="chevron-right"
            iconPosition="right"
            onPress={() => router.push("/(tabs)/admissions")}
            style={styles.smallBtn}
          />
        </View>
        {current.length === 0 ? (
          <EmptyState
            icon="plus-square"
            title="No current admissions"
            description="Newly assigned patients will appear here."
          />
        ) : (
          <AdmissionsTable admissions={current.slice(0, 8)} onOpen={(a) => router.push(`/admissions/${a._id}`)} />
        )}
      </Card>

      <OptionsDialog
        visible={monthOpen}
        title="Select Month"
        subtitle="Key metrics are totalled for the selected month."
        options={months}
        value={month}
        onSelect={setMonth}
        onClose={() => setMonthOpen(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  topRow: { flexDirection: "row", gap: spacing.lg, marginBottom: spacing.lg, alignItems: "stretch" },
  leftCol: { flex: 2 },
  rightCol: { flex: 1, minWidth: 280 },
  stack: { gap: spacing.lg, marginBottom: spacing.lg },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg },
  smallBtn: { minHeight: 36, paddingHorizontal: spacing.md },
  metricsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  monthPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 32,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  monthText: { fontFamily: fonts.medium, fontSize: 12, color: colors.textBody },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  totalsCaption: { ...typography.caption, fontSize: 10, textAlign: "right", marginTop: spacing.sm },
  quickTitle: { marginTop: spacing.sm, marginBottom: spacing.sm },
  quickAction: {
    minHeight: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.quickActionBorder,
    backgroundColor: colors.quickActionBg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  quickPressed: { opacity: 0.85 },
  quickText: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary },
  tableCard: { overflow: "hidden" },
  errorCard: { marginBottom: spacing.lg, flexDirection: "row", alignItems: "center", gap: spacing.md },
  errorText: { ...typography.body, color: colors.danger, flex: 1 },
});
