import { useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { z } from "zod";
import { AuthLayout } from "../../src/components/shared/AuthLayout";
import { AuthHeading } from "../../src/components/shared/AuthHeading";
import { TextField } from "../../src/components/ui/TextField";
import { Button } from "../../src/components/ui/Button";
import { authApi } from "../../src/services/api/medlogApi";
import { getErrorMessage } from "../../src/services/api/client";
import { spacing } from "../../src/theme/tokens";

const emailSchema = z.string().trim().email("Enter a valid email address");

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? "");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    try {
      setError(undefined);
      setLoading(true);
      const { data } = await authApi.forgotPassword({ email: parsed.data });
      if (data.data.otpHint) Alert.alert("Verification code", `Development code: ${data.data.otpHint}`);
      router.push({ pathname: "/(auth)/verify-otp", params: { email: parsed.data, mode: "reset" } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeading
        title="Forgot Password"
        subtitle="Enter your registered email address and we’ll send you a verification code to reset your password."
      />
      <TextField
        tone="auth"
        label="Email Address"
        placeholder="Enter your email address"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        onSubmitEditing={onSubmit}
        error={error}
      />
      <Button
        title="Send Verification Code"
        variant="gradient"
        onPress={onSubmit}
        loading={loading}
        style={styles.submit}
      />
      <Button title="Back to login" variant="ghost" onPress={() => router.back()} style={styles.back} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  submit: { marginTop: spacing.xs },
  back: { marginTop: spacing.md },
});
