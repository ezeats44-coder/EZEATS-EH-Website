# Owner recipe workspace — local implementation, not deployed

## Verified starting point

Production was READY deployment `dpl_ECVqHTeWnAat8ChU3gUWF9rMDNSb`, source `9713b62185d82a25957c92142a4e17a518bf6a86`, when this work began. That source includes the deployed 100-recipe release (`0545de1`) and Owner-tool back navigation. Work is isolated in branch `codex/owner-recipe-workspace`, worktree `/tmp/ezeats-owner-recipes`. The dirty nearby-MVP checkout and `sources/` were not changed.

Baseline: 136 tests and 50 JavaScript syntax checks plus catalog/link/asset checks passed. There is no compiled frontend build, separate lint command, formatter or TypeScript step in this repository.

## Delivered interface

The authorized Owner dashboard has a **Recipe catalog** card linking to `/owner/recipes/`. Community Reviews remains separate. The workspace supports title, author, creation-date range, status, meal type and diet filtering, with 20-item pages (server maximum 50; bounded offset). It labels published database content as **not in the public picker**. Report intake is not activated.

Owners can create incomplete drafts (title and stable ID required), save and reopen, enter quantities/units/ingredient notes, reorder directions with keyboard-accessible buttons, preview public recipe fields, submit for review, approve, publish, request changes, reject and remove. Rights, private notes and suitability evidence are kept in the private editor/history. The form captures author attribution, timing/yield, cuisine, meal/diet/allergen tags, cost/currency, mood/heat/familiarity/budget and image rights. It accepts no image URL or file. Safety claims are never upgraded to verified merely by approving a recipe.

All recipe displays use text nodes/textContent. No rich HTML or markdown rendering is accepted. Drafts can be incomplete; submission/approval/publication gates require coherent timing, positive ingredient quantities/units, nonempty steps, metadata, original-work confirmation and safety/allergen evidence. Dietary claims require recorded evidence and cannot contradict declared allergens. This checks structure and explicit contradictions, not culinary correctness or ingredient-based safety; human review remains necessary.

## State and storage

`server/recipes/workspace/schema.sql` replaces the historical, unapplied proposal in `server/recipes/moderation/schema.sql`. **Do not apply both.** The old proposal mixed mutable review status into recipe rows; the implemented schema separates it:

- `recipe_records`: stable identity, origin/provider, private submitting account, creation/update/removal times, current revision/status, publication pointer, optimistic lock.
- `recipe_revisions`: immutable content, image rights, private notes, server-stamped copyright attestation, claimed/unknown evidence, parent version, fingerprint, creator/time. Content changes always INSERT a new version, including saves of unpublished drafts.
- `recipe_moderation_events`: append-only decisions, actor, exact version, time and private notes. Submission/review/approval/publication timestamps and reviewing administrator are obtained from these events, not overwritten fields.
- `recipe_owner_limits`: one bounded row per owner for a shared 60-operations/minute budget, including reads.

Revision/event UPDATE, DELETE and TRUNCATE are rejected by triggers. Foreign keys preserve record/revision/event integrity. All runtime values are parameterized. A transaction locks the record, checks `expectedLock`, inserts revision/event, and moves the publication pointer atomically. Detail reads hold a shared record lock for a consistent snapshot. Rollback protects against partial writes. Concurrent stale saves/decisions return 409; reload before retry. An ambiguous connection failure also requires reload before retry, rather than assuming a save failed. Detail responses include the latest 20 revisions plus the current published snapshot and at most 100 decision events; older events use a bounded cursor and any old revision is retrievable by version through the same owner-authenticated API.

Editing any published record creates a pending revision. The existing published pointer remains active through edits, changes requested and rejection. Only approval plus publication replaces it. Removal clears the pointer, marks the record removed and keeps its private audit. Restoring removed records and permanent data deletion are not exposed.

The Neon adapter uses the existing serverless driver's interactive Pool transactions, dedicated `RECIPE_DATABASE_URL`, an eight-second transaction statement timeout and bounded connections. It never falls back to the customer-review `DATABASE_URL`. SQL was exercised with embedded PostgreSQL (PGlite), using the same queries/schema. No Neon connection or schema change was made. Neon WebSocket transport, database roles and deployed concurrency still require isolated-preview verification.

## Security and feature gates

`/api/owner-recipes` authenticates **every** call via Clerk and `server/owner-access.js`, using the existing server-side `REVIEW_ADMIN_USER_IDS` allowlist. Client roles, email addresses, actor IDs, origins and verified evidence are not accepted. The owner check runs before the enablement flag or storage lookup. Normal local development also requires a real development Clerk session and allowlisted ID. Only the dedicated local startup injects localhost origins; production defaults are unchanged.

Hosted enablement requires both `OWNER_RECIPES_ENABLED=true` and a dedicated server-side `RECIPE_DATABASE_URL`. They are currently unset by this task. Without them the authorized API returns a disabled/unavailable message and does not collect recipe data. Requests are limited to 64 KB, accepted fields are enumerated at every editable level, queries and pagination are validated, and all responses are private/no-store. No server or provider key is sent to the browser.

Only owners may use GET list/detail and POST creation/edit/review operations. Public and invitation-only submission routes, contributor roles, reports, uploads and provider imports do not exist. The SQL origin enum retains `ezeats-owned`, `licensed-provider`, `user-submitted`; this phase always stamps new content `ezeats-owned`/EZEATS server-side. Future ingestion will use separately authorized commands, not a client-editable origin or role. No table restructuring is needed to retain those origins, contributor IDs, rights/evidence and revisions.

## Public catalog boundary

The deployed 100 recipes, generated summaries, ranking, preference filtering, public recipe API and detail page are unchanged. Their namespace remains `ezeats:`. New identities use `ezeats-owner:slug`, preventing collisions by construction plus a database primary key. Namespace/ID are immutable after creation. Similar-content fingerprints are available for future editorial duplicate candidate detection; they are not proof of copying or automatic rejection.

`publishedDatabaseProvider(store)` implements the existing provider-neutral interface, but is **not registered** in `api/recipes.js` or the picker. It reads only the publication pointer, excludes removed records, and explicitly projects public Recipe v1 fields. Private notes, account identifiers, rights attestations, evidence text, moderation decisions and history never enter public provider responses. It returns unverified suitability with false completeness/evidence flags. Approval never bypasses `matchesRestrictions`.

Before integrating this provider into recommendations, separately verify: merged provider routing and collision handling; all new picker summaries mapping to published full records; cost/currency normalization (no treating CAD as USD), total-time limits and mood/heat/familiarity conversion; event/history identity compatibility; known-allergen taxonomy; evidence needed for each hard restriction; and atomic publication/removal behavior with caches. Unknown evidence must fail closed for explicit diets/allergies/exclusions. Never silently relax a user's restrictions. Existing metadata such as gender is not an authorization or safety signal.

## Local operation and verification

Use Node 24 and pinned pnpm 11.19.0:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm check
git diff --check
```

For normal owner development, configure only existing **development** Clerk keys and allowlisted development user IDs in your shell, then `pnpm dev:recipes`. It starts http://localhost:4192/owner/recipes/ and stores local PostgreSQL files under ignored `.local-data/recipe-workspace`. Register that local origin with the development Clerk application as needed. The local schema is initialized only in this explicit local entry point. Hosted API startup never runs migrations.

`pnpm verify:recipes:browser` instead starts a clearly labeled simulated owner at http://localhost:4193/owner/recipes/ with a disposable in-memory PostgreSQL database. This script overrides only the local fixture account module and injects the real handler's test Clerk client. It is not mounted by normal development or Vercel. It binds loopback only and refuses to run with VERCEL set. Stopping it discards all recipe fixtures. Automated disk-persistence tests create and remove their own temporary database directory.

Database/API tests cover drafts/reload, immutable saves, submit/approve/publish, pending versus published, changes requested, rejection/removal, stale concurrent saves, duplicate IDs, hard-restriction projection, markup/unknown fields, size/media-type validation, pagination, per-request owner authorization, rate limiting, transaction rollback, Neon transaction lifecycle and unavailable storage. Existing account/review/picker tests remain in the complete suite.

Browser verification uses the disposable fixture, not a real new Clerk login: desktop/phone layout, form labels, save/reload, public preview without private notes, ordered steps, review/publication, pending versus published comparison, changes requested, empty filters and keyboard controls. No browser errors were found in the successful fixture run. A local-origin write failure found during testing was corrected by an explicit local-only origin injection, without adding localhost to hosted authorization defaults.

Final local results: **154 automated tests passed**, **61 JavaScript syntax checks** plus generated 100-recipe catalog/report, HTML asset/link and diff checks passed. The same schema and transactions ran in PGlite, including persistent close/reopen and deliberately failing transaction fixtures. Browser checks at 1280×900 and 390×844 verified the Owner card/back link, form controls, save/resume, step ordering, public preview, review/publication, existing published version during edits, change requests, older-version reads, empty filtering and keyboard focus; no horizontal overflow or console errors in the final run. Private notes were absent from the public preview. File-based recipes, public recipe API, picker/profile matching and account/review API files have no diff from the verified production base. The shared owner-auth helper only adds injectable origins for the explicit local entry point; its hosted defaults and server allowlist are unchanged.

Remaining verification limits: this task did not connect to Neon, exercise a real new Clerk login in the workspace, test multi-instance hosted WebSocket contention, run a screen-reader application, or deploy a preview. Those checks require the isolated preview setup below. Accessible labels, semantic ordered lists, live status, focus outlines, keyboard controls and phone layout were checked locally. Recipe quality, rights and food safety still require human editorial review; no kitchen testing is claimed.

## Approval required: isolated migration and preview (not performed)

1. Approve a specific isolated Neon development branch/database. Confirm its connection target is **not production** and does not contain production customer records. No new paid service or plan is needed or authorized by this code. Confirm cost/limits before any provisioning.
2. Inspect the database for any previous recipe tables. If the historical design was already applied elsewhere, stop: this migration deliberately does not silently drop/alter them. Prepare an explicit reconciled migration for review instead.
3. After approving the exact target, a database operator runs this reviewed additive migration once, as the isolated database schema owner:

   ```sh
   psql "$RECIPE_PREVIEW_ADMIN_URL" -v ON_ERROR_STOP=1 --single-transaction \
     -f server/recipes/workspace/schema.sql
   ```

   This adds four tables, two foreign keys, three indexes, one immutable trigger function and four triggers. It makes no changes to reviews, accounts or the 100 file recipes. Do not run it against production.
4. Using the approved isolated database, create a dedicated runtime login via the database's secure credential workflow, not in source control. With the role name `ezeats_recipe_runtime`, grant USAGE on schema public; SELECT/INSERT on recipe_revisions and recipe_moderation_events; SELECT/INSERT/UPDATE on recipe_records and recipe_owner_limits; and USAGE/SELECT on recipe_moderation_events_event_id_seq. Do not grant DELETE, TRUNCATE, DDL or schema ownership. Test denied mutation of audit rows and cross-role access on that actual isolated database. Keep the migration/admin connection out of runtime environment variables.
5. Approve adding **preview-scoped only** `OWNER_RECIPES_ENABLED=true` and `RECIPE_DATABASE_URL` (runtime-role connection), and the existing development Clerk keys/owner allowlist for this branch. Do not edit production variables. Keep external recipe providers and public submissions/uploads disabled. The live-review production database must not be used for preview testing.
6. Approve a Vercel preview from the reviewed feature commit. No production promotion or main-branch push. Re-run the full suite before deployment, verify origins match the actual preview, and test real authorized/non-owner Clerk accounts, concurrent writes and Neon transaction failures, logs, mobile, keyboard and private projections.
7. For preview fixtures, use disposable originals. Remove them through the workspace (which retains audit), or discard the entire **isolated test database** after explicit approval. Never truncate production audit tables. Agree retention/privacy/deletion rules before collecting genuine recipes.

Production migration, environment changes and deployment require a later, separate approval. Public recommendation integration is another review gate. A UI publication decision in this phase does not authorize activating that integration.

## Later contributor rollout

1. Owner-created recipes in isolated preview, then approved production rollout.
2. Invitation-only contributor beta after explicit launch approval, server-side ownership checks and contributor-scoped routes.
3. Public account submissions only after rate/abuse limits, copyright confirmation, duplicate screening, plain-text controls, privacy/retention disclosures and food-safety warnings are reviewed.
4. Reuse this Owner recipe queue and comparison view for contributors, separate from Community Reviews. Do not let contributor input set authorization, verified evidence or publication state.
5. Changes requested, approval, rejection, publication and removal reuse immutable revisions/events. Add reporting, private reporter handling and appeals only after a separate rollout review. Images require separate upload controls, rights verification and approval; no uploads are enabled now.
