import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { DataTable } from "../../components/ui/DataTable";
import { useResponsive } from "../../hooks/useResponsive";
import { AssessmentTiles } from "../patients/PatientSummaryCard";
import { MedicationTable } from "../clinical/MedicationTable";
import { FieldSpec, RecordFormModal } from "../clinical/RecordFormModal";
import { AddBar, DateGroups, HeaderAction, ItemCard, RowActions, SubHeading, WorkspaceCard } from "./parts";
import { PlansModal, ToggleModal, dtpLabel } from "./WorkspaceModals";
import { WorkspaceData } from "./useWorkspace";
import {
  admissionsApi,
  antibioticsApi,
  clinicalApi,
  medicationsApi,
  patientsApi,
  reconciliationsApi,
} from "../../services/api/medlogApi";
import { getErrorMessage } from "../../services/api/client";
import {
  ClinicalParameter,
  HospitalMedication,
  MedicationReconciliation,
  Patient,
  PreviousAntibiotic,
  Recommendation,
} from "../../types/api";
import { toDayInput } from "../../utils/dates";
import { formatDate, userOf } from "../../utils/format";
import { confirmAction } from "../../utils/dialogs";
import { colors, fonts, radius, spacing } from "../../theme/tokens";

type RecordKind = "hospital" | "antibiotic" | "reconciliation" | "previous" | "parameter" | "chiefComplaint" | "diagnosis" | "medicalHistory";

const MED_FIELDS: FieldSpec[] = [
  { key: "name", label: "Drug", required: true, row: 1 },
  { key: "dose", label: "Dose", placeholder: "e.g. 1 g", row: 1 },
  { key: "route", label: "Route", placeholder: "e.g. PO", row: 2 },
  { key: "frequency", label: "Frequency", placeholder: "e.g. TID", row: 2 },
  { key: "notes", label: "Comment" },
  { key: "startDate", label: "Start", kind: "date", row: 3 },
  { key: "endDate", label: "End (leave empty if ongoing)", kind: "date", row: 3 },
];

const RECONCILIATION_FIELDS: FieldSpec[] = [
  { key: "drug", label: "Drug", required: true, row: 1 },
  { key: "dose", label: "Dose", row: 1 },
  { key: "route", label: "Route", row: 2 },
  { key: "frequency", label: "Frequency", row: 2 },
  { key: "discrepancy", label: "Discrepancy", placeholder: "e.g. None, Omission, Dose change" },
  { key: "comment", label: "Comment" },
];

const PREVIOUS_FIELDS: FieldSpec[] = [
  { key: "condition", label: "Condition", placeholder: "e.g. UTI" },
  { key: "name", label: "Drug", required: true, row: 1 },
  { key: "dose", label: "Dose", row: 1 },
  { key: "route", label: "Route", row: 2 },
  { key: "frequency", label: "Frequency", row: 2 },
  { key: "duration", label: "Duration", placeholder: "e.g. 7 days", row: 3 },
  { key: "startDate", label: "Start", kind: "date", row: 3 },
  { key: "notes", label: "Comment" },
];

const PARAMETER_FIELDS: FieldSpec[] = [
  { key: "parameter", label: "Parameter", required: true, placeholder: "e.g. Blood Sugar" },
  { key: "valueGoal", label: "Value / Goal", placeholder: "e.g. Fasting < 100 mg/dL" },
  { key: "planRecommendation", label: "Note", kind: "multiline", placeholder: "e.g. Monitor for Diabetes" },
];

const THREE_MONTHS = 90 * 24 * 60 * 60 * 1000;

interface Props {
  data: WorkspaceData;
  patient: Patient;
  editing: boolean;
  canEdit: boolean;
  onChanged: () => void;
  onHandover: () => void;
  onDischarge: () => void;
}

export function OverviewTab({ data, patient, editing, canEdit, onChanged, onHandover, onDischarge }: Props) {
  const { isPhone } = useResponsive();
  const { admission } = data;
  const [record, setRecord] = useState<{ kind: RecordKind; item?: unknown } | null>(null);
  const [toggles, setToggles] = useState<"life" | "lines" | null>(null);
  const [plans, setPlans] = useState<{ editing?: Recommendation } | null>(null);

  const confirmDelete = async (label: string, action: () => Promise<unknown>) => {
    if (!(await confirmAction("Delete entry", `Remove ${label}? This cannot be undone.`))) return;
    try {
      await action();
      onChanged();
    } catch (err) {
      Alert.alert("Could not delete", getErrorMessage(err));
    }
  };

  const recentAntibiotics = data.previousAntibiotics.filter(
    (a) => Date.now() - new Date(a.startDate ?? a.createdAt ?? Date.now()).getTime() <= THREE_MONTHS
  );

  const recordConfig = (): {
    title: string;
    fields: FieldSpec[];
    initial: Record<string, string>;
    save: (v: Record<string, string | undefined>) => Promise<unknown>;
  } | null => {
    if (!record) return null;
    const item = record.item as Record<string, string | undefined> | undefined;
    const pick = (keys: string[]) =>
      Object.fromEntries(
        keys.map((k) => [k, k.endsWith("Date") ? toDayInput(item?.[k]) : (item?.[k] ?? "")])
      ) as Record<string, string>;
    const id = item?._id;
    switch (record.kind) {
      case "hospital":
      case "antibiotic": {
        const category = record.kind;
        return {
          title: `${id ? "Edit" : "Add"} ${category === "antibiotic" ? "Antibiotic" : "Medication"}`,
          fields: MED_FIELDS,
          initial: pick(MED_FIELDS.map((f) => f.key)),
          save: (v) =>
            id
              ? medicationsApi.update(id, { ...v, endDate: v.endDate ?? null })
              : medicationsApi.create({ ...v, category, admissionId: admission._id }),
        };
      }
      case "reconciliation":
        return {
          title: `${id ? "Edit" : "Add"} Medication Reconciliation`,
          fields: RECONCILIATION_FIELDS,
          initial: pick(RECONCILIATION_FIELDS.map((f) => f.key)),
          save: (v) =>
            id ? reconciliationsApi.update(id, v) : reconciliationsApi.create({ ...v, admissionId: admission._id }),
        };
      case "previous":
        return {
          title: `${id ? "Edit" : "Add"} Previous Antibiotic`,
          fields: PREVIOUS_FIELDS,
          initial: pick(PREVIOUS_FIELDS.map((f) => f.key)),
          save: (v) => (id ? antibioticsApi.update(id, v) : antibioticsApi.create({ ...v, admissionId: admission._id })),
        };
      case "parameter":
        return {
          title: `${id ? "Edit" : "Add"} Monitoring Parameter`,
          fields: PARAMETER_FIELDS,
          initial: pick(PARAMETER_FIELDS.map((f) => f.key)),
          save: (v) => (id ? clinicalApi.update(id, v) : clinicalApi.create({ ...v, admissionId: admission._id })),
        };
      default: {
        const key = record.kind;
        const label = key === "chiefComplaint" ? "Chief Complaint" : key === "diagnosis" ? "Diagnosis" : "Medical History";
        return {
          title: `Edit ${label}`,
          fields: [{ key, label, required: true, kind: "multiline" }],
          initial: { [key]: admission[key] ?? "" },
          save: (v) => admissionsApi.update(admission._id, { [key]: v[key] }),
        };
      }
    }
  };
  const config = recordConfig();

  const medActions = (m: HospitalMedication, kind: "hospital" | "antibiotic") =>
    editing ? (
      <RowActions
        label={m.name}
        onEdit={() => setRecord({ kind, item: m })}
        onDelete={() => confirmDelete(m.name, () => medicationsApi.remove(m._id))}
      />
    ) : null;

  const action = (label: string, icon: "plus" | "edit-2", onPress: () => void) =>
    editing ? <HeaderAction label={label} icon={icon} onPress={onPress} /> : undefined;

  const creator = userOf(admission.createdBy);

  return (
    <View style={styles.stack}>
      <AssessmentTiles
        title="Life Assessment"
        right={action("Edit", "edit-2", () => setToggles("life"))}
        tiles={[
          { label: "Smoking", value: patient.smoker, emoji: editing ? undefined : "🚬" },
          { label: "Alcohol", value: patient.alcohol, emoji: editing ? undefined : "🍺" },
          ...(editing ? [{ label: "Caffeine", value: patient.caffeine }] : []),
          { label: "Rec. Drugs", value: patient.recreationalDrugs, emoji: editing ? undefined : "☘️" },
        ]}
      />
      <AssessmentTiles
        title="Lines / Tubes"
        right={action("Edit", "edit-2", () => setToggles("lines"))}
        tiles={[
          { label: "Catheter", value: patient.catheter },
          { label: "NGT", value: patient.ngt },
          { label: "PEG Tube", value: patient.pegTube },
        ]}
      />

      <View style={isPhone ? styles.stack : styles.row}>
        <View style={styles.flex}>
          <WorkspaceCard title="Chief Complaint" action={action("Edit", "edit-2", () => setRecord({ kind: "chiefComplaint" }))}>
            <Text style={styles.body}>{admission.chiefComplaint || "—"}</Text>
          </WorkspaceCard>
        </View>
        <View style={styles.flex}>
          <WorkspaceCard title="Diagnosis" action={action("Edit", "edit-2", () => setRecord({ kind: "diagnosis" }))}>
            <Text style={styles.body}>{admission.diagnosis || "—"}</Text>
          </WorkspaceCard>
        </View>
      </View>
      <WorkspaceCard title="Medical History" action={action("Edit", "edit-2", () => setRecord({ kind: "medicalHistory" }))}>
        <Text style={styles.body}>{admission.medicalHistory || "—"}</Text>
      </WorkspaceCard>

      <WorkspaceCard title="Medication Reconciliation & Previous antibiotics">
        <View style={styles.subHeader}>
          <SubHeading>MEDICATION RECONCILIATION</SubHeading>
          {action("Add Medication", "plus", () => setRecord({ kind: "reconciliation" }))}
        </View>
        <DataTable
          columns={[
            { key: "drug", label: "Drug", render: (r: MedicationReconciliation) => r.drug },
            { key: "dose", label: "Dose", render: (r: MedicationReconciliation) => r.dose || "—" },
            { key: "route", label: "Route", render: (r: MedicationReconciliation) => r.route || "—" },
            { key: "frequency", label: "Frequency", render: (r: MedicationReconciliation) => r.frequency || "—" },
            { key: "discrepancy", label: "Discrepancy", render: (r: MedicationReconciliation) => r.discrepancy || "None" },
            ...(editing
              ? [
                  {
                    key: "actions",
                    label: "Actions",
                    flex: 0.8,
                    align: "right" as const,
                    render: (r: MedicationReconciliation) => (
                      <RowActions
                        label={r.drug}
                        onEdit={() => setRecord({ kind: "reconciliation", item: r })}
                        onDelete={() => confirmDelete(r.drug, () => reconciliationsApi.remove(r._id))}
                      />
                    ),
                  },
                ]
              : []),
          ]}
          rows={data.reconciliation}
          keyOf={(r) => r._id}
          emptyText="No medications reconciled yet"
        />
        <View style={[styles.subHeader, styles.subHeaderGap]}>
          <SubHeading>PREVIOUS ANTIBIOTICS (LAST 3 MONTHS)</SubHeading>
          {action("Add Antibiotic", "plus", () => setRecord({ kind: "previous" }))}
        </View>
        <DataTable
          columns={[
            { key: "condition", label: "Condition", render: (r: PreviousAntibiotic) => r.condition || "—" },
            { key: "drug", label: "Drug", render: (r: PreviousAntibiotic) => r.name },
            { key: "dose", label: "Dose", render: (r: PreviousAntibiotic) => r.dose || "—" },
            { key: "route", label: "Route", render: (r: PreviousAntibiotic) => r.route || "—" },
            { key: "frequency", label: "Frequency", render: (r: PreviousAntibiotic) => r.frequency || "—" },
            { key: "duration", label: "Duration", render: (r: PreviousAntibiotic) => r.duration || "—" },
            { key: "comment", label: "Comment", render: (r: PreviousAntibiotic) => r.notes || "—" },
            ...(editing
              ? [
                  {
                    key: "actions",
                    label: "Actions",
                    flex: 0.8,
                    align: "right" as const,
                    render: (r: PreviousAntibiotic) => (
                      <RowActions
                        label={r.name}
                        onEdit={() => setRecord({ kind: "previous", item: r })}
                        onDelete={() => confirmDelete(r.name, () => antibioticsApi.remove(r._id))}
                      />
                    ),
                  },
                ]
              : []),
          ]}
          rows={recentAntibiotics}
          keyOf={(r) => r._id}
          emptyText="No Previous antibiotics found (last 3 months)"
        />
      </WorkspaceCard>

      <WorkspaceCard title="Current Hospital Medications" action={action("Add Medication", "plus", () => setRecord({ kind: "hospital" }))}>
        <MedicationTable
          rows={data.hospitalMeds}
          emptyText="No current hospital medications"
          actions={editing ? (m) => medActions(m, "hospital") : undefined}
        />
      </WorkspaceCard>

      <WorkspaceCard title="Current Antibiotics" action={action("Add Antibiotic", "plus", () => setRecord({ kind: "antibiotic" }))}>
        <MedicationTable
          rows={data.currentAntibiotics}
          emptyText="No current antibiotics"
          actions={editing ? (m) => medActions(m, "antibiotic") : undefined}
        />
      </WorkspaceCard>

      <WorkspaceCard title="Plans / Recommendations" titleSize={16}>
        <DateGroups
          items={data.recommendations}
          dateOf={(r) => r.recordedAt}
          noun="Recommendations"
          emptyText="No plans or recommendations yet."
          render={(r) => (
            <ItemCard
              key={r._id}
              right={editing ? <RowActions label={r.text} onEdit={() => setPlans({ editing: r })} /> : undefined}
            >
              <Text style={styles.itemTitle}>{r.text}</Text>
              {r.dtp !== "none" ? <Text style={styles.itemMeta}>DTP : {dtpLabel(r.dtp)}</Text> : null}
            </ItemCard>
          )}
        />
        {canEdit ? <AddBar label="Plans / Recommendations" onPress={() => setPlans({})} /> : null}
      </WorkspaceCard>

      <WorkspaceCard title="Monitoring Parameters" titleSize={16}>
        <DateGroups
          items={data.parameters}
          dateOf={(p) => p.recordedAt}
          noun="Parameters"
          emptyText="No monitoring parameters yet."
          render={(p: ClinicalParameter) => (
            <ItemCard
              key={p._id}
              right={
                editing ? (
                  <RowActions
                    label={p.parameter}
                    onEdit={() => setRecord({ kind: "parameter", item: p })}
                    onDelete={() => confirmDelete(p.parameter, () => clinicalApi.remove(p._id))}
                  />
                ) : undefined
              }
            >
              <Text style={styles.itemTitle}>{p.parameter}</Text>
              {p.valueGoal ? <Text style={styles.itemMeta}>value/goal : {p.valueGoal}</Text> : null}
              {p.planRecommendation ? <Text style={styles.itemMeta}>Note : {p.planRecommendation}</Text> : null}
            </ItemCard>
          )}
        />
        {canEdit ? <AddBar label="Add Monitoring Parameters" onPress={() => setRecord({ kind: "parameter" })} /> : null}
      </WorkspaceCard>

      <WorkspaceCard title="Admission Information">
        <View style={styles.infoGrid}>
          <Info label="Department" value={admission.specialty || "—"} />
          <Info label="Created by" value={creator?.email || "—"} />
          <Info label="Admission Date" value={formatDate(admission.admissionDate)} />
          <Info label="Last Updated" value={formatDate(admission.updatedAt ?? admission.createdAt)} />
        </View>
        <View style={styles.footerActions}>
          <Pressable
            onPress={onHandover}
            disabled={!canEdit}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canEdit }}
            style={[styles.footerBtn, styles.handover, !canEdit && styles.disabledBtn]}
          >
            <Text style={styles.handoverText}>Handover Patient</Text>
          </Pressable>
          <Pressable
            onPress={onDischarge}
            disabled={!canEdit}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canEdit }}
            style={[styles.footerBtn, styles.discharge, !canEdit && styles.dischargeDisabled]}
          >
            <Text style={styles.dischargeText}>Discharge Patient</Text>
          </Pressable>
        </View>
      </WorkspaceCard>

      {config ? (
        <RecordFormModal
          visible
          title={config.title}
          fields={config.fields}
          initial={config.initial}
          onClose={() => setRecord(null)}
          onSubmit={async (values) => {
            try {
              await config.save(values);
              setRecord(null);
              onChanged();
            } catch (err) {
              Alert.alert("Could not save", getErrorMessage(err));
            }
          }}
        />
      ) : null}

      <ToggleModal
        visible={toggles !== null}
        title={toggles === "lines" ? "Edit Lines / Tubes" : "Edit Life Assessment"}
        items={
          toggles === "lines"
            ? [
                { key: "catheter", label: "Catheter", value: !!patient.catheter },
                { key: "ngt", label: "NGT", value: !!patient.ngt },
                { key: "pegTube", label: "PEG Tube", value: !!patient.pegTube },
              ]
            : [
                { key: "smoker", label: "Smoking", value: !!patient.smoker },
                { key: "alcohol", label: "Alcohol", value: !!patient.alcohol },
                { key: "caffeine", label: "Caffeine", value: !!patient.caffeine },
                { key: "recreationalDrugs", label: "Recreational Drugs", value: !!patient.recreationalDrugs },
              ]
        }
        onClose={() => setToggles(null)}
        onSave={async (values) => {
          try {
            await patientsApi.update(patient._id, values);
            setToggles(null);
            onChanged();
          } catch (err) {
            Alert.alert("Could not save", getErrorMessage(err));
          }
        }}
      />

      <PlansModal
        visible={plans !== null}
        admissionId={admission._id}
        editing={plans?.editing}
        onClose={() => setPlans(null)}
        onSaved={onChanged}
      />
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  row: { flexDirection: "row", gap: spacing.md },
  flex: { flex: 1, minWidth: 0 },
  body: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textBody },
  subHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  subHeaderGap: { marginTop: spacing.lg },
  itemTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.heading },
  itemMeta: { fontFamily: fonts.regular, fontSize: 12, color: colors.textBody },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: colors.tileBg,
    borderRadius: radius.md,
    padding: spacing.md,
    rowGap: spacing.md,
  },
  info: { width: "50%", paddingRight: spacing.md },
  infoLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.textBody },
  infoValue: { fontFamily: fonts.semibold, fontSize: 12, color: colors.text, marginTop: 2 },
  footerActions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
  footerBtn: { flex: 1, minHeight: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  handover: { backgroundColor: colors.softActionBg },
  handoverText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.primaryStrong },
  discharge: { backgroundColor: colors.danger },
  dischargeText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.white },
  disabledBtn: { opacity: 0.45 },
  dischargeDisabled: { opacity: 0.3 },
});
