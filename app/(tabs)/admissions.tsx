import { useCallback, useState } from "react";
import { RefreshControl, StyleSheet, Text } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { Card } from "../../src/components/ui/Card";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Loader } from "../../src/components/ui/Loader";
import { AdmissionsTable } from "../../src/components/shared/AdmissionsTable";
import { admissionsApi } from "../../src/services/api/medlogApi";
import { getErrorMessage } from "../../src/services/api/client";
import { Admission } from "../../src/types/api";
import { colors, fonts, spacing } from "../../src/theme/tokens";

export default function CurrentAdmissionsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const { data } = await admissionsApi.list({ status: "active", limit: 100 });
      setItems(data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <Screen scroll refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      <Text style={styles.title} accessibilityRole="header">
        Current Admissions
      </Text>

      <Card padded={false} style={styles.tableCard}>
        {loading && items.length === 0 ? (
          <Loader />
        ) : error ? (
          <EmptyState icon="alert-circle" title="Could not load admissions" description={error} actionLabel="Retry" onAction={load} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="plus-square"
            title="No current admissions"
            description="Newly assigned patients will appear here."
            actionLabel="New Admission"
            onAction={() => router.push("/(tabs)/new-admission")}
          />
        ) : (
          <AdmissionsTable admissions={items} onOpen={(a) => router.push(`/admissions/${a._id}`)} />
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, color: colors.heading, marginBottom: spacing.md },
  tableCard: { overflow: "hidden" },
});
