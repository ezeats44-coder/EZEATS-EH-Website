# Audit remediation — 2026-09-29

Base: production d1e4dec507848126d026b653dc659e9032b5dcca. Isolated branch codex/audit-remediation; nearby MVP checkout remains untouched.

## Prepared, not deployed

- Vercel builds run the complete test and catalog/link/syntax checks before serving output. Development test dependencies are explicitly installed.
- GitHub validation workflow runs with declared pnpm 11.19.0 and Node 24. Branch protection still requires repository administrator configuration; the Vercel build gate independently prevents invalid artifacts becoming Ready.
- Profile endpoint bounds actual UTF-8 payload size, including missing/incorrect Content-Length.
- Browser headers deny framing and object embedding and restrict base URLs. Camera, microphone and payment are disabled; geolocation is intentionally unaffected. This is a minimal CSP, not a complete script-source allowlist.
- Account-service outages no longer imply a guest has saved preferences. Signed-in profile failures retain their existing warning.

Validation: 180 tests pass; 100 recipe mappings pass; 75 JS files and local HTML links/assets pass; git diff --check passes. Browser and hosted release verification remain required. Local fallback pnpm was 11.25.0, so exact pinned-version reproduction is not claimed.

## Immediate external blocker

Registry RDAP confirms clientHold on ezeats-eh.com, expires 2027-09-11, Squarespace nameservers. DNS returns NXDOMAIN for apex, www and Clerk host. Squarespace UI says Active without a visible suspension notice. Hold date is 15 days after registration; contact-email verification is a likely cause, not yet proven. User was asked to inspect the registrar verification email. No DNS or registrar settings changed.

## Still outstanding

- Remove registrar hold and verify fresh production sign-in, owner/contributor authorization, all aliases and Clerk DNS.
- Owner-controlled MFA setup on hosting/registrar accounts.
- Shared profile/rate-limit protections and concurrency-safe history design; avoid claiming process-local locks solve distributed concurrency.
- Redacted diagnostic logging, retention/deletion/recovery runbooks and verification. No destructive cleanup is authorized by this document.
- Recipe owner review and kitchen testing require actual human/physical review; no recipe has been relabeled tested.
- Canada allergen/currency coverage, SEO, performance and broader accessibility follow-up from the audit.
- Deploy only a reviewed isolated commit after browser checks; do not include nearby MVP, contributor experiments or secret values.
