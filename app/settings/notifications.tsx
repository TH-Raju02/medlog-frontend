import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { TextField } from "../../src/components/ui/TextField";
import { YesNoToggle } from "../../src/components/ui/YesNoToggle";
import { usersApi } from "../../src/services/api/medlogApi";
import { getErrorMessage } from "../../src/services/api/client";
import { useAuthStore } from "../../src/store/authStore";
import { parseTimeInput } from "../../src/utils/dates";
import { colors, fonts, spacing, typography } from "../../src/theme/tokens";

export default function NotificationsScreen() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const prefs = user?.preferences;
  const [enabled, setEnabled] = useState(prefs?.notificationsEnabled !== false);
  const [handover, setHandover] = useState(prefs?.handoverNotifications !== false);
  const [time, setTime] = useState(prefs?.reminderTime ?? "07:00");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!parseTimeInput(time)) {
      setError("Use HH:mm, for example 07:00");
      return;
    }
    try {
      setError(undefined);
      setSaving(true);
      const { data } = await usersApi.updateMe({
        preferences: { notificationsEnabled: enabled, handoverNotifications: handover, reminderTime: time },
      });
      updateUser(data.data);
      Alert.alert("Saved", "Your notification preferences were updated.");
    } catch (err) {
      Alert.alert("Could not save", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll maxWidth={760} header={<Header title="Notifications & Alerts" subtitle="Reminder times and handover notifications" showBack />}>
      <Card style={styles.card}>
        <Row title="Reminder notifications" caption="Alerts for reminders that are due today.">
          <YesNoToggle compact value={enabled} onChange={setEnabled} style={styles.toggle} />
        </Row>
        <Row title="Handover notifications" caption="Alerts when a colleague sends or accepts a handover.">
          <YesNoToggle compact value={handover} onChange={setHandover} style={styles.toggle} />
        </Row>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Text style={styles.title}>Daily reminder time</Text>
            <Text style={typography.caption}>When the daily review and reminder summary is sent (24h).</Text>
          </View>
          <TextField label="Daily reminder time" hideLabel value={time} onChangeText={setTime} error={error} containerStyle={styles.time} />
        </View>
      </Card>
      <Button title="Save Changes" onPress={save} loading={saving} />
    </Screen>
  );
}

function Row({ title, caption, children }: { title: string; caption: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <View style={styles.flex}>
        <Text style={styles.title}>{title}</Text>
        <Text style={typography.caption}>{caption}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  card: { marginBottom: spacing.lg, paddingVertical: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: { fontFamily: fonts.semibold, fontSize: 14, color: colors.heading },
  toggle: { width: 120 },
  time: { width: 100, marginBottom: 0 },
});
