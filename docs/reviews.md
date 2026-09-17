# Reviews page

Local implementation; not deployed. Reviews of EZEATS (not restaurants) appear at `/reviews/`, linked from the site navigation. Optional 1–5 rating and display name, required comment and publication consent. Both positive and critical feedback can be published; review for spam, abuse and personal information rather than sentiment. Names are unverified; no account/email is collected.

Submissions are saved as pending. Only published rows are returned publicly. Empty states contain no invented testimonials. All user content renders through textContent. Network/storage failure preserves the form and does not falsely report success.

## Local storage and approval

The development server uses `.local-data/reviews.json` (gitignored). Local preview data stays in this file; it is not sent to Neon or Clerk. Visit `/reviews/manage/` on the local preview to approve pending reviews or hide published reviews. These controls share the server's serialized storage adapter. The endpoint exists only in the local dev server, rejects external hostnames and cross-origin mutations, and is not a production owner-authentication system.

Run one dev server using this store. Optional command-line moderation follows; stop the dev server first because the JSON adapter does not coordinate concurrent processes.

`node scripts/review-moderate.mjs list` lists pending reviews and IDs.

`node scripts/review-moderate.mjs publish REVIEW_ID` publishes a selected review locally.

`node scripts/review-moderate.mjs reject REVIEW_ID` withholds it. The row remains on disk, so this is reversible with publish. Moderation is a local command, not an unauthenticated public HTTP endpoint.

The public API uses the Neon adapter when DATABASE_URL is configured and otherwise remains unavailable. No serverless ephemeral-file storage or Clerk-metadata review database is used.

## Before a public launch

- Schema applied to the authorized Neon Free ezeats-reviews database on September 17, 2026. The Vercel production project is connected; preview/development are not connected. Sensitive credentials cannot be downloaded by env pull. Never use downloaded [SENSITIVE] placeholders as credentials.
- Owner verified by exact email lookup in production Clerk; REVIEW_ADMIN_USER_IDS is configured for that existing account on production. api/review-moderation.js verifies Clerk bearer sessions and the explicit allowlist; no owner is inferred or automatically enrolled.
- Decide retention, removal/contact handling, and update the production privacy disclosure for reviews before collecting public submissions.
- Test publication/rejection, concurrent submissions, account authorization, restore/removal, and storage failure on the selected backend.
- Release from the production branch without unrelated MVP changes when deployment is authorized.

No paid service or live provider has been activated. A functioning shared public review system needs this launch setup; local submissions are not visible to visitors of the live site.

## Shared database adapter

server/review-store.js uses parameterized Neon serverless queries. scripts/reviews-schema.sql creates reviews and short-lived rate-limit buckets. Submission IDs are unique; a transaction lock coordinates retries and limits. At most five new submissions per salted network-address/day bucket and 2,000 pending reviews are accepted. Raw IP addresses are not saved; bucket hashes expire after a day and are purged during later submissions. This basic limit is not a complete spam defense. Public results and moderation lists are bounded to 200 rows per request.

The hosted moderation endpoint requires both a verified Clerk session and an explicit owner ID. Local moderation remains loopback-only and uses the JSON store. DATABASE_URL and CLERK_SECRET_KEY stay server-side. No production deployment has occurred. Tests cover denial for guests, other users, an empty owner allowlist, invalid origins, and permitted owner actions using injected identity/storage doubles; the actual database pending, duplicate, publication of critical feedback, and rejection transitions also passed a Neon SQL transaction test, rolled back with zero test rows remaining. Live browser-to-hosted-API owner sign-in still requires an isolated review release and end-to-end verification.

Current verification: 38 automated tests pass; syntax/link checks pass. Database schema creation succeeded (four statements). A real SQL transaction verified pending status, retry deduplication, publishing a two-star critical review, and hiding it; ROLLBACK left zero test rows. Nothing has been deployed.

## Owner dashboard

`/owner/` contains the review-management link and a reserved area for future tools. `dist/owner-access.js` adds the Owner navigation tab only after `/api/owner` verifies the signed-in session against the server allowlist. The tab is removed on session changes. The static page contains no private records; all privileged endpoints must use `server/owner-access.js`. Unauthorized visitors see an access message and no tools.

To add an owner, verify their existing production Clerk account and add its user ID to the comma-separated `REVIEW_ADMIN_USER_IDS` production variable, preserving existing IDs. Redeploy for the new setting to take effect. Do not use client-provided email addresses as authorization. This same list controls reviews and the dashboard.
