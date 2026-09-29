"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DocumentType } from "@/lib/supabase/database.types";

const DOCUMENT_TYPES: DocumentType[] = [
  "GST Invoice",
  "Bank Statement",
  "Purchase Register",
  "GSTR-2B",
];

type UploadState = "idle" | "uploading" | "done" | "error";

export function UploadDropzone({ clientDbId }: { clientDbId: string }) {
  const router = useRouter();
  const [state, setState] = useState<UploadState>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("GST Invoice");
  const [error, setError] = useState<string | null>(null);

  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setFileName(file.name);
    setState("uploading");
    setError(null);

    const form = new FormData();
    form.append("file", file);
    form.append("clientId", clientDbId);
    form.append("documentType", documentType);

    try {
      const res = await fetch("/api/documents/upload", { method: "POST", body: form });
      const body = await res.json();
      if (!res.ok || body.processingStatus === "Failed") {
        setState("error");
        setError(body.error ?? "Extraction failed.");
      } else {
        setState("done");
        router.refresh();
      }
    } catch (err) {
      setState("error");
      setError((err as Error).message);
    }
  }

  return (
    <div className="mb-4 flex items-center justify-between rounded border border-dashed border-border px-5 py-4">
      <div>
        <p className="text-sm font-medium text-ink">Upload documents</p>
        {state === "idle" && (
          <p className="text-sm text-ink-soft">
            Choose a document type, then pick a file — invoices, bank statements, purchase register, GSTR-2B export.
          </p>
        )}
        {state === "uploading" && <p className="text-sm text-status-review">Uploading and processing {fileName}…</p>}
        {state === "done" && <p className="text-sm text-status-matched">{fileName} processed successfully.</p>}
        {state === "error" && (
          <p className="text-sm text-status-mismatch">
            {fileName} was uploaded but could not be processed{error ? `: ${error}` : "."}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as DocumentType)}
          disabled={state === "uploading"}
          className="rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <label className="btn-primary cursor-pointer">
          {state === "uploading" ? "Working…" : "Upload"}
          <input type="file" className="hidden" disabled={state === "uploading"} onChange={handlePick} />
        </label>
      </div>
    </div>
  );
}
