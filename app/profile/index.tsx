import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { FormModal } from "../../src/components/ui/FormModal";
import { TextField } from "../../src/components/ui/TextField";
import { SelectField } from "../../src/components/ui/SelectField";
import { usersApi } from "../../src/services/api/medlogApi";
import { getErrorMessage } from "../../src/services/api/client";
import { useAuthStore } from "../../src/store/authStore";
import { JobTitle } from "../../src/types/api";
import { formatDate, initials } from "../../src/utils/format";
import { subscriptionLabel } from "../../src/features/settings/subscription";
import { colors, fonts, spacing } from "../../src/theme/tokens";

const JOB_TITLES: { value: JobTitle; label: string }[] = [
  { value: "Doctor", label: "Doctor" },
  { value: "Pharmacist", label: "Pharmacist" },
];

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [editOpen, setEditOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState<JobTitle>();
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({});
  const [saving, setSaving] = useState(false);

  const openEdit = () => {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setPhone(user?.phone ?? "");
    setJobTitle(user?.jobTitle);
    setErrors({});
    setEditOpen(true);
  };

  const save = async () => {
    const next: typeof errors = {};
    if (!firstName.trim()) next.firstName = "First name is required";
    if (!lastName.trim()) next.lastName = "Last name is required";
    setErrors(next);
    if (Object.keys(next).length) return;
    try {
      setSaving(true);
      const { data } = await usersApi.updateMe({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        ...(jobTitle ? { jobTitle } : {}),
      });
      updateUser(data.data);
      setEditOpen(false);
    } catch (err) {
      Alert.alert("Could not update profile", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const facts: Array<[string, string]> = [
    ["First Name", user?.firstName ?? "—"],
    ["Last Name", user?.lastName ?? "—"],
    ["Email", user?.email ?? "—"],
    ["Phone", user?.phone || "—"],
    ["Job title", user?.jobTitle ?? (user?.role === "admin" ? "Administrator" : "Clinician")],
    ["Specialty", user?.specialty || "Not set"],
    ["Subscription", subscriptionLabel(user?.subscription)],
    ["Member Since", formatDate(user?.createdAt)],
  ];

  return (
    <Screen
      scroll
      header={
        <Header
          title="My Profile"
          subtitle="View and manage your account details and clinical role"
          showBack
          right={<Button title="Edit" icon="edit-2" onPress={openEdit} style={styles.headerBtn} />}
        />
      }
    >
      <Card style={styles.card}>
        <View style={styles.top}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(user?.firstName, user?.lastName)}</Text>
          </View>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.role}>{[user?.jobTitle, user?.specialty].filter(Boolean).join(" · ")}</Text>
        </View>
        {facts.map(([label, value]) => (
          <View key={label} style={styles.fact}>
            <Text style={styles.factLabel}>{label}</Text>
            <Text style={styles.factValue} numberOfLines={1}>
              {value}
            </Text>
          </View>
        ))}
      </Card>

      <FormModal
        visible={editOpen}
        title="Edit Profile"
        subtitle="Update your personal contact details, role, and department."
        onClose={() => setEditOpen(false)}
        submitLabel="Save Changes"
        onSubmit={save}
        submitting={saving}
        maxWidth={560}
      >
        <TextField label="First Name" required value={firstName} onChangeText={setFirstName} error={errors.firstName} />
        <TextField label="Last Name" required value={lastName} onChangeText={setLastName} error={errors.lastName} />
        <TextField label="Phone Number" keyboardType="phone-pad" placeholder="+965 5555 1234" value={phone} onChangeText={setPhone} />
        <SelectField label="Job title" options={JOB_TITLES} value={jobTitle} onChange={setJobTitle} placeholder="Select job title" />
      </FormModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerBtn: { minHeight: 38 },
  card: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
  top: { alignItems: "center", gap: spacing.xs, paddingBottom: spacing.lg },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.profileAvatar,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  avatarText: { fontFamily: fonts.semibold, fontSize: 20, color: colors.white },
  name: { fontFamily: fonts.semibold, fontSize: 18, color: colors.heading },
  role: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  fact: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 44,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  factLabel: { width: "24%", minWidth: 110, fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  factValue: { flex: 1, fontFamily: fonts.medium, fontSize: 13, color: colors.text },
});
