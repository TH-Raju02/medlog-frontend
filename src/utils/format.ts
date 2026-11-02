import { Admission, Patient, UserSummary } from "../types/api";
import { colors, metricTones } from "../theme/tokens";
import { isReviewedToday } from "./dates";

export const formatDate = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
};

export const ageFromDob = (dob?: string) => {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
};

export const patientOf = (admission: Admission): Patient | null =>
  typeof admission.patient === "object" ? (admission.patient as Patient) : null;

export const fullName = (p?: Pick<Patient, "firstName" | "lastName"> | null) =>
  p ? `${p.firstName} ${p.lastName}` : "Patient";

export const userOf = (value?: UserSummary | string): UserSummary | null =>
  value && typeof value === "object" ? value : null;

export const initials = (first?: string, last?: string) =>
  `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";

export const locationOf = (a: Pick<Admission, "ward" | "room" | "bed">) =>
  [a.ward, a.room, a.bed].filter(Boolean).join("-") || "—";

export const genderLabel = (gender?: string) =>
  gender === "female" ? "Female" : gender === "male" ? "Male" : gender === "other" ? "Other" : "—";

/** "Female · 75 yrs" line under patient names. */
export const patientSubtitle = (p?: Patient | null) => {
  const age = ageFromDob(p?.dateOfBirth);
  return [genderLabel(p?.gender), age !== null ? `${age} yrs` : null].filter(Boolean).join(" · ");
};

export const yesNo = (value?: boolean) => (value ? "Yes" : "No");

export const bmiOf = (weightKg?: number, heightCm?: number) => {
  if (!weightKg || !heightCm) return null;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
};

export const admissionStatus = (status: Admission["status"]) => {
  switch (status) {
    case "active":
      return { label: "Active", tone: "success" as const, bg: colors.successBg, fg: colors.success };
    case "transferred":
      return { label: "Transferred", tone: "warning" as const, bg: colors.warningBg, fg: colors.warning };
    default:
      return { label: "Discharged", tone: "neutral" as const, bg: colors.inputBg, fg: colors.muted };
  }
};

/** Daily-review state shown in Current Admissions and Patients ("Reviewed" / "Pending"). */
export const reviewStatus = (a?: Pick<Admission, "status" | "lastReviewedAt"> | null) => {
  if (!a) return { label: "No admission", tone: "neutral" as const, bg: colors.inputBg, fg: colors.muted };
  if (a.status === "discharged") {
    return { label: "Discharged", tone: "neutral" as const, bg: colors.inputBg, fg: colors.muted };
  }
  return isReviewedToday(a.lastReviewedAt)
    ? { label: "Reviewed", tone: "success" as const, bg: colors.reviewedBg, fg: colors.success }
    : { label: "Pending", tone: "warning" as const, bg: colors.warningBg, fg: colors.warning };
};

/** Figma tints patient icons peach for female and teal otherwise. */
export const patientTint = (gender?: string) =>
  gender === "female"
    ? { bg: metricTones.brown.bg, fg: metricTones.brown.fg }
    : { bg: colors.patientTealBg, fg: colors.avatarText };
