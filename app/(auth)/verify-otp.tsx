import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AuthLayout } from "../../src/components/shared/AuthLayout";
import { AuthHeading } from "../../src/components/shared/AuthHeading";
import { OtpInput } from "../../src/components/shared/OtpInput";
import { Button } from "../../src/components/ui/Button";
import { authApi } from "../../src/services/api/medlogApi";
import { getErrorMessage } from "../../src/services/api/client";
import { useAuthStore } from "../../src/store/authStore";
import { colors, fonts, spacing, typography } from "../../src/theme/tokens";

const CODE_LENGTH = 4;
const RESEND_SECONDS = 30;

/** Shared by sign-up verification and the forgot-password flow (`mode=reset`). */
export default function VerifyOtpScreen() {
  const router = useRouter();
  const { email, mode } = useLocalSearchParams<{ email: string; mode?: "signup" | "reset" }>();
  const isReset = mode === "reset";
  const setSession = useAuthStore((s) => s.setSession);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const onVerify = async (value = code) => {
    if (!email || value.length < CODE_LENGTH) {
      setError(`Enter the ${CODE_LENGTH}-digit code sent to your email.`);
      return;
    }
    try {
      setError(null);
      setLoading(true);
      if (isReset) {
        const { data } = await authApi.verifyResetCode({ email, code: value });
        router.replace({
          pathname: "/(auth)/reset-password",
          params: { email, token: data.data.resetToken },
        });
      } else {
        const { data } = await authApi.verifyOtp({ email, code: value });
        await setSession(data.data.user, data.data.tokens);
        router.replace("/(auth)/choose-plan");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (!email || seconds > 0) return;
    try {
      const { data } = isReset
        ? await authApi.forgotPassword({ email })
        : await authApi.resendOtp({ email });
      setSeconds(RESEND_SECONDS);
      setCode("");
      const hint = data.data?.otpHint ? `\nTest code: ${data.data.otpHint}` : "";
      Alert.alert("Code sent", `Check your email for a new code.${hint}`);
    } catch (err) {
      Alert.alert("Could not resend", getErrorMessage(err));
    }
  };

  const countdown = `00:${String(Math.max(seconds, 0)).padStart(2, "0")}`;

  return (
    <AuthLayout>
      <AuthHeading
        title={isReset ? "Verify Code" : "Verify Your OTP"}
        subtitle={`Enter the ${CODE_LENGTH}-digit verification code sent to your email address.`}
      />

      <Text style={[typography.authLabel, styles.label]}>Verification Code</Text>
      <OtpInput value={code} onChange={setCode} length={CODE_LENGTH} onComplete={onVerify} error={!!error} />

      <View style={styles.resendRow}>
        <Text style={styles.prompt}>Didn't receive the code?</Text>
        <Pressable
          onPress={onResend}
          disabled={seconds > 0}
          accessibilityRole="link"
          accessibilityState={{ disabled: seconds > 0 }}
          hitSlop={8}
        >
          <Text style={styles.resend}>
            {seconds > 0 ? (
              <>
                Resend in <Text style={styles.timer}>{countdown}</Text>
              </>
            ) : (
              "Resend code"
            )}
          </Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Button title="Back" variant="authBack" onPress={() => router.back()} style={styles.half} />
        <Button
          title="Verify Code"
          variant="gradient"
          onPress={() => onVerify()}
          loading={loading}
          style={styles.half}
        />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 6 },
  resendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  prompt: { fontFamily: fonts.semibold, fontSize: 12, color: colors.authLabel },
  resend: { fontFamily: fonts.semibold, fontSize: 12, color: colors.link },
  timer: { fontFamily: fonts.medium, fontSize: 12, color: colors.link },
  error: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm },
  actions: { flexDirection: "row", gap: spacing.md },
  half: { flex: 1, minWidth: 0 },
});
