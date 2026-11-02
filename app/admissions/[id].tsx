import { useCallback, useState } from "react";
import { Alert, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Screen } from "../../src/components/ui/Screen";
import { Header } from "../../src/components/ui/Header";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { DataTable } from "../../src/components/ui/DataTable";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Loader } from "../../src/components/ui/Loader";
import { PatientSummaryCard } from "../../src/features/patients/PatientSummaryCard";
import { useWorkspace } from "../../src/features/workspace/useWorkspace";
import { OverviewTab } from "../../src/features/workspace/OverviewTab";
import { LabTab } from "../../src/features/workspace/LabTab";
import { WorkspaceCard } from "../../src/features/workspace/parts";
import { DischargeModal, HandoverModal, PatientEditModal } from "../../src/features/workspace/WorkspaceModals";
import { admissionsApi } from "../../src/services/api/medlogApi";
import { useResponsive } from "../../src/hooks/useResponsive";
import { getErrorMessage } from "../../src/services/api/client";
import { Admission, Patient } from "../../src/types/api";
import { formatDate, patientOf } from "../../src/utils/format";
import { clockTime, isReviewedToday, longDay } from "../../src/utils/dates";
import { colors, fonts, radius, spacing } from "../../src/theme/tokens";

type Tab = "overview" | "lab" | "history";

const TABS: { key: Tab; label: string; short: string }[] = [
  { key: "overview", label: "Overview", short: "Overview" },
  { key: "lab", label: "Lab / Culture & Susceptibility", short: "Lab / Culture" },
  { key: "history", label: "Previous Admissions", short: "Previous" },
];

export default function ClinicalWorkspaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isPhone } = useResponsive();
  const { data, setData, loading, error, load } = useWorkspace(id);
  const [tab, setTab] = useState<Tab>("overview");
  const [editing, setEditing] = useState(false);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [modal, setModal] = useState<"profile" | "discharge" | "handover" | null>(null);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const admission = data?.admission;
  const patient = admission ? patientOf(admission) : null;
  const discharged = admission?.status === "discharged";
  const canEdit = !!admission && !discharged;
  const reviewed = isReviewedToday(admission?.lastReviewedAt);

  const toggleReview = async () => {
    if (!admission) return;
    try {
      setReviewBusy(true);
      const { data: res } = reviewed
        ? await admissionsApi.undoReview(admission._id)
        : await admissionsApi.review(admission._id);
      setData((d) => (d ? { ...d, admission: res.data } : d));
    } catch (err) {
      Alert.alert("Could not update review", getErrorMessage(err));
    } finally {
      setReviewBusy(false);
    }
  };

  const header = (
    <Header
      title="Clinical Workspace"
      subtitle={admission ? [admission.specialty, admission.code].filter(Boolean).join(" · ") : undefined}
      showBack
      right={
        admission ? (
          editing ? (
            <Button
              title="Done editing"
              icon="check"
              variant="outline"
              onPress={() => setEditing(false)}
              style={styles.headerBtn}
            />
          ) : (
            <Button
              title="Edit Profile"
              icon="edit-2"
              onPress={() => setEditing(true)}
              disabled={!canEdit}
              style={styles.headerBtn}
            />
          )
        ) : null
      }
    />
  );

  if (loading && !data) {
    return (
      <Screen header={header}>
        <Loader />
      </Screen>
    );
  }

  if (error || !admission || !patient || !data) {
    return (
      <Screen header={header}>
        <EmptyState icon="alert-circle" title="Could not load admission" description={error ?? undefined} actionLabel="Retry" onAction={load} />
      </Screen>
    );
  }

  return (
    <Screen scroll header={header} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      <View style={styles.stack}>
        <PatientSummaryCard
          patient={patient}
          collapsible
          defaultExpanded={false}
          actions={
            canEdit ? (
              <Pressable
                onPress={() => setModal("profile")}
                accessibilityRole="button"
                accessibilityLabel="Edit patient profile"
                style={styles.softBtn}
              >
                <Feather name="edit-2" size={12} color={colors.softActionText} />
                <Text style={styles.softBtnText}>Edit Profile</Text>
              </Pressable>
            ) : null
          }
        />

        <Card style={styles.reviewCard}>
          <View style={styles.reviewText}>
            <Text style={styles.reviewTitle}>Daily clinical review</Text>
            <Text style={styles.reviewSub}>Review status resets to pending every day at 7:00 AM.</Text>
          </View>
          <View style={[styles.reviewPill, reviewed ? styles.reviewedPill : styles.pendingPill]}>
            <View style={[styles.reviewDot, { backgroundColor: reviewed ? colors.success : colors.warning }]} />
            <Text style={[styles.reviewPillText, { color: reviewed ? colors.success : colors.pendingText }]}>
              {reviewed ? "Reviewed today" : "Pending review"}
            </Text>
          </View>
          {reviewed ? (
            <Button
              title="Undo review"
              icon="repeat"
              variant="outline"
              onPress={toggleReview}
              loading={reviewBusy}
              disabled={!canEdit}
              style={styles.reviewBtn}
            />
          ) : (
            <Button
              title="Mark reviewed"
              icon="check"
              onPress={toggleReview}
              loading={reviewBusy}
              disabled={!canEdit}
              style={styles.reviewBtn}
            />
          )}
        </Card>

        <View style={styles.tabs} accessibilityRole="tablist">
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={1}>
                  {isPhone ? t.short : t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {tab === "overview" ? (
          <OverviewTab
            data={data}
            patient={patient}
            editing={editing && canEdit}
            canEdit={canEdit}
            onChanged={load}
            onHandover={() => setModal("handover")}
            onDischarge={() => setModal("discharge")}
          />
        ) : tab === "lab" ? (
          <LabTab
            admissionId={admission._id}
            labs={data.labs}
            cultures={data.cultures}
            editing={editing && canEdit}
            onChanged={load}
          />
        ) : (
          <PreviousAdmissions items={data.history} />
        )}

        {discharged ? <DischargedBanner admission={admission} /> : null}
      </View>

      <PatientEditModal
        visible={modal === "profile"}
        patient={patient as Patient}
        onClose={() => setModal(null)}
        onSaved={load}
      />
      <DischargeModal
        visible={modal === "discharge"}
        admissionId={admission._id}
        currentMeds={data.hospitalMeds}
        onClose={() => setModal(null)}
        onDischarged={() => {
          setEditing(false);
          load();
        }}
      />
      <HandoverModal
        visible={modal === "handover"}
        admissionId={admission._id}
        onClose={() => setModal(null)}
        onDone={load}
      />
    </Screen>
  );
}

function PreviousAdmissions({ items }: { items: Admission[] }) {
  return (
    <WorkspaceCard title="Admissions">
      <DataTable
        caps
        columns={[
          { key: "diagnosis", label: "Diagnosis", render: (a: Admission) => a.diagnosis || a.specialty || "—" },
          { key: "admitted", label: "Admission Date", render: (a: Admission) => formatDate(a.admissionDate) },
          {
            key: "discharged",
            label: "Discharge Date",
            render: (a: Admission) => (a.dischargedAt ? formatDate(a.dischargedAt) : a.status === "active" ? "Current" : "—"),
          },
        ]}
        rows={items}
        keyOf={(a) => a._id}
        emptyText="No previous admissions"
      />
    </WorkspaceCard>
  );
}

function DischargedBanner({ admission }: { admission: Admission }) {
  const when = admission.dischargedAt;
  return (
    <View style={styles.banner}>
      <View style={styles.bannerIcon}>
        <Feather name="alert-circle" size={16} color={colors.danger} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.bannerTitle}>Patient Discharged</Text>
        <Text style={styles.bannerText}>
          This patient was discharged
          {when ? (
            <Text style={styles.bannerStrong}>
              {" "}
              on {longDay(when)} at {clockTime(when)}
            </Text>
          ) : null}
          . You can view the existing patient record, but you can no longer edit, add new information, or manage the
          admission.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  flex: { flex: 1, minWidth: 0 },
  headerBtn: { minHeight: 38 },
  softBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 34,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.softActionBg,
  },
  softBtnText: { fontFamily: fonts.medium, fontSize: 12, color: colors.softActionText },
  reviewCard: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.md, padding: spacing.md },
  reviewText: { flexGrow: 1, flexShrink: 1, flexBasis: 240, minWidth: 0 },
  reviewTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.heading },
  reviewSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 2 },
  reviewPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 32,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  reviewedPill: { backgroundColor: colors.reviewedBg },
  pendingPill: { backgroundColor: colors.pendingBg },
  reviewDot: { width: 6, height: 6, borderRadius: 3 },
  reviewPillText: { fontFamily: fonts.medium, fontSize: 12 },
  reviewBtn: { minHeight: 36 },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 3,
  },
  tab: { flex: 1, minHeight: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textBody },
  tabTextActive: { color: colors.white, fontFamily: fonts.medium },
  banner: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.dischargedBg,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.allergyBg,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.danger },
  bannerText: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: colors.muted, marginTop: 2 },
  bannerStrong: { fontFamily: fonts.medium, color: colors.text },
});
