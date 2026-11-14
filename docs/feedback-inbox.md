# Private Feedback Inbox — Step 4A

Starting state: no private Feedback route, API or storage found. Existing Community Reviews are public-after-approval and remain separate. This implementation is Preview-only until Step 4B approval.

## Routes and security

`/feedback/` and `/api/feedback`: authenticated user's own conversations, including when the user is an Owner. `/owner/feedback/` and `/api/owner-feedback`: verified server-side Owner allowlist. Reuse existing Clerk session verification (`betaIdentity`) and authorized origins; the contributor role has no effect. Every request reauthenticates. Mutations require an allowed Origin and JSON content type. Client identities/roles and unexpected fields are rejected. Private responses are no-store. Only opaque conversation/message UUIDs, text, public categories/statuses and timestamps are projected; no Clerk IDs, sender identities, owner details or audit events.

Status and archive operations require a current version; replies are serialized per conversation. Read markers acknowledge only the sequence actually fetched, preserving concurrent unseen messages. Owner unread state is shared by the Owner team, not per staff member. Closed and archived conversations are read-only to users. Owners reopen Closed conversations through status selection. Archive preserves private history, and the Owner Archived filter can retrieve it.

## Storage and configuration

Migration `20261113_feedback_v1`, `server/feedback/schema.sql`: five new tables (feedback_conversations, feedback_messages, feedback_requests, feedback_limits, feedback_events), constraints and indexes. No changes to recipes, accounts or reviews. Transactions, row locks, actor advisory locks and unique request keys prevent partial writes and duplicate retries. Message/events/request records are append-only through the application and proposed runtime grants. Rate limit: 60 authenticated API requests/minute/account, shared by both APIs and all function instances. Lists contain at most 20 conversations; messages at most 50, with earlier-page retrieval. Subjects 120 characters; messages 4000; JSON maximum 64KB. Plain text only; angle brackets and control characters rejected. No message bodies in diagnostic logs.

`FEEDBACK_ENABLED=true` enables APIs. `FEEDBACK_DATABASE_URL` is the dedicated server-only connection. For Vercel Preview only, an absent feedback connection may reuse the already-isolated `RECIPE_DATABASE_URL`. Production never uses that fallback. Existing Clerk keys and `REVIEW_ADMIN_USER_IDS` remain required. Never configure production credentials for this branch. No tracking script on feedback pages.

## Preview migration procedure

Verify project `royal-fire-77229787`, branch `br-super-firefly-au2umstc`, database neondb. Inspect existing tables and role. In one transaction take `pg_advisory_xact_lock(hashtext('ezeats-feedback-migration'))`; execute schema exactly, apply minimal `preview-grants.sql`, and record the file SHA256/version in a dedicated migration ledger only after success. Verify tables, constraints, grants and zero initial rows. Do not run against project noisy-dream-52759351. All Preview content must be conspicuously labeled TEST and archived after verification.

## Local verification

`node scripts/test.mjs`, `pnpm check`, `git diff --check`, `pnpm audit --prod`. `node scripts/feedback-browser-fixture.mjs` supplies a disposable PGlite database and explicitly simulated owner/alice/bob/guest identities on loopback port 4196. This is not evidence of real Clerk-session verification. Real Preview owner and two user sessions are a release gate.

## Privacy and retention gates

Private messages are visible only to their account and authorized Owners. Do not include passwords, payments or sensitive personal information. No attachments, notifications, third-party communication services or automated replies. Draft text stays in page memory and is lost on reload; successful messages persist. Request retry keys stay in page memory during retries. Archived does not mean deleted. Before production, approve a retention/deletion policy covering conversation content, sender IDs, retry records, audit events, rate-limit buckets and Neon backups, and publish an appropriate privacy-policy addition. No automatic deletion policy is activated in Preview. Feedback does not expose or reuse sensitive profile answers.

## Step 4B deployment and rollback (not authorized here)

Require all real-session lifecycle/security/mobile checks to pass; approve retention/privacy disclosure; identify exact reviewed commit and recovery target; confirm additive migration checksum and production database identity; obtain recovery point; transactionally apply schema and minimal dedicated runtime grants and record migration; configure Production FEEDBACK_DATABASE_URL and FEEDBACK_ENABLED explicitly; deploy approved source only; verify production with labeled test conversations and archive them. If app checks fail, disable Feedback/revert to prior application, retaining tables and private messages. Do not automatically drop data. Preview cleanup may archive fixtures or remove a dedicated disposable database only with explicit deletion approval; never drop shared recipe/review storage.

## Known limits

Refresh inbox checks for new messages; there is no polling/realtime transport or notification service. Subject search is literal, case-insensitive. Offset pagination can shift if conversations update between pages; bounded reads remain enforced. No attachments, exports, bulk actions, per-owner assignment or per-owner unread state. Retention cleanup and privacy-policy publication are production gates.

## Step 4A execution evidence (in progress)

2026-11-14: Preview migration applied successfully in project royal-fire-77229787 / br-super-firefly-au2umstc. Schema SHA256: `5485a5442d95b9ced23fbf53073ee6d1aeca3deb1cb2c27494c6f1f99c8d41d1`. Minimal runtime grants approved by the user at action time. Dedicated ledger ezeats_feedback_migrations records version/checksum. Initial conversation count zero. Production unchanged.

Local automated suite: 201 tests pass, including 10 feedback groups. Existing 100 recipes/100 static detail pages verified. Syntax, local links/assets and diff checks pass; production dependency audit reports no known vulnerabilities. Simulated local browser verified create, Owner unread/open/reply, user unread and closed read-only view, with 390×844 mobile reflow and keyboard Enter activation. Real Clerk Preview lifecycle is not yet complete.

Feature worktree: codex/private-feedback-preview, isolated from b3123fa9600c1bfb1359cbc2bd54fa873b74158d. Preview release uses the existing codex/owner-recipe-preview Git branch, fast-forward only, to preserve its already-isolated branch-scoped database/Clerk configuration. Only FEEDBACK_ENABLED=true was added in Preview. No production environment variables changed.
