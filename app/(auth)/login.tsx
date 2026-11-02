import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { z } from "zod";
import { AuthLayout } from "../../src/components/shared/AuthLayout";
import { Logo } from "../../src/components/shared/Logo";
import { TextField } from "../../src/components/ui/TextField";
import { Button } from "../../src/components/ui/Button";
import { Checkbox } from "../../src/components/ui/Checkbox";
import { authApi } from "../../src/services/api/medlogApi";
import { getErrorMessage } from "../../src/services/api/client";
import { useAuthStore } from "../../src/store/authStore";
import { useResponsive } from "../../src/hooks/useResponsive";
import { colors, fonts, spacing, typography } from "../../src/theme/tokens";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export default function LoginScreen() {
  const router = useRouter();
  const { isPhone } = useResponsive();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  const onSubmit = async () => {
    const parsed = schema.safeParse({ email: email.trim(), password });
    if (!parsed.success) {
      const next: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as "email" | "password";
        next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    try {
      setErrors({});
      setLoading(true);
      const { data } = await authApi.login(parsed.data);
      await setSession(data.data.user, data.data.tokens, remember);
      router.replace("/(tabs)/dashboard");
    } catch (err) {
      const message = getErrorMessage(err);
      if (message.toLowerCase().includes("not verified")) {
        router.push({ pathname: "/(auth)/verify-otp", params: { email: parsed.data.email } });
        return;
      }
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <View style={styles.logo}>
        <Logo variant="stacked" scale={isPhone ? 0.38 : 0.43} />
      </View>

      <Text style={[typography.authTitle, styles.title]} accessibilityRole="header">
        Welcome back
      </Text>

      <TextField
        tone="auth"
        label="Email Address"
        placeholder="Enter your email address"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
      />
      <TextField
        tone="auth"
        label="Password"
        placeholder="••••••••"
        secureToggle
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={onSubmit}
        error={errors.password}
      />

      <View style={styles.options}>
        <Checkbox
          tone="auth"
          size={14}
          checked={remember}
          onChange={setRemember}
          label="Remember me"
          accessibilityLabel="Remember me"
        />
        <Pressable
          onPress={() => router.push({ pathname: "/(auth)/forgot-password", params: { email } })}
          accessibilityRole="link"
          hitSlop={8}
        >
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>
      </View>

      {errors.form ? <Text style={styles.formError}>{errors.form}</Text> : null}

      <Button
        title="Go To Dashboard"
        variant="gradient"
        icon="arrow-right"
        iconPosition="right"
        onPress={onSubmit}
        loading={loading}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>New to MedLog?</Text>
        <Pressable onPress={() => router.push("/(auth)/register")} accessibilityRole="link" hitSlop={8}>
          <Text style={styles.link}>Create an account !</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  logo: { alignItems: "center", marginBottom: spacing.xxxl },
  title: { marginBottom: spacing.xs },
  options: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  formError: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 6,
    marginTop: spacing.xxl,
  },
  footerText: { fontFamily: fonts.medium, fontSize: 13, color: colors.authLabel },
  link: { fontFamily: fonts.semibold, fontSize: 13, color: colors.link },
});
