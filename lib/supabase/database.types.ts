// Hand-written mirror of supabase/migrations/0001_core_schema.sql.
// Once the project is linked to a real Supabase instance, replace this with
// the generated file: `supabase gen types typescript --linked > lib/supabase/database.types.ts`

export type UserRole = "PARTNER" | "SENIOR" | "STAFF";
export type ClientStatus = "ACTIVE" | "ONBOARDING" | "PAUSED";
export type DocumentType = "GST Invoice" | "Bank Statement" | "Purchase Register" | "GSTR-2B";
export type ProcessingStatus = "Processing" | "Processed" | "Ready" | "Failed";
export type ReconciliationStatus = "DRAFT" | "RUNNING" | "COMPLETE" | "FAILED";
export type ReconResultType =
  | "MATCHED"
  | "PARTIAL_MATCH"
  | "AMOUNT_MISMATCH"
  | "MISSING_IN_2B"
  | "GSTIN_MISMATCH"
  | "DUPLICATE";
export type ExceptionSeverity = "HIGH" | "MEDIUM" | "LOW";
export type ExceptionStatus =
  | "OPEN"
  | "ASSIGNED"
  | "AWAITING_CLIENT"
  | "UNDER_REVIEW"
  | "RESOLVED"
  | "REJECTED";
export type EvidenceStatus = "RECEIVED" | "REQUESTED" | "PENDING";

export interface Database {
  public: {
    Tables: {
      firms: {
        Row: { id: string; name: string; created_at: string };
        Insert: { id?: string; name: string; created_at?: string };
        Update: Partial<{ name: string }>;
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          firm_id: string;
          auth_user_id: string | null;
          name: string;
          email: string;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          firm_id: string;
          auth_user_id?: string | null;
          name: string;
          email: string;
          role: UserRole;
          created_at?: string;
        };
        Update: Partial<{ name: string; email: string; role: UserRole; auth_user_id: string | null }>;
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          firm_id: string;
          slug: string;
          name: string;
          gstin: string;
          pan: string | null;
          industry: string | null;
          engagement: string | null;
          status: ClientStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          firm_id: string;
          slug: string;
          name: string;
          gstin: string;
          pan?: string | null;
          industry?: string | null;
          engagement?: string | null;
          status?: ClientStatus;
          created_at?: string;
        };
        Update: Partial<{
          slug: string;
          name: string;
          gstin: string;
          pan: string | null;
          industry: string | null;
          engagement: string | null;
          status: ClientStatus;
        }>;
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          firm_id: string;
          client_id: string;
          file_name: string;
          storage_path: string;
          document_type: DocumentType;
          processing_status: ProcessingStatus;
          extracted_data: Record<string, unknown> | null;
          extracted_confidence: number | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          firm_id: string;
          client_id: string;
          file_name: string;
          storage_path: string;
          document_type: DocumentType;
          processing_status?: ProcessingStatus;
          extracted_data?: Record<string, unknown> | null;
          extracted_confidence?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          processing_status: ProcessingStatus;
          extracted_data: Record<string, unknown> | null;
          extracted_confidence: number | null;
        }>;
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          firm_id: string;
          client_id: string;
          source: string;
          vendor_name: string;
          vendor_gstin: string;
          invoice_number: string;
          invoice_date: string;
          taxable_value: number;
          cgst: number;
          sgst: number;
          igst: number;
          total_amount: number;
          source_document_id: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["transactions"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Row"]>;
        Relationships: [];
      };
      reconciliations: {
        Row: {
          id: string;
          firm_id: string;
          client_id: string;
          name: string;
          period: string;
          source_a: string;
          source_b: string;
          status: ReconciliationStatus;
          run_at: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["reconciliations"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<{ status: ReconciliationStatus; run_at: string | null }>;
        Relationships: [];
      };
      reconciliation_results: {
        Row: {
          id: string;
          firm_id: string;
          reconciliation_id: string;
          transaction_id: string | null;
          matched_transaction_id: string | null;
          result_type: ReconResultType;
          difference_amount: number | null;
          explanation: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["reconciliation_results"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["reconciliation_results"]["Row"]>;
        Relationships: [];
      };
      exceptions: {
        Row: {
          id: string;
          firm_id: string;
          client_id: string;
          reconciliation_id: string | null;
          reconciliation_result_id: string | null;
          transaction_id: string | null;
          display_code: string;
          exception_type: ReconResultType;
          severity: ExceptionSeverity;
          description: string | null;
          why_explanation: string[];
          ai_suggested_steps: string[];
          status: ExceptionStatus;
          assigned_to: string | null;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["exceptions"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<{
          status: ExceptionStatus;
          assigned_to: string | null;
          resolved_at: string | null;
          severity: ExceptionSeverity;
        }>;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          firm_id: string;
          client_id: string;
          exception_id: string;
          assigned_to: string;
          title: string;
          description: string | null;
          status: ExceptionStatus;
          due_date: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tasks"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<{ status: ExceptionStatus; assigned_to: string; due_date: string | null }>;
        Relationships: [];
      };
      evidence: {
        Row: {
          id: string;
          firm_id: string;
          client_id: string;
          exception_id: string;
          document_id: string | null;
          label: string;
          status: EvidenceStatus;
          description: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["evidence"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<{ status: EvidenceStatus; document_id: string | null }>;
        Relationships: [];
      };
      activity_log: {
        Row: {
          id: string;
          firm_id: string;
          client_id: string;
          exception_id: string | null;
          user_id: string | null;
          action: string;
          description: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["activity_log"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      invites: {
        Row: {
          id: string;
          firm_id: string;
          token: string;
          role: UserRole;
          invited_by: string | null;
          created_at: string;
          expires_at: string;
          accepted_at: string | null;
          accepted_by: string | null;
        };
        Insert: {
          id?: string;
          firm_id: string;
          token: string;
          role: UserRole;
          invited_by?: string | null;
          created_at?: string;
          expires_at?: string;
          accepted_at?: string | null;
          accepted_by?: string | null;
        };
        Update: Partial<{ accepted_at: string | null; accepted_by: string | null }>;
        Relationships: [];
      };
    };
    // Supabase's query client needs these keys to exist — even empty — to
    // correctly infer what .select("col1, col2") returns. Omitting them
    // (as this hand-written file originally did) makes every such query
    // resolve to `never`, which is the exact "Failed to compile" error this
    // fixes. Real `supabase gen types` output always includes these.
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      client_status: ClientStatus;
      document_type: DocumentType;
      processing_status: ProcessingStatus;
      reconciliation_status: ReconciliationStatus;
      recon_result_type: ReconResultType;
      exception_severity: ExceptionSeverity;
      exception_status: ExceptionStatus;
      evidence_status: EvidenceStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
