# EZEATS operations and recovery

## Release gate

Use an isolated production-based branch; never the unfinished nearby-MVP checkout. Pin Node 24 and pnpm 11.19.0, frozen install, run tests/check and diff validation, scan tracked source for secrets, verify exactly 100 original records remain unchanged, then browser-test the candidate. Vercel now fails its build on failed tests/checks. GitHub validation exists; repository-admin branch protection should require it. Do not claim branch protection is enabled without checking GitHub.

## Current data and credentials

Clerk retains profiles and recent choices; the existing recipe database supplies only a per-account `profile-api` rate counter and a transaction-scoped PostgreSQL advisory lock. Use the existing contributor migration and limited recipe runtime role. No migration is introduced. Profile coordination fails closed if unavailable. Concurrent saves, clears and preference writes are serialized before reading Clerk metadata. Clerk is a separate service: an ambiguous external timeout is not an atomic cross-service rollback; retry meal saves with their existing choice ID, and reload after an uncertain response.

API logs contain only a generated request ID, static route name, allowed method, status and duration. They intentionally omit bodies, full URLs, account identifiers, emails, tokens, recipe drafts, private notes and error messages. Errors and mutations are logged; normal reads are not analytics. Success moderation audit details remain in private append-only database records. Configure retention in the existing host, not a new tracking service. Review failed requests and repeated 401/403/429/503 responses before inviting more contributors.

## Retention/deletion procedure — operator action required

The privacy policy's retention periods require manual review; this document does not authorize deletion or assert an automatic purge exists. Monthly, inspect aggregate counts and identify withdrawals/deleted-account cases privately as an authorized owner. Confirm applicable withdrawal/deletion dates and policy before a maintenance change. Use account-deleted reconciliation to revoke access after confirming Clerk deletion. Preserve published recipe attribution under the existing contributor permission/removal policy; do not silently withdraw a published recipe solely because a sign-in account was deleted.

Immutable recipe revisions and audit records cannot be updated/deleted by runtime. Any approved minimization must be designed as a separate reviewed administrator migration with a restore reference, scope, privacy-policy consistency, transaction, expected counts and tests. Never disable immutability guards or cascade-delete records as an ad hoc cleanup. Apply the documented 90-day unpublished-content and 12-month audit review periods; do not retain content indefinitely merely because the application lacks a purge button. Include backups/restore branches when scheduling expiry. Do not run destructive cleanup without explicit approval.

## Recovery drill

Before an approved schema change, record production deployment ID, source commit, migration checksums and non-sensitive baseline counts. Verify Neon recovery availability and retention in its dashboard. Use a time-limited isolated recovery branch only when it introduces no unapproved charge and production personal-data copying is explicitly approved. Run integrity and application checks using a least-privilege test connection. Record the result and expire the recovery copy through an approved cleanup. This release does not change schemas or perform a recovery drill.

## Application rollback

Recorded baseline: dpl_6v4EiwiHZGatLf495QbykUJPXYdH / d1e4dec507848126d026b653dc659e9032b5dcca. Recheck current deployment before release. If the new profile coordination or other critical behavior fails, restore that verified production deployment and verify all three aliases. Do not delete recipe tables, rate counters, reviews or owner-created data. The unchanged old app ignores the additional profile-api counter category. Align main with a reviewed revert; never reset unrelated work.

## Human-owned gates

Registrar verification resolved the September domain hold. Maintain renewal/contact verification and set up MFA on Squarespace, Vercel and source control using the owner's authenticator and securely stored recovery codes. The agent cannot attest to kitchen testing: all 100 recipes retain owner-review-required/not-kitchen-tested disclosures. Canada-specific allergy screening remains conservative; unsupported priority allergens pause suggestions. Costs are explicitly USD estimates, not CAD prices. These are separate review gates, not claims of a complete Canadian launch.
