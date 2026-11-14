# Feedback retention and controlled release — proposed, pending Owner approval

Draft disclosure is /feedback/privacy/ and is not yet published in the Production privacy policy. Owner must approve practical review deadlines before deployment: inactive open conversations 12 months; closed/archived content 90 days; verified deletion request review 30 days; rate-limit bucket cleanup review 30 days; audit minimization review 12 months. Retry receipts live with their conversation to preserve retry guarantees. Exceptions require a private documented reason and new review date. Do not promise automatic erasure.

## Operations required before Production

Assign an authorized Owner to conduct monthly retention reviews and maintain a restricted deletion/exception register outside public content. Do not store sensitive message copies in that register. Record only necessary opaque identifiers, decision, reason, date and next review date. No automated scheduling or external tracking is activated by this draft.

For verified deletion/account-deletion requests: verify identity using existing account support procedures; identify associated Feedback, minimize/remove account links and messages as appropriate; handle foreign keys/receipts/audit consistently in an approved transaction using an administrative maintenance connection, never by broadening the web runtime's DELETE permissions. Obtain explicit approval for destructive operations. Record the decision so it can be reapplied following a restore. Review separately retained recovery branches and actual provider backup expiry before describing copies as gone. No deletion is performed by this change.

## Test-only release switch

FEEDBACK_ENABLED=true is the master switch. FEEDBACK_ACCESS_MODE=test (also the default when unset) allows only server-verified Owners or exact verified Clerk IDs in FEEDBACK_TEST_USER_IDS. Invalid modes deny everyone. Missing/empty test IDs deny all non-Owners. Emails, contributor roles, query/body IDs and browser flags never grant access. FEEDBACK_ACCESS_MODE=signed-in explicitly opens to all authenticated users after controlled smoke tests. FEEDBACK_ENABLED=false disables the API even for Owners.

The access discovery endpoint GET /api/feedback?access=1 returns only {available:boolean} after authentication, without database access or exposing allowlist contents. Shared navigation and the Owner Feedback card hide when unavailable. Direct API requests enforce the same gate; hiding links is not authorization.

Use separate development Clerk IDs for Preview and production Clerk IDs for Production. Never copy test identities between Clerk instances by email assumptions. Changing Vercel environment variables requires a new deployment of the same tested source for the changes to apply. Controlled Production sequence: deploy same tested commit with test mode and approved Production test IDs; run complete smoke test; archive fixtures; build same commit with signed-in mode only after all release gates pass. Roll back application or deploy master switch off on failure while retaining private records.

## Policy publication gate

Preview serves a clearly marked draft. After approval, incorporate the approved wording into /privacy/, update the policy date, and change Feedback links to the published section. Re-run tests and verify that final Preview candidate before Production. Approval of the engineering implementation does not silently approve a retention period or publish this draft.

## Approval recorded — November 14, 2026

The user approved the draft and proposed review deadlines in chat. The approved text is now incorporated into /privacy/#private-feedback on the final Preview candidate; this does not mean Production has been deployed. The same candidate must pass remaining restricted-account checks and Production recovery/migration preflight.
