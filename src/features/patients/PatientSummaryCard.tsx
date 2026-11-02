import { ReactNode, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card } from "../../components/ui/Card";
import { useResponsive } from "../../hooks/useResponsive";
import { Patient } from "../../types/api";
import { bmiOf, fullName, patientSubtitle } from "../../utils/format";
import { colors, fonts, radius, spacing } from "../../theme/tokens";

interface Props {
  patient: Patient;
  /** Buttons shown on the right of the name row (e.g. Edit Profile). */
  actions?: ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

/** Patient identity card: name, allergy banner and the Civil ID / File # / ... facts grid. */
export function PatientSummaryCard({ patient, actions, collapsible, defaultExpanded = true }: Props) {
  const { isPhone } = useResponsive();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const female = patient.gender === "female";
  const bmi = bmiOf(patient.weightKg, patient.heightCm);
  const facts: Array<[string, string]> = [
    ["Civil ID", patient.nationalId || "—"],
    ["File #", patient.fileNumber || "—"],
    ["Nationality", patient.nationality || "—"],
    ["Contact #", patient.phone || "—"],
    ["Blood Type", patient.bloodType || "—"],
    ["Weight", patient.weightKg ? `${patient.weightKg} kg` : "—"],
    ["Height", patient.heightCm ? `${patient.heightCm} cm` : "—"],
    ["BMI", bmi ? `${bmi} kg/m²` : "—"],
  ];

  return (
    <Card style={styles.card}>
      <View style={styles.inner}>
        <View style={styles.identity}>
          <View style={[styles.avatar, female ? styles.avatarFemale : styles.avatarMale]}>
            <Feather name="user" size={16} color={female ? colors.pdf : colors.avatarText} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.name} numberOfLines={1}>
              {fullName(patient)}
            </Text>
            <Text style={styles.sub}>{patientSubtitle(patient)}</Text>
          </View>
          {actions}
          {collapsible ? (
            <Pressable
              onPress={() => setExpanded((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={expanded ? "Hide patient details" : "Show patient details"}
              style={styles.chevron}
            >
              <Feather name={expanded ? "chevron-up" : "chevron-down"} size={16} color={colors.textBody} />
            </Pressable>
          ) : null}
        </View>
        {patient.hasAllergies ? (
          <View style={[styles.banner, styles.bannerDanger]}>
            <Feather name="alert-triangle" size={14} color={colors.danger} />
            <Text style={[styles.bannerText, { color: colors.danger }]}>
              Allergies : {patient.allergies || "Not specified"}
            </Text>
          </View>
        ) : (
          <View style={[styles.banner, styles.bannerOk]}>
            <Text style={[styles.bannerText, { color: colors.success }]}>No Known Allergies</Text>
          </View>
        )}
      </View>

      {expanded ? (
        <>
          <View style={styles.divider} />
          <View style={styles.facts}>
            {facts.map(([label, value]) => (
              <View key={label} style={[styles.fact, { width: isPhone ? "50%" : "25%" }]}>
                <Text style={styles.factLabel}>{label.toUpperCase()}</Text>
                <Text style={styles.factValue} numberOfLines={1}>
                  {value}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </Card>
  );
}

interface Tile {
  label: string;
  value: boolean | undefined;
  emoji?: string;
}

/** "Physical assessment", "Lines / Tubes" and "Life Assessment" Yes/No tiles. */
export function AssessmentTiles({
  title,
  tiles,
  right,
  compact,
}: {
  title: string;
  tiles: Tile[];
  right?: ReactNode;
  compact?: boolean;
}) {
  return (
    <Card style={styles.tilesCard}>
      <View style={styles.tilesHeader}>
        <Text style={styles.tilesTitle}>{title}</Text>
        {right}
      </View>
      <View style={styles.tiles}>
        {tiles.map((t) => (
          <View key={t.label} style={[styles.tile, compact && styles.tileCompact, t.value && styles.tileActive]}>
            {t.emoji ? <Text style={styles.emoji}>{t.emoji}</Text> : null}
            <Text style={[styles.tileLabel, t.value && styles.tileLabelActive]}>{t.label}</Text>
            <Text style={[styles.tileValue, t.value && styles.tileValueActive]}>{t.value ? "Yes" : "No"}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  card: { padding: spacing.md },
  inner: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  identity: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  avatarFemale: { backgroundColor: colors.dangerBg },
  avatarMale: { backgroundColor: colors.patientTealBg },
  name: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, color: colors.heading },
  sub: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  chevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  banner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, minHeight: 36 },
  bannerDanger: { backgroundColor: colors.allergyBg },
  bannerOk: { backgroundColor: colors.noAllergyBg },
  bannerText: { fontFamily: fonts.medium, fontSize: 13 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },
  facts: { flexDirection: "row", flexWrap: "wrap", rowGap: spacing.md },
  fact: { paddingRight: spacing.md },
  factLabel: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 0.4, color: colors.muted },
  factValue: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text, marginTop: 4 },
  tilesCard: { padding: spacing.md, flex: 1 },
  tilesHeader: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md, gap: spacing.sm },
  tilesTitle: { flex: 1, fontFamily: fonts.semibold, fontSize: 14, color: colors.heading },
  tiles: { flexDirection: "row", gap: spacing.sm },
  tile: {
    flex: 1,
    minHeight: 60,
    borderRadius: radius.md,
    backgroundColor: colors.tileBg,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    gap: 4,
  },
  tileCompact: { minHeight: 52 },
  tileActive: { backgroundColor: colors.tileActiveBg },
  emoji: { fontSize: 18 },
  tileLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.textBody },
  tileLabelActive: { color: colors.primaryStrong },
  tileValue: { fontFamily: fonts.semibold, fontSize: 12, color: colors.text },
  tileValueActive: { color: colors.primaryStrong },
});
