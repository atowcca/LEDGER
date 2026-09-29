# CA Ledger — Build Status

Last updated: 2026-09-27 (Scale bugs found and fixed after loading the 2,500-row seed)

## Fully working, live-tested against a real Supabase project
Everything from Batches 1–4 and the frontend↔Supabase integration is confirmed working — not
just theoretically, but verified against real dashboard/reconciliation/exception/task/evidence/
review screenshots with hand-checked numbers matching the seed data exactly. One real bug was
found and fixed in this process: an unescaped apostrophe in a generated SQL string (`vendor's`)
that broke migration `0003`. Fixed at the generator level, not hand-patched.

## Latest: scale bugs found by live testing (fixed)
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
