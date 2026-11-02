import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { FormModal } from "../../components/ui/FormModal";
import { AddBar, WorkspaceCard } from "./parts";
import { aiApi, culturesApi, labResultsApi } from "../../services/api/medlogApi";
import { getErrorMessage } from "../../services/api/client";
import { CultureResult, LabResult } from "../../types/api";
import { parseDayInput, shortDay, toDayInput } from "../../utils/dates";
import { colors, fonts, radius, spacing, typography } from "../../theme/tokens";

type LabRow = { _id?: string; testName: string; date: string; reference: string; value: string };
type CultureRow = {
  _id?: string;
  cultureType: string;
  collectedAt: string;
  resultAt: string;
  organism: string;
  susceptibility: string;
};

const emptyLab = (): LabRow => ({ testName: "", date: "", reference: "", value: "" });
const emptyCulture = (): CultureRow => ({ cultureType: "", collectedAt: "", resultAt: "", organism: "", susceptibility: "" });

const LAB_FIELDS: { key: keyof LabRow; label: string }[] = [
  { key: "testName", label: "Test name" },
  { key: "date", label: "Date" },
  { key: "reference", label: "Reference" },
  { key: "value", label: "Value" },
];
const CULTURE_FIELDS: { key: keyof CultureRow; label: string }[] = [
  { key: "cultureType", label: "Culture Type" },
  { key: "collectedAt", label: "Date Collected" },
  { key: "resultAt", label: "Result Date" },
  { key: "organism", label: "Organism" },
  { key: "susceptibility", label: "Susceptibility" },
];
const DATE_KEYS = new Set(["date", "collectedAt", "resultAt"]);

const isoOrUndefined = (value: string) => (value.trim() ? parseDayInput(value)?.toISOString() : undefined);

interface Props {
  admissionId: string;
  labs: LabResult[];
  cultures: CultureResult[];
  editing: boolean;
  onChanged: () => void;
}

export function LabTab({ admissionId, labs, cultures, editing, onChanged }: Props) {
  if (!editing) return <LabView labs={labs} cultures={cultures} />;
  return <LabEditor admissionId={admissionId} labs={labs} cultures={cultures} onChanged={onChanged} />;
}

function LabView({ labs, cultures }: { labs: LabResult[]; cultures: CultureResult[] }) {
  const pivot = useMemo(() => {
    const dates = [...new Set(labs.map((l) => (l.date ? shortDay(l.date) : "—")))].slice(0, 4);
    const tests = new Map<string, { reference?: string; values: Record<string, string> }>();
    for (const l of labs) {
      const entry = tests.get(l.testName) ?? { values: {} };
      const day = l.date ? shortDay(l.date) : "—";
      entry.values[day] ??= l.value ?? "—";
      entry.reference ??= l.reference;
      tests.set(l.testName, entry);
    }
    return { dates, rows: [...tests.entries()].map(([testName, v]) => ({ testName, ...v })) };
  }, [labs]);

  return (
    <View style={styles.stack}>
      <WorkspaceCard title="Lab Results">
        <DataTable
          caps
          columns={[
            { key: "test", label: "Test Name", flex: 1.4, render: (r) => <Text style={styles.bold}>{r.testName}</Text> },
            ...pivot.dates.map((d) => ({
              key: d,
              label: d,
              align: "center" as const,
              render: (r: (typeof pivot.rows)[number]) => <Text style={styles.value}>{r.values[d] ?? "-"}</Text>,
            })),
            { key: "reference", label: "Reference", align: "center", render: (r) => r.reference || "—" },
          ]}
          rows={pivot.rows}
          keyOf={(r) => r.testName}
          emptyText="No lab results recorded yet"
        />
      </WorkspaceCard>
      <WorkspaceCard title="Culture & Susceptibility">
        <DataTable
          caps
          columns={[
            { key: "type", label: "Culture Type", render: (c: CultureResult) => <Text style={styles.bold}>{c.cultureType}</Text> },
            { key: "collected", label: "Date Collected", render: (c: CultureResult) => <Text style={styles.value}>{shortDay(c.collectedAt)}</Text> },
            { key: "result", label: "Result Date", render: (c: CultureResult) => <Text style={styles.value}>{shortDay(c.resultAt)}</Text> },
            { key: "organism", label: "Organism", render: (c: CultureResult) => c.organism || "—" },
            { key: "susceptibility", label: "Susceptibility", flex: 1.3, render: (c: CultureResult) => c.susceptibility || "—" },
          ]}
          rows={cultures}
          keyOf={(c) => c._id}
          emptyText="No cultures recorded yet"
        />
      </WorkspaceCard>
    </View>
  );
}

function LabEditor({
  admissionId,
  labs,
  cultures,
  onChanged,
}: {
  admissionId: string;
  labs: LabResult[];
  cultures: CultureResult[];
  onChanged: () => void;
}) {
  const [labRows, setLabRows] = useState<LabRow[]>([]);
  const [cultureRows, setCultureRows] = useState<CultureRow[]>([]);
  const [chooser, setChooser] = useState<"lab" | "culture" | null>(null);
  const [saving, setSaving] = useState<"lab" | "culture" | null>(null);

  useEffect(() => {
    setLabRows(
      labs.length
        ? labs.map((l) => ({ _id: l._id, testName: l.testName, date: toDayInput(l.date), reference: l.reference ?? "", value: l.value ?? "" }))
        : [emptyLab()]
    );
    setCultureRows(
      cultures.length
        ? cultures.map((c) => ({
            _id: c._id,
            cultureType: c.cultureType,
            collectedAt: toDayInput(c.collectedAt),
            resultAt: toDayInput(c.resultAt),
            organism: c.organism ?? "",
            susceptibility: c.susceptibility ?? "",
          }))
        : [emptyCulture()]
    );
  }, [labs, cultures]);

  const saveLabs = async () => {
    const rows = labRows.filter((r) => r.testName.trim());
    if (rows.some((r) => r.date.trim() && !parseDayInput(r.date))) {
      Alert.alert("Check the dates", "Use dd/mm/yyyy for lab dates.");
      return;
    }
    try {
      setSaving("lab");
      await labResultsApi.replace(
        admissionId,
        rows.map((r) => ({
          ...(r._id ? { _id: r._id } : {}),
          testName: r.testName.trim(),
          date: isoOrUndefined(r.date),
          reference: r.reference.trim() || undefined,
          value: r.value.trim() || undefined,
        }))
      );
      onChanged();
    } catch (err) {
      Alert.alert("Could not save lab results", getErrorMessage(err));
    } finally {
      setSaving(null);
    }
  };

  const saveCultures = async () => {
    const rows = cultureRows.filter((r) => r.cultureType.trim());
    if (rows.some((r) => (r.collectedAt.trim() && !parseDayInput(r.collectedAt)) || (r.resultAt.trim() && !parseDayInput(r.resultAt)))) {
      Alert.alert("Check the dates", "Use dd/mm/yyyy for culture dates.");
      return;
    }
    try {
      setSaving("culture");
      await culturesApi.replace(
        admissionId,
        rows.map((r) => ({
          ...(r._id ? { _id: r._id } : {}),
          cultureType: r.cultureType.trim(),
          collectedAt: isoOrUndefined(r.collectedAt),
          resultAt: isoOrUndefined(r.resultAt),
          organism: r.organism.trim() || undefined,
          susceptibility: r.susceptibility.trim() || undefined,
        }))
      );
      onChanged();
    } catch (err) {
      Alert.alert("Could not save cultures", getErrorMessage(err));
    } finally {
      setSaving(null);
    }
  };

  return (
    <View style={styles.stack}>
      <WorkspaceCard title="Add Lab Result">
        <EditGrid
          fields={LAB_FIELDS}
          rows={labRows}
          onChange={setLabRows}
          onAdd={() => setChooser("lab")}
        />
        <Button title="Save Lab Results" onPress={saveLabs} loading={saving === "lab"} style={styles.save} />
      </WorkspaceCard>
      <WorkspaceCard title="Add Culture & Susceptibility">
        <EditGrid
          fields={CULTURE_FIELDS}
          rows={cultureRows}
          onChange={setCultureRows}
          onAdd={() => setChooser("culture")}
        />
        <Button title="Save Cultures" onPress={saveCultures} loading={saving === "culture"} style={styles.save} />
      </WorkspaceCard>

      <EntryMethodModal
        kind={chooser}
        onClose={() => setChooser(null)}
        onManual={() => {
          if (chooser === "lab") setLabRows((r) => [...r, emptyLab()]);
          else setCultureRows((r) => [...r, emptyCulture()]);
          setChooser(null);
        }}
        onExtracted={(extracted) => {
          if (chooser === "lab") {
            const rows = extracted.labResults.map((l) => ({ ...emptyLab(), ...l, date: toDayInput(l.date) }));
            setLabRows((r) => [...r.filter((x) => x.testName.trim()), ...(rows.length ? rows : [emptyLab()])]);
          } else {
            const rows = extracted.cultures.map((c) => ({
              ...emptyCulture(),
              ...c,
              collectedAt: toDayInput(c.collectedAt),
              resultAt: toDayInput(c.resultAt),
            }));
            setCultureRows((r) => [...r.filter((x) => x.cultureType.trim()), ...(rows.length ? rows : [emptyCulture()])]);
          }
          setChooser(null);
        }}
      />
    </View>
  );
}

function EditGrid<T extends Record<string, string | undefined>>({
  fields,
  rows,
  onChange,
  onAdd,
}: {
  fields: { key: keyof T & string; label: string }[];
  rows: T[];
  onChange: (rows: T[]) => void;
  onAdd: () => void;
}) {
  return (
    <View style={styles.grid}>
      <View style={styles.gridHeader}>
        {fields.map((f) => (
          <Text key={f.key} style={styles.gridHeadText}>
            {f.label}
          </Text>
        ))}
        <Text style={[styles.gridHeadText, styles.actionsHead]}>Actions</Text>
      </View>
      {rows.map((row, i) => (
        <View key={i} style={styles.gridRow}>
          {fields.map((f) => (
            <TextInput
              key={f.key}
              value={row[f.key] ?? ""}
              onChangeText={(v) => onChange(rows.map((r, idx) => (idx === i ? { ...r, [f.key]: v } : r)))}
              placeholder={DATE_KEYS.has(f.key) ? "dd/mm/yyyy" : f.label}
              placeholderTextColor={colors.placeholder}
              accessibilityLabel={`${f.label} row ${i + 1}`}
              style={styles.gridInput}
            />
          ))}
          <Pressable
            onPress={() => onChange(rows.filter((_, idx) => idx !== i))}
            accessibilityRole="button"
            accessibilityLabel={`Remove row ${i + 1}`}
            style={styles.gridDelete}
          >
            <Feather name="trash-2" size={13} color={colors.danger} />
          </Pressable>
        </View>
      ))}
      <AddBar label="Add Row" onPress={onAdd} />
    </View>
  );
}

interface Extracted {
  labResults: Array<Partial<LabRow>>;
  cultures: Array<Partial<CultureRow>>;
}

/** Figma "Add Lab Result" / "Add Culture & Susceptibility": Manual Entry or Extract by AI. */
function EntryMethodModal({
  kind,
  onClose,
  onManual,
  onExtracted,
}: {
  kind: "lab" | "culture" | null;
  onClose: () => void;
  onManual: () => void;
  onExtracted: (data: Extracted) => void;
}) {
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (kind) {
      setMode("manual");
      setFile(null);
    }
  }, [kind]);

  const pick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf", "text/plain"],
      copyToCacheDirectory: true,
    });
    if (!result.canceled) setFile(result.assets[0]);
  };

  const extract = async () => {
    if (!file) {
      Alert.alert("Upload a report", "Choose the lab report image first.");
      return;
    }
    try {
      setBusy(true);
      const form = new FormData();
      if (file.file) {
        form.append("document", file.file);
      } else {
        form.append("document", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType ?? "application/octet-stream",
        } as unknown as Blob);
      }
      form.append("kind", kind ?? "lab");
      const { data } = await aiApi.extract(form);
      const draft = (data as { data: Partial<Extracted> }).data;
      const extracted = { labResults: draft.labResults ?? [], cultures: draft.cultures ?? [] };
      const count = kind === "lab" ? extracted.labResults.length : extracted.cultures.length;
      if (count === 0) {
        Alert.alert("Nothing extracted", "No results could be read from this file. An empty row was added for manual entry.");
      }
      onExtracted(extracted);
    } catch (err) {
      Alert.alert("Extraction failed", getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const title = kind === "culture" ? "Add Culture & Susceptibility" : "Add Lab Result";

  return (
    <FormModal
      visible={!!kind}
      title={title}
      onClose={onClose}
      submitLabel={mode === "manual" ? "Add / Edit Rows" : "Review & Edit Extracted Results"}
      onSubmit={mode === "manual" ? onManual : extract}
      submitting={busy}
    >
      <View style={styles.methods}>
        {(["manual", "ai"] as const).map((m) => {
          const active = mode === m;
          return (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              style={[styles.method, active && styles.methodActive]}
            >
              <Text style={styles.methodIcon}>{m === "manual" ? "📝" : "📲"}</Text>
              <Text style={styles.methodText}>{m === "manual" ? "Manual Entry" : "Extract by AI"}</Text>
            </Pressable>
          );
        })}
      </View>
      {mode === "ai" ? (
        <View>
          <Text style={[typography.label, styles.uploadLabel]}>Upload Lab Report</Text>
          <Pressable onPress={pick} accessibilityRole="button" style={styles.upload}>
            {file?.mimeType?.startsWith("image/") ? (
              <Image source={{ uri: file.uri }} style={styles.preview} />
            ) : (
              <Feather name="upload" size={14} color={colors.softActionText} />
            )}
            <Text style={styles.uploadText} numberOfLines={1}>
              {file ? file.name : "Just upload your lab report image here"}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </FormModal>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  bold: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  value: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary },
  save: { marginTop: spacing.md, alignSelf: "flex-end", minWidth: 180 },
  grid: { borderWidth: 1, borderColor: colors.divider, borderRadius: radius.md, padding: spacing.sm },
  gridHeader: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm, paddingHorizontal: 2 },
  gridHeadText: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: colors.tableHeaderText },
  actionsHead: { flex: 0, width: 40, textAlign: "right" },
  gridRow: { flexDirection: "row", gap: spacing.sm, alignItems: "center", marginBottom: spacing.sm },
  gridInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 38,
    borderRadius: radius.md,
    backgroundColor: colors.inputBg,
    paddingHorizontal: 10,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.text,
  },
  gridDelete: {
    width: 40,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoftBg,
    alignItems: "center",
    justifyContent: "center",
  },
  methods: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.md },
  method: {
    flex: 1,
    minHeight: 72,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  methodActive: { borderColor: colors.primary, backgroundColor: colors.chipSelectedBg },
  methodIcon: { fontSize: 18 },
  methodText: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary },
  uploadLabel: { marginBottom: spacing.sm },
  upload: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: colors.softActionBg,
    paddingHorizontal: spacing.md,
  },
  uploadText: { fontFamily: fonts.regular, fontSize: 12, color: colors.softActionText, flexShrink: 1 },
  preview: { width: 28, height: 28, borderRadius: 4 },
});
