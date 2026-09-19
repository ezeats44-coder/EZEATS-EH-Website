# Contributor beta verification — 2026-09-19

Local implementation only. Base production source: `e7d34d11167a22cdce02bbce313ee267b79a5928`. Isolated branch: `codex/contributor-beta`. The implementation commit is the commit adding this report (resolve with `git log -1 --format=%H -- docs/contributor-beta-verification.md`). No deployment or external database/account mutation was performed.

## Automated checks

- Pinned dependency installation succeeded using `pnpm install --frozen-lockfile`; lockfile unchanged.
- `pnpm test`: **171 passed, 0 failed, 0 skipped**, including 17 contributor tests and all 154 baseline tests.
- `pnpm check`: **100 recipe summaries/review rows verified**, **71 JavaScript files** passed syntax checks; local HTML links/assets exist.
- `git diff --check`: passed. No separate TypeScript, formatter, lint or build command is configured in this static application.
- Credential-pattern scan across tracked and feature files: no private keys, long Clerk/GitHub secrets, credential-bearing database URLs or JWT matches. Pattern scanning is not a guarantee against every possible secret format.
- Exact base comparison: no changes to the 100 owned recipe files, picker data, profile/review APIs, existing owner authorization module, live privacy page, Vercel configuration or legacy hosting identity. No nearby-MVP files included.

Tests exercise invitations/expiration/revocation/duplicate grants, exact Clerk lookup and 13+/legacy14 eligibility, ownership and owner authorization, draft lifecycle, pending locks, changes requests, approval separate from publication, replacement publication, rejection/removal, UUID deduplication, stale/simultaneous edits, quotas/shared limits, plain text/URLs/payloads, private projections, published and pending account-deletion cases, failed transaction rollback, immutable guards, disabled public catalog and existing regressions. Test databases are memory-only and closed after the suite.

## Browser observations

Used disposable localhost PostgreSQL and simulated, visibly labeled accounts. **No claim of real Clerk sign-in or deployed Neon verification.**

- Contributor draft creation, save, reload, edit and recipe preview passed.
- Incomplete safety fields were rejected with a focused status message.
- Complete submission became read-only, including disabled fields and Save control.
- Owner queue showed `user-submitted`; owner requested changes with separate private note and contributor message.
- Contributor received the change request but not the private owner note; revision and resubmission passed.
- Owner approved/published locally; public detail displayed ingredients, ordered steps, attribution and unverified-suitability warnings without private fields.
- Editing published content created a locked pending revision. Public detail retained the earlier approved title and content. Comparison displayed the published version separately.
- Owner invitation UI resolved simulated Bob's email; access worked, then revocation immediately denied access. Uninvited account was also denied.
- Keyboard Enter withdrew a disposable unpublished draft; owner list showed `removed`, and private history was retained.
- Desktop owner layout and 390 × 844 phone recipe preview were visually inspected. No horizontal overflow on the phone form; labels, status regions, preview and comparison were usable. No captured browser errors or warnings during the successful local flows.
- Owner removal confirmation in the in-app browser stalled the browser-control connection, so **that one browser removal step was not confirmed**. Removal and public withdrawal pass transactional automated tests. A separate Chrome local session completed contributor withdrawal and invitation checks. Recheck owner removal with a real session during preview verification.

The local fixture was stopped after checks, discarding test invitations and recipes. No real invitations or emails were sent. Real accounts, live account entry points, deployed multi-instance races, Neon role grants and hosted function logs are preview release gates, not claimed passes.

## Migration and release gates

Migration **contributor-beta-v1**, `server/recipes/contributors/schema.sql`.

SHA-256: `2924daba590612a94868f64958aa82ec807a7e1cf929809ea390596277dfc3ce`.

Five additive tables: `recipe_invitations`, `recipe_invitation_events`, `recipe_contributor_limits`, `recipe_contributor_requests`, `recipe_change_requests`; two indexes and immutable audit guards. Applied only to disposable local databases. Existing owner schema and the 100 file recipes were not migrated.

Before real invitations: approve the unpublished privacy/rights wording and implement the proposed retention/deletion operating procedure; authorize an isolated preview database/migration/deployment; verify exact Clerk account resolution, owner/contributor isolation, Neon runtime privileges, revocation races, full browser lifecycle and logs with real development sessions; then separately approve production activation. Keep `RECIPE_CONTRIBUTOR_BETA` and `RECIPE_COMMUNITY_CATALOG` off outside approved test environments. See `contributor-beta.md` for exact environment, migration, rollout and rollback steps.
