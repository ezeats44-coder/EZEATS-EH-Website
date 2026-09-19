# Invitation-only contributor beta — local implementation

This phase is **not deployed**. It starts from production source `e7d34d11167a22cdce02bbce313ee267b79a5928` (Owner Recipe Manager deployment `dpl_B5aKMToeeLEWieqiY8ox3QSRqXut`, verified before implementation). Worktree `/tmp/ezeats-contributor-beta`, branch `codex/contributor-beta`. The older dirty checkout and nearby MVP are excluded. The historical owner-workspace document describes its earlier phase; this document supersedes its statement that invitation routes do not exist.

## Routes and authorization

| Route | Access and purpose |
| --- | --- |
| `/owner/recipes/contributors/` | Owners: resolve an existing account, invite, expire/revoke, view private invitation audit, reconcile deleted accounts |
| `/owner/recipes/` | Existing owner queue, now identifies contributor origin and submitting ID, duplicate candidates, private decision notes, contributor messages, comparison and moderation |
| `/recipes/contribute/` | Invited account's own drafts, revisions, previews, submission and withdrawal |
| `/api/recipe-contributors` | Verified Clerk session plus existing server-side owner ID allowlist on every call |
| `/api/contributor-recipes` | Verified session, existing private 13+ or legacy 14+ confirmation, active invitation, ownership on every call |
| `/api/community-recipes` | Separately gated, public normalized published contributor recipes only |
| `/recipe/?id=ezeats-user:slug` | Existing detail renderer for a published contributor recipe when community catalog is enabled |

Email is only an owner lookup input. Clerk must return exactly one matching **verified** email on an existing eligible account. No email is stored in invitation records, no account is created, and no message is sent. The exact server-returned Clerk ID is stored. Direct ID lookup also retrieves the actual Clerk account and checks eligibility. Neither body fields nor client roles establish an identity. The Contribute navigation link appears only after a successful server access check; it grants no authorization itself.

Invitations last at most 90 days. Active duplicate invitations are idempotent; renewed invitations produce new immutable events with their expiration. Revocation locks the invitation row; it blocks requests after the revocation transaction commits. An operation already holding the lock may finish before that commit. Expiration is checked on every request. Private lists show active/revoked/expired state; no public contributor directory exists.

## Storage and workflow

New additive migration: `server/recipes/contributors/schema.sql`, version **contributor-beta-v1**. Depends on the implemented `server/recipes/workspace/schema.sql`, not the old proposed moderation schema. Adds five tables:

- `recipe_invitations`: current grant, inviting owner, dates, expiry and revocation.
- `recipe_invitation_events`: append-only private grant/revoke/deleted-account audit, including grant expiration.
- `recipe_contributor_limits`: shared database-backed actor/category time windows.
- `recipe_contributor_requests`: immutable request UUID/fingerprint/recipe receipts for retry deduplication.
- `recipe_change_requests`: immutable messages tied by foreign keys to the exact moderation event and recipe revision.

Adds two lookup indexes and immutable update/delete/truncate guards. No review-table edits, file-recipe import, table rename, data rewrite or seed recipes. The existing revision, moderation-event, publication-pointer and optimistic-lock tables remain authoritative. No migration runs at application startup.

All business writes use the existing interactive transaction adapter, parameterized SQL, row locks and `expectedLock`. A stale editor receives 409. Contributor requests carry UUIDs: the same request/content returns the existing result, while reuse with different content fails. Transactions cover invitations, revision writes, submission transitions and publication. Failed writes roll back their recipe/event/receipt together.

Contributors use reserved `ezeats-user:` IDs. Incomplete drafts may be saved; submission requires complete normalized content, positive quantities, ordered nonempty steps, yield/timing, cuisine/meal metadata, attribution, copyright statement and safety/allergen evidence. The form supports original work or permission with source URL and attribution. HTML/scripts, unsafe source URLs, unexpected fields, oversized requests and numbered step objects are rejected. All displays use text nodes. No image URL or upload is accepted.

Pending and approved revisions are read-only to contributors. Changes requested permit a new revision and resubmission; rejection may be followed by a revised draft. Editing a published recipe creates a pending revision immediately, leaving the public pointer on the previously approved version. Contributors may withdraw unpublished editable drafts; pending/published removal goes through an owner. Owners alone moderate. Changes requested and rejection require both an owner-only explanation and a separate message visible to that contributor. Owners' private notes, account IDs and attestation records are excluded from contributor/public projections.

Publication reads only the approved pointer and removes withdrawn records from public responses. Approval never verifies allergy claims. Every new public recipe retains unverified suitability and false evidence/completeness flags. This phase has no verification command for either role. Duplicate candidates use exact normalized title or content fingerprint and never cause automatic rejection; fuzzy similarity is not implemented.

The existing 100 `ezeats:` recipes and picker are unchanged. Database recipes are **not registered in the recommendation pool**. Even owner-provided mood/heat/budget metadata does not opt them in. Future integration must separately approve metadata, currency/time conversions, per-restriction evidence, cache/removal behavior and history identities. Explicit exclusions must remain hard constraints; unverified recipes must not pass a restricted filter.

## Limits

64 KB JSON; bounded fields/arrays; 20-item contributor/invitation pages; 10,000 maximum offset; latest 20 revisions plus published version; at most 100 messages/events per response. Shared limits include 60 API attempts/minute, 30 contributor writes/minute, 100 revision operations/day, 10 creates/day, 10 active unpublished recipes, 5 submissions/day and 3 pending recipes per contributor; owner invitation operations are limited to 20/minute. Rate counters reset on the next request after their window expires. Retry receipts remain with immutable audit data. No analytics or body logging was added.

## Local verification

Use Node 24, pinned pnpm 11.19.0 and the committed lockfile:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm check
git diff --check
pnpm verify:contributors:browser
```

The browser fixture binds only to `127.0.0.1:4195`, checks Host, refuses hosted/production startup, and uses disposable in-memory PGlite plus clearly labeled simulated Clerk identities. Switch accounts with fixture links. Only Alice starts invited. It uses real handlers, validation, SQL, transactions and forms; it does **not** test real Clerk sign-in. Stop the process to discard every fixture. Automated tests close their in-memory databases. No test uses production credentials.

## Preview gates and configuration (not applied)

1. Approve the privacy/rights/retention draft and isolated preview work. Do not invite a real contributor yet.
2. Use a dedicated empty test database with the existing owner workspace migration first. Do not clone unnecessary production personal data. Confirm any service cost before provisioning.
3. Review the exact contributor SQL checksum. Apply it in one transaction with a migration advisory lock; verify all objects, then record `contributor-beta-v1` and checksum in the existing release migration ledger. Do not use `IF NOT EXISTS` to conceal a partial/different migration.
4. Runtime database role needs SELECT/INSERT/UPDATE on invitation and limit tables; SELECT/INSERT only on invitation events, contributor receipts and change requests; USAGE/SELECT on the invitation-event sequence. Preserve the existing recipe-table privileges. Never grant DELETE/TRUNCATE or schema ownership to runtime. Test with that limited role, not the migration administrator.
5. Preview-only variables: dedicated `RECIPE_DATABASE_URL`, existing `OWNER_RECIPES_ENABLED=true`, development Clerk server/publishable keys, development `REVIEW_ADMIN_USER_IDS`, existing origin configuration, `RECIPE_CONTRIBUTOR_BETA=true`. Set `RECIPE_COMMUNITY_CATALOG=true` only for the approved published-projection test. Neither flag is public or defaults on. No new provider, email, upload or analytics variables.
6. Test real development owner, invited contributor, other contributor, uninvited and signed-out sessions; verify Clerk private age metadata. Repeat the complete lifecycle, cross-account denial, concurrent edits/revocation, low-privilege database transactions and function logs on Neon/Vercel Preview. Do not use simulated fixture authentication in a deployment.
7. Check preview public projections and exact unchanged 100-record baseline. Require explicit production approval afterward.

## Retention, account deletion and rollout

See `contributor-privacy-draft.md`. No live privacy page changed. This code deliberately retains immutable revisions and audit records; withdrawal is not erasure. There is no automatic purge scheduler, backup purge or legal-request deletion tool in this phase. Before real invitations, approve and operationalize the stated retention/removal policy and rights permission with an appropriate reviewer. The draft must not promise an automated deletion capability that does not exist.

Clerk account absence blocks contributor requests. An owner can use “Reconcile deleted account”; the server independently requires Clerk's explicit 404, not an outage or client assertion. This revokes the grant and records the action. Pending content remains private for owner resolution. Published recipes retain attribution and publication until a documented owner removal decision. No automatic transfer of copyright to EZEATS is claimed. There is no webhook or automatic deletion reconciliation; owners must perform this review. Treat unverifiable rights, removal requests and attribution changes as moderation cases.

After approved preview testing: record production restore/rollback references, apply only this additive migration with transaction/lock and checksum verification, verify review counts unchanged, deploy exact approved source with flags off, then explicitly approve the beta/policy activation and selected invitations. No emails are part of this rollout. Reports, uploads, public signups for contributing, external providers and automatic picker integration remain disabled.

Rollback: disable both beta/community flags to stop contributor writes and public community reads; restore the prior app if necessary. Keep all existing and new recipe data/audit tables. Do not drop tables holding contributor data or undo published pointers by hand. Empty disposable preview databases may be deleted only after confirming they contain no required data. Failed transactional migrations roll back before application activation. Production credentials, domains, Clerk metadata and schema were not changed during implementation.
