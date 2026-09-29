export interface InvoiceExtraction {
  document_type: string;
  vendor_name: string | null;
  vendor_gstin: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  taxable_value: number | null;
  cgst: number | null;
  sgst: number | null;
  igst: number | null;
  total_amount: number | null;
  confidence: {
    vendor_name: number;
    vendor_gstin: number;
    invoice_number: number;
    invoice_date: number;
    taxable_value: number;
    cgst: number;
    sgst: number;
    igst: number;
    total_amount: number;
  };
}
