import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card } from "../../components/ui/Card";
import { Chip } from "../../components/ui/Chip";
import { DataTable } from "../../components/ui/DataTable";
import { EmptyState } from "../../components/ui/EmptyState";
import { Loader } from "../../components/ui/Loader";
import { transfersApi } from "../../services/api/medlogApi";
import { getErrorMessage } from "../../services/api/client";
import { useAuthStore } from "../../store/authStore";
import { Patient, Transfer } from "../../types/api";
import { userOf } from "../../utils/format";
import { clockTime, isoDay } from "../../utils/dates";
import { colors, fonts, radius, spacing } from "../../theme/tokens";

type Box = "all" | "sent" | "received" | "completed";

const BOXES: { key: Box; label: string }[] = [
  { key: "all", label: "All Transfers" },
  { key: "sent", label: "Sent Requests" },
  { key: "received", label: "Received Requests" },
  { key: "completed", label: "Completed" },
];

const STATUS = {
  pending: { label: "Pending", bg: colors.warningBg, fg: colors.warning },
  accepted: { label: "Accepted", bg: colors.successBg, fg: colors.success },
  completed: { label: "Completed", bg: colors.successBg, fg: colors.success },
  cancelled: { label: "Declined", bg: colors.dangerBg, fg: colors.danger },
} as const;

const personName = (value: Transfer["requestedBy"]) => {
  const u = userOf(value);
  if (!u) return "—";
  return `${u.jobTitle === "Doctor" ? "Dr. " : ""}${u.firstName} ${u.lastName}`;
};

const twelveClock = (iso: string) => {
  const [h, m] = clockTime(iso).split(":").map(Number);
  return `${String(h % 12 || 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

export function TransfersPanel({ onPendingChange }: { onPendingChange?: (count: number) => void }) {
  const me = useAuthStore((s) => s.user);
  const [box, setBox] = useState<Box>("all");
  const [items, setItems] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const { data } = await transfersApi.list({ box });
      setItems(data.data);
      onPendingChange?.(data.meta?.pendingReceived ?? 0);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [box, onPendingChange]);

  useEffect(() => {
    load();
  }, [load]);

  const respond = async (t: Transfer, status: "accepted" | "cancelled") => {
    try {
      setBusy(t._id);
      await transfersApi.updateStatus(t._id, status);
      load();
    } catch (err) {
      Alert.alert("Could not update transfer", getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const actions = (t: Transfer) => {
    const toMe = userOf(t.toUser)?._id === me?.id || userOf(t.toUser)?.id === me?.id;
    if (t.status === "completed") {
      return (
        <View style={styles.done}>
          <Feather name="check-circle" size={12} color={colors.success} />
          <Text style={styles.doneText}>Transferred</Text>
        </View>
      );
    }
    if (t.status === "cancelled") return <Text style={styles.muted}>Declined</Text>;
    if (t.status === "pending" && toMe) {
      return (
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => respond(t, "accepted")}
            disabled={busy === t._id}
            accessibilityRole="button"
            accessibilityLabel="Accept transfer"
            style={styles.accept}
          >
            <Text style={styles.acceptText}>Accept</Text>
          </Pressable>
          <Pressable
            onPress={() => respond(t, "cancelled")}
            disabled={busy === t._id}
            accessibilityRole="button"
            accessibilityLabel="Decline transfer"
            style={styles.decline}
          >
            <Feather name="x" size={12} color={colors.danger} />
          </Pressable>
        </View>
      );
    }
    return <Text style={[styles.muted, styles.italic]}>Awaiting reply</Text>;
  };

  return (
    <View>
      <View style={styles.chips}>
        {BOXES.map((b) => (
          <Chip key={b.key} label={b.label} selected={box === b.key} onPress={() => setBox(b.key)} />
        ))}
      </View>
      <Card padded={false} style={styles.tableCard}>
        {loading && items.length === 0 ? (
          <Loader />
        ) : error ? (
          <EmptyState icon="alert-circle" title="Could not load transfers" description={error} actionLabel="Retry" onAction={load} />
        ) : (
          <DataTable
            caps
            framed={false}
            columns={[
              {
                key: "patient",
                label: "Patient",
                flex: 1.4,
                render: (t: Transfer) => {
                  const p = typeof t.patient === "object" ? (t.patient as Patient) : null;
                  return (
                    <View>
                      <Text style={styles.strong} numberOfLines={1}>
                        Patient ({p?.nationalId || p?.mrn || "—"})
                      </Text>
                      <Text style={styles.small}>Civil ID: {p?.nationalId || "—"}</Text>
                    </View>
                  );
                },
              },
              { key: "from", label: "From", render: (t: Transfer) => personName(t.requestedBy) },
              {
                key: "to",
                label: "To (Specialty)",
                render: (t: Transfer) => (
                  <View>
                    <Text style={styles.cell}>{personName(t.toUser)}</Text>
                    {t.toSpecialty ? <Text style={styles.specialty}>{t.toSpecialty}</Text> : null}
                  </View>
                ),
              },
              {
                key: "date",
                label: "Date",
                render: (t: Transfer) => (
                  <Text style={styles.small}>
                    {isoDay(t.createdAt)} {twelveClock(t.createdAt)}
                  </Text>
                ),
              },
              {
                key: "status",
                label: "Status",
                flex: 0.8,
                render: (t: Transfer) => (
                  <View style={[styles.status, { backgroundColor: STATUS[t.status].bg }]}>
                    <Text style={[styles.statusText, { color: STATUS[t.status].fg }]}>{STATUS[t.status].label}</Text>
                  </View>
                ),
              },
              { key: "actions", label: "Actions", align: "right", render: actions },
            ]}
            rows={items}
            keyOf={(t) => t._id}
            emptyText="No patient transfers yet"
          />
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  tableCard: { overflow: "hidden" },
  strong: { fontFamily: fonts.semibold, fontSize: 13, color: colors.heading },
  small: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
  cell: { fontFamily: fonts.regular, fontSize: 12, color: colors.text },
  specialty: { fontFamily: fonts.regular, fontSize: 11, color: colors.primary, marginTop: 2 },
  status: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.full, alignSelf: "flex-start" },
  statusText: { fontFamily: fonts.medium, fontSize: 11 },
  actionRow: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  accept: {
    minHeight: 30,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.checkbox,
    justifyContent: "center",
  },
  acceptText: { fontFamily: fonts.semibold, fontSize: 11, color: colors.white },
  decline: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.dangerBg,
    alignItems: "center",
    justifyContent: "center",
  },
  done: { flexDirection: "row", alignItems: "center", gap: 4 },
  doneText: { fontFamily: fonts.medium, fontSize: 11, color: colors.success },
  muted: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
  italic: { fontStyle: "italic" },
});
