import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Screen } from "../../components/ui/Screen";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { patientsApi } from "../../services/api/medlogApi";
import { getErrorMessage } from "../../services/api/client";
import { Patient } from "../../types/api";
import { ageFromDob, fullName } from "../../utils/format";
import { colors, fonts, radius, spacing, typography } from "../../theme/tokens";

type Result = { kind: "found"; patient: Patient } | { kind: "missing"; civilId: string } | null;

/** Figma "Start a new admission": look a patient up by Civil ID before admitting. */
export function AdmissionSearch() {
  const router = useRouter();
  const [civilId, setCivilId] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    const id = civilId.trim();
    if (!id) {
      setError("Enter a Civil ID to search.");
      return;
    }
    try {
      setError(null);
      setLoading(true);
      const { data } = await patientsApi.lookup(id);
      setResult(data.data ? { kind: "found", patient: data.data } : { kind: "missing", civilId: id });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const age = result?.kind === "found" ? ageFromDob(result.patient.dateOfBirth) : null;

  return (
    <Screen scroll maxWidth={500}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Feather name="user" size={16} color={colors.iconTile} />
        </View>
        <Text style={styles.title} accessibilityRole="header">
          Start a new admission
        </Text>
        <Text style={styles.subtitle}>
          Search by Civil ID to find an existing patient or create a new profile.
        </Text>
      </View>

      <Card style={styles.searchCard}>
        <Text style={typography.label}>Civil ID</Text>
        <View style={styles.searchRow}>
          <View style={styles.inputWrap}>
            <TextInput
              value={civilId}
              onChangeText={(v) => {
                setCivilId(v);
                setResult(null);
              }}
              onSubmitEditing={search}
              placeholder="Enter Civil ID"
              placeholderTextColor={colors.placeholder}
              keyboardType="number-pad"
              returnKeyType="search"
              accessibilityLabel="Civil ID"
              style={styles.input}
            />
            {civilId ? (
              <Pressable
                onPress={() => {
                  setCivilId("");
                  setResult(null);
                }}
                accessibilityRole="button"
                accessibilityLabel="Clear Civil ID"
                hitSlop={10}
                style={styles.clear}
              >
                <Feather name="x" size={14} color={colors.muted} />
              </Pressable>
            ) : null}
          </View>
          <Button
            title="Search"
            variant="strong"
            onPress={search}
            loading={loading}
            disabled={!civilId.trim()}
            style={styles.searchBtn}
          />
        </View>
        <Text style={styles.hint}>Enter the patient's Civil ID exactly as shown on their card.</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Card>

      {result?.kind === "found" ? (
        <Card padded={false} style={styles.resultCard}>
          <View style={styles.resultBody}>
            <View style={[styles.avatar, styles.avatarFound]}>
              <Feather name="user" size={16} color={colors.success} />
            </View>
            <View style={styles.flex}>
              <View style={styles.foundLabel}>
                <Feather name="check-circle" size={11} color={colors.success} />
                <Text style={styles.foundText}>EXISTING PATIENT FOUND</Text>
              </View>
              <Text style={styles.name}>{fullName(result.patient)}</Text>
              <Text style={styles.meta}>
                Civil ID {result.patient.nationalId}
                {age !== null ? ` · ${age} years old` : ""}
              </Text>
            </View>
          </View>
          <View style={styles.resultFooter}>
            <Button
              title={`Continue with ${fullName(result.patient)}`}
              icon="chevron-right"
              iconPosition="right"
              onPress={() =>
                router.push({ pathname: "/admissions/new", params: { patientId: result.patient._id } })
              }
            />
          </View>
        </Card>
      ) : null}

      {result?.kind === "missing" ? (
        <Card padded={false} style={styles.resultCard}>
          <View style={styles.resultBody}>
            <View style={styles.avatar}>
              <Feather name="user" size={16} color={colors.muted} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.name}>No patient profile found</Text>
              <Text style={styles.meta}>
                No profile is associated with Civil ID {result.civilId}. Create a profile to continue with this
                admission.
              </Text>
            </View>
          </View>
          <View style={styles.resultFooter}>
            <Button
              title="Create new patient profile"
              icon="plus"
              onPress={() => router.push({ pathname: "/admissions/new", params: { civilId: result.civilId } })}
            />
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  hero: { alignItems: "center", marginTop: spacing.lg, marginBottom: spacing.xl },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.iconTileBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: { fontFamily: fonts.semibold, fontSize: 22, lineHeight: 30, color: colors.heading, textAlign: "center" },
  subtitle: { ...typography.body, color: colors.muted, textAlign: "center", marginTop: spacing.xs },
  searchCard: { gap: spacing.sm, marginBottom: spacing.md },
  searchRow: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  inputWrap: { flex: 1, justifyContent: "center" },
  input: {
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.searchBg,
    paddingHorizontal: 14,
    paddingRight: 36,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  clear: { position: "absolute", right: 12 },
  searchBtn: { minWidth: 92 },
  hint: { ...typography.caption, fontSize: 11 },
  error: { ...typography.caption, color: colors.danger },
  resultCard: { overflow: "hidden" },
  resultBody: { flexDirection: "row", gap: spacing.md, padding: spacing.lg, alignItems: "center" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.iconButtonBg,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFound: { backgroundColor: colors.successBg },
  foundLabel: { flexDirection: "row", alignItems: "center", gap: 4 },
  foundText: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 0.4, color: colors.success },
  name: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, color: colors.heading },
  meta: { ...typography.caption, marginTop: 2 },
  resultFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    padding: spacing.md,
    backgroundColor: colors.tableHeaderBg,
  },
});
