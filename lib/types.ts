export type UserRole = "PARTNER" | "SENIOR" | "STAFF";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  initials: string;
}

export type ClientStatus = "ACTIVE" | "ONBOARDING" | "PAUSED";

export interface Client {
  id: string;
  name: string;
  gstin: string;
  engagement: string;
  status: ClientStatus;
  documentsCount: number;
  exceptionsCount: number;
  lastActivity: string; // ISO date
}

export type DocumentType =
  | "GST Invoice"
  | "Bank Statement"
  | "Purchase Register"
  | "GSTR-2B";

export type ProcessingStatus = "Processing" | "Processed" | "Ready" | "Failed";

export interface ClientDocument {
  id: string;
  clientId: string;
  fileName: string;
  documentType: DocumentType;
  uploadedOn: string;
  processingStatus: ProcessingStatus;
  extractedConfidence?: number; // 0-1, only for AI-extracted docs
}

export type ReconResultType =
  | "MATCHED"
  | "PARTIAL_MATCH"
  | "AMOUNT_MISMATCH"
  | "MISSING_IN_2B"
  | "GSTIN_MISMATCH"
  | "DUPLICATE";

export interface ReconciliationRow {
  id: string;
  clientId: string;
  vendorName: string;
  vendorGstin: string;
  invoiceNumber: string;
  invoiceDate: string;
  purchaseValue: number | null;
  gstr2bValue: number | null;
  difference: number | null;
  status: ReconResultType;
}

export interface ReconciliationSummary {
  clientId: string;
  period: string;
  purchaseEntries: number;
  matched: number;
  partialMatch?: number;
  amountMismatch: number;
  missingIn2B: number;
  gstinMismatch: number;
  duplicates: number;
}

export type ExceptionSeverity = "HIGH" | "MEDIUM" | "LOW";

export type ExceptionStatus =
  | "OPEN"
  | "ASSIGNED"
  | "AWAITING_CLIENT"
  | "UNDER_REVIEW"
  | "RESOLVED"
  | "REJECTED";

export interface EvidenceItem {
  id: string;
  exceptionId: string;
  label: string;
  status: "RECEIVED" | "REQUESTED" | "PENDING";
  sourceDocumentId?: string;
}

export interface ExceptionRecord {
  id: string; // e.g. EX-1042
  clientId: string;
  clientName: string;
  vendorName: string;
  vendorGstin: string;
  invoiceNumber: string;
  invoiceDate: string;
  type: ReconResultType;
  severity: ExceptionSeverity;
  status: ExceptionStatus;
  purchaseValue: number | null;
  gstr2bValue: number | null;
  difference: number | null;
  assignedTo: User | null;
  createdAt: string;
  resolvedAt: string | null;
  whyExplanation: string[];
  aiSuggestedSteps: string[];
  evidence: EvidenceItem[];
}

export interface ActivityEvent {
  id: string;
  clientId: string;
  exceptionId?: string;
  time: string; // display time, e.g. "09:42"
  date: string; // ISO date
  description: string;
}

export interface TaskRecord {
  id: string;
  clientId: string;
  exceptionId: string;
  title: string;
  assignedTo: User;
  status: ExceptionStatus;
  dueDate: string;
}
