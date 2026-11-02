import { useCallback, useState } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { Header } from "../../src/components/ui/Header";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { DataTable } from "../../src/components/ui/DataTable";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Loader } from "../../src/components/ui/Loader";
import { AssessmentTiles, PatientSummaryCard } from "../../src/features/patients/PatientSummaryCard";
import { MedicationTable } from "../../src/features/clinical/MedicationTable";
import { admissionsApi, medicationsApi, patientsApi } from "../../src/services/api/medlogApi";
import { getErrorMessage } from "../../src/services/api/client";
import { useResponsive } from "../../src/hooks/useResponsive";
import { Admission, HospitalMedication, Patient } from "../../src/types/api";
import { formatDate } from "../../src/utils/format";
import { colors, fonts, spacing } from "../../src/theme/tokens";

export default function PatientProfileScreen() {
  const router = useRouter();
  const { isPhone } = useResponsive();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [hospitalMeds, setHospitalMeds] = useState<HospitalMedication[]>([]);
  const [dischargeMeds, setDischargeMeds] = useState<HospitalMedication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      setLoading(true);
      const [p, a, h, d] = await Promise.all([
        patientsApi.get(id),
        admissionsApi.list({ patientId: id, limit: 50 }),
        medicationsApi.list({ patientId: id, category: "hospital" }),
        medicationsApi.list({ patientId: id, category: "discharge" }),
      ]);
      setPatient(p.data.data);
      setAdmissions(a.data.data);
      setHospitalMeds(h.data.data);
      setDischargeMeds(d.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const active = admissions.find((a) => a.status === "active");
  const lastDischarged = admissions.find((a) => a.status === "discharged" && a.dischargeSummary);

  const header = (
    <Header
      title="Patient Profile"
      subtitle="Clinical overview and admission history"
      showBack
      right={
        patient ? (
          active ? (
            <Button
              title="Open admission"
              icon="clipboard"
              onPress={() => router.push(`/admissions/${active._id}`)}
              style={styles.headerBtn}
            />
          ) : (
            <Button
              title="Admit again"
              icon="plus"
              onPress={() => router.push({ pathname: "/admissions/new", params: { patientId: patient._id } })}
              style={styles.headerBtn}
            />
          )
        ) : null
      }
    />
  );

  if (loading && !patient) {
    return (
      <Screen header={header}>
        <Loader />
      </Screen>
    );
  }

  if (error || !patient) {
    return (
      <Screen header={header}>
        <EmptyState icon="alert-circle" title="Could not load patient" description={error ?? undefined} actionLabel="Retry" onAction={load} />
      </Screen>
    );
  }

  return (
    <Screen scroll header={header} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      <View style={styles.stack}>
        <PatientSummaryCard patient={patient} />

        <View style={isPhone ? styles.stack : styles.row}>
          <AssessmentTiles
            title="Physical assessment"
            compact
            tiles={[
              { label: "Smoking", value: patient.smoker },
              { label: "Alcohol", value: patient.alcohol },
              { label: "Rec. Drugs", value: patient.recreationalDrugs },
            ]}
          />
          <AssessmentTiles
            title="Lines / Tubes"
            compact
            tiles={[
              { label: "Catheter", value: patient.catheter },
              { label: "NGT", value: patient.ngt },
              { label: "PEG Tube", value: patient.pegTube },
            ]}
          />
        </View>

        <Card padded={false} style={styles.tableCard}>
          <Text style={[styles.cardTitle, styles.padded]}>Admissions</Text>
          <DataTable
            caps
            framed={false}
            columns={[
              { key: "diagnosis", label: "Diagnosis", render: (a: Admission) => a.diagnosis || a.specialty || "—" },
              { key: "admitted", label: "Admission Date", render: (a: Admission) => formatDate(a.admissionDate) },
              {
                key: "discharged",
                label: "Discharge Date",
                render: (a: Admission) => (a.dischargedAt ? formatDate(a.dischargedAt) : a.status === "active" ? "Current" : "—"),
              },
            ]}
            rows={admissions}
            keyOf={(a) => a._id}
            emptyText="No admissions recorded"
          />
        </Card>

        <Card>
          <Text style={[styles.cardTitle, styles.titleGap]}>Hospital Medication</Text>
          <MedicationTable rows={hospitalMeds} emptyText="No hospital medications recorded" />
        </Card>

        <Card>
          <Text style={[styles.cardTitle, styles.titleGap]}>Discharge Medications</Text>
          <MedicationTable rows={dischargeMeds} emptyText="No discharge medications recorded" />
        </Card>

        <Card>
          <Text style={[styles.cardTitle, styles.titleGap]}>Discharge Summary *</Text>
          <Text style={styles.body}>{lastDischarged?.dischargeSummary || "No discharge summary yet."}</Text>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  row: { flexDirection: "row", gap: spacing.md },
  headerBtn: { minHeight: 38 },
  tableCard: { overflow: "hidden" },
  padded: { padding: spacing.lg },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.heading },
  titleGap: { marginBottom: spacing.md },
  body: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textBody },
});
