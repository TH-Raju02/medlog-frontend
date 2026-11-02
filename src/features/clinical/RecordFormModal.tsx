import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { FormModal } from "../../components/ui/FormModal";
import { TextField } from "../../components/ui/TextField";
import { useResponsive } from "../../hooks/useResponsive";
import { parseDayInput } from "../../utils/dates";
import { spacing } from "../../theme/tokens";

export interface FieldSpec {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  kind?: "text" | "date" | "multiline";
  /** Fields with the same row number share a line on tablets. */
  row?: number;
}

interface Props {
  visible: boolean;
  title: string;
  subtitle?: string;
  fields: FieldSpec[];
  initial: Record<string, string>;
  submitLabel?: string;
  onClose: () => void;
  /** Receives trimmed values; dates are converted to ISO strings (empty → undefined). */
  onSubmit: (values: Record<string, string | undefined>) => Promise<void>;
}

/** Add/edit dialog for one clinical table row (medication, reconciliation, antibiotic, parameter). */
export function RecordFormModal({ visible, title, subtitle, fields, initial, submitLabel, onClose, onSubmit }: Props) {
  const { isPhone } = useResponsive();
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setValues(initial);
      setErrors({});
    }
    // Reset only when the dialog opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const submit = async () => {
    const next: Record<string, string> = {};
    const out: Record<string, string | undefined> = {};
    for (const f of fields) {
      const raw = (values[f.key] ?? "").trim();
      if (f.required && !raw) next[f.key] = `${f.label} is required`;
      if (f.kind === "date" && raw) {
        const d = parseDayInput(raw);
        if (!d) next[f.key] = "Use dd/mm/yyyy";
        out[f.key] = d?.toISOString();
      } else {
        out[f.key] = raw || undefined;
      }
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    try {
      setSaving(true);
      await onSubmit(out);
    } finally {
      setSaving(false);
    }
  };

  const rows: FieldSpec[][] = [];
  for (const f of fields) {
    const last = rows[rows.length - 1];
    if (!isPhone && f.row !== undefined && last && last[0].row === f.row) last.push(f);
    else rows.push([f]);
  }

  return (
    <FormModal
      visible={visible}
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      submitLabel={submitLabel ?? "Save Changes"}
      onSubmit={submit}
      submitting={saving}
    >
      {rows.map((group) => (
        <View key={group.map((g) => g.key).join("-")} style={styles.row}>
          {group.map((f) => (
            <TextField
              key={f.key}
              label={f.label}
              required={f.required}
              placeholder={f.placeholder ?? (f.kind === "date" ? "dd/mm/yyyy" : f.label)}
              multiline={f.kind === "multiline"}
              value={values[f.key] ?? ""}
              onChangeText={(v) => setValues((s) => ({ ...s, [f.key]: v }))}
              error={errors[f.key]}
              containerStyle={styles.cell}
            />
          ))}
        </View>
      ))}
    </FormModal>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.md },
  cell: { flex: 1, minWidth: 0 },
});
