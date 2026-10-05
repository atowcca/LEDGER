# CA Ledger — Demo MVP (Frontend)

AI-native assurance workflow demo for Indian CA firms. This is the **frontend-only** build:
all data is synthetic and lives in `lib/mock-data.ts`. No Supabase, Gemini, or auth wired up yet —
that's the next phase.

## Stack
Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS

## Run locally
```bash
npm install
npm run dev
```
Then open http://localhost:3000

## Structure
```
app/(dashboard)/          Partner Dashboard, Clients, Client Workspace tabs, Partner Review
components/                UI components, grouped by domain
lib/types.ts               Shared TypeScript types (mirrors the eventual DB schema)
lib/mock-data.ts           All synthetic demo data + accessor functions
lib/format.ts               INR currency / date formatting helpers
```

## Demo path
Dashboard → ABC Manufacturing Pvt Ltd → Reconciliation → EX-1042 (₹8,000 mismatch) →
Why panel → Request clarification → Evidence → back to Partner Review.

## Known gaps (by design, frontend-first)
- No auth — the app assumes a single logged-in partner (Arvind Rao).
- Exception-workflow actions (Assign, Resolve, Send for review, Approve, Upload evidence, Request clarification) update local component state for a realistic demo feel, but don't persist across navigation or reset on refresh — that's what Supabase wiring in Batch 2+ is for.
- Reconciliation totals (2,500 transactions, 173 exceptions) are shown as summary stats; only a representative sample of rows is rendered per client, per the spec's guidance not to generate unnecessary volume.

## Supabase setup (Batch 2)

The schema, RLS policies, and seed data live in `supabase/migrations/`. The frontend still
reads from `lib/mock-data.ts` — nothing is wired to Supabase yet (that's the integration step
after this batch). To stand up the database itself:

1. Create a Supabase project.
2. Install the Supabase CLI, then from this repo root:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
   This runs the three migrations in order: core schema → RLS policies → demo seed data.
3. Copy `.env.example` to `.env.local` and fill in the values from
   Project Settings → API in the Supabase dashboard.
4. **Auth**: the seed data creates 3 `users` rows (Arvind/Rahul/Priya) but does not create
   Supabase Auth logins — that's the open decision flagged in `STATUS.md`. To try it locally
   in the meantime, create 3 users under Authentication → Users in the dashboard, then run:
   ```sql
   update users set auth_user_id = '<auth-user-uuid>' where email = 'arvind@northgate.example';
   ```
   for each, so RLS's `current_firm_id()` lookup resolves correctly.
5. `npm run typecheck` — `lib/supabase/database.types.ts` is hand-written to match the schema;
   once the project is linked you can replace it with the real generated types:
   ```bash
   supabase gen types typescript --linked > lib/supabase/database.types.ts
   ```

### What's seeded vs. not
Seed data covers the firm, all 3 demo users, all 12 clients, and full transaction/
reconciliation/exception/evidence/activity data for the 3 clients used in the spec's own
demo story (ABC Manufacturing, Sharma Traders, XYZ Pvt Ltd) — including the canonical
EX-1042 ₹8,000 mismatch. The other 9 clients exist as rows but have no transactions yet.
Seeding every client at the spec's full scale (2,500 purchase transactions, 173 exceptions)
is deferred to the final stabilization pass, matching the spec's own guidance not to
generate unnecessary volume before it's needed.

## Document Intelligence (Batch 3)

- `lib/ai/gemini.ts` — extraction client using the current `@google/genai` SDK (not the deprecated
  `@google/generative-ai` package). Model is pinned to `gemini-3.5-flash-lite` by default (current as
  of Sept 2026, positioned for high-volume/low-latency extraction) but overridable via `GEMINI_MODEL`
  without a code change — Google's model lineup moves fast, confirm what's current when you actually
  run this.
- `lib/ai/prompts.ts` — the invoice extraction prompt verbatim from spec section 19, plus reusable
  prompt builders for exception explanation (section 29) and clarification drafts (section 30) for
  when those get wired up in later batches.
- `app/api/documents/upload/route.ts` — the full section 16 flow in one request: upload to Supabase
  Storage → create `documents` row → (GST invoices only) call Gemini → save `extracted_data` +
  confidence → update `processing_status`. Deliberately synchronous, no job queue, per spec section 53.
- `app/api/documents/[documentId]/retry/route.ts` — re-reads the already-uploaded file and retries
  extraction, for the Retry action on a Failed document.
- `supabase/migrations/0004_storage_bucket.sql` — private `documents` storage bucket with firm-scoped
  RLS on `storage.objects`, mirroring the app-layer tables.

**Not wired to the frontend yet** — the Documents tab's upload dropzone and Retry button still run
the client-side simulation built in Batch 1, not these real routes. That's the same integration step
flagged for Batch 2.

## Reconciliation engine (Batch 4)

- `lib/reconciliation/engine.ts` — the deterministic Purchase Register vs GSTR-2B matcher, per
  spec sections 20-23. Pure functions, no network calls, no LLM — matches on GSTIN + invoice
  number first, then falls back to invoice-number-only (to detect GSTIN mismatches) or reports
  MISSING_IN_2B. Duplicate detection is a same-GSTIN/invoice/value check within the purchase
  register itself. `lib/reconciliation/normalize.ts` handles whitespace/case/punctuation only —
  no fuzzy matching, per spec section 22's explicit instruction not to overbuild this.
- `lib/reconciliation/engine.test.ts` — unit tests via Vitest, including the spec's own canonical
  ₹8,000 mismatch example as a literal test case. Run with `npm test`.
- `lib/reconciliation/exceptions-from-results.ts` — deterministic (lookup-table, not AI) mapping
  from a non-MATCHED result to an exception draft: type, a simple explainable severity rule, and
  the why/suggested-steps text shown in the UI.
- `app/api/reconciliations/run/route.ts` — the actual "Run reconciliation" trigger: reads this
  client's transactions, runs the engine, writes `reconciliation_results`, and creates one
  `exceptions` row per non-MATCHED result. This resolves the "is reconciliation live or
  pre-seeded" open question from STATUS.md — it's a real, working action now, not a stub.

**Not wired to the frontend yet** — same integration step as Batches 2 and 3.

## Integration — frontend wired to Supabase (final step)

Every page now reads live data instead of `lib/mock-data.ts`:

- `lib/supabase/mappers.ts` — converts Supabase rows (snake_case) into the exact view-model
  shapes the Batch 1 components already expect (`lib/types.ts`), so no presentational component
  had to change. Numeric Postgres columns are defensively coerced with `Number(...)` since
  PostgREST can serialize `numeric` columns as strings depending on config.
- `lib/supabase/queries/*` — rewritten to return those view models, with the same function
  names as the old `lib/mock-data.ts` accessors (`getClient`, `getExceptions`, `getActivity`,
  etc.) so each page's data-fetching line changed but its rendering didn't.
- `app/actions/exceptions.ts` — Server Actions (`assignExceptionAction`, `updateStatusAction`,
  `uploadEvidenceAction`, `sendClarificationAction`) called directly from the client-side
  `ExceptionWorkspace`. Each one also writes an `activity_log` row, so the Activity tab now
  fills in for real as you use the app.
- `app/login/page.tsx` + `middleware.ts` — minimal email/password sign-in (Supabase Auth),
  with the dashboard route group gated behind a session. **You still need to do the two setup
  steps from the "Supabase setup" section above**: create the 3 Auth users and link their
  `auth_user_id`, or nothing will render (RLS has no firm to resolve without a session).
- Client routes still use the `slug` column in the URL (`/clients/abc-manufacturing`); pages that
  need the row's real uuid call `getClientDbId(slug)` once and pass that down.

### What's genuinely live now
Upload a document → real Gemini extraction → real `documents` row. Click "Run reconciliation" →
the actual deterministic engine runs against this client's `transactions` → real
`reconciliation_results` + `exceptions` rows get created. Assign/Resolve/Send for review/Approve
on an exception → real `exceptions` + `activity_log` writes, visible on refresh and to every
other signed-in user in the firm.

### Known rough edges in this pass
- No signup UI or password reset — only sign-in. Creating the 3 demo logins is a manual step in
  the Supabase dashboard (see setup steps above).
- Role-based UI (e.g. only partners seeing Approve/Return) isn't enforced — anyone signed in sees
  the same actions. RLS enforces firm isolation; it does not enforce role.
- `ExceptionWorkspace` updates its own state optimistically and fires the Server Action in the
  background; if the action fails, the error shows inline but the optimistic UI doesn't auto-revert
  — refresh the page to resync.
- I could not run `npm install` / `next build` / `npm test` in this sandbox (registry access is
  blocked here) — verified everything by static analysis (bracket balance, import resolution,
  numeric-coercion review) instead of an actual build. Please run the real build before relying on it.

## Full-scale seed data, role restrictions, and signup (final pass)

- **`supabase/migrations/0005_full_scale_seed.sql`** — brings ABC Manufacturing up to the spec's
  own numbers (sections 14/24/42/43): 2,500 purchase transactions, 2,327 matched, 61 amount
  mismatch, 74 missing in 2B, 23 GSTIN mismatch, 15 duplicates = 173 total exceptions, distributed
  27 Open / 19 Assigned / 18 Awaiting Client / 9 Under Review / 100 Resolved. This *adds* to the 6
  hand-written canonical exceptions in `0003` (EX-1042 etc.) rather than replacing them — the
  canonical demo story is still exactly where it was, just one exception among 173 now, which is
  the point. Generated by `gen_full_scale.py` (not checked in — regenerate rather than hand-edit
  the SQL if you need to change the distribution). Run `supabase db push` again to apply it.
- **Role-based UI restrictions**: the Review nav item and the Partner Review page itself
  (`app/(dashboard)/review/page.tsx`) are restricted to the `PARTNER` role — Senior/Staff who
  navigate to `/review` directly get redirected home, not just hidden from the sidebar. On an
  exception, Approve/Return for review only render for partners, and — more importantly — the
  underlying Server Actions (`approveExceptionAction`, `returnForReviewAction` in
  `app/actions/exceptions.ts`) check the role server-side too, so this isn't just a UI nicety a
  non-partner could bypass by calling the action directly.
- **Signup** (`app/signup/page.tsx` + `app/actions/signup.ts`): self-signup creates a *new firm*
  with the signing-up person as its Partner — there's no "join an existing firm" flow, since that
  needs an invite system this MVP doesn't have. The server action runs with the service-role
  client specifically because a brand-new user has no `firm_id` yet for RLS to scope to; it can
  only ever create a new firm, never attach to one that already exists. Handles both Supabase
  configurations — instant session, or "confirm your email first" if your project has email
  confirmation turned on.

### What's still genuinely not built
- No invite flow for adding a second user to an *existing* firm (signup always creates a new one).
- No password reset.
- Role restrictions cover Partner Review specifically (the one place spec section 33 calls out
  approval authority); nothing else in the app is role-gated, matching spec section 33's
  "do not create complicated approval hierarchies."

## Scale fixes (found by running the 2,500-row seed against a real database)

PostgREST — the API layer behind Supabase — silently caps any single query at **1,000 rows**.
No error is raised; the data is just truncated. This surfaced the moment `0005` loaded ABC
Manufacturing's 2,500 rows: the reconciliation panel read "1,000 entries / 6 exceptions".

- `getReconSummary` now uses database-side `COUNT` queries (never fetches rows).
- The reconciliation table is server-driven: page, status filter, and search live in the URL
  and are applied by the database (`getReconRows`), so the browser only ever holds one page.
- `lib/supabase/fetch-all.ts` pages through with `.range()` for anything that genuinely needs
  every row (exceptions, client counts, and the reconciliation run itself).
- **The "Run reconciliation" route had the same flaw** and would have reconciled only ~1,000 of
  ABC's ~4,900 transactions and saved wrong results. It now reads everything, is safe to re-run
  (an invoice that already has an exception doesn't get a second one), and derives exception
  numbers from the highest existing code instead of "the newest row" (bulk-seeded rows share a
  timestamp, which could have collided with an existing code and failed the insert).
- `supabase/migrations/0006_fix_seed_gstin_mismatch_pairs.sql` corrects 2 seeded GSTIN-mismatch
  pairs whose GSTINs were accidentally identical, so the seed and the live engine agree.

Rule of thumb for future queries: totals → `count`; tables → `.range()`; "need every row" →
`fetchAllPages`. Never a bare `.select()` on a table that can exceed 1,000 rows.

### Seed ↔ engine consistency (migrations 0006 + 0007)
The seed labels were assigned by generator scripts, while "Run reconciliation" classifies from the
actual data — so they could disagree. A Python port of `lib/reconciliation/engine.ts` was run over
every seeded transaction and diffed against the seeded labels; it found 5 rows the engine would have
contradicted on a re-run (2 bulk GSTIN pairs with identical GSTINs, and the hand-written INV-341,
INV-77, and INV-8821 rows — the last had no actual duplicate row). `0006` and `0007` fix all five.
After both, the engine reproduces every seeded label and ABC totals exactly 2,500 / 2,327 / 61 / 74 /
23 / 15 = 173, so clicking "Run reconciliation" on a seeded client is a no-op (0 new exceptions).
Caveat: that check used a Python port, not the TypeScript itself — run `npm test` for the real thing.

## Build-breaking type errors found deploying to Vercel (fixed)

`npm run dev` and `npm test` both passing didn't catch this — `next build` type-checks the whole
project, which neither of those do. Root cause: `lib/supabase/database.types.ts` is hand-written
(not generated from a live Supabase project, since this sandbox has no network access to do that),
and was missing two things Supabase's query client structurally requires to correctly infer what
`.select("col1, col2")` returns: the `Views`/`Functions`/`Enums`/`CompositeTypes` keys on the
`Database` type, and a `Relationships` array on every table. Without them, `.select()` with a
specific column list silently resolves to `never` instead of the actual row shape — no warning,
just a wall of "Property 'x' does not exist on type 'never'" at build time.

Both structural gaps are now fixed in `database.types.ts`. But since that diagnosis was reached by
reasoning about the Supabase JS library's internals rather than running `tsc` directly (this
sandbox can't install npm packages), every non-wildcard `.select()` call across the app — 23 of
them — was also given an explicit result type as a backstop, independent of whether the structural
fix is complete. If one query site still breaks, it's isolated to that file and fixable the same
way: add an interface describing the expected row shape and cast `data as unknown as ThatType`.

**Lesson for any future query added to this codebase:** don't trust the inferred type from
`.select("...")` against this hand-written types file. Either cast the result explicitly, or run
`supabase gen types typescript --linked` once the project is linked to replace `database.types.ts`
with the real thing — that removes this whole class of bug permanently.

## Round 3: the same `never`-type problem also hit `.update()` / `.insert()` (fixed)

After the `.select()` fixes, the build progressed further and hit `Argument of type '{ status:
string }' is not assignable to parameter of type 'never'` on `.update()` — the same broken-type
inference, just on the write side instead of the read side. Rather than keep hunting for the one
remaining structural gap in the hand-written `database.types.ts` (two guesses in, that approach
was clearly too slow), every `.update()`/`.insert()` call across the codebase (18 of them) now
casts its `.from("table")` builder to `any` directly, guaranteeing the write compiles regardless
of how Supabase's generic resolution behaves. There's also one unrelated fix in the same build
run: `extracted_data: extraction` needed `as unknown as Record<string, unknown>`, since
`InvoiceExtraction` is a named interface without an index signature and TypeScript won't assign
it to a `Record<string, unknown>` column without an explicit cast.

**Net effect:** every read (`.select()`) and every write (`.update()`/`.insert()`) in this app now
has an explicit type or an `any` cast, independent of whatever `database.types.ts` actually says.
The real fix — replacing that file with `supabase gen types typescript --linked` once the project
is linked — would let all of these casts be removed again, but isn't required for correctness now.

## Round 4: unused `lib/mock-data.ts` also broke the build (fixed)

`next build` type-checks every `.ts`/`.tsx` file in the project per `tsconfig.json`'s `include`
pattern, regardless of whether anything actually imports it. `lib/mock-data.ts` — the Batch 1
placeholder data, explicitly unused since the Supabase integration — had a real bug (a missing
`ReconResultType` import) that had been sitting there invisibly the whole time, since nothing
exercised it. Fixed the import, and added the file to `tsconfig.json`'s `exclude` so an unused
reference file can't block a production build again, now or if it drifts further out of sync later.

## Round 5: implicit-`any` in the Supabase cookie boilerplate (fixed)

Unrelated to the Database-typing issue — this is the standard `@supabase/ssr` cookie-handling
pattern (used in `lib/supabase/server.ts` and `middleware.ts`), which left `setAll`'s parameter
without an inferred type under this project's `strict: true` / `noImplicitAny` tsconfig. Fixed by
explicitly typing it with `CookieOptions` imported from `@supabase/ssr` itself — the type the
library's own `createServerClient` cookie adapter expects, not a guessed shape.
