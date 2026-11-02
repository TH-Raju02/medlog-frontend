import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Checkbox } from "../../components/ui/Checkbox";
import { EmptyState } from "../../components/ui/EmptyState";
import { FormModal } from "../../components/ui/FormModal";
import { SwipeRow } from "../../components/ui/SwipeRow";
import { TextField } from "../../components/ui/TextField";
import { remindersApi, usersApi } from "../../services/api/medlogApi";
import { getErrorMessage } from "../../services/api/client";
import { useAuthStore } from "../../store/authStore";
import { Reminder } from "../../types/api";
import {
  clockTime,
  daysFromToday,
  formatDayMonth,
  parseDayInput,
  parseTimeInput,
  toDayInput,
  twelveHour,
} from "../../utils/dates";
import { colors, fonts, radius, spacing, typography } from "../../theme/tokens";

const dueInfo = (reminder: Reminder) => {
  if (reminder.completedAt) {
    const done = daysFromToday(reminder.completedAt) === 0 ? "Completed today" : `Completed ${formatDayMonth(reminder.completedAt)}`;
    return { text: done, color: colors.success, dot: colors.success };
  }
  const days = daysFromToday(reminder.dueAt);
  const time = clockTime(reminder.dueAt);
  if (days < 0) return { text: `Overdue · ${formatDayMonth(reminder.dueAt)} ${time}`, color: colors.dotToday, dot: colors.dotToday };
  if (days === 0) return { text: `Due today · ${time}`, color: colors.dotToday, dot: colors.dotToday };
  if (days === 1) return { text: `Due tomorrow · ${time}`, color: colors.dotTomorrow, dot: colors.dotTomorrow };
  return { text: `Due in ${days} days · ${time}`, color: colors.laterText, dot: colors.dotLater };
};

interface Draft {
  id?: string;
  title: string;
  day: string;
  time: string;
}

const emptyDraft = (): Draft => ({ title: "", day: toDayInput(new Date()), time: "09:00" });

export function RemindersCard() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [draftErrors, setDraftErrors] = useState<Partial<Record<keyof Draft, string>>>({});
  const [saving, setSaving] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [reminderTime, setReminderTime] = useState(user?.preferences?.reminderTime ?? "07:00");

  const load = useCallback(async () => {
    try {
      setError(null);
      const { data } = await remindersApi.list();
      setReminders(data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (reminder: Reminder) => {
    const completed = !reminder.completedAt;
    setReminders((list) =>
      list.map((r) => (r._id === reminder._id ? { ...r, completedAt: completed ? new Date().toISOString() : undefined } : r))
    );
    try {
      await remindersApi.update(reminder._id, { completed });
    } catch (err) {
      Alert.alert("Could not update reminder", getErrorMessage(err));
      load();
    }
  };

  const remove = async (reminder: Reminder) => {
    setReminders((list) => list.filter((r) => r._id !== reminder._id));
    try {
      await remindersApi.remove(reminder._id);
    } catch (err) {
      Alert.alert("Could not delete reminder", getErrorMessage(err));
      load();
    }
  };

  const save = async () => {
    if (!draft) return;
    const day = parseDayInput(draft.day);
    const time = parseTimeInput(draft.time);
    const next: typeof draftErrors = {};
    if (!draft.title.trim()) next.title = "Enter what you need to be reminded about";
    if (!day) next.day = "Use dd/mm/yyyy";
    if (!time) next.time = "Use HH:mm (24h)";
    setDraftErrors(next);
    if (!day || !time || next.title) return;

    day.setHours(time[0], time[1], 0, 0);
    try {
      setSaving(true);
      const payload = { title: draft.title.trim(), dueAt: day.toISOString() };
      if (draft.id) await remindersApi.update(draft.id, payload);
      else await remindersApi.create(payload);
      setDraft(null);
      load();
    } catch (err) {
      Alert.alert("Could not save reminder", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const saveTime = async () => {
    if (!parseTimeInput(reminderTime)) {
      Alert.alert("Invalid time", "Use HH:mm, for example 07:00.");
      return;
    }
    try {
      setSaving(true);
      const { data } = await usersApi.updateMe({ preferences: { reminderTime } });
      updateUser(data.data);
      setTimeOpen(false);
    } catch (err) {
      Alert.alert("Could not save time", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const savedTime = user?.preferences?.reminderTime ?? "07:00";

  return (
    <Card padded={false} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Reminders</Text>
          <View style={styles.legend}>
            <Legend color={colors.dotToday} label="Today" />
            <Legend color={colors.dotTomorrow} label="Tomorrow" />
            <Legend color={colors.dotLater} label="Following days" />
          </View>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.buttons}>
            <Button
              title="Add"
              icon="plus"
              onPress={() => {
                setDraftErrors({});
                setDraft(emptyDraft());
              }}
              style={styles.smallBtn}
            />
            <Button
              title={twelveHour(savedTime)}
              icon="activity"
              variant="neutral"
              onPress={() => {
                setReminderTime(savedTime);
                setTimeOpen(true);
              }}
              accessibilityLabel={`Daily reminder time ${twelveHour(savedTime)}. Change`}
              style={styles.smallBtn}
            />
          </View>
          <Text style={styles.hint}>Swipe left on a reminder to delete.</Text>
        </View>
      </View>
      <View style={styles.divider} />

      {loading ? null : error ? (
        <EmptyState icon="alert-circle" title="Couldn't load reminders" description={error} actionLabel="Retry" onAction={load} />
      ) : reminders.length === 0 ? (
        <EmptyState icon="check" title="You're all caught up" description="There are no reminders scheduled right now." />
      ) : (
        reminders.map((reminder, i) => {
          const info = dueInfo(reminder);
          const done = !!reminder.completedAt;
          return (
            <SwipeRow
              key={reminder._id}
              onDelete={() => remove(reminder)}
              deleteLabel={`Delete reminder ${reminder.title}`}
              style={styles.swipe}
            >
              <View style={[styles.row, i > 0 && styles.rowDivider]}>
                <Checkbox
                  tone="success"
                  checked={done}
                  onChange={() => toggle(reminder)}
                  accessibilityLabel={`Mark ${reminder.title} ${done ? "not done" : "done"}`}
                />
                <View style={[styles.dot, { backgroundColor: info.dot }]} />
                <View style={styles.flex}>
                  <Text style={[styles.reminderTitle, done && styles.done]} numberOfLines={2}>
                    {reminder.title}
                  </Text>
                  <Text style={[styles.due, { color: info.color }]}>{info.text}</Text>
                </View>
                <Pressable
                  onPress={() => {
                    setDraftErrors({});
                    setDraft({
                      id: reminder._id,
                      title: reminder.title,
                      day: toDayInput(reminder.dueAt),
                      time: clockTime(reminder.dueAt),
                    });
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${reminder.title}`}
                  style={styles.edit}
                >
                  <Feather name="edit-2" size={13} color={colors.primaryStrong} />
                </Pressable>
              </View>
            </SwipeRow>
          );
        })
      )}

      <FormModal
        visible={!!draft}
        title={draft?.id ? "Edit Reminder" : "Add Reminder"}
        subtitle="Set what needs doing and when it is due."
        onClose={() => setDraft(null)}
        submitLabel={draft?.id ? "Save Changes" : "Add Reminder"}
        onSubmit={save}
        submitting={saving}
        maxWidth={520}
      >
        <TextField
          label="Reminder"
          required
          placeholder="e.g. Medication review — Ward 5"
          value={draft?.title ?? ""}
          onChangeText={(title) => setDraft((d) => (d ? { ...d, title } : d))}
          error={draftErrors.title}
        />
        <View style={styles.quickDays}>
          {[
            { label: "Today", offset: 0 },
            { label: "Tomorrow", offset: 1 },
            { label: "In 3 days", offset: 3 },
          ].map((q) => {
            const value = toDayInput(new Date(Date.now() + q.offset * 86400000));
            const active = draft?.day === value;
            return (
              <Pressable
                key={q.label}
                onPress={() => setDraft((d) => (d ? { ...d, day: value } : d))}
                accessibilityRole="button"
                style={[styles.quickDay, active && styles.quickDayActive]}
              >
                <Text style={[styles.quickDayText, active && styles.quickDayTextActive]}>{q.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.formRow}>
          <TextField
            label="Due date"
            placeholder="dd/mm/yyyy"
            value={draft?.day ?? ""}
            onChangeText={(day) => setDraft((d) => (d ? { ...d, day } : d))}
            error={draftErrors.day}
            containerStyle={styles.flex}
          />
          <TextField
            label="Time"
            placeholder="HH:mm"
            value={draft?.time ?? ""}
            onChangeText={(time) => setDraft((d) => (d ? { ...d, time } : d))}
            error={draftErrors.time}
            containerStyle={styles.flex}
          />
        </View>
      </FormModal>

      <FormModal
        visible={timeOpen}
        title="Daily Reminder Time"
        subtitle="When MedLog reminds you about today's reminders and pending reviews."
        onClose={() => setTimeOpen(false)}
        submitLabel="Save Changes"
        onSubmit={saveTime}
        submitting={saving}
        maxWidth={440}
      >
        <TextField label="Time (24h)" placeholder="07:00" value={reminderTime} onChangeText={setReminderTime} />
      </FormModal>
    </Card>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, overflow: "hidden" },
  flex: { flex: 1, minWidth: 0 },
  header: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, padding: spacing.lg, paddingBottom: spacing.md },
  headerText: { flexGrow: 1, flexShrink: 1, flexBasis: 220, minWidth: 0 },
  title: { ...typography.sectionTitle, fontSize: 17 },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.xs },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textBody },
  headerActions: { alignItems: "flex-end", gap: spacing.xs },
  buttons: { flexDirection: "row", gap: spacing.sm },
  smallBtn: { minHeight: 34, paddingHorizontal: spacing.md },
  hint: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, fontStyle: "italic" },
  divider: { height: 1, backgroundColor: colors.divider },
  swipe: { borderRadius: 0 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    minHeight: 60,
  },
  rowDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
  dot: { width: 6, height: 6, borderRadius: 3, marginLeft: -spacing.xs },
  reminderTitle: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  done: { textDecorationLine: "line-through", color: colors.muted },
  due: { fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
  edit: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.iconButtonBg,
    alignItems: "center",
    justifyContent: "center",
  },
  quickDays: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md, flexWrap: "wrap" },
  quickDay: {
    paddingHorizontal: spacing.md,
    minHeight: 32,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    justifyContent: "center",
  },
  quickDayActive: { backgroundColor: colors.chipSelectedBg, borderColor: colors.primary },
  quickDayText: { fontFamily: fonts.medium, fontSize: 12, color: colors.textBody },
  quickDayTextActive: { color: colors.primaryStrong },
  formRow: { flexDirection: "row", gap: spacing.md },
});
