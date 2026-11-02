import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Admission } from "../../types/api";
import { useResponsive } from "../../hooks/useResponsive";
import { colors, fonts, spacing } from "../../theme/tokens";
import {
  ageFromDob,
  formatDate,
  fullName,
  locationOf,
  patientOf,
  patientTint,
  reviewStatus,
} from "../../utils/format";
import { Badge } from "../ui/Badge";

interface Props {
  admissions: Admission[];
  onOpen: (admission: Admission) => void;
}

const COLUMNS = [
  { key: "patient", label: "Patient", flex: 2.2 },
  { key: "diagnosis", label: "Diagnosis", flex: 2.2 },
  { key: "date", label: "Adm. Date", flex: 1.3 },
  { key: "location", label: "Location", flex: 1.1 },
  { key: "status", label: "Status", flex: 1.3 },
] as const;

function PatientCell({ admission }: { admission: Admission }) {
  const patient = patientOf(admission);
  const tint = patientTint(patient?.gender);
  const age = ageFromDob(patient?.dateOfBirth);
  return (
    <View style={styles.patientCell}>
      <View style={[styles.patientIcon, { backgroundColor: tint.bg }]}>
        <Feather name="user" size={13} color={tint.fg} />
      </View>
      <View style={styles.flexText}>
        <Text style={styles.name} numberOfLines={1}>
          {fullName(patient)}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {age !== null ? `${age} years` : patient?.nationalId ?? ""}
        </Text>
      </View>
    </View>
  );
}

/** Current admissions with the daily-review status (Reviewed / Pending) used by Figma. */
export function AdmissionsTable({ admissions, onOpen }: Props) {
  const { isPhone } = useResponsive();

  if (isPhone) {
    return (
      <View>
        {admissions.map((admission, i) => {
          const status = reviewStatus(admission);
          return (
            <Pressable
              key={admission._id}
              onPress={() => onOpen(admission)}
              accessibilityRole="button"
              accessibilityLabel={`Open admission for ${fullName(patientOf(admission))}`}
              style={({ pressed }) => [styles.phoneRow, i > 0 && styles.rowDivider, pressed && styles.pressed]}
            >
              <View style={styles.phoneTop}>
                <PatientCell admission={admission} />
                <Badge label={status.label} tone={status.tone} />
              </View>
              <Text style={styles.cellText} numberOfLines={2}>
                {admission.diagnosis || admission.chiefComplaint || "—"}
              </Text>
              <Text style={styles.sub}>
                {formatDate(admission.admissionDate)} · Location {locationOf(admission)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View accessibilityRole="list">
      <View style={styles.headerRow}>
        {COLUMNS.map((c) => (
          <Text
            key={c.key}
            style={[styles.headerText, { flex: c.flex }, c.key === "status" && styles.center]}
            numberOfLines={1}
          >
            {c.label.toUpperCase()}
          </Text>
        ))}
      </View>
      {admissions.map((admission) => {
        const status = reviewStatus(admission);
        return (
          <Pressable
            key={admission._id}
            onPress={() => onOpen(admission)}
            accessibilityRole="button"
            accessibilityLabel={`Open admission for ${fullName(patientOf(admission))}`}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View style={[styles.cell, { flex: COLUMNS[0].flex }]}>
              <PatientCell admission={admission} />
            </View>
            <Text style={[styles.cell, styles.cellText, { flex: COLUMNS[1].flex }]} numberOfLines={2}>
              {admission.diagnosis || admission.chiefComplaint || "—"}
            </Text>
            <Text style={[styles.cell, styles.cellText, { flex: COLUMNS[2].flex }]}>
              {formatDate(admission.admissionDate)}
            </Text>
            <Text style={[styles.cell, styles.cellText, { flex: COLUMNS[3].flex }]} numberOfLines={1}>
              {locationOf(admission)}
            </Text>
            <View style={[styles.statusCell, { flex: COLUMNS[4].flex, backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.fg }]}>{status.label}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 40,
    paddingLeft: spacing.lg,
    backgroundColor: colors.tableHeaderBg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.divider,
  },
  headerText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 0.4,
    color: colors.tableHeaderText,
    paddingRight: spacing.sm,
  },
  center: { textAlign: "center", paddingRight: 0 },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 64,
    paddingLeft: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  pressed: { backgroundColor: colors.iconButtonBg },
  cell: { alignSelf: "center", paddingRight: spacing.sm },
  cellText: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.textBody },
  statusCell: { alignItems: "center", justifyContent: "center" },
  statusText: { fontFamily: fonts.medium, fontSize: 13 },
  patientCell: { flexDirection: "row", alignItems: "center", gap: spacing.md, flexShrink: 1 },
  patientIcon: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  flexText: { flexShrink: 1, minWidth: 0 },
  name: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, color: colors.text },
  sub: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: colors.muted },
  phoneRow: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, gap: 6 },
  phoneTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  rowDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
});
