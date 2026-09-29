// Maps Supabase rows (snake_case, DB-shaped) to the view-model types the
// frontend components already expect (lib/types.ts, camelCase). This is
// what lets every existing page/component built in Batch 1 keep working
// unchanged — only the query functions that produce these shapes changed.
import type {
  User as ViewUser,
  Client as ViewClient,
  ClientDocument as ViewDocument,
  ExceptionRecord as ViewException,
  ActivityEvent as ViewActivity,
  TaskRecord as ViewTask,
} from "@/lib/types";

export function mapUser(row: { id: string; name: string; role: string } | null): ViewUser | null {
  if (!row) return null;
  const initials = row.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return { id: row.id, name: row.name, role: row.role as ViewUser["role"], initials };
}

export function mapClient(row: {
  id: string;
  slug: string;
  name: string;
  gstin: string;
  engagement: string | null;
  status: string;
  created_at: string;
}): ViewClient {
  // documentsCount/exceptionsCount/lastActivity are computed separately
  // (they require joins/aggregates) — see listClients() in clients.ts.
  return {
    id: row.slug, // routes use the slug; components call this field `id`
    name: row.name,
    gstin: row.gstin,
    engagement: row.engagement ?? "",
    status: row.status as ViewClient["status"],
    documentsCount: 0,
    exceptionsCount: 0,
    lastActivity: row.created_at,
  };
}

function num(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

export function mapDocument(row: {
  id: string;
  client_id: string;
  file_name: string;
  document_type: string;
  processing_status: string;
  extracted_confidence: number | null;
  created_at: string;
}): ViewDocument {
  return {
    id: row.id,
    clientId: row.client_id,
    fileName: row.file_name,
    documentType: row.document_type as ViewDocument["documentType"],
    uploadedOn: row.created_at,
    processingStatus: row.processing_status as ViewDocument["processingStatus"],
    extractedConfidence: num(row.extracted_confidence) ?? undefined,
  };
}

interface ExceptionRow {
  id: string;
  display_code: string;
  client_id: string;
  exception_type: string;
  severity: string;
  status: string;
  why_explanation: string[];
  ai_suggested_steps: string[];
  created_at: string;
  resolved_at: string | null;
  assigned_to: { id: string; name: string; role: string } | null;
  client?: { slug: string; name: string } | null;
  evidence?: Array<{ id: string; label: string; status: string }>;
  transaction?: {
    vendor_name: string;
    vendor_gstin: string;
    invoice_number: string;
    invoice_date: string;
    taxable_value: number;
  } | null;
  reconciliation_result?: {
    difference_amount: number | null;
    matched_transaction?: { taxable_value: number } | null;
  } | null;
}

export function mapException(row: ExceptionRow): ViewException {
  const txn = row.transaction;
  const result = row.reconciliation_result;
  const purchaseValue = num(txn?.taxable_value);
  const differenceAmount = num(result?.difference_amount);
  const matchedValue = num(result?.matched_transaction?.taxable_value);

  return {
    id: row.display_code,
    clientId: row.client?.slug ?? row.client_id,
    clientName: row.client?.name ?? "",
    vendorName: txn?.vendor_name ?? "",
    vendorGstin: txn?.vendor_gstin ?? "",
    invoiceNumber: txn?.invoice_number ?? "",
    invoiceDate: txn?.invoice_date ?? row.created_at,
    type: row.exception_type as ViewException["type"],
    severity: row.severity as ViewException["severity"],
    status: row.status as ViewException["status"],
    purchaseValue,
    gstr2bValue: matchedValue ?? (purchaseValue !== null && differenceAmount !== null ? purchaseValue - differenceAmount : null),
    difference: differenceAmount,
    assignedTo: mapUser(row.assigned_to),
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
    whyExplanation: row.why_explanation ?? [],
    aiSuggestedSteps: row.ai_suggested_steps ?? [],
    evidence: (row.evidence ?? []).map((e) => ({
      id: e.id,
      exceptionId: row.id,
      label: e.label,
      status: e.status as ViewException["evidence"][number]["status"],
    })),
  };
}

export function mapActivity(row: {
  id: string;
  client_id: string;
  exception_id: string | null;
  description: string;
  created_at: string;
}): ViewActivity {
  const d = new Date(row.created_at);
  return {
    id: row.id,
    clientId: row.client_id,
    exceptionId: row.exception_id ?? undefined,
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
    date: row.created_at.slice(0, 10),
    description: row.description,
  };
}

export function mapTaskFromException(exception: ViewException): ViewTask | null {
  if (!exception.assignedTo) return null;
  return {
    id: `task-${exception.id}`,
    clientId: exception.clientId,
    exceptionId: exception.id,
    title: `${exception.type.replace(/_/g, " ").toLowerCase()} — ${exception.invoiceNumber}`,
    assignedTo: exception.assignedTo,
    status: exception.status,
    dueDate: exception.createdAt,
  };
}
