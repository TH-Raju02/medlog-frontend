import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { AuthLayout } from "../../src/components/shared/AuthLayout";
import { AuthHeading } from "../../src/components/shared/AuthHeading";
import { Button } from "../../src/components/ui/Button";
import { subscriptionsApi } from "../../src/services/api/medlogApi";
import { getErrorMessage } from "../../src/services/api/client";
import { startCheckout } from "../../src/services/payments";
import { confirmAction } from "../../src/utils/dialogs";
import { useAuthStore } from "../../src/store/authStore";
import { Plan, PlanId } from "../../src/types/api";
import { colors, fonts, radius, spacing } from "../../src/theme/tokens";

const FALLBACK_PLANS: Plan[] = [
  { id: "monthly", name: "Monthly", description: "Flexible access, billed monthly", amount: 1199, months: 1, intervalLabel: "month" },
  { id: "six_months", name: "6 Months", description: "Save more with a 6-month plan", amount: 5999, months: 6, intervalLabel: "6 months", savingsLabel: "Save $11.95 (17% off)" },
  { id: "annual", name: "Annual", description: "Best value for continuous access", amount: 9899, months: 12, intervalLabel: "year", savingsLabel: "Save $44.89 (31% off)" },
];

const price = (plan: Plan) => `$${(plan.amount / 100).toFixed(2)} / ${plan.intervalLabel}`;

export default function ChoosePlanScreen() {
  const router = useRouter();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [selected, setSelected] = useState<PlanId>("monthly");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    subscriptionsApi
      .plans()
      .then(({ data }) => setPlans(data.data.plans))
      .catch(() => undefined);
  }, []);

  const finish = () => router.replace("/(auth)/onboarding-complete");

  const onContinue = async () => {
    try {
      setLoading(true);
      const result = await startCheckout(selected);
      if (result.paid) {
        await refreshUser();
        finish();
      } else {
        Alert.alert("Payment not completed", "Your plan was not activated. You can try again.");
      }
    } catch (err) {
      const code = axios.isAxiosError(err) ? (err.response?.data as { code?: string })?.code : undefined;
      if (code === "PAYMENTS_NOT_CONFIGURED") {
        const proceed = await confirmAction(
          "Payments unavailable",
          "Online payment is not set up on the server yet. You can continue and subscribe later from Settings.",
          "Continue",
          false
        );
        if (proceed) finish();
      } else {
        Alert.alert("Checkout failed", getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeading title="Choose a plan that's right for you" subtitle="Downgrade or upgrade at anytime" />

      <View style={styles.list} accessibilityRole="radiogroup">
        {plans.map((plan) => {
          const active = plan.id === selected;
          const saveTone = plan.id === "annual" ? styles.saveBlue : styles.saveGreen;
          const saveText = plan.id === "annual" ? styles.saveBlueText : styles.saveGreenText;
          return (
            <Pressable
              key={plan.id}
              onPress={() => setSelected(plan.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${plan.name}, ${price(plan)}`}
              style={[styles.card, active && styles.cardActive]}
            >
              {plan.savingsLabel ? (
                <View style={[styles.save, saveTone]}>
                  <Text style={[styles.saveText, saveText]}>{plan.savingsLabel}</Text>
                </View>
              ) : null}
              <View style={styles.cardRow}>
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active ? <Feather name="check" size={10} color={colors.white} /> : null}
                </View>
                <Text style={styles.planName}>{plan.name}</Text>
              </View>
              <Text style={styles.description}>{plan.description}</Text>
              <Text style={styles.price}>{price(plan)}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actions}>
        <Button title="Back" variant="authBack" onPress={() => router.back()} style={styles.half} />
        <Button title="Continue" variant="gradient" onPress={onContinue} loading={loading} style={styles.half} />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.lg, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.authInputBg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    overflow: "hidden",
  },
  cardActive: { borderColor: colors.planSelected, backgroundColor: colors.authBackBg },
  cardRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.planTitle,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { backgroundColor: colors.planSelected, borderColor: colors.planSelected },
  planName: { fontFamily: fonts.semibold, fontSize: 18, color: colors.planTitle },
  description: { fontFamily: fonts.medium, fontSize: 13, color: colors.textBody, marginTop: spacing.xs, marginLeft: 28 },
  price: { fontFamily: fonts.semibold, fontSize: 15, color: colors.authLabel, marginTop: spacing.xs, marginLeft: 28 },
  save: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderBottomLeftRadius: radius.md,
  },
  saveGreen: { backgroundColor: colors.planSaveGreenBg },
  saveBlue: { backgroundColor: colors.planSaveBlueBg },
  saveText: { fontFamily: fonts.medium, fontSize: 12 },
  saveGreenText: { color: colors.planSaveGreen },
  saveBlueText: { color: colors.planSaveBlue },
  actions: { flexDirection: "row", gap: spacing.md },
  half: { flex: 1, minWidth: 0 },
});
