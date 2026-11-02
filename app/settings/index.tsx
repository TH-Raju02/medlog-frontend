import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { Checkbox } from "../../src/components/ui/Checkbox";
import { FormModal } from "../../src/components/ui/FormModal";
import { SelectField } from "../../src/components/ui/SelectField";
import { ListRow } from "../../src/components/shared/ListRow";
import { TransfersPanel } from "../../src/features/settings/TransfersPanel";
import { specialtiesApi, transfersApi, usersApi } from "../../src/services/api/medlogApi";
import { getErrorMessage } from "../../src/services/api/client";
import { useAuthStore } from "../../src/store/authStore";
import { colors, fonts, radius, spacing, typography } from "../../src/theme/tokens";

type Tab = "settings" | "transfers";

export default function SettingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: Tab }>();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [tab, setTab] = useState<Tab>(params.tab === "transfers" ? "transfers" : "settings");
  const [pending, setPending] = useState(0);
  const [specialtyOpen, setSpecialtyOpen] = useState(false);
  const [specialties, setSpecialties] = useState<{ value: string; label: string }[]>([]);
  const [specialty, setSpecialty] = useState<string>();
  const [understood, setUnderstood] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    transfersApi
      .list({ box: "received", status: "pending" })
      .then(({ data }) => setPending(data.meta?.pendingReceived ?? data.data.length))
      .catch(() => undefined);
  }, []);

  const onPendingChange = useCallback((count: number) => setPending(count), []);

  const openSpecialty = async () => {
    setSpecialty(user?.specialty);
    setUnderstood(false);
    setSpecialtyOpen(true);
    if (specialties.length === 0) {
      try {
        const { data } = await specialtiesApi.list();
        setSpecialties(data.data.map((s) => ({ value: s.name, label: s.name })));
      } catch (err) {
        Alert.alert("Could not load specialties", getErrorMessage(err));
      }
    }
  };

  const saveSpecialty = async () => {
    if (!specialty) return;
    if (!understood) {
      Alert.alert("Please confirm", "Confirm that you understand historical data stays intact.");
      return;
    }
    try {
      setSaving(true);
      const { data } = await usersApi.updateMe({ specialty });
      updateUser(data.data);
      setSpecialtyOpen(false);
    } catch (err) {
      Alert.alert("Could not change specialty", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      scroll
      header={
        <Header
          title="Settings & Transfers"
          subtitle="Manage department specialty, preferences, and patient transfer history"
          showBack
        />
      }
    >
      <View style={styles.tabs} accessibilityRole="tablist">
        {([
          { key: "settings", label: "Settings & Preferences", icon: "settings" },
          { key: "transfers", label: "Patient Transfers", icon: "repeat" },
        ] as const).map((t) => {
          const active = tab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Feather name={t.icon} size={14} color={active ? colors.primary : colors.textBody} />
              <Text style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={1}>
                {t.label}
              </Text>
              {t.key === "transfers" && pending > 0 ? <View style={styles.dot} /> : null}
            </Pressable>
          );
        })}
      </View>

      {tab === "settings" ? (
        <View style={styles.stack}>
          <Card style={styles.specialtyCard}>
            <View style={styles.specialtyHeader}>
              <View style={styles.iconCircle}>
                <Feather name="user" size={16} color={colors.primary} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>Medical Specialty</Text>
                <Text style={styles.cardSub}>Clinical department scope used for patient assignments and rounds.</Text>
              </View>
            </View>
            <View style={styles.specialtyBox}>
              <View style={styles.flex}>
                <Text style={styles.overline}>CURRENT SPECIALTY</Text>
                <View style={styles.specialtyChip}>
                  <Text style={styles.specialtyChipText}>{user?.specialty || "Not set"}</Text>
                </View>
              </View>
              <Button title="Change Specialty" icon="edit-2" onPress={openSpecialty} style={styles.changeBtn} />
            </View>
          </Card>

          <Text style={styles.sectionTitle}>General & Security</Text>
          <Card padded={false} style={styles.list}>
            <ListRow
              first
              icon="credit-card"
              title="Subscription Details"
              caption="Manage clinical plan renewal and billing"
              onPress={() => router.push("/settings/subscription")}
            />
            <ListRow
              icon="bell"
              title="Notifications & Alerts"
              caption="Reminder times and handover notifications"
              onPress={() => router.push("/settings/notifications")}
            />
            <ListRow
              icon="shield"
              title="MedLog Terms and Conditions"
              caption="Patient confidentiality and encryption standards"
              onPress={() => router.push("/terms")}
            />
          </Card>
        </View>
      ) : (
        <TransfersPanel onPendingChange={onPendingChange} />
      )}

      <FormModal
        visible={specialtyOpen}
        title="Change Specialty"
        subtitle="Historical records are always preserved."
        onClose={() => setSpecialtyOpen(false)}
        submitLabel="Save Changes"
        onSubmit={saveSpecialty}
        submitting={saving}
        submitDisabled={!specialty}
        maxWidth={560}
      >
        <SelectField label="Specialty" options={specialties} value={specialty} onChange={setSpecialty} placeholder="Select specialty" />
        <View style={styles.confirmBox}>
          <Checkbox
            checked={understood}
            onChange={setUnderstood}
            accessibilityLabel="I understand historical data stays intact"
            label={
              <View style={styles.flex}>
                <Text style={styles.confirmTitle}>I understand historical data stays intact</Text>
                <Text style={styles.confirmText}>
                  Past admissions, medications and DTPs remain attached to their original specialty.
                </Text>
              </View>
            }
          />
        </View>
      </FormModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  stack: { gap: spacing.md },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.segmentBg,
    borderRadius: radius.lg,
    padding: 3,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  tabActive: { backgroundColor: colors.surface },
  tabText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textBody, flexShrink: 1 },
  tabTextActive: { color: colors.primary, fontFamily: fonts.medium },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.dotToday },
  specialtyCard: { gap: spacing.md },
  specialtyHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.iconButtonBg,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.heading },
  cardSub: { ...typography.caption },
  specialtyBox: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.md,
    backgroundColor: colors.tableHeaderBg,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  overline: { fontFamily: fonts.medium, fontSize: 10, letterSpacing: 0.4, color: colors.textBody, marginBottom: spacing.xs },
  specialtyChip: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.quickActionBorder,
    backgroundColor: colors.quickActionBg,
  },
  specialtyChipText: { fontFamily: fonts.medium, fontSize: 12, color: colors.primary },
  changeBtn: { minHeight: 36 },
  sectionTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.heading, marginTop: spacing.sm },
  list: { overflow: "hidden" },
  confirmBox: { backgroundColor: colors.inputBg, borderRadius: radius.md, padding: spacing.md },
  confirmTitle: { fontFamily: fonts.semibold, fontSize: 13, color: colors.heading },
  confirmText: { ...typography.caption, marginTop: 2 },
});
