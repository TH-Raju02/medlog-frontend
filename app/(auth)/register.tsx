import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { z } from "zod";
import { AuthLayout } from "../../src/components/shared/AuthLayout";
import { AuthHeading } from "../../src/components/shared/AuthHeading";
import { TextField } from "../../src/components/ui/TextField";
import { SelectField } from "../../src/components/ui/SelectField";
import { Checkbox } from "../../src/components/ui/Checkbox";
import { Button } from "../../src/components/ui/Button";
import { authApi, specialtiesApi } from "../../src/services/api/medlogApi";
import { getErrorMessage } from "../../src/services/api/client";
import { useResponsive } from "../../src/hooks/useResponsive";
import { JobTitle } from "../../src/types/api";
import { colors, fonts, spacing, typography } from "../../src/theme/tokens";

const JOB_TITLES: { value: JobTitle; label: string }[] = [
  { value: "Doctor", label: "Doctor" },
  { value: "Pharmacist", label: "Pharmacist" },
];

const schema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z.string().trim().email("Enter a valid email address"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string(),
    jobTitle: z.enum(["Doctor", "Pharmacist"], { message: "Select your job title" }),
    specialty: z.string().min(1, "Select your specialty"),
    acceptTerms: z.literal(true, { message: "Please accept the Terms of Service and Privacy Policy" }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Field = "firstName" | "lastName" | "email" | "password" | "confirmPassword" | "jobTitle" | "specialty" | "acceptTerms";

export default function RegisterScreen() {
  const router = useRouter();
  const { width } = useResponsive();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [jobTitle, setJobTitle] = useState<JobTitle>();
  const [specialty, setSpecialty] = useState<string>();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [specialties, setSpecialties] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const nameRow = width >= 360;

  useEffect(() => {
    specialtiesApi
      .list()
      .then(({ data }) => setSpecialties(data.data.map((s) => ({ value: s.name, label: s.name }))))
      .catch(() => setSpecialties([{ value: "Internal Medicine", label: "Internal Medicine" }]));
  }, []);

  const onSubmit = async () => {
    const parsed = schema.safeParse({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      jobTitle,
      specialty,
      acceptTerms,
    });
    if (!parsed.success) {
      const next: Partial<Record<Field, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as Field;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    try {
      setErrors({});
      setLoading(true);
      const { confirmPassword: _confirm, ...payload } = parsed.data;
      const { data } = await authApi.register(payload);
      if (data.data.otpHint) Alert.alert("Verification code", `Development code: ${data.data.otpHint}`);
      router.push({ pathname: "/(auth)/verify-otp", params: { email: parsed.data.email } });
    } catch (error) {
      Alert.alert("Registration failed", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeading
        title="Create Your Account"
        subtitle="Just fill in the necessary details and sign up to kick things off with MedLog!"
      />

      <View style={nameRow ? styles.row : null}>
        <TextField
          tone="auth"
          label="First name"
          placeholder="Enter your first name"
          autoComplete="given-name"
          value={firstName}
          onChangeText={setFirstName}
          error={errors.firstName}
          containerStyle={nameRow ? styles.half : null}
        />
        <TextField
          tone="auth"
          label="Last name"
          placeholder="Enter your last name"
          autoComplete="family-name"
          value={lastName}
          onChangeText={setLastName}
          error={errors.lastName}
          containerStyle={nameRow ? styles.half : null}
        />
      </View>

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
        autoComplete="new-password"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
      />
      <TextField
        tone="auth"
        label="Confirm Password"
        placeholder="••••••••"
        secureToggle
        autoComplete="new-password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={errors.confirmPassword}
      />
      <SelectField
        tone="auth"
        label="Job Title"
        placeholder="Select job title"
        dialogTitle="Select Job Title"
        options={JOB_TITLES}
        value={jobTitle}
        onChange={setJobTitle}
        error={errors.jobTitle}
      />
      <SelectField
        tone="auth"
        label="Specialty"
        placeholder="Select your specialty"
        dialogTitle="Select Specialty"
        options={specialties}
        value={specialty}
        onChange={setSpecialty}
        error={errors.specialty}
      />

      <Checkbox
        tone="auth"
        size={14}
        checked={acceptTerms}
        onChange={setAcceptTerms}
        accessibilityLabel="I agree to the Terms of Service and Privacy Policy"
        label={
          <Text style={styles.terms}>
            I agree to the{" "}
            <Text style={styles.link} onPress={() => router.push("/terms")} accessibilityRole="link">
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text style={styles.link} onPress={() => router.push("/terms")} accessibilityRole="link">
              Privacy Policy
            </Text>
          </Text>
        }
      />
      {errors.acceptTerms ? <Text style={styles.error}>{errors.acceptTerms}</Text> : null}

      <View style={[styles.row, styles.actions]}>
        <Button title="Back" variant="authBack" onPress={() => router.back()} style={styles.half} />
        <Button
          title="Continue"
          variant="gradient"
          onPress={onSubmit}
          loading={loading}
          disabled={!acceptTerms}
          style={styles.half}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already registered?</Text>
        <Pressable onPress={() => router.replace("/(auth)/login")} accessibilityRole="link" hitSlop={8}>
          <Text style={styles.link}>Login !</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.md },
  half: { flex: 1, minWidth: 0 },
  actions: { marginTop: spacing.md },
  terms: { fontFamily: fonts.semibold, fontSize: 13, color: colors.authLabel, flexShrink: 1 },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
  footer: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: 6, marginTop: spacing.xxl },
  footerText: { fontFamily: fonts.medium, fontSize: 13, color: colors.authLabel },
  link: { fontFamily: fonts.semibold, fontSize: 13, color: colors.link },
});
