import { ReactNode } from "react";
import { HospitalMedication } from "../../types/api";
import { Column, DataTable } from "../../components/ui/DataTable";
import { isoDay } from "../../utils/dates";

interface Props {
  rows: HospitalMedication[];
  emptyText: string;
  /** Edit/delete buttons shown in edit mode. */
  actions?: (row: HospitalMedication) => ReactNode;
}

/** Drug / Dose / Route / Frequency / Comment / Start / End (current, antibiotic and discharge meds). */
export function MedicationTable({ rows, emptyText, actions }: Props) {
  const columns: Column<HospitalMedication>[] = [
    { key: "drug", label: "Drug", render: (m) => m.name },
    { key: "dose", label: "Dose", render: (m) => m.dose || "—" },
    { key: "route", label: "Route", render: (m) => m.route || "—" },
    { key: "frequency", label: "Frequency", render: (m) => m.frequency || "—" },
    { key: "comment", label: "Comment", render: (m) => m.notes || "—" },
    { key: "start", label: "Start", render: (m) => isoDay(m.startDate) },
    { key: "end", label: "End", render: (m) => (m.endDate ? isoDay(m.endDate) : "Ongoing") },
  ];
  if (actions) columns.push({ key: "actions", label: "Actions", flex: 0.8, align: "right", render: actions });
  return <DataTable columns={columns} rows={rows} keyOf={(m) => m._id} emptyText={emptyText} />;
}
