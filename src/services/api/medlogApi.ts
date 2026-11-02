import { api } from "./client";
import {
  Admission,
  AuthTokens,
  AuthUser,
  ClinicalParameter,
  CultureResult,
  DashboardMetrics,
  HospitalMedication,
  LabResult,
  MedicationCategory,
  MedicationReconciliation,
  Patient,
  PlanId,
  PlansResponse,
  PreviousAntibiotic,
  Recommendation,
  ReferenceItem,
  ReferenceListing,
  Reminder,
  Specialty,
  Subscription,
  Transfer,
  UserSummary,
} from "../../types/api";

type Payload = Record<string, unknown>;
type Envelope<T> = { data: T; meta?: { total: number; pendingReceived?: number } };

export const authApi = {
  register: (payload: Payload) =>
    api.post<Envelope<{ user: AuthUser; otpHint?: string }>>("/auth/register", payload),
  login: (payload: { email: string; password: string }) =>
    api.post<Envelope<{ user: AuthUser; tokens: AuthTokens }>>("/auth/login", payload),
  verifyOtp: (payload: { email: string; code: string }) =>
    api.post<Envelope<{ user: AuthUser; tokens: AuthTokens }>>("/auth/verify-otp", payload),
  resendOtp: (payload: { email: string }) =>
    api.post<Envelope<{ otpHint?: string }>>("/auth/resend-otp", payload),
  forgotPassword: (payload: { email: string }) =>
    api.post<Envelope<{ otpHint?: string }>>("/auth/forgot-password", payload),
  verifyResetCode: (payload: { email: string; code: string }) =>
    api.post<Envelope<{ resetToken: string }>>("/auth/verify-reset-code", payload),
  resetPassword: (payload: { email: string; resetToken: string; password: string }) =>
    api.post<Envelope<{ message: string }>>("/auth/reset-password", payload),
  me: () => api.get<Envelope<AuthUser>>("/auth/me"),
};

export const subscriptionsApi = {
  plans: () => api.get<Envelope<PlansResponse>>("/subscriptions/plans"),
  me: () => api.get<Envelope<Subscription>>("/subscriptions/me"),
  checkout: (payload: { plan: PlanId; returnUrl: string }) =>
    api.post<Envelope<{ sessionId: string; url: string }>>("/subscriptions/checkout", payload),
  confirm: (sessionId: string) =>
    api.post<Envelope<{ paid: boolean; subscription: Subscription }>>("/subscriptions/confirm", {
      sessionId,
    }),
};

export const dashboardApi = {
  metrics: (month?: string) =>
    api.get<Envelope<DashboardMetrics>>("/dashboard/metrics", { params: month ? { month } : {} }),
};

export const remindersApi = {
  list: () => api.get<Envelope<Reminder[]>>("/reminders"),
  create: (payload: { title: string; dueAt: string }) =>
    api.post<Envelope<Reminder>>("/reminders", payload),
  update: (id: string, payload: { title?: string; dueAt?: string; completed?: boolean }) =>
    api.patch<Envelope<Reminder>>(`/reminders/${id}`, payload),
  remove: (id: string) => api.delete(`/reminders/${id}`),
};

export const patientsApi = {
  list: (params?: { search?: string; page?: number; limit?: number; sort?: "recent" | "name" | "admission" }) =>
    api.get<Envelope<Patient[]>>("/patients", { params }),
  lookup: (civilId: string) => api.get<Envelope<Patient | null>>("/patients/lookup", { params: { civilId } }),
  get: (id: string) => api.get<Envelope<Patient>>(`/patients/${id}`),
  create: (payload: Payload) => api.post<Envelope<Patient>>("/patients", payload),
  update: (id: string, payload: Payload) => api.patch<Envelope<Patient>>(`/patients/${id}`, payload),
};

export const admissionsApi = {
  list: (params?: Payload) => api.get<Envelope<Admission[]>>("/admissions", { params }),
  get: (id: string) => api.get<Envelope<Admission>>(`/admissions/${id}`),
  create: (payload: Payload) => api.post<Envelope<Admission>>("/admissions", payload),
  update: (id: string, payload: Payload) => api.patch<Envelope<Admission>>(`/admissions/${id}`, payload),
  review: (id: string) => api.post<Envelope<Admission>>(`/admissions/${id}/review`),
  undoReview: (id: string) => api.delete<Envelope<Admission>>(`/admissions/${id}/review`),
  discharge: (id: string, payload: Payload) =>
    api.post<Envelope<Admission>>(`/admissions/${id}/discharge`, payload),
  handover: (id: string, payload: { toUserId: string; notes?: string }) =>
    api.post<Envelope<Transfer>>(`/admissions/${id}/handover`, payload),
};

/** CRUD helpers shared by every table that belongs to one admission. */
const scoped = <T>(path: string) => ({
  list: (params: { admissionId?: string; patientId?: string }) =>
    api.get<Envelope<T[]>>(path, { params }),
  create: (payload: Payload) => api.post<Envelope<T>>(path, payload),
  update: (id: string, payload: Payload) => api.patch<Envelope<T>>(`${path}/${id}`, payload),
  remove: (id: string) => api.delete(`${path}/${id}`),
});

export const clinicalApi = scoped<ClinicalParameter>("/clinical-parameters");
export const antibioticsApi = scoped<PreviousAntibiotic>("/antibiotics");
export const reconciliationsApi = scoped<MedicationReconciliation>("/medication-reconciliations");

export const medicationsApi = {
  ...scoped<HospitalMedication>("/medications"),
  list: (params: { admissionId?: string; patientId?: string; category?: MedicationCategory }) =>
    api.get<Envelope<HospitalMedication[]>>("/medications", { params }),
};

export const recommendationsApi = {
  ...scoped<Recommendation>("/recommendations"),
  bulk: (admissionId: string, items: Payload[]) =>
    api.post<Envelope<Recommendation[]>>("/recommendations/bulk", { admissionId, items }),
};

export const labResultsApi = {
  ...scoped<LabResult>("/lab-results"),
  replace: (admissionId: string, items: Payload[]) =>
    api.put<Envelope<LabResult[]>>("/lab-results/replace", { admissionId, items }),
};

export const culturesApi = {
  ...scoped<CultureResult>("/cultures"),
  replace: (admissionId: string, items: Payload[]) =>
    api.put<Envelope<CultureResult[]>>("/cultures/replace", { admissionId, items }),
};

export const referencesApi = {
  list: (parentId?: string) =>
    api.get<Envelope<ReferenceListing>>("/references", { params: parentId ? { parentId } : {} }),
  createFolder: (name: string, parentId?: string) =>
    api.post<Envelope<ReferenceItem>>("/references/folders", { name, parentId }),
  upload: (formData: FormData) =>
    api.post<Envelope<ReferenceItem>>("/references/files", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    }),
  link: (id: string) =>
    api.get<Envelope<{ viewUrl: string; downloadUrl: string }>>(`/references/${id}/link`),
  remove: (id: string) => api.delete(`/references/${id}`),
};

export const specialtiesApi = {
  list: () => api.get<Envelope<Specialty[]>>("/specialties"),
};

export const transfersApi = {
  list: (params?: { status?: string; box?: "all" | "sent" | "received" | "completed" }) =>
    api.get<Envelope<Transfer[]>>("/transfers", { params }),
  updateStatus: (id: string, status: Transfer["status"]) =>
    api.patch<Envelope<Transfer>>(`/transfers/${id}/status`, { status }),
};

export const usersApi = {
  me: () => api.get<Envelope<AuthUser>>("/users/me"),
  updateMe: (payload: Payload) => api.patch<Envelope<AuthUser>>("/users/me", payload),
  colleagues: (search?: string) =>
    api.get<Envelope<UserSummary[]>>("/users/colleagues", { params: search ? { search } : {} }),
};

export const aiApi = {
  extract: (formData: FormData) =>
    api.post("/ai/extract", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
