import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Patient } from "../../types/api";
import { colors, fonts, spacing } from "../../theme/tokens";
import { formatDate, reviewStatus } from "../../utils/format";
import { Card } from "../ui/Card";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";

interface Props {
  patient: Patient;
  onPress: () => void;
}

export function PatientCard({ patient, onPress }: Props) {
  const name = `${patient.firstName} ${patient.lastName}`;
  const latest = patient.latestAdmission;
  const status = latest ? reviewStatus(latest) : null;
  return (
    <Card onPress={onPress} accessibilityLabel={`Open ${name}`} style={styles.card}>
      <Avatar name={patient.firstName} />
      <View style={styles.meta}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.line}>
          <Feather name="credit-card" size={11} color={colors.muted} />
          <Text style={styles.sub} numberOfLines={1}>
            {patient.nationalId || patient.mrn}
          </Text>
        </View>
        <View style={styles.line}>
          <Feather name="calendar" size={11} color={colors.muted} />
          <Text style={styles.sub}>
            {latest ? `Adm: ${formatDate(latest.admissionDate)}` : `Added: ${formatDate(patient.createdAt)}`}
          </Text>
        </View>
      </View>
      {status ? <Badge label={status.label} tone={status.tone === "neutral" ? "neutral" : "brand"} /> : null}
      <Feather name="chevron-right" size={16} color={colors.muted} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  meta: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20, color: colors.text },
  line: { flexDirection: "row", alignItems: "center", gap: 6 },
  sub: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 16, color: colors.muted, flexShrink: 1 },
});
