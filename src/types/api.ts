export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    pendingReceived?: number;
  };
}

export interface ApiFailure {
  success: false;
  message: string;
  code?: string;
  errors?: unknown;
}

export type JobTitle = "Doctor" | "Pharmacist";
export type PlanId = "monthly" | "six_months" | "annual";

export interface Subscription {
  plan?: PlanId;
  status: "none" | "active" | "expired";
  startedAt?: string;
  expiresAt?: string;
  amount?: number;
  currency?: string;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country: string;
  countryCode: string;
  jobTitle?: JobTitle;
  specialty?: string;
  role: "admin" | "clinician";
  isVerified?: boolean;
  subscription?: Subscription;
  preferences?: {
    notificationsEnabled?: boolean;
    handoverNotifications?: boolean;
    reminderTime?: string;
    language?: string;
  };
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  amount: number;
  months: number;
  intervalLabel: string;
  savingsLabel?: string;
}

export interface PlansResponse {
  paymentsEnabled: boolean;
  currency: string;
  plans: Plan[];
}

export type MaritalStatus = "single" | "married" | "divorced" | "widowed";

export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  mrn: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "unknown";
  nationalId?: string;
  fileNumber?: string;
  phone?: string;
  nationality?: string;
  maritalStatus?: MaritalStatus;
  weightKg?: number;
  heightCm?: number;
  bloodType?: string;
  hasAllergies?: boolean;
  allergies?: string;
  smoker?: boolean;
  alcohol?: boolean;
  caffeine?: boolean;
  recreationalDrugs?: boolean;
  catheter?: boolean;
  ngt?: boolean;
  pegTube?: boolean;
  country?: string;
  notes?: string;
  createdAt: string;
  latestAdmission?: Pick<
    Admission,
    "_id" | "admissionDate" | "status" | "lastReviewedAt" | "dischargedAt" | "specialty" | "code"
  >;
}

export interface UserSummary {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: JobTitle;
  specialty?: string;
}

export interface Admission {
  _id: string;
  code?: string;
  patient: Patient | string;
  admissionDate: string;
  chiefComplaint?: string;
  diagnosis?: string;
  medicalHistory?: string;
  specialty?: string;
  ward?: string;
  room?: string;
  bed?: string;
  hospital?: string;
  status: "active" | "discharged" | "transferred";
  entryMode: "manual" | "ai";
  notes?: string;
  lastReviewedAt?: string;
  dischargedAt?: string;
  dischargeSummary?: string;
  dischargeCounseling?: boolean;
  assignedTo?: UserSummary | string;
  createdBy?: UserSummary | string;
  createdAt: string;
  updatedAt?: string;
}

export interface ClinicalParameter {
  _id: string;
  admission: string;
  patient: string;
  parameter: string;
  valueGoal?: string;
  planRecommendation?: string;
  recordedAt: string;
}

export type MedicationCategory = "hospital" | "antibiotic" | "discharge";

export interface HospitalMedication {
  _id: string;
  admission?: string;
  category?: MedicationCategory;
  name: string;
  dose?: string;
  route?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface PreviousAntibiotic {
  _id: string;
  condition?: string;
  name: string;
  dose?: string;
  route?: string;
  frequency?: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  indication?: string;
  notes?: string;
  createdAt?: string;
}

export interface MedicationReconciliation {
  _id: string;
  drug: string;
  dose?: string;
  route?: string;
  frequency?: string;
  discrepancy?: string;
  comment?: string;
}

export type DtpCategory = "indication" | "effectiveness" | "safety" | "adherence" | "none";

export interface Recommendation {
  _id: string;
  text: string;
  dtp: DtpCategory;
  recordedAt: string;
}

export interface LabResult {
  _id: string;
  testName: string;
  date?: string;
  reference?: string;
  value?: string;
}

export interface CultureResult {
  _id: string;
  cultureType: string;
  collectedAt?: string;
  resultAt?: string;
  organism?: string;
  susceptibility?: string;
}

export interface Protocol {
  _id: string;
  title: string;
  category?: string;
  specialty?: string;
  summary?: string;
  content: string;
  tags?: string[];
}

export interface ReferenceItem {
  _id: string;
  name: string;
  kind: "file" | "folder";
  parent?: string | null;
  file?: { originalName: string; mimeType: string; size: number };
  createdAt: string;
}

export interface ReferenceListing {
  folder: ReferenceItem | null;
  items: ReferenceItem[];
}

export interface Specialty {
  _id: string;
  name: string;
  description?: string;
}

export interface Transfer {
  _id: string;
  admission: Admission | string;
  patient: Patient | string;
  fromWard?: string;
  toWard?: string;
  fromHospital?: string;
  toHospital?: string;
  reason?: string;
  notes?: string;
  transferType?: "inter_ward" | "inter_hospital" | "handoff";
  requestedBy?: UserSummary | string;
  toUser?: UserSummary | string;
  toSpecialty?: string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  createdAt: string;
}

export interface Reminder {
  _id: string;
  title: string;
  dueAt: string;
  completedAt?: string;
}

export interface DashboardMetrics {
  month: string;
  monthEnd: string;
  medicationReconciliation: number;
  drugTherapyProblems: number;
  dischargeCounseling: number;
  casesThisMonth: number;
  currentAdmissions: Admission[];
}
