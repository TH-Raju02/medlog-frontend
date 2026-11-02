import { Dispatch, SetStateAction } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { TextField } from "../../components/ui/TextField";
import { SelectField } from "../../components/ui/SelectField";
import { YesNoToggle } from "../../components/ui/YesNoToggle";
import { useResponsive } from "../../hooks/useResponsive";
import { MaritalStatus, Patient } from "../../types/api";
import { bmiOf } from "../../utils/format";
import { parseDayInput, toDayInput } from "../../utils/dates";
import { colors, fonts, radius, spacing, typography } from "../../theme/tokens";

export interface PatientDraft {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationalId: string;
  fileNumber: string;
  phone: string;
  weightKg: string;
  heightCm: string;
  gender?: "male" | "female";
  nationality?: string;
  maritalStatus?: MaritalStatus;
  bloodType?: string;
  smoker: boolean;
  alcohol: boolean;
  recreationalDrugs: boolean;
  caffeine: boolean;
  catheter: boolean;
  ngt: boolean;
  pegTube: boolean;
  hasAllergies: boolean;
  allergies: string;
}

export type PatientDraftErrors = Partial<Record<keyof PatientDraft, string>>;

export const NATIONALITIES = [
  "Kuwaiti",
  "Saudi",
  "Emirati",
  "Bahraini",
  "Qatari",
  "Omani",
  "Egyptian",
  "Jordanian",
  "Lebanese",
  "Syrian",
  "Iraqi",
  "Indian",
  "Pakistani",
  "Bangladeshi",
  "Filipino",
  "Sri Lankan",
  "Other",
].map((n) => ({ value: n, label: n }));

export const MARITAL_STATUSES: { value: MaritalStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
];

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => ({ value: b, label: b }));

export const emptyPatientDraft = (civilId = ""): PatientDraft => ({
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  nationalId: civilId,
  fileNumber: "",
  phone: "",
  weightKg: "",
  heightCm: "",
  smoker: false,
  alcohol: false,
  recreationalDrugs: false,
  caffeine: false,
  catheter: false,
  ngt: false,
  pegTube: false,
  hasAllergies: false,
  allergies: "",
});

export const draftFromPatient = (p: Patient): PatientDraft => ({
  firstName: p.firstName,
  lastName: p.lastName,
  dateOfBirth: toDayInput(p.dateOfBirth),
  nationalId: p.nationalId ?? "",
  fileNumber: p.fileNumber ?? "",
  phone: p.phone ?? "",
  weightKg: p.weightKg ? String(p.weightKg) : "",
  heightCm: p.heightCm ? String(p.heightCm) : "",
  gender: p.gender === "male" || p.gender === "female" ? p.gender : undefined,
  nationality: p.nationality,
  maritalStatus: p.maritalStatus,
  bloodType: p.bloodType,
  smoker: !!p.smoker,
  alcohol: !!p.alcohol,
  recreationalDrugs: !!p.recreationalDrugs,
  caffeine: !!p.caffeine,
  catheter: !!p.catheter,
  ngt: !!p.ngt,
  pegTube: !!p.pegTube,
  hasAllergies: !!p.hasAllergies,
  allergies: p.allergies ?? "",
});

/** Validates the draft and returns the API payload, or field errors. */
export const patientPayload = (
  d: PatientDraft
): { payload?: Record<string, unknown>; errors: PatientDraftErrors } => {
  const errors: PatientDraftErrors = {};
  if (!d.firstName.trim()) errors.firstName = "First name is required";
  if (!d.lastName.trim()) errors.lastName = "Second name is required";
  const dob = parseDayInput(d.dateOfBirth);
  if (!dob || dob > new Date()) errors.dateOfBirth = "Enter a valid date (dd/mm/yyyy)";
  if (!d.nationalId.trim()) errors.nationalId = "Civil ID is required";
  if (!d.gender) errors.gender = "Select a gender";
  if (d.phone && !/^\+?[\d\s-]{8,}$/.test(d.phone.trim())) errors.phone = "Enter at least 8 digits";
  const weight = d.weightKg ? Number(d.weightKg) : undefined;
  const height = d.heightCm ? Number(d.heightCm) : undefined;
  if (weight !== undefined && (Number.isNaN(weight) || weight <= 0 || weight > 700)) errors.weightKg = "Invalid weight";
  if (height !== undefined && (Number.isNaN(height) || height <= 0 || height > 300)) errors.heightCm = "Invalid height";
  if (d.hasAllergies && !d.allergies.trim()) errors.allergies = "Describe the allergy";
  if (Object.keys(errors).length) return { errors };

  return {
    errors,
    payload: {
      firstName: d.firstName.trim(),
      lastName: d.lastName.trim(),
      dateOfBirth: dob!.toISOString(),
      nationalId: d.nationalId.trim(),
      fileNumber: d.fileNumber.trim() || undefined,
      phone: d.phone.trim() || undefined,
      weightKg: weight,
      heightCm: height,
      gender: d.gender,
      nationality: d.nationality,
      maritalStatus: d.maritalStatus,
      bloodType: d.bloodType,
      smoker: d.smoker,
      alcohol: d.alcohol,
      recreationalDrugs: d.recreationalDrugs,
      caffeine: d.caffeine,
      catheter: d.catheter,
      ngt: d.ngt,
      pegTube: d.pegTube,
      hasAllergies: d.hasAllergies,
      allergies: d.hasAllergies ? d.allergies.trim() : "",
    },
  };
};

interface Props {
  value: PatientDraft;
  onChange: Dispatch<SetStateAction<PatientDraft>>;
  errors: PatientDraftErrors;
  civilIdLocked?: boolean;
  showBloodType?: boolean;
}

/** Figma "Profile Information" block (New Patient Profile / Edit Profile). */
export function PatientProfileFields({ value, onChange, errors, civilIdLocked, showBloodType }: Props) {
  const { isPhone } = useResponsive();
  const set = <K extends keyof PatientDraft>(key: K, v: PatientDraft[K]) =>
    onChange((prev) => ({ ...prev, [key]: v }));
  const bmi = bmiOf(Number(value.weightKg) || undefined, Number(value.heightCm) || undefined);
  const row = isPhone ? null : styles.row;
  const cell = isPhone ? null : styles.cell;

  return (
    <View>
      <Text style={typography.label}>
        Patient Name<Text style={styles.req}> *</Text>
      </Text>
      <View style={[styles.row, styles.nameRow]}>
        <TextField
          label="First name"
          hideLabel
          placeholder="First name"
          value={value.firstName}
          onChangeText={(v) => set("firstName", v)}
          error={errors.firstName}
          containerStyle={styles.cell}
        />
        <TextField
          label="Second name"
          hideLabel
          placeholder="Second name"
          value={value.lastName}
          onChangeText={(v) => set("lastName", v)}
          error={errors.lastName}
          containerStyle={styles.cell}
        />
      </View>

      <View style={row}>
        <TextField
          label="Date of Birth"
          required
          placeholder="dd/mm/yyyy"
          value={value.dateOfBirth}
          onChangeText={(v) => set("dateOfBirth", v)}
          error={errors.dateOfBirth}
          containerStyle={cell}
        />
        <TextField
          label="Civil ID"
          required
          placeholder="123456789"
          keyboardType="number-pad"
          editable={!civilIdLocked}
          value={value.nationalId}
          onChangeText={(v) => set("nationalId", v)}
          error={errors.nationalId}
          containerStyle={cell}
        />
      </View>

      <View style={row}>
        <TextField
          label="File No."
          placeholder="e.g. MR-12345"
          value={value.fileNumber}
          onChangeText={(v) => set("fileNumber", v)}
          containerStyle={cell}
        />
        <TextField
          label="Contact Number"
          placeholder="8 digits"
          keyboardType="phone-pad"
          value={value.phone}
          onChangeText={(v) => set("phone", v)}
          error={errors.phone}
          containerStyle={cell}
        />
      </View>

      <View style={styles.row}>
        <TextField
          label="Weight (kg)"
          placeholder="e.g. 70"
          keyboardType="decimal-pad"
          value={value.weightKg}
          onChangeText={(v) => set("weightKg", v)}
          error={errors.weightKg}
          containerStyle={styles.cell}
        />
        <TextField
          label="Height (cm)"
          placeholder="e.g. 175"
          keyboardType="decimal-pad"
          value={value.heightCm}
          onChangeText={(v) => set("heightCm", v)}
          error={errors.heightCm}
          containerStyle={styles.cell}
        />
        <TextField
          label="BMI"
          placeholder="Automatically calculated"
          editable={false}
          value={bmi ? `${bmi} kg/m²` : ""}
          containerStyle={styles.cell}
        />
      </View>

      <Text style={[typography.label, styles.groupLabel]}>
        Gender<Text style={styles.req}> *</Text>
      </Text>
      <View style={[styles.row, styles.genderRow]} accessibilityRole="radiogroup">
        {(["female", "male"] as const).map((g) => {
          const active = value.gender === g;
          return (
            <Pressable
              key={g}
              onPress={() => set("gender", g)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              style={[styles.genderOption, active && styles.genderActive]}
            >
              <View style={[styles.genderRadio, active && styles.genderRadioActive]}>
                {active ? <Feather name="check" size={10} color={colors.white} /> : null}
              </View>
              <Text style={[styles.genderText, active && styles.genderTextActive]}>
                {g === "female" ? "Female" : "Male"}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {errors.gender ? <Text style={styles.error}>{errors.gender}</Text> : null}

      <View style={row}>
        <SelectField
          label="Nationality"
          placeholder="Select Nationality"
          dialogTitle="Select Nationality"
          options={NATIONALITIES}
          value={value.nationality}
          onChange={(v) => set("nationality", v)}
          containerStyle={cell}
        />
        <SelectField
          label="Marital Status"
          placeholder="Select marital status"
          dialogTitle="Select Marital Status"
          dialogSubtitle="Choose the patient's marital status"
          options={MARITAL_STATUSES}
          value={value.maritalStatus}
          onChange={(v) => set("maritalStatus", v)}
          containerStyle={cell}
        />
      </View>

      {showBloodType ? (
        <SelectField
          label="Blood Type"
          placeholder="Select blood type"
          options={BLOOD_TYPES}
          value={value.bloodType}
          onChange={(v) => set("bloodType", v)}
        />
      ) : null}

      <View style={[styles.row, styles.toggles]}>
        <YesNoToggle label="Smoker" value={value.smoker} onChange={(v) => set("smoker", v)} style={styles.cell} />
        <YesNoToggle label="Alcohol" value={value.alcohol} onChange={(v) => set("alcohol", v)} style={styles.cell} />
        <YesNoToggle
          label="Rec. Drugs"
          value={value.recreationalDrugs}
          onChange={(v) => set("recreationalDrugs", v)}
          style={styles.cell}
        />
      </View>
      <View style={[styles.row, styles.toggles]}>
        <YesNoToggle label="Catheter" value={value.catheter} onChange={(v) => set("catheter", v)} style={styles.cell} />
        <YesNoToggle label="NGT" value={value.ngt} onChange={(v) => set("ngt", v)} style={styles.cell} />
        <YesNoToggle label="PEG Tube" value={value.pegTube} onChange={(v) => set("pegTube", v)} style={styles.cell} />
      </View>
    </View>
  );
}

/** Figma "Allergy Information" block. */
export function AllergyFields({ value, onChange, errors }: Omit<Props, "civilIdLocked">) {
  return (
    <View>
      <YesNoToggle
        label="Allergies"
        required
        tone="alert"
        value={value.hasAllergies}
        onChange={(v) => onChange((prev) => ({ ...prev, hasAllergies: v }))}
      />
      {value.hasAllergies ? (
        <View style={styles.allergyBox}>
          <TextField
            label="Type of Allergy"
            required
            placeholder="Enter allergy details"
            value={value.allergies}
            onChangeText={(v) => onChange((prev) => ({ ...prev, allergies: v }))}
            error={errors.allergies}
            containerStyle={styles.noMargin}
            style={styles.allergyInput}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.md },
  cell: { flex: 1, minWidth: 0 },
  nameRow: { marginTop: spacing.sm },
  req: { color: colors.text },
  groupLabel: { marginBottom: spacing.sm },
  genderRow: { marginBottom: spacing.sm },
  genderOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.inputBg,
  },
  genderActive: { backgroundColor: colors.optionSelectedBg },
  genderRadio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.radioRing,
    alignItems: "center",
    justifyContent: "center",
  },
  genderRadioActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  genderText: { fontFamily: fonts.regular, fontSize: 13, color: colors.text },
  genderTextActive: { color: colors.primaryStrong },
  error: { ...typography.caption, color: colors.danger, marginBottom: spacing.md },
  toggles: { marginBottom: spacing.lg },
  allergyBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerBg,
  },
  allergyInput: { backgroundColor: colors.inputBg },
  noMargin: { marginBottom: 0 },
});
