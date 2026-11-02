import { useCallback, useState } from "react";
import {
  admissionsApi,
  antibioticsApi,
  clinicalApi,
  culturesApi,
  labResultsApi,
  medicationsApi,
  reconciliationsApi,
  recommendationsApi,
} from "../../services/api/medlogApi";
import { getErrorMessage } from "../../services/api/client";
import {
  Admission,
  ClinicalParameter,
  CultureResult,
  HospitalMedication,
  LabResult,
  MedicationReconciliation,
  PreviousAntibiotic,
  Recommendation,
} from "../../types/api";

export interface WorkspaceData {
  admission: Admission;
  reconciliation: MedicationReconciliation[];
  previousAntibiotics: PreviousAntibiotic[];
  hospitalMeds: HospitalMedication[];
  currentAntibiotics: HospitalMedication[];
  recommendations: Recommendation[];
  parameters: ClinicalParameter[];
  labs: LabResult[];
  cultures: CultureResult[];
  history: Admission[];
}

/** Loads an admission and every table shown in the Clinical Workspace in parallel. */
export function useWorkspace(admissionId?: string) {
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!admissionId) return;
    try {
      setError(null);
      setLoading(true);
      const scope = { admissionId };
      const [admission, rec, prevAbx, meds, curAbx, plans, params, labs, cultures] = await Promise.all([
        admissionsApi.get(admissionId),
        reconciliationsApi.list(scope),
        antibioticsApi.list(scope),
        medicationsApi.list({ ...scope, category: "hospital" }),
        medicationsApi.list({ ...scope, category: "antibiotic" }),
        recommendationsApi.list(scope),
        clinicalApi.list(scope),
        labResultsApi.list(scope),
        culturesApi.list(scope),
      ]);
      const a = admission.data.data;
      const patientId = typeof a.patient === "object" ? a.patient._id : a.patient;
      const history = await admissionsApi.list({ patientId, limit: 50 });
      setData({
        admission: a,
        reconciliation: rec.data.data,
        previousAntibiotics: prevAbx.data.data,
        hospitalMeds: meds.data.data,
        currentAntibiotics: curAbx.data.data,
        recommendations: plans.data.data,
        parameters: params.data.data,
        labs: labs.data.data,
        cultures: cultures.data.data,
        history: history.data.data.filter((h) => h._id !== a._id),
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [admissionId]);

  return { data, setData, loading, error, load };
}
