import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { Header } from "../../src/components/ui/Header";
import { SectionCard } from "../../src/components/ui/Card";
import { TextField } from "../../src/components/ui/TextField";
import { Button } from "../../src/components/ui/Button";
import { Loader } from "../../src/components/ui/Loader";
import {
  AllergyFields,
  PatientDraft,
  PatientDraftErrors,
  PatientProfileFields,
  draftFromPatient,
  emptyPatientDraft,
  patientPayload,
} from "../../src/features/patients/PatientProfileFields";
import { admissionsApi, patientsApi } from "../../src/services/api/medlogApi";
import { getErrorMessage } from "../../src/services/api/client";
import { useAuthStore } from "../../src/store/authStore";
import { useResponsive } from "../../src/hooks/useResponsive";
import { spacing } from "../../src/theme/tokens";

interface AdmissionDraft {
  ward: string;
  room: string;
  bed: string;
  chiefComplaint: string;
  diagnosis: string;
  medicalHistory: string;
}

const emptyAdmission: AdmissionDraft = {
  ward: "",
  room: "",
  bed: "",
  chiefComplaint: "",
  diagnosis: "",
  medicalHistory: "",
};

/** Figma "New Patient Profile": patient profile + admission details + allergy information. */
export default function NewAdmissionScreen() {
  const router = useRouter();
  const { isPhone } = useResponsive();
  const user = useAuthStore((s) => s.user);
  const { patientId, civilId } = useLocalSearchParams<{ patientId?: string; civilId?: string }>();
  const [patient, setPatient] = useState<PatientDraft>(emptyPatientDraft(civilId ?? ""));
  const [admission, setAdmission] = useState<AdmissionDraft>(emptyAdmission);
  const [patientErrors, setPatientErrors] = useState<PatientDraftErrors>({});
  const [admissionErrors, setAdmissionErrors] = useState<Partial<Record<keyof AdmissionDraft, string>>>({});
  const [loading, setLoading] = useState(!!patientId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    patientsApi
      .get(patientId)
      .then(({ data }) => setPatient(draftFromPatient(data.data)))
      .catch((err) => Alert.alert("Could not load patient", getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [patientId]);

  const setA = (key: keyof AdmissionDraft, value: string) => setAdmission((a) => ({ ...a, [key]: value }));

  const submit = async () => {
    const { payload, errors } = patientPayload(patient);
    const aErrors: typeof admissionErrors = {};
    if (!admission.chiefComplaint.trim()) aErrors.chiefComplaint = "Chief complaint is required";
    if (!admission.diagnosis.trim()) aErrors.diagnosis = "Diagnosis is required";
    if (!admission.medicalHistory.trim()) aErrors.medicalHistory = "Medical history is required";
    setPatientErrors(errors);
    setAdmissionErrors(aErrors);
    if (!payload || Object.keys(aErrors).length) {
      Alert.alert("Check the form", "Some required fields are missing or invalid.");
      return;
    }

    try {
      setSaving(true);
      const details = {
        ward: admission.ward.trim() || undefined,
        room: admission.room.trim() || undefined,
        bed: admission.bed.trim() || undefined,
        chiefComplaint: admission.chiefComplaint.trim(),
        diagnosis: admission.diagnosis.trim(),
        medicalHistory: admission.medicalHistory.trim(),
        specialty: user?.specialty,
        entryMode: "manual",
      };
      let created;
      if (patientId) {
        await patientsApi.update(patientId, payload);
        created = await admissionsApi.create({ ...details, patientId });
      } else {
        created = await admissionsApi.create({ ...details, patient: payload });
      }
      router.replace(`/admissions/${created.data.data._id}`);
    } catch (err) {
      Alert.alert("Could not create admission", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const subtitle = [patient.nationalId ? `Civil ID: ${patient.nationalId}` : null, user?.specialty]
    .filter(Boolean)
    .join(" · ");

  return (
    <Screen
      scroll
      header={<Header title={patientId ? "New Admission" : "New Patient Profile"} subtitle={subtitle} showBack />}
    >
      {loading ? (
        <Loader />
      ) : (
        <View style={styles.stack}>
          <SectionCard title="Profile Information" icon="user">
            <PatientProfileFields
              value={patient}
              onChange={setPatient}
              errors={patientErrors}
              civilIdLocked={!!patientId}
            />
          </SectionCard>

          <SectionCard title="Admission Details" icon="user">
            <View style={styles.row}>
              <TextField label="Ward" placeholder="e.g. Ward 3" value={admission.ward} onChangeText={(v) => setA("ward", v)} containerStyle={styles.cell} />
              <TextField label="Room" placeholder="e.g. R404" value={admission.room} onChangeText={(v) => setA("room", v)} containerStyle={styles.cell} />
              <TextField label="Bed" placeholder="e.g. 01" value={admission.bed} onChangeText={(v) => setA("bed", v)} containerStyle={styles.cell} />
            </View>
            <TextField
              label="Chief Complaint"
              required
              multiline
              placeholder="Enter chief complaint"
              value={admission.chiefComplaint}
              onChangeText={(v) => setA("chiefComplaint", v)}
              error={admissionErrors.chiefComplaint}
            />
            <TextField
              label="Diagnosis"
              required
              multiline
              placeholder="Enter diagnosis"
              value={admission.diagnosis}
              onChangeText={(v) => setA("diagnosis", v)}
              error={admissionErrors.diagnosis}
            />
            <TextField
              label="Medical History"
              required
              multiline
              placeholder="Enter medical history"
              value={admission.medicalHistory}
              onChangeText={(v) => setA("medicalHistory", v)}
              error={admissionErrors.medicalHistory}
              containerStyle={isPhone ? undefined : styles.lastField}
            />
          </SectionCard>

          <SectionCard title="Allergy Information" icon="activity">
            <AllergyFields value={patient} onChange={setPatient} errors={patientErrors} />
          </SectionCard>

          <Button
            title={patientId ? "Create Admission" : "Create Profile & Admission"}
            icon="check-circle"
            onPress={submit}
            loading={saving}
            style={styles.submit}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  row: { flexDirection: "row", gap: spacing.md },
  cell: { flex: 1, minWidth: 0 },
  lastField: { marginBottom: 0 },
  submit: { minHeight: 48 },
});
