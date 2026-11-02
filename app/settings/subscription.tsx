import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import axios from "axios";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { subscriptionsApi } from "../../src/services/api/medlogApi";
import { getErrorMessage } from "../../src/services/api/client";
import { startCheckout } from "../../src/services/payments";
import { useAuthStore } from "../../src/store/authStore";
import { Plan, PlanId } from "../../src/types/api";
import { PLAN_NAMES } from "../../src/features/settings/subscription";
import { formatDate } from "../../src/utils/format";
import { colors, fonts, radius, spacing, typography } from "../../src/theme/tokens";

const price = (p: Plan) => `$${(p.amount / 100).toFixed(2)} / ${p.intervalLabel}`;

export default function SubscriptionScreen() {
  const user = useAuthStore((s) => s.user);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [paymentsEnabled, setPaymentsEnabled] = useState(true);
  const [selected, setSelected] = useState<PlanId>(user?.subscription?.plan ?? "monthly");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshUser();
    subscriptionsApi
      .plans()
      .then(({ data }) => {
        setPlans(data.data.plans);
        setPaymentsEnabled(data.data.paymentsEnabled);
      })
      .catch(() => undefined);
  }, [refreshUser]);

  const sub = user?.subscription;
  const active = sub?.status === "active";
  const expired = sub?.status === "expired";

  const renew = async () => {
    try {
      setLoading(true);
      const result = await startCheckout(selected);
      await refreshUser();
      Alert.alert(
        result.paid ? "Subscription active" : "Payment not completed",
        result.paid ? "Thank you! Your plan is active." : "Your plan was not changed."
      );
    } catch (err) {
      const code = axios.isAxiosError(err) ? (err.response?.data as { code?: string })?.code : undefined;
      Alert.alert(
        "Checkout unavailable",
        code === "PAYMENTS_NOT_CONFIGURED" ? "Online payment is not set up on the server yet." : getErrorMessage(err)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll maxWidth={760} header={<Header title="Subscription Details" subtitle="Manage clinical plan renewal and billing" showBack />}>
      <Card style={styles.current}>
        <Text style={styles.overline}>CURRENT PLAN</Text>
        <Text style={styles.planName}>{sub?.plan ? `${PLAN_NAMES[sub.plan]} plan` : "No active plan"}</Text>
        <View style={[styles.status, active ? styles.statusActive : expired ? styles.statusExpired : styles.statusNone]}>
          <Text style={[styles.statusText, { color: active ? colors.success : expired ? colors.danger : colors.muted }]}>
            {active ? "Active" : expired ? "Expired" : "Not subscribed"}
          </Text>
        </View>
        {sub?.expiresAt ? (
          <Text style={styles.meta}>
            {expired ? "Expired on" : "Renews / expires on"} {formatDate(sub.expiresAt)}
          </Text>
        ) : null}
        {expired ? (
          <Text style={styles.warning}>
            Your account is read-only until the subscription is renewed.
          </Text>
        ) : null}
      </Card>

      <Text style={styles.sectionTitle}>{active ? "Extend or change plan" : "Choose a plan"}</Text>
      <View style={styles.plans}>
        {plans.map((p) => {
          const isSelected = p.id === selected;
          return (
            <Pressable
              key={p.id}
              onPress={() => setSelected(p.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              style={[styles.plan, isSelected && styles.planActive]}
            >
              <View style={[styles.radio, isSelected && styles.radioActive]} />
              <View style={styles.flex}>
                <Text style={styles.planTitle}>{p.name}</Text>
                <Text style={styles.meta}>{p.description}</Text>
              </View>
              <Text style={styles.price}>{price(p)}</Text>
            </Pressable>
          );
        })}
      </View>
      {!paymentsEnabled ? (
        <Text style={styles.meta}>Online payment is not configured on the server yet.</Text>
      ) : null}
      <Button
        title={expired ? "Renew now" : active ? "Extend plan" : "Subscribe"}
        onPress={renew}
        loading={loading}
        disabled={!paymentsEnabled}
        style={styles.cta}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  current: { gap: spacing.sm, marginBottom: spacing.lg },
  overline: { fontFamily: fonts.medium, fontSize: 10, letterSpacing: 0.4, color: colors.textBody },
  planName: { fontFamily: fonts.semibold, fontSize: 18, color: colors.heading },
  status: { alignSelf: "flex-start", paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.full },
  statusActive: { backgroundColor: colors.successBg },
  statusExpired: { backgroundColor: colors.dangerBg },
  statusNone: { backgroundColor: colors.inputBg },
  statusText: { fontFamily: fonts.medium, fontSize: 12 },
  meta: { ...typography.caption },
  warning: { ...typography.caption, color: colors.danger },
  sectionTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.heading, marginBottom: spacing.sm },
  plans: { gap: spacing.sm, marginBottom: spacing.md },
  plan: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  planActive: { borderColor: colors.planSelected, backgroundColor: colors.chipSelectedBg },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: colors.radioRing },
  radioActive: { borderWidth: 5, borderColor: colors.planSelected },
  planTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.heading },
  price: { fontFamily: fonts.semibold, fontSize: 13, color: colors.authLabel },
  cta: { marginTop: spacing.sm },
});
