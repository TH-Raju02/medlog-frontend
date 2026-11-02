import { useCallback, useState } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { Card } from "../../src/components/ui/Card";
import { Chip } from "../../src/components/ui/Chip";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Loader } from "../../src/components/ui/Loader";
import { PageTitle } from "../../src/components/ui/PageTitle";
import { SearchField } from "../../src/components/ui/SearchField";
import { PatientCard } from "../../src/components/shared/PatientCard";
import { patientsApi } from "../../src/services/api/medlogApi";
import { getErrorMessage } from "../../src/services/api/client";
import { Patient } from "../../src/types/api";
import { colors, spacing, typography } from "../../src/theme/tokens";

type Sort = "az" | "date";

export default function PatientsScreen() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("az");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const { data } = await patientsApi.list({
        search: search || undefined,
        page: 1,
        limit: 100,
        sort: sort === "az" ? "name" : "admission",
      });
      setPatients(data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, sort]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const sorted = patients;

  return (
    <Screen scroll refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      <PageTitle title="Patients" subtitle="All registered patients and their current admission status" />

      <Card style={styles.filters}>
        <SearchField value={search} onChangeText={setSearch} onSubmit={load} placeholder="Search by name or Civil ID" />
        <View style={styles.chips}>
          <Text style={styles.chipsLabel}>Sort by:</Text>
          <Chip label="A–Z" selected={sort === "az"} onPress={() => setSort("az")} />
          <Chip label="Admission Date" selected={sort === "date"} onPress={() => setSort("date")} />
        </View>
      </Card>

      {loading && patients.length === 0 ? (
        <Loader />
      ) : error ? (
        <EmptyState icon="alert-circle" title="Could not load patients" description={error} actionLabel="Retry" onAction={load} />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon="users"
          title="No patients yet"
          description="Start with a new admission."
          actionLabel="New Admission"
          onAction={() => router.push("/(tabs)/new-admission")}
        />
      ) : (
        sorted.map((item) => (
          <PatientCard key={item._id} patient={item} onPress={() => router.push(`/patients/${item._id}`)} />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { marginBottom: spacing.md, gap: spacing.md },
  chips: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.sm },
  chipsLabel: { ...typography.caption, color: colors.textBody },
});
