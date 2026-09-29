// NOT USED BY THE APP as of the Supabase integration — every page now reads
// from lib/supabase/queries/*. Kept only as a reference for the exact data
// the seed migration (supabase/migrations/0003_seed_demo_data.sql) mirrors,
// and as a fallback you could wire back in for offline/no-Supabase local dev.
//
// Synthetic demo data only. No real client, vendor, or government information.
import type {
  User,
  Client,
  ClientDocument,
  ReconciliationRow,
  ReconciliationSummary,
  ExceptionRecord,
  ActivityEvent,
  TaskRecord,
} from "./types";

export const USERS: User[] = [
  { id: "u-arvind", name: "Arvind Rao", role: "PARTNER", initials: "AR" },
  { id: "u-rahul", name: "Rahul Sharma", role: "SENIOR", initials: "RS" },
  { id: "u-priya", name: "Priya Nair", role: "STAFF", initials: "PN" },
];

export const CURRENT_USER = USERS[0]; // Arvind — demo is shown from the partner's seat

export const CLIENTS: Client[] = [
  {
    id: "abc-manufacturing",
    name: "ABC Manufacturing Pvt Ltd",
    gstin: "27AABCA1234A1Z5",
    engagement: "GST Reconciliation — FY 2026-27",
    status: "ACTIVE",
    documentsCount: 142,
    exceptionsCount: 173,
    lastActivity: "2026-09-23T11:15:00",
  },
  {
    id: "sharma-traders",
    name: "Sharma Traders",
    gstin: "07AASFS5678B1Z2",
    engagement: "GST Reconciliation — FY 2026-27",
    status: "ACTIVE",
    documentsCount: 88,
    exceptionsCount: 41,
    lastActivity: "2026-09-22T16:40:00",
  },
  {
    id: "xyz-pvt-ltd",
    name: "XYZ Pvt Ltd",
    gstin: "29AAXYZ9012C1Z8",
    engagement: "GST Reconciliation — FY 2026-27",
    status: "ACTIVE",
    documentsCount: 64,
    exceptionsCount: 19,
    lastActivity: "2026-09-23T09:05:00",
  },
  {
    id: "kumar-engineering",
    name: "Kumar Engineering",
    gstin: "33AAKEN3456D1Z1",
    engagement: "GST Reconciliation — FY 2026-27",
    status: "ACTIVE",
    documentsCount: 51,
    exceptionsCount: 12,
    lastActivity: "2026-09-21T14:20:00",
  },
  {
    id: "apex-infotech",
    name: "Apex Infotech Pvt Ltd",
    gstin: "24AAAPI7890E1Z4",
    engagement: "GST Reconciliation — FY 2026-27",
    status: "ACTIVE",
    documentsCount: 73,
    exceptionsCount: 8,
    lastActivity: "2026-09-20T10:00:00",
  },
  {
    id: "greenline-foods",
    name: "Greenline Foods",
    gstin: "36AAGLF2345F1Z9",
    engagement: "GST Reconciliation — FY 2026-27",
    status: "ONBOARDING",
    documentsCount: 14,
    exceptionsCount: 0,
    lastActivity: "2026-09-18T12:30:00",
  },
  {
    id: "northstar-components",
    name: "Northstar Components",
    gstin: "09AANSC6789G1Z6",
    engagement: "GST Reconciliation — FY 2026-27",
    status: "ACTIVE",
    documentsCount: 96,
    exceptionsCount: 17,
    lastActivity: "2026-09-22T08:50:00",
  },
  {
    id: "vardhan-electricals",
    name: "Vardhan Electricals",
    gstin: "19AAVEL1123H1Z3",
    engagement: "GST Reconciliation — FY 2026-27",
    status: "ACTIVE",
    documentsCount: 39,
    exceptionsCount: 6,
    lastActivity: "2026-09-19T15:10:00",
  },
  {
    id: "metro-industrial",
    name: "Metro Industrial Supplies",
    gstin: "27AAMIS4456J1Z7",
    engagement: "GST Reconciliation — FY 2026-27",
    status: "ACTIVE",
    documentsCount: 58,
    exceptionsCount: 11,
    lastActivity: "2026-09-21T17:45:00",
  },
  {
    id: "sundaram-textiles",
    name: "Sundaram Textiles Pvt Ltd",
    gstin: "33AASTX7789K1Z0",
    engagement: "GST Reconciliation — FY 2026-27",
    status: "ACTIVE",
    documentsCount: 45,
    exceptionsCount: 4,
    lastActivity: "2026-09-17T11:00:00",
  },
  {
    id: "bhavani-agro",
    name: "Bhavani Agro Exports",
    gstin: "24AABAE3321L1Z5",
    engagement: "GST Reconciliation — FY 2026-27",
    status: "PAUSED",
    documentsCount: 22,
    exceptionsCount: 2,
    lastActivity: "2026-09-05T09:30:00",
  },
  {
    id: "coastline-logistics",
    name: "Coastline Logistics Pvt Ltd",
    gstin: "29AACLL8890M1Z2",
    engagement: "GST Reconciliation — FY 2026-27",
    status: "ACTIVE",
    documentsCount: 67,
    exceptionsCount: 9,
    lastActivity: "2026-09-20T13:15:00",
  },
];

export function getClient(id: string): Client | undefined {
  return CLIENTS.find((c) => c.id === id);
}

// ---------------------------------------------------------------------------
// Documents — full inbox for the canonical demo client, a light sample for others
// ---------------------------------------------------------------------------

const abcDocuments: ClientDocument[] = [
  { id: "d1", clientId: "abc-manufacturing", fileName: "ABC_INV_1023.pdf", documentType: "GST Invoice", uploadedOn: "2026-08-17", processingStatus: "Processed", extractedConfidence: 0.97 },
  { id: "d2", clientId: "abc-manufacturing", fileName: "ABC_INV_1024.pdf", documentType: "GST Invoice", uploadedOn: "2026-08-17", processingStatus: "Processed", extractedConfidence: 0.95 },
  { id: "d3", clientId: "abc-manufacturing", fileName: "ABC_INV_1025.pdf", documentType: "GST Invoice", uploadedOn: "2026-08-17", processingStatus: "Processed", extractedConfidence: 0.99 },
  { id: "d4", clientId: "abc-manufacturing", fileName: "ABC_INV_1026_ABC_Components.pdf", documentType: "GST Invoice", uploadedOn: "2026-08-17", processingStatus: "Processed", extractedConfidence: 0.89 },
  { id: "d5", clientId: "abc-manufacturing", fileName: "bank_august.pdf", documentType: "Bank Statement", uploadedOn: "2026-08-18", processingStatus: "Processing" },
  { id: "d6", clientId: "abc-manufacturing", fileName: "purchase_register_aug.xlsx", documentType: "Purchase Register", uploadedOn: "2026-08-18", processingStatus: "Ready" },
  { id: "d7", clientId: "abc-manufacturing", fileName: "gstr2b_august.json", documentType: "GSTR-2B", uploadedOn: "2026-08-18", processingStatus: "Ready" },
  { id: "d8", clientId: "abc-manufacturing", fileName: "ABC_INV_1031.pdf", documentType: "GST Invoice", uploadedOn: "2026-08-19", processingStatus: "Failed" },
  { id: "d9", clientId: "abc-manufacturing", fileName: "ABC_INV_1032.pdf", documentType: "GST Invoice", uploadedOn: "2026-08-19", processingStatus: "Processed", extractedConfidence: 0.93 },
];

export const DOCUMENTS_BY_CLIENT: Record<string, ClientDocument[]> = {
  "abc-manufacturing": abcDocuments,
  "sharma-traders": [
    { id: "d10", clientId: "sharma-traders", fileName: "ST_INV_204.pdf", documentType: "GST Invoice", uploadedOn: "2026-08-16", processingStatus: "Processed", extractedConfidence: 0.96 },
    { id: "d11", clientId: "sharma-traders", fileName: "purchase_register_aug.xlsx", documentType: "Purchase Register", uploadedOn: "2026-08-16", processingStatus: "Ready" },
    { id: "d12", clientId: "sharma-traders", fileName: "gstr2b_august.json", documentType: "GSTR-2B", uploadedOn: "2026-08-16", processingStatus: "Ready" },
  ],
  "xyz-pvt-ltd": [
    { id: "d13", clientId: "xyz-pvt-ltd", fileName: "XYZ_INV_88.pdf", documentType: "GST Invoice", uploadedOn: "2026-08-15", processingStatus: "Processed", extractedConfidence: 0.91 },
    { id: "d14", clientId: "xyz-pvt-ltd", fileName: "purchase_register_aug.xlsx", documentType: "Purchase Register", uploadedOn: "2026-08-15", processingStatus: "Ready" },
  ],
  "kumar-engineering": [
    { id: "d15", clientId: "kumar-engineering", fileName: "KE_INV_512.pdf", documentType: "GST Invoice", uploadedOn: "2026-08-14", processingStatus: "Processed", extractedConfidence: 0.94 },
    { id: "d16", clientId: "kumar-engineering", fileName: "purchase_register_aug.xlsx", documentType: "Purchase Register", uploadedOn: "2026-08-14", processingStatus: "Ready" },
  ],
  "apex-infotech": [
    { id: "d17", clientId: "apex-infotech", fileName: "AXI_INV_09.pdf", documentType: "GST Invoice", uploadedOn: "2026-08-13", processingStatus: "Processed", extractedConfidence: 0.98 },
    { id: "d18", clientId: "apex-infotech", fileName: "purchase_register_aug.xlsx", documentType: "Purchase Register", uploadedOn: "2026-08-13", processingStatus: "Ready" },
  ],
  "northstar-components": [
    { id: "d19", clientId: "northstar-components", fileName: "NSC_INV_301.pdf", documentType: "GST Invoice", uploadedOn: "2026-08-12", processingStatus: "Processed", extractedConfidence: 0.9 },
    { id: "d20", clientId: "northstar-components", fileName: "purchase_register_aug.xlsx", documentType: "Purchase Register", uploadedOn: "2026-08-12", processingStatus: "Ready" },
    { id: "d21", clientId: "northstar-components", fileName: "gstr2b_august.json", documentType: "GSTR-2B", uploadedOn: "2026-08-12", processingStatus: "Ready" },
  ],
  "vardhan-electricals": [
    { id: "d22", clientId: "vardhan-electricals", fileName: "VE_INV_44.pdf", documentType: "GST Invoice", uploadedOn: "2026-08-11", processingStatus: "Processed", extractedConfidence: 0.92 },
    { id: "d23", clientId: "vardhan-electricals", fileName: "purchase_register_aug.xlsx", documentType: "Purchase Register", uploadedOn: "2026-08-11", processingStatus: "Ready" },
  ],
  "metro-industrial": [
    { id: "d24", clientId: "metro-industrial", fileName: "MIS_INV_120.pdf", documentType: "GST Invoice", uploadedOn: "2026-08-10", processingStatus: "Processed", extractedConfidence: 0.87 },
    { id: "d25", clientId: "metro-industrial", fileName: "purchase_register_aug.xlsx", documentType: "Purchase Register", uploadedOn: "2026-08-10", processingStatus: "Ready" },
  ],
  "sundaram-textiles": [
    { id: "d26", clientId: "sundaram-textiles", fileName: "SUN_INV_67.pdf", documentType: "GST Invoice", uploadedOn: "2026-08-09", processingStatus: "Processed", extractedConfidence: 0.95 },
  ],
  "coastline-logistics": [
    { id: "d27", clientId: "coastline-logistics", fileName: "CLL_INV_231.pdf", documentType: "GST Invoice", uploadedOn: "2026-08-08", processingStatus: "Processed", extractedConfidence: 0.93 },
    { id: "d28", clientId: "coastline-logistics", fileName: "purchase_register_aug.xlsx", documentType: "Purchase Register", uploadedOn: "2026-08-08", processingStatus: "Ready" },
  ],
};

export function getDocuments(clientId: string): ClientDocument[] {
  return DOCUMENTS_BY_CLIENT[clientId] ?? [];
}

// ---------------------------------------------------------------------------
// Reconciliation — Purchase Register vs GSTR-2B
// ---------------------------------------------------------------------------

export const RECON_SUMMARY_BY_CLIENT: Record<string, ReconciliationSummary> = {
  "abc-manufacturing": {
    clientId: "abc-manufacturing",
    period: "August 2026",
    purchaseEntries: 2500,
    matched: 2327,
    amountMismatch: 61,
    missingIn2B: 74,
    gstinMismatch: 23,
    duplicates: 15,
  },
  "sharma-traders": {
    clientId: "sharma-traders",
    period: "August 2026",
    purchaseEntries: 640,
    matched: 599,
    amountMismatch: 14,
    missingIn2B: 21,
    gstinMismatch: 4,
    duplicates: 2,
  },
  "xyz-pvt-ltd": {
    clientId: "xyz-pvt-ltd",
    period: "August 2026",
    purchaseEntries: 410,
    matched: 391,
    amountMismatch: 6,
    missingIn2B: 9,
    gstinMismatch: 3,
    duplicates: 1,
  },
  "kumar-engineering": {
    clientId: "kumar-engineering",
    period: "August 2026",
    purchaseEntries: 305,
    matched: 293,
    amountMismatch: 5,
    missingIn2B: 4,
    gstinMismatch: 2,
    duplicates: 1,
  },
  "apex-infotech": {
    clientId: "apex-infotech",
    period: "August 2026",
    purchaseEntries: 210,
    matched: 202,
    amountMismatch: 3,
    missingIn2B: 3,
    gstinMismatch: 1,
    duplicates: 1,
  },
  "northstar-components": {
    clientId: "northstar-components",
    period: "August 2026",
    purchaseEntries: 480,
    matched: 463,
    amountMismatch: 8,
    missingIn2B: 6,
    gstinMismatch: 2,
    duplicates: 1,
  },
  "vardhan-electricals": {
    clientId: "vardhan-electricals",
    period: "August 2026",
    purchaseEntries: 160,
    matched: 154,
    amountMismatch: 2,
    missingIn2B: 3,
    gstinMismatch: 1,
    duplicates: 0,
  },
  "metro-industrial": {
    clientId: "metro-industrial",
    period: "August 2026",
    purchaseEntries: 275,
    matched: 264,
    amountMismatch: 4,
    missingIn2B: 5,
    gstinMismatch: 1,
    duplicates: 1,
  },
  "sundaram-textiles": {
    clientId: "sundaram-textiles",
    period: "August 2026",
    purchaseEntries: 140,
    matched: 136,
    amountMismatch: 2,
    missingIn2B: 1,
    gstinMismatch: 1,
    duplicates: 0,
  },
  "coastline-logistics": {
    clientId: "coastline-logistics",
    period: "August 2026",
    purchaseEntries: 230,
    matched: 221,
    amountMismatch: 4,
    missingIn2B: 3,
    gstinMismatch: 1,
    duplicates: 1,
  },
};

const abcReconRows: ReconciliationRow[] = [
  { id: "r1", clientId: "abc-manufacturing", vendorName: "ABC Components Pvt Ltd", vendorGstin: "27AABCC5678K1Z2", invoiceNumber: "INV-10482", invoiceDate: "2026-08-05", purchaseValue: 100000, gstr2bValue: 92000, difference: 8000, status: "AMOUNT_MISMATCH" },
  { id: "r2", clientId: "abc-manufacturing", vendorName: "Shree Steel Traders", vendorGstin: "27AASST1122L1Z9", invoiceNumber: "INV-7734", invoiceDate: "2026-08-06", purchaseValue: 245000, gstr2bValue: 245000, difference: 0, status: "MATCHED" },
  { id: "r3", clientId: "abc-manufacturing", vendorName: "Bharat Packaging Co", vendorGstin: "27AABPC3344M1Z0", invoiceNumber: "INV-2201", invoiceDate: "2026-08-07", purchaseValue: 58500, gstr2bValue: null, difference: null, status: "MISSING_IN_2B" },
  { id: "r4", clientId: "abc-manufacturing", vendorName: "Vishal Hardware", vendorGstin: "27AAVHW9988N1Z5", invoiceNumber: "INV-559", invoiceDate: "2026-08-07", purchaseValue: 12400, gstr2bValue: 12400, difference: 0, status: "MATCHED" },
  { id: "r5", clientId: "abc-manufacturing", vendorName: "Om Sai Logistics", vendorGstin: "27AAOSL6677P1Z3", invoiceNumber: "INV-9012", invoiceDate: "2026-08-08", purchaseValue: 76000, gstr2bValue: 76000, difference: 0, status: "MATCHED" },
  { id: "r6", clientId: "abc-manufacturing", vendorName: "Kiran Electricals", vendorGstin: "07AAKEL2233Q1Z1", invoiceNumber: "INV-341", invoiceDate: "2026-08-09", purchaseValue: 34000, gstr2bValue: 34000, difference: 0, status: "GSTIN_MISMATCH" },
  { id: "r7", clientId: "abc-manufacturing", vendorName: "Nandi Chemicals", vendorGstin: "27AANCH4455R1Z8", invoiceNumber: "INV-8821", invoiceDate: "2026-08-10", purchaseValue: 189000, gstr2bValue: 189000, difference: 0, status: "DUPLICATE" },
  { id: "r8", clientId: "abc-manufacturing", vendorName: "Global Freight Movers", vendorGstin: "27AAGFM7799S1Z6", invoiceNumber: "INV-4410", invoiceDate: "2026-08-10", purchaseValue: 91200, gstr2bValue: 91200, difference: 0, status: "MATCHED" },
  { id: "r9", clientId: "abc-manufacturing", vendorName: "Precision Tools India", vendorGstin: "27AAPTI1010T1Z4", invoiceNumber: "INV-6650", invoiceDate: "2026-08-11", purchaseValue: 143500, gstr2bValue: 139500, difference: 4000, status: "AMOUNT_MISMATCH" },
  { id: "r10", clientId: "abc-manufacturing", vendorName: "Suraj Industrial Gases", vendorGstin: "27AASIG2020U1Z2", invoiceNumber: "INV-3390", invoiceDate: "2026-08-12", purchaseValue: 27800, gstr2bValue: null, difference: null, status: "MISSING_IN_2B" },
  { id: "r11", clientId: "abc-manufacturing", vendorName: "Anand Timber Mart", vendorGstin: "27AAATM3030V1Z0", invoiceNumber: "INV-5512", invoiceDate: "2026-08-12", purchaseValue: 63000, gstr2bValue: 63000, difference: 0, status: "MATCHED" },
  { id: "r12", clientId: "abc-manufacturing", vendorName: "Deepak Fasteners", vendorGstin: "27AADFA4040W1Z8", invoiceNumber: "INV-7781", invoiceDate: "2026-08-13", purchaseValue: 18900, gstr2bValue: 18200, difference: 700, status: "AMOUNT_MISMATCH" },
];

const sharmaReconRows: ReconciliationRow[] = [
  { id: "r13", clientId: "sharma-traders", vendorName: "Radha Textiles", vendorGstin: "07AARTX5566X1Z6", invoiceNumber: "INV-201", invoiceDate: "2026-08-03", purchaseValue: 42000, gstr2bValue: null, difference: null, status: "MISSING_IN_2B" },
  { id: "r14", clientId: "sharma-traders", vendorName: "Om Enterprises", vendorGstin: "07AAOEN6677Y1Z4", invoiceNumber: "INV-202", invoiceDate: "2026-08-04", purchaseValue: 15800, gstr2bValue: 15800, difference: 0, status: "MATCHED" },
  { id: "r15", clientId: "sharma-traders", vendorName: "Balaji Traders", vendorGstin: "07AABJT7788Z1Z2", invoiceNumber: "INV-203", invoiceDate: "2026-08-05", purchaseValue: 99000, gstr2bValue: 94500, difference: 4500, status: "AMOUNT_MISMATCH" },
];

const xyzReconRows: ReconciliationRow[] = [
  { id: "r16", clientId: "xyz-pvt-ltd", vendorName: "Meridian Packaging", vendorGstin: "29AAMPK8899A1Z1", invoiceNumber: "INV-77", invoiceDate: "2026-08-02", purchaseValue: 74500, gstr2bValue: 74500, difference: 0, status: "GSTIN_MISMATCH" },
];

const kumarReconRows: ReconciliationRow[] = [
  { id: "r17", clientId: "kumar-engineering", vendorName: "Reliant Alloys", vendorGstin: "33AARAL1234N1Z9", invoiceNumber: "INV-512", invoiceDate: "2026-08-04", purchaseValue: 88000, gstr2bValue: 81000, difference: 7000, status: "AMOUNT_MISMATCH" },
  { id: "r18", clientId: "kumar-engineering", vendorName: "Coimbatore Machine Tools", vendorGstin: "33AACMT5566P1Z7", invoiceNumber: "INV-513", invoiceDate: "2026-08-05", purchaseValue: 41000, gstr2bValue: 41000, difference: 0, status: "MATCHED" },
];

const apexReconRows: ReconciliationRow[] = [
  { id: "r19", clientId: "apex-infotech", vendorName: "Cloudverse Systems", vendorGstin: "24AACVS9911R1Z2", invoiceNumber: "INV-09", invoiceDate: "2026-08-03", purchaseValue: 128000, gstr2bValue: null, difference: null, status: "MISSING_IN_2B" },
];

const northstarReconRows: ReconciliationRow[] = [
  { id: "r20", clientId: "northstar-components", vendorName: "Lucknow Wire Industries", vendorGstin: "09AALWI2288S1Z6", invoiceNumber: "INV-301", invoiceDate: "2026-08-06", purchaseValue: 63500, gstr2bValue: 59500, difference: 4000, status: "AMOUNT_MISMATCH" },
  { id: "r21", clientId: "northstar-components", vendorName: "Ganges Casting Works", vendorGstin: "09AAGCW3399T1Z4", invoiceNumber: "INV-302", invoiceDate: "2026-08-07", purchaseValue: 31000, gstr2bValue: 31000, difference: 0, status: "GSTIN_MISMATCH" },
];

const vardhanReconRows: ReconciliationRow[] = [
  { id: "r22", clientId: "vardhan-electricals", vendorName: "Howrah Cable Corp", vendorGstin: "19AAHCC4477U1Z1", invoiceNumber: "INV-44", invoiceDate: "2026-08-05", purchaseValue: 22500, gstr2bValue: null, difference: null, status: "MISSING_IN_2B" },
];

const metroReconRows: ReconciliationRow[] = [
  { id: "r23", clientId: "metro-industrial", vendorName: "Pune Bearings Ltd", vendorGstin: "27AAPBL5588V1Z8", invoiceNumber: "INV-120", invoiceDate: "2026-08-04", purchaseValue: 54000, gstr2bValue: 49500, difference: 4500, status: "AMOUNT_MISMATCH" },
  { id: "r24", clientId: "metro-industrial", vendorName: "Thane Rubber Works", vendorGstin: "27AATRW6699W1Z5", invoiceNumber: "INV-121", invoiceDate: "2026-08-06", purchaseValue: 17800, gstr2bValue: 17800, difference: 0, status: "DUPLICATE" },
];

const sundaramReconRows: ReconciliationRow[] = [
  { id: "r25", clientId: "sundaram-textiles", vendorName: "Erode Cotton Mills", vendorGstin: "33AAECM7700X1Z3", invoiceNumber: "INV-67", invoiceDate: "2026-08-02", purchaseValue: 39500, gstr2bValue: 37000, difference: 2500, status: "AMOUNT_MISMATCH" },
];

const coastlineReconRows: ReconciliationRow[] = [
  { id: "r26", clientId: "coastline-logistics", vendorName: "Kandla Port Services", vendorGstin: "24AAKPS8811Y1Z0", invoiceNumber: "INV-231", invoiceDate: "2026-08-05", purchaseValue: 96000, gstr2bValue: null, difference: null, status: "MISSING_IN_2B" },
  { id: "r27", clientId: "coastline-logistics", vendorName: "Mundra Freight Co", vendorGstin: "24AAMFC9922Z1Z8", invoiceNumber: "INV-232", invoiceDate: "2026-08-07", purchaseValue: 61000, gstr2bValue: 61000, difference: 0, status: "MATCHED" },
];

export const RECON_ROWS_BY_CLIENT: Record<string, ReconciliationRow[]> = {
  "abc-manufacturing": abcReconRows,
  "sharma-traders": sharmaReconRows,
  "xyz-pvt-ltd": xyzReconRows,
  "kumar-engineering": kumarReconRows,
  "apex-infotech": apexReconRows,
  "northstar-components": northstarReconRows,
  "vardhan-electricals": vardhanReconRows,
  "metro-industrial": metroReconRows,
  "sundaram-textiles": sundaramReconRows,
  "coastline-logistics": coastlineReconRows,
};

export function getReconRows(clientId: string): ReconciliationRow[] {
  return RECON_ROWS_BY_CLIENT[clientId] ?? [];
}

export function getReconSummary(clientId: string): ReconciliationSummary | undefined {
  return RECON_SUMMARY_BY_CLIENT[clientId];
}

// ---------------------------------------------------------------------------
// Exceptions
// ---------------------------------------------------------------------------

const canonicalException: ExceptionRecord = {
  id: "EX-1042",
  clientId: "abc-manufacturing",
  clientName: "ABC Manufacturing Pvt Ltd",
  vendorName: "ABC Components Pvt Ltd",
  vendorGstin: "27AABCC5678K1Z2",
  invoiceNumber: "INV-10482",
  invoiceDate: "2026-08-05",
  type: "AMOUNT_MISMATCH",
  severity: "HIGH",
  status: "AWAITING_CLIENT",
  purchaseValue: 100000,
  gstr2bValue: 92000,
  difference: 8000,
  assignedTo: USERS[1],
  createdAt: "2026-08-18T09:43:00",
  resolvedAt: null,
  whyExplanation: [
    "Vendor GSTIN matches.",
    "Invoice number matches.",
    "Invoice date matches.",
    "Taxable amount differs by ₹8,000.",
  ],
  aiSuggestedSteps: [
    "Check the original invoice.",
    "Check whether the vendor amended the invoice.",
    "Check for a related credit/debit note.",
    "Obtain vendor clarification if required.",
  ],
  evidence: [
    { id: "ev1", exceptionId: "EX-1042", label: "Purchase invoice", status: "RECEIVED", sourceDocumentId: "d4" },
    { id: "ev2", exceptionId: "EX-1042", label: "GSTR-2B entry", status: "RECEIVED" },
    { id: "ev3", exceptionId: "EX-1042", label: "Vendor confirmation", status: "REQUESTED" },
  ],
};

const abcExceptions: ExceptionRecord[] = [
  canonicalException,
  {
    id: "EX-1043",
    clientId: "abc-manufacturing",
    clientName: "ABC Manufacturing Pvt Ltd",
    vendorName: "Bharat Packaging Co",
    vendorGstin: "27AABPC3344M1Z0",
    invoiceNumber: "INV-2201",
    invoiceDate: "2026-08-07",
    type: "MISSING_IN_2B",
    severity: "MEDIUM",
    status: "OPEN",
    purchaseValue: 58500,
    gstr2bValue: null,
    difference: null,
    assignedTo: null,
    createdAt: "2026-08-19T10:05:00",
    resolvedAt: null,
    whyExplanation: [
      "Invoice appears in the purchase register.",
      "No matching entry found in GSTR-2B for this period.",
    ],
    aiSuggestedSteps: [
      "Confirm the vendor has filed their GSTR-1 for this period.",
      "Check whether the invoice will appear in a later GSTR-2B refresh.",
      "Contact the vendor if the filing appears delayed.",
    ],
    evidence: [
      { id: "ev4", exceptionId: "EX-1043", label: "Purchase invoice", status: "RECEIVED" },
      { id: "ev5", exceptionId: "EX-1043", label: "GSTR-2B entry", status: "PENDING" },
    ],
  },
  {
    id: "EX-1044",
    clientId: "abc-manufacturing",
    clientName: "ABC Manufacturing Pvt Ltd",
    vendorName: "Kiran Electricals",
    vendorGstin: "07AAKEL2233Q1Z1",
    invoiceNumber: "INV-341",
    invoiceDate: "2026-08-09",
    type: "GSTIN_MISMATCH",
    severity: "HIGH",
    status: "ASSIGNED",
    purchaseValue: 34000,
    gstr2bValue: 34000,
    difference: 0,
    assignedTo: USERS[2],
    createdAt: "2026-08-19T11:30:00",
    resolvedAt: null,
    whyExplanation: [
      "Invoice number and amount match.",
      "Vendor GSTIN on the purchase register does not match the GSTIN on the GSTR-2B entry.",
    ],
    aiSuggestedSteps: [
      "Verify the vendor's registered GSTIN against their invoice.",
      "Check whether the vendor operates from multiple registered branches.",
    ],
    evidence: [
      { id: "ev6", exceptionId: "EX-1044", label: "Purchase invoice", status: "RECEIVED" },
      { id: "ev7", exceptionId: "EX-1044", label: "GSTR-2B entry", status: "RECEIVED" },
    ],
  },
  {
    id: "EX-1045",
    clientId: "abc-manufacturing",
    clientName: "ABC Manufacturing Pvt Ltd",
    vendorName: "Nandi Chemicals",
    vendorGstin: "27AANCH4455R1Z8",
    invoiceNumber: "INV-8821",
    invoiceDate: "2026-08-10",
    type: "DUPLICATE",
    severity: "LOW",
    status: "UNDER_REVIEW",
    purchaseValue: 189000,
    gstr2bValue: 189000,
    difference: 0,
    assignedTo: USERS[1],
    createdAt: "2026-08-20T09:00:00",
    resolvedAt: null,
    whyExplanation: [
      "This invoice number and value already appear once elsewhere in the purchase register for this period.",
    ],
    aiSuggestedSteps: [
      "Confirm whether this is a genuine duplicate entry or two separate deliveries under one invoice number.",
      "Remove the duplicate from the purchase register if confirmed.",
    ],
    evidence: [
      { id: "ev8", exceptionId: "EX-1045", label: "Purchase invoice", status: "RECEIVED" },
    ],
  },
  {
    id: "EX-1046",
    clientId: "abc-manufacturing",
    clientName: "ABC Manufacturing Pvt Ltd",
    vendorName: "Precision Tools India",
    vendorGstin: "27AAPTI1010T1Z4",
    invoiceNumber: "INV-6650",
    invoiceDate: "2026-08-11",
    type: "AMOUNT_MISMATCH",
    severity: "MEDIUM",
    status: "RESOLVED",
    purchaseValue: 143500,
    gstr2bValue: 139500,
    difference: 4000,
    assignedTo: USERS[2],
    createdAt: "2026-08-20T14:15:00",
    resolvedAt: "2026-09-02T16:30:00",
    whyExplanation: [
      "Vendor GSTIN, invoice number and date match.",
      "Taxable amount differs by ₹4,000.",
    ],
    aiSuggestedSteps: [
      "Check the original invoice.",
      "Check for a related credit note.",
    ],
    evidence: [
      { id: "ev9", exceptionId: "EX-1046", label: "Purchase invoice", status: "RECEIVED" },
      { id: "ev10", exceptionId: "EX-1046", label: "GSTR-2B entry", status: "RECEIVED" },
      { id: "ev11", exceptionId: "EX-1046", label: "Vendor confirmation", status: "RECEIVED" },
    ],
  },
  {
    id: "EX-1047",
    clientId: "abc-manufacturing",
    clientName: "ABC Manufacturing Pvt Ltd",
    vendorName: "Deepak Fasteners",
    vendorGstin: "27AADFA4040W1Z8",
    invoiceNumber: "INV-7781",
    invoiceDate: "2026-08-13",
    type: "AMOUNT_MISMATCH",
    severity: "LOW",
    status: "UNDER_REVIEW",
    purchaseValue: 18900,
    gstr2bValue: 18200,
    difference: 700,
    assignedTo: USERS[2],
    createdAt: "2026-08-21T10:40:00",
    resolvedAt: null,
    whyExplanation: [
      "Vendor GSTIN, invoice number and date match.",
      "Taxable amount differs by ₹700.",
    ],
    aiSuggestedSteps: [
      "Check for rounding differences on small-value invoices.",
      "Confirm the final amount with the vendor if the difference persists.",
    ],
    evidence: [
      { id: "ev12", exceptionId: "EX-1047", label: "Purchase invoice", status: "RECEIVED" },
      { id: "ev13", exceptionId: "EX-1047", label: "GSTR-2B entry", status: "RECEIVED" },
    ],
  },
];

const sharmaExceptions: ExceptionRecord[] = [
  {
    id: "EX-2011",
    clientId: "sharma-traders",
    clientName: "Sharma Traders",
    vendorName: "Radha Textiles",
    vendorGstin: "07AARTX5566X1Z6",
    invoiceNumber: "INV-201",
    invoiceDate: "2026-08-03",
    type: "MISSING_IN_2B",
    severity: "HIGH",
    status: "AWAITING_CLIENT",
    purchaseValue: 42000,
    gstr2bValue: null,
    difference: null,
    assignedTo: USERS[1],
    createdAt: "2026-08-16T09:10:00",
    resolvedAt: null,
    whyExplanation: [
      "Invoice appears in the purchase register.",
      "No matching entry found in GSTR-2B for this period.",
    ],
    aiSuggestedSteps: [
      "Confirm the vendor has filed their GSTR-1 for this period.",
      "Contact the vendor if the filing appears delayed.",
    ],
    evidence: [
      { id: "ev14", exceptionId: "EX-2011", label: "Purchase invoice", status: "RECEIVED" },
      { id: "ev15", exceptionId: "EX-2011", label: "GSTR-2B entry", status: "PENDING" },
    ],
  },
  {
    id: "EX-2012",
    clientId: "sharma-traders",
    clientName: "Sharma Traders",
    vendorName: "Balaji Traders",
    vendorGstin: "07AABJT7788Z1Z2",
    invoiceNumber: "INV-203",
    invoiceDate: "2026-08-05",
    type: "AMOUNT_MISMATCH",
    severity: "MEDIUM",
    status: "OPEN",
    purchaseValue: 99000,
    gstr2bValue: 94500,
    difference: 4500,
    assignedTo: null,
    createdAt: "2026-08-17T13:20:00",
    resolvedAt: null,
    whyExplanation: [
      "Vendor GSTIN, invoice number and date match.",
      "Taxable amount differs by ₹4,500.",
    ],
    aiSuggestedSteps: [
      "Check the original invoice.",
      "Check for a related credit/debit note.",
    ],
    evidence: [
      { id: "ev16", exceptionId: "EX-2012", label: "Purchase invoice", status: "RECEIVED" },
      { id: "ev17", exceptionId: "EX-2012", label: "GSTR-2B entry", status: "RECEIVED" },
    ],
  },
];

const xyzExceptions: ExceptionRecord[] = [
  {
    id: "EX-3005",
    clientId: "xyz-pvt-ltd",
    clientName: "XYZ Pvt Ltd",
    vendorName: "Meridian Packaging",
    vendorGstin: "29AAMPK8899A1Z1",
    invoiceNumber: "INV-77",
    invoiceDate: "2026-08-02",
    type: "GSTIN_MISMATCH",
    severity: "MEDIUM",
    status: "ASSIGNED",
    purchaseValue: 74500,
    gstr2bValue: 74500,
    difference: 0,
    assignedTo: USERS[2],
    createdAt: "2026-08-15T09:50:00",
    resolvedAt: null,
    whyExplanation: [
      "Invoice number and amount match.",
      "Vendor GSTIN on the purchase register does not match the GSTIN on the GSTR-2B entry.",
    ],
    aiSuggestedSteps: [
      "Verify the vendor's registered GSTIN against their invoice.",
    ],
    evidence: [
      { id: "ev18", exceptionId: "EX-3005", label: "Purchase invoice", status: "RECEIVED" },
      { id: "ev19", exceptionId: "EX-3005", label: "GSTR-2B entry", status: "RECEIVED" },
    ],
  },
];

function simpleException(args: {
  id: string;
  clientId: string;
  clientName: string;
  vendorName: string;
  vendorGstin: string;
  invoiceNumber: string;
  invoiceDate: string;
  type: ReconResultType;
  severity: "HIGH" | "MEDIUM" | "LOW";
  status: ExceptionStatus;
  purchaseValue: number | null;
  gstr2bValue: number | null;
  difference: number | null;
  assignedTo: User | null;
  createdAt: string;
}): ExceptionRecord {
  const why: Record<ReconResultType, string[]> = {
    MATCHED: ["Vendor GSTIN, invoice number, date and amount all match."],
    PARTIAL_MATCH: ["Most fields match; one or more fields need confirmation."],
    AMOUNT_MISMATCH: [
      "Vendor GSTIN, invoice number and date match.",
      `Taxable amount differs by ₹${(args.difference ?? 0).toLocaleString("en-IN")}.`,
    ],
    MISSING_IN_2B: [
      "Invoice appears in the purchase register.",
      "No matching entry found in GSTR-2B for this period.",
    ],
    GSTIN_MISMATCH: [
      "Invoice number and amount match.",
      "Vendor GSTIN on the purchase register does not match the GSTIN on the GSTR-2B entry.",
    ],
    DUPLICATE: ["This invoice number and value already appear once elsewhere in the purchase register."],
  };
  const steps: Record<ReconResultType, string[]> = {
    MATCHED: [],
    PARTIAL_MATCH: ["Confirm the differing field with the vendor."],
    AMOUNT_MISMATCH: ["Check the original invoice.", "Check for a related credit/debit note."],
    MISSING_IN_2B: ["Confirm the vendor has filed their GSTR-1 for this period."],
    GSTIN_MISMATCH: ["Verify the vendor's registered GSTIN against their invoice."],
    DUPLICATE: ["Confirm whether this is a genuine duplicate or two separate deliveries."],
  };

  return {
    ...args,
    resolvedAt: null,
    whyExplanation: why[args.type],
    aiSuggestedSteps: steps[args.type],
    evidence: [
      { id: `${args.id}-ev1`, exceptionId: args.id, label: "Purchase invoice", status: "RECEIVED" },
      { id: `${args.id}-ev2`, exceptionId: args.id, label: "GSTR-2B entry", status: args.type === "MISSING_IN_2B" ? "PENDING" : "RECEIVED" },
    ],
  };
}

const kumarExceptions: ExceptionRecord[] = [
  simpleException({ id: "EX-4001", clientId: "kumar-engineering", clientName: "Kumar Engineering", vendorName: "Reliant Alloys", vendorGstin: "33AARAL1234N1Z9", invoiceNumber: "INV-512", invoiceDate: "2026-08-04", type: "AMOUNT_MISMATCH", severity: "MEDIUM", status: "ASSIGNED", purchaseValue: 88000, gstr2bValue: 81000, difference: 7000, assignedTo: USERS[2], createdAt: "2026-08-14T10:00:00" }),
];

const apexExceptions: ExceptionRecord[] = [
  simpleException({ id: "EX-5001", clientId: "apex-infotech", clientName: "Apex Infotech Pvt Ltd", vendorName: "Cloudverse Systems", vendorGstin: "24AACVS9911R1Z2", invoiceNumber: "INV-09", invoiceDate: "2026-08-03", type: "MISSING_IN_2B", severity: "LOW", status: "OPEN", purchaseValue: 128000, gstr2bValue: null, difference: null, assignedTo: null, createdAt: "2026-08-13T09:30:00" }),
];

const northstarExceptions: ExceptionRecord[] = [
  simpleException({ id: "EX-6001", clientId: "northstar-components", clientName: "Northstar Components", vendorName: "Lucknow Wire Industries", vendorGstin: "09AALWI2288S1Z6", invoiceNumber: "INV-301", invoiceDate: "2026-08-06", type: "AMOUNT_MISMATCH", severity: "MEDIUM", status: "UNDER_REVIEW", purchaseValue: 63500, gstr2bValue: 59500, difference: 4000, assignedTo: USERS[1], createdAt: "2026-08-12T11:15:00" }),
  simpleException({ id: "EX-6002", clientId: "northstar-components", clientName: "Northstar Components", vendorName: "Ganges Casting Works", vendorGstin: "09AAGCW3399T1Z4", invoiceNumber: "INV-302", invoiceDate: "2026-08-07", type: "GSTIN_MISMATCH", severity: "HIGH", status: "ASSIGNED", purchaseValue: 31000, gstr2bValue: 31000, difference: 0, assignedTo: USERS[2], createdAt: "2026-08-12T11:40:00" }),
];

const vardhanExceptions: ExceptionRecord[] = [
  simpleException({ id: "EX-7001", clientId: "vardhan-electricals", clientName: "Vardhan Electricals", vendorName: "Howrah Cable Corp", vendorGstin: "19AAHCC4477U1Z1", invoiceNumber: "INV-44", invoiceDate: "2026-08-05", type: "MISSING_IN_2B", severity: "MEDIUM", status: "AWAITING_CLIENT", purchaseValue: 22500, gstr2bValue: null, difference: null, assignedTo: USERS[1], createdAt: "2026-08-11T14:00:00" }),
];

const metroExceptions: ExceptionRecord[] = [
  simpleException({ id: "EX-8001", clientId: "metro-industrial", clientName: "Metro Industrial Supplies", vendorName: "Pune Bearings Ltd", vendorGstin: "27AAPBL5588V1Z8", invoiceNumber: "INV-120", invoiceDate: "2026-08-04", type: "AMOUNT_MISMATCH", severity: "MEDIUM", status: "OPEN", purchaseValue: 54000, gstr2bValue: 49500, difference: 4500, assignedTo: null, createdAt: "2026-08-10T09:00:00" }),
];

const sundaramExceptions: ExceptionRecord[] = [
  simpleException({ id: "EX-9001", clientId: "sundaram-textiles", clientName: "Sundaram Textiles Pvt Ltd", vendorName: "Erode Cotton Mills", vendorGstin: "33AAECM7700X1Z3", invoiceNumber: "INV-67", invoiceDate: "2026-08-02", type: "AMOUNT_MISMATCH", severity: "LOW", status: "RESOLVED", purchaseValue: 39500, gstr2bValue: 37000, difference: 2500, assignedTo: USERS[2], createdAt: "2026-08-09T10:30:00" }),
];

const coastlineExceptions: ExceptionRecord[] = [
  simpleException({ id: "EX-1101", clientId: "coastline-logistics", clientName: "Coastline Logistics Pvt Ltd", vendorName: "Kandla Port Services", vendorGstin: "24AAKPS8811Y1Z0", invoiceNumber: "INV-231", invoiceDate: "2026-08-05", type: "MISSING_IN_2B", severity: "HIGH", status: "AWAITING_CLIENT", purchaseValue: 96000, gstr2bValue: null, difference: null, assignedTo: USERS[1], createdAt: "2026-08-08T13:20:00" }),
];

export const EXCEPTIONS_BY_CLIENT: Record<string, ExceptionRecord[]> = {
  "abc-manufacturing": abcExceptions,
  "sharma-traders": sharmaExceptions,
  "xyz-pvt-ltd": xyzExceptions,
  "kumar-engineering": kumarExceptions,
  "apex-infotech": apexExceptions,
  "northstar-components": northstarExceptions,
  "vardhan-electricals": vardhanExceptions,
  "metro-industrial": metroExceptions,
  "sundaram-textiles": sundaramExceptions,
  "coastline-logistics": coastlineExceptions,
};

export function getExceptions(clientId: string): ExceptionRecord[] {
  return EXCEPTIONS_BY_CLIENT[clientId] ?? [];
}

export function getExceptionByInvoice(
  clientId: string,
  invoiceNumber: string
): ExceptionRecord | undefined {
  return getExceptions(clientId).find((e) => e.invoiceNumber === invoiceNumber);
}

export function getAllExceptions(): ExceptionRecord[] {
  return Object.values(EXCEPTIONS_BY_CLIENT).flat();
}

export function getException(id: string): ExceptionRecord | undefined {
  return getAllExceptions().find((e) => e.id === id);
}

// ---------------------------------------------------------------------------
// Activity log
// ---------------------------------------------------------------------------

export const ACTIVITY_BY_CLIENT: Record<string, ActivityEvent[]> = {
  "abc-manufacturing": [
    { id: "a1", clientId: "abc-manufacturing", exceptionId: "EX-1042", time: "09:42", date: "2026-08-18", description: "Purchase register imported" },
    { id: "a2", clientId: "abc-manufacturing", exceptionId: "EX-1042", time: "09:43", date: "2026-08-18", description: "GSTR-2B imported" },
    { id: "a3", clientId: "abc-manufacturing", exceptionId: "EX-1042", time: "09:43", date: "2026-08-18", description: "Rule detected ₹8,000 mismatch on INV-10482" },
    { id: "a4", clientId: "abc-manufacturing", exceptionId: "EX-1042", time: "09:45", date: "2026-08-18", description: "Exception EX-1042 assigned to Rahul Sharma" },
    { id: "a5", clientId: "abc-manufacturing", exceptionId: "EX-1042", time: "10:21", date: "2026-08-18", description: "Invoice attached as evidence" },
    { id: "a6", clientId: "abc-manufacturing", exceptionId: "EX-1042", time: "10:26", date: "2026-08-18", description: "Client clarification requested for INV-10482" },
    { id: "a7", clientId: "abc-manufacturing", exceptionId: "EX-1046", time: "16:30", date: "2026-09-02", description: "Exception EX-1046 marked resolved" },
    { id: "a8", clientId: "abc-manufacturing", exceptionId: "EX-1046", time: "16:32", date: "2026-09-02", description: "Sent for partner review" },
  ],
  "sharma-traders": [
    { id: "a9", clientId: "sharma-traders", exceptionId: "EX-2011", time: "09:10", date: "2026-08-16", description: "Exception EX-2011 assigned to Rahul Sharma" },
    { id: "a10", clientId: "sharma-traders", exceptionId: "EX-2011", time: "09:15", date: "2026-08-16", description: "Client clarification requested for INV-201" },
  ],
  "xyz-pvt-ltd": [
    { id: "a11", clientId: "xyz-pvt-ltd", exceptionId: "EX-3005", time: "09:50", date: "2026-08-15", description: "Exception EX-3005 assigned to Priya Nair" },
  ],
  "kumar-engineering": [
    { id: "a12", clientId: "kumar-engineering", exceptionId: "EX-4001", time: "10:00", date: "2026-08-14", description: "Exception EX-4001 assigned to Priya Nair" },
  ],
  "apex-infotech": [
    { id: "a13", clientId: "apex-infotech", exceptionId: "EX-5001", time: "09:30", date: "2026-08-13", description: "Rule detected missing GSTR-2B entry for INV-09" },
  ],
  "northstar-components": [
    { id: "a14", clientId: "northstar-components", exceptionId: "EX-6001", time: "11:15", date: "2026-08-12", description: "Exception EX-6001 sent for partner review" },
    { id: "a15", clientId: "northstar-components", exceptionId: "EX-6002", time: "11:40", date: "2026-08-12", description: "Exception EX-6002 assigned to Priya Nair" },
  ],
  "vardhan-electricals": [
    { id: "a16", clientId: "vardhan-electricals", exceptionId: "EX-7001", time: "14:05", date: "2026-08-11", description: "Client clarification requested for INV-44" },
  ],
  "metro-industrial": [
    { id: "a17", clientId: "metro-industrial", exceptionId: "EX-8001", time: "09:00", date: "2026-08-10", description: "Rule detected ₹4,500 mismatch on INV-120" },
  ],
  "sundaram-textiles": [
    { id: "a18", clientId: "sundaram-textiles", exceptionId: "EX-9001", time: "10:45", date: "2026-08-20", description: "Exception EX-9001 marked resolved" },
  ],
  "coastline-logistics": [
    { id: "a19", clientId: "coastline-logistics", exceptionId: "EX-1101", time: "13:25", date: "2026-08-08", description: "Client clarification requested for INV-231" },
  ],
};

export function getActivity(clientId: string): ActivityEvent[] {
  return ACTIVITY_BY_CLIENT[clientId] ?? [];
}

// ---------------------------------------------------------------------------
// Tasks (derived view over exceptions with an assignee)
// ---------------------------------------------------------------------------

export function getTasks(clientId: string): TaskRecord[] {
  return getExceptions(clientId)
    .filter((e) => e.assignedTo)
    .map((e) => ({
      id: `task-${e.id}`,
      clientId,
      exceptionId: e.id,
      title: `${e.type.replace(/_/g, " ").toLowerCase()} — ${e.invoiceNumber}`,
      assignedTo: e.assignedTo!,
      status: e.status,
      dueDate: e.createdAt,
    }));
}

// ---------------------------------------------------------------------------
// Dashboard-level aggregates
// ---------------------------------------------------------------------------

export function getDashboardStats() {
  const allExceptions = getAllExceptions();
  return {
    totalClients: CLIENTS.length,
    openExceptions: allExceptions.filter((e) =>
      ["OPEN", "ASSIGNED", "UNDER_REVIEW"].includes(e.status)
    ).length,
    awaitingClient: allExceptions.filter((e) => e.status === "AWAITING_CLIENT").length,
    partnerReviews: allExceptions.filter((e) => e.status === "UNDER_REVIEW").length,
  };
}

export function getPriorityExceptionGroups() {
  return [
    {
      client: getClient("abc-manufacturing")!,
      headline: "3 high-value mismatches",
      value: 842000,
    },
    {
      client: getClient("sharma-traders")!,
      headline: "7 missing invoices",
      value: 213400,
    },
    {
      client: getClient("xyz-pvt-ltd")!,
      headline: "2 GSTIN mismatches",
      value: 74500,
    },
  ];
}
