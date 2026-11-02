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

const schema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] });

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email, token } = useLocalSearchParams<{ email: string; token: string }>();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const parsed = schema.safeParse({ password, confirm });
    if (!parsed.success) {
      const next: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as "password" | "confirm";
        next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    if (!email || !token) {
      Alert.alert("Link expired", "Please request a new verification code.");
      router.replace("/(auth)/forgot-password");
      return;
    }
    try {
      setErrors({});
      setLoading(true);
      await authApi.resetPassword({ email, resetToken: token, password });
      Alert.alert("Password updated", "You can now sign in with your new password.");
      router.replace("/(auth)/login");
    } catch (err) {
      Alert.alert("Could not update password", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeading
        title="Set New Password"
        subtitle="Create a new password for your account to continue securely."
      />
      <TextField
        tone="auth"
        label="New Password"
        placeholder="••••••••"
        secureToggle
        autoComplete="new-password"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
      />
      <TextField
        tone="auth"
        label="Confirm New Password"
        placeholder="••••••••"
        secureToggle
        autoComplete="new-password"
        value={confirm}
        onChangeText={setConfirm}
        onSubmitEditing={onSubmit}
        error={errors.confirm}
      />
      <Button title="Update Password" variant="gradient" onPress={onSubmit} loading={loading} style={styles.submit} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  submit: { marginTop: spacing.xs },
});
