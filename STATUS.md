# CA Ledger — Build Status

Last updated: 2026-10-02 (Deployed live + invite flow + password reset added — local build passes types, Suspense fix applied, needs one more build)

## Fully working, live-tested against a real Supabase project
Everything from Batches 1–4 and the frontend↔Supabase integration is confirmed working — not
just theoretically, but verified against real dashboard/reconciliation/exception/task/evidence/
review screenshots with hand-checked numbers matching the seed data exactly. One real bug was
found and fixed in this process: an unescaped apostrophe in a generated SQL string (`vendor's`)
that broke migration `0003`. Fixed at the generator level, not hand-patched.

## Latest: invite flow + password reset added (both feature gaps now closed)
- Invite flow: `/team` (Partner-only) generates a 7-day token; `/signup?invite=<token>` joins the
  invitee to the existing firm instead of creating a new one. New `invites` table (migration
  `0008`), new `lib/supabase/queries/invites.ts`, `app/actions/invites.ts`,
  `app/api/invites/[token]/route.ts`. See README for the full design and the RLS reasoning.
- Password reset: `/forgot-password` + `/reset-password`, standard Supabase Auth recovery flow.
  Required one real fix to `middleware.ts` — the recovery-session edge case documented in README.
- Did not store the user's actual password anywhere, per explicit judgment call — see README.
- **Not yet verified against a real build** — same discipline as every DB call since the 5 build
  rounds: every new `.select()`/`.update()`/`.insert()` here is explicitly typed or `any`-cast,
  but this hasn't been through `npm run build` yet. Run that before pushing.

## Earlier: Vercel build failure — hand-written Supabase types caused `never`-typed query results
`next build` (which neither `npm run dev` nor `npm test` exercises) failed with "Property 'firm_id'
does not exist on type 'never'". Root cause: `database.types.ts` was missing structural pieces
Supabase's client needs (`Relationships` per table, `Views`/`Functions`/`Enums`/`CompositeTypes` on
the schema) for `.select()` to infer correctly. Fixed the structural gap AND added an explicit
backstop type to all 23 non-wildcard `.select()` calls project-wide, since the structural diagnosis
couldn't be verified with a real compiler in this sandbox. The `.select()` fix (round 1) worked and the build progressed further, but hit the identical
`never`-type problem on `.update()`/`.insert()` (round 2), plus one unrelated cast needed for a
JSON column (round 3, same build). All 18 write calls across the codebase now force-cast their
query builder to `any` rather than relying on Supabase's inference at all. Round 4: the unused `lib/mock-data.ts` reference file (dead since the Supabase integration) had
its own unrelated bug and was still being type-checked by `next build` despite nothing importing
it. Fixed its missing import and excluded it from `tsconfig.json` so unused files can't block a
build again. Round 5: an implicit-`any` parameter in the standard `@supabase/ssr` cookie-handling boilerplate
(present in both `lib/supabase/server.ts` and `middleware.ts`), unrelated to the Database-typing
issue — fixed with the library's own exported `CookieOptions` type. **Not yet re-verified** —
needs `npm run build` locally, then push + redeploy.

## Previous: scale bugs found by live testing (fixed)
Loading `0005` exposed the PostgREST 1,000-row cap: the reconciliation panel showed 1,000 entries
and 6 exceptions instead of 2,500 and 173. Fixed with COUNT-based summaries, a server-side
paginated reconciliation table, and paged reads elsewhere. The "Run reconciliation" route had the
same flaw (would have saved wrong results for ABC) plus an exception-code collision risk and would
have duplicated exceptions on re-run — all fixed. Migration `0006` corrects 2 seed rows. See README
"Scale fixes". **Verified live:** ABC's panel now reads 2,500 / 2,327 / 61 / 74 / 23 / 15 / 173 and the table pages correctly (1–25 of 2,500).
A simulated engine run then found 3 more hand-written seed rows the engine would contradict; migration `0007` fixes them.
**Still to verify live:** `supabase db push` (0006 + 0007), then click "Run reconciliation" on ABC — expect identical totals and 0 new exceptions.

## Previous pass — the last of the previously-open items
- **Full-scale seed data** (`0005_full_scale_seed.sql`): ABC Manufacturing now has 2,500
  transactions / 173 exceptions matching spec sections 14/24/42/43 exactly, including the
  27/19/18/9/100 status distribution. Additive to the existing canonical 6 exceptions, not a
  replacement — EX-1042 and the rest of the demo story are untouched.
- **Role-based UI restrictions**: Partner Review (nav + page + Approve/Return actions) is
  restricted to the PARTNER role, enforced both in the UI and server-side in the Server Actions
  themselves (`requirePartner()` in `app/actions/exceptions.ts`).
- **Signup flow**: `/signup` creates a new firm + its first Partner account. No invite-to-existing-
  firm flow yet (documented as a real gap, not silently missing).

## Everything built so far, end to end
Schema + RLS + seed data (Batch 2) → Gemini document extraction (Batch 3) → deterministic
reconciliation engine (Batch 4) → full frontend wired to all of it, with real Server Actions,
real auth, role restrictions, and now spec-scale demo data.

## Genuinely remaining (not built)
- Invite flow for adding a second user to an existing firm.
- Password reset.
- Deployment to Vercel (yours to do, per the original scope split for this build).
- The 9 non-canonical clients (Kumar Engineering, Apex Infotech, etc.) still have only light
  seed data, not full-scale — intentional, matches spec's own "don't generate unnecessary volume"
  guidance; only the spec's own canonical demo client (ABC Manufacturing) needed the 2,500-scale
  treatment.

## To resume after a reset
Re-upload the zip and tell Claude "continue from this build." At this point the natural next asks
are either the two remaining gaps above, or ongoing bug-fixing as you exercise the live app further.
