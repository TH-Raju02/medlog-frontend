import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { FormModal } from "../../components/ui/FormModal";
import { TextField } from "../../components/ui/TextField";
import { Checkbox } from "../../components/ui/Checkbox";
import { YesNoToggle } from "../../components/ui/YesNoToggle";
import { AddBar } from "./parts";
import {
  AllergyFields,
  PatientDraft,
  PatientDraftErrors,
  PatientProfileFields,
  draftFromPatient,
  patientPayload,
} from "../patients/PatientProfileFields";
import { admissionsApi, patientsApi, recommendationsApi, usersApi } from "../../services/api/medlogApi";
import { getErrorMessage } from "../../services/api/client";
import { DtpCategory, HospitalMedication, Patient, Recommendation, UserSummary } from "../../types/api";
import { parseDayInput, toDayInput } from "../../utils/dates";
import { colors, fonts, radius, spacing, typography } from "../../theme/tokens";

const DTP: { value: DtpCategory; label: string }[] = [
  { value: "indication", label: "Indication" },
  { value: "effectiveness", label: "Effectiveness" },
  { value: "safety", label: "Safety" },
  { value: "adherence", label: "Adherence" },
  { value: "none", label: "None" },
];

export const dtpLabel = (dtp: DtpCategory) => DTP.find((d) => d.value === dtp)?.label ?? dtp;

interface PlanDraft {
  id?: string;
  text: string;
  dtp: DtpCategory;
}

/** Add (several at once) or edit Plans / Recommendations with their Drug Therapy Problem. */
export function PlansModal({
  visible,
  admissionId,
  editing,
  onClose,
  onSaved,
}: {
  visible: boolean;
  admissionId: string;
  editing?: Recommendation | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [drafts, setDrafts] = useState<PlanDraft[]>([]);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setError(undefined);
    setDrafts(editing ? [{ id: editing._id, text: editing.text, dtp: editing.dtp }] : [{ text: "", dtp: "none" }]);
  }, [visible, editing]);

  const update = (i: number, patch: Partial<PlanDraft>) =>
    setDrafts((list) => list.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));

  const remove = async (i: number) => {
    const draft = drafts[i];
    if (draft.id) {
      try {
        await recommendationsApi.remove(draft.id);
        onSaved();
        onClose();
      } catch (err) {
        Alert.alert("Could not delete", getErrorMessage(err));
      }
      return;
    }
    setDrafts((list) => list.filter((_, idx) => idx !== i));
  };

  const save = async () => {
    const valid = drafts.filter((d) => d.text.trim());
    if (valid.length === 0 || valid.length !== drafts.length) {
      setError("Each recommendation needs a plan / recommendation text.");
      return;
    }
    try {
      setSaving(true);
      if (editing && valid[0].id) {
        await recommendationsApi.update(valid[0].id, { text: valid[0].text.trim(), dtp: valid[0].dtp });
      } else {
        await recommendationsApi.bulk(
          admissionId,
          valid.map((d) => ({ text: d.text.trim(), dtp: d.dtp }))
        );
      }
      onSaved();
      onClose();
    } catch (err) {
      Alert.alert("Could not save recommendations", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal
      visible={visible}
      title={editing ? "Edit Plan / Recommendation" : "Add Plan / Recommendation"}
      onClose={onClose}
      submitLabel="Save Recommendations"
      onSubmit={save}
      submitting={saving}
    >
      {drafts.map((d, i) => (
        <View key={i} style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planTitle}>Recommendation {String(i + 1).padStart(2, "0")}</Text>
            {drafts.length > 1 || d.id ? (
              <Pressable
                onPress={() => remove(i)}
                accessibilityRole="button"
                accessibilityLabel={`Remove recommendation ${i + 1}`}
                style={styles.trash}
              >
                <Feather name="trash-2" size={13} color={colors.danger} />
              </Pressable>
            ) : null}
          </View>
          <Text style={[typography.label, styles.gap]}>Drug Therapy Problem (DTP)</Text>
          <View style={styles.chips}>
            {DTP.map((option) => {
              const active = d.dtp === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => update(i, { dtp: option.value })}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <TextField
            label="Plan / Recommendation"
            required
            multiline
            placeholder="e.g. Review renal function and medication doses."
            value={d.text}
            onChangeText={(text) => update(i, { text })}
            containerStyle={styles.noMargin}
          />
        </View>
      ))}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {editing ? null : (
        <AddBar label="Add Another Recommendation" onPress={() => setDrafts((l) => [...l, { text: "", dtp: "none" }])} />
      )}
    </FormModal>
  );
}

/** Edits a set of Yes/No flags (Life Assessment, Lines / Tubes). */
export function ToggleModal({
  visible,
  title,
  items,
  onClose,
  onSave,
}: {
  visible: boolean;
  title: string;
  items: { key: string; label: string; value: boolean }[];
  onClose: () => void;
  onSave: (values: Record<string, boolean>) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) setValues(Object.fromEntries(items.map((i) => [i.key, i.value])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <FormModal
      visible={visible}
      title={title}
      subtitle="Update clinical information and save your changes."
      onClose={onClose}
      submitLabel="Save Changes"
      submitting={saving}
      onSubmit={async () => {
        try {
          setSaving(true);
          await onSave(values);
        } finally {
          setSaving(false);
        }
      }}
      maxWidth={560}
    >
      <View style={styles.toggleList}>
        {items.map((item) => (
          <View key={item.key} style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{item.label}</Text>
            <YesNoToggle
              compact
              value={!!values[item.key]}
              onChange={(v) => setValues((s) => ({ ...s, [item.key]: v }))}
              style={styles.toggle}
            />
          </View>
        ))}
      </View>
    </FormModal>
  );
}

/** Edit the patient's profile, lifestyle flags and allergies from the workspace. */
export function PatientEditModal({
  visible,
  patient,
  onClose,
  onSaved,
}: {
  visible: boolean;
  patient: Patient;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<PatientDraft>(draftFromPatient(patient));
  const [errors, setErrors] = useState<PatientDraftErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setDraft(draftFromPatient(patient));
      setErrors({});
    }
  }, [visible, patient]);

  const save = async () => {
    const { payload, errors: next } = patientPayload(draft);
    setErrors(next);
    if (!payload) return;
    try {
      setSaving(true);
      await patientsApi.update(patient._id, payload);
      onSaved();
      onClose();
    } catch (err) {
      Alert.alert("Could not update patient", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal
      visible={visible}
      title="Edit Patient Profile"
      subtitle="Update the patient's details. Changes apply to every admission."
      onClose={onClose}
      submitLabel="Save Changes"
      onSubmit={save}
      submitting={saving}
    >
      <PatientProfileFields value={draft} onChange={setDraft} errors={errors} showBloodType />
      <AllergyFields value={draft} onChange={setDraft} errors={errors} />
    </FormModal>
  );
}

interface MedRow {
  name: string;
  dose: string;
  route: string;
  frequency: string;
  notes: string;
  start: string;
  end: string;
}

const toRow = (m?: HospitalMedication): MedRow => ({
  name: m?.name ?? "",
  dose: m?.dose ?? "",
  route: m?.route ?? "",
  frequency: m?.frequency ?? "",
  notes: m?.notes ?? "",
  start: toDayInput(m?.startDate),
  end: toDayInput(m?.endDate),
});

const MED_COLUMNS: { key: keyof MedRow; label: string }[] = [
  { key: "name", label: "Drug" },
  { key: "dose", label: "Dose" },
  { key: "route", label: "Route" },
  { key: "frequency", label: "Frequency" },
  { key: "notes", label: "Comment" },
  { key: "start", label: "Start" },
  { key: "end", label: "End" },
];

/** Figma "Discharge Patient": discharge medications, summary and counseling confirmation. */
export function DischargeModal({
  visible,
  admissionId,
  currentMeds,
  onClose,
  onDischarged,
}: {
  visible: boolean;
  admissionId: string;
  currentMeds: HospitalMedication[];
  onClose: () => void;
  onDischarged: () => void;
}) {
  const [rows, setRows] = useState<MedRow[]>([]);
  const [summary, setSummary] = useState("");
  const [counseling, setCounseling] = useState(false);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setRows(currentMeds.length ? currentMeds.map(toRow) : [toRow()]);
    setSummary("");
    setCounseling(false);
    setError(undefined);
  }, [visible, currentMeds]);

  const confirm = async () => {
    if (!summary.trim()) {
      setError("Discharge summary is required.");
      return;
    }
    const filled = rows.filter((r) => r.name.trim());
    for (const r of filled) {
      if ((r.start && !parseDayInput(r.start)) || (r.end && !parseDayInput(r.end))) {
        setError(`Check the dates for ${r.name} (dd/mm/yyyy).`);
        return;
      }
    }
    try {
      setSaving(true);
      await admissionsApi.discharge(admissionId, {
        summary: summary.trim(),
        counselingCompleted: counseling,
        medications: filled.map((r) => ({
          name: r.name.trim(),
          dose: r.dose.trim() || undefined,
          route: r.route.trim() || undefined,
          frequency: r.frequency.trim() || undefined,
          notes: r.notes.trim() || undefined,
          startDate: r.start ? parseDayInput(r.start)?.toISOString() : undefined,
          endDate: r.end ? parseDayInput(r.end)?.toISOString() : undefined,
        })),
      });
      onDischarged();
      onClose();
    } catch (err) {
      Alert.alert("Could not discharge patient", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal
      visible={visible}
      title="Discharge Patient"
      subtitle="Archive this active admission and save the permanent clinical discharge summary."
      onClose={onClose}
      submitLabel="Confirm Discharge"
      onSubmit={confirm}
      submitting={saving}
    >
      <Text style={[styles.sectionLabel]}>Current Hospital /Discharge Medications</Text>
      <View style={styles.grid}>
        <View style={styles.gridHeader}>
          {MED_COLUMNS.map((c) => (
            <Text key={c.key} style={styles.gridHeadText}>
              {c.label}
            </Text>
          ))}
          <Text style={[styles.gridHeadText, styles.actionsHead]}>Actions</Text>
        </View>
        {rows.map((row, i) => (
          <View key={i} style={styles.gridRow}>
            {MED_COLUMNS.map((c) => (
              <TextInput
                key={c.key}
                value={row[c.key]}
                onChangeText={(v) => setRows((list) => list.map((r, idx) => (idx === i ? { ...r, [c.key]: v } : r)))}
                placeholder={c.key === "start" || c.key === "end" ? "dd/mm/yy" : c.label}
                placeholderTextColor={colors.placeholder}
                accessibilityLabel={`${c.label} row ${i + 1}`}
                style={styles.gridInput}
              />
            ))}
            <Pressable
              onPress={() => setRows((list) => list.filter((_, idx) => idx !== i))}
              accessibilityRole="button"
              accessibilityLabel={`Remove row ${i + 1}`}
              style={styles.gridDelete}
            >
              <Feather name="trash-2" size={12} color={colors.danger} />
            </Pressable>
          </View>
        ))}
        <AddBar label="Add Row" onPress={() => setRows((list) => [...list, toRow()])} />
      </View>

      <TextField
        label="Discharge Summary"
        required
        multiline
        placeholder="e.g. Patient is hemodynamically stable. Medications reconciled for discharge home."
        value={summary}
        onChangeText={setSummary}
        containerStyle={styles.summary}
      />
      <Checkbox
        checked={counseling}
        onChange={setCounseling}
        accessibilityLabel="Discharge medication counseling and education completed with patient"
        label="Discharge medication counseling and education completed with patient"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </FormModal>
  );
}

/** Figma "Handover Patient": pick a colleague (or search by name) to take over care. */
export function HandoverModal({
  visible,
  admissionId,
  onClose,
  onDone,
}: {
  visible: boolean;
  admissionId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [query, setQuery] = useState("");
  const [colleagues, setColleagues] = useState<UserSummary[]>([]);
  const [selected, setSelected] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      usersApi
        .colleagues(query.trim() || undefined)
        .then(({ data }) => setColleagues(data.data))
        .catch(() => setColleagues([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [visible, query]);

  useEffect(() => {
    if (visible) {
      setQuery("");
      setSelected(undefined);
    }
  }, [visible]);

  const confirm = async () => {
    const target = selected ?? (colleagues.length === 1 ? colleagues[0].id : undefined);
    if (!target) {
      Alert.alert("Select a colleague", "Choose who should receive this patient.");
      return;
    }
    try {
      setSaving(true);
      await admissionsApi.handover(admissionId, { toUserId: target });
      Alert.alert("Handover sent", "The patient will move to your colleague once they accept.");
      onDone();
      onClose();
    } catch (err) {
      Alert.alert("Could not hand over patient", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal
      visible={visible}
      title="Handover Patient"
      subtitle="Transfer clinical responsibility and active medication management to a colleague."
      onClose={onClose}
      submitLabel="Confirm Handover"
      onSubmit={confirm}
      submitting={saving}
    >
      <TextField
        label="Receiver Username / Provider"
        placeholder="e.g. Dr. Yousef Al Ali"
        value={query}
        onChangeText={setQuery}
      />
      <Text style={[typography.label, styles.gap]}>Or Select Available Colleague</Text>
      {colleagues.length === 0 ? (
        <Text style={styles.empty}>No colleagues match your search.</Text>
      ) : (
        <View style={styles.colleagues}>
          {colleagues.map((c) => {
            const active = selected === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setSelected(c.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[styles.colleague, active && styles.colleagueActive]}
              >
                <Text style={styles.colleagueName}>
                  {c.jobTitle === "Doctor" ? "Dr. " : ""}
                  {c.firstName} {c.lastName}
                </Text>
                <Text style={styles.colleagueMeta}>
                  {[c.jobTitle, c.specialty].filter(Boolean).join(" · ") || c.email}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </FormModal>
  );
}

const styles = StyleSheet.create({
  gap: { marginBottom: spacing.sm },
  noMargin: { marginBottom: 0 },
  planCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  planHeader: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  planTitle: { flex: 1, fontFamily: fonts.semibold, fontSize: 14, color: colors.heading },
  trash: {
    width: 30,
    height: 30,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoftBg,
    alignItems: "center",
    justifyContent: "center",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    minHeight: 32,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.inputBg,
    justifyContent: "center",
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textBody },
  chipTextActive: { color: colors.white, fontFamily: fonts.medium },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.sm },
  toggleList: { gap: spacing.sm },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  toggleLabel: { flex: 1, fontFamily: fonts.semibold, fontSize: 13, color: colors.heading },
  toggle: { width: 120 },
  sectionLabel: { fontFamily: fonts.semibold, fontSize: 13, color: colors.heading, marginBottom: spacing.sm },
  grid: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.lg,
  },
  gridHeader: { flexDirection: "row", gap: 6, paddingHorizontal: 2, marginBottom: spacing.sm },
  gridHeadText: { flex: 1, fontFamily: fonts.regular, fontSize: 11, color: colors.tableHeaderText },
  actionsHead: { flex: 0, width: 46, textAlign: "right" },
  gridRow: { flexDirection: "row", gap: 6, alignItems: "center", marginBottom: 6 },
  gridInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.inputBg,
    paddingHorizontal: 8,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.text,
  },
  gridDelete: {
    width: 46,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerSoftBg,
    alignItems: "center",
    justifyContent: "center",
  },
  summary: { marginBottom: spacing.md },
  empty: { ...typography.caption, paddingVertical: spacing.sm },
  colleagues: { gap: spacing.sm },
  colleague: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
    justifyContent: "center",
  },
  colleagueActive: { borderColor: colors.primary, backgroundColor: colors.chipSelectedBg },
  colleagueName: { fontFamily: fonts.semibold, fontSize: 13, color: colors.heading },
  colleagueMeta: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 2 },
});
