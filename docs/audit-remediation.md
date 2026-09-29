# Audit remediation — 2026-09-29

Base: production d1e4dec507848126d026b653dc659e9032b5dcca. Isolated branch codex/audit-remediation; nearby MVP checkout remains untouched.

## Prepared, not deployed

- Vercel builds run the complete test and catalog/link/syntax checks before serving output. Development test dependencies are explicitly installed.
- GitHub validation workflow runs with declared pnpm 11.19.0 and Node 24. Branch protection still requires repository administrator configuration; the Vercel build gate independently prevents invalid artifacts becoming Ready.
- Profile endpoint bounds actual UTF-8 payload size, including missing/incorrect Content-Length.
- Browser headers deny framing and object embedding and restrict base URLs. Camera, microphone and payment are disabled; geolocation is intentionally unaffected. This is a minimal CSP, not a complete script-source allowlist.
- Account-service outages no longer imply a guest has saved preferences. Signed-in profile failures retain their existing warning.

Validation: 180 tests pass; 100 recipe mappings pass; 75 JS files and local HTML links/assets pass; git diff --check passes. Browser and hosted release verification remain required. Local fallback pnpm was 11.25.0, so exact pinned-version reproduction is not claimed.

## Domain recovered

The owner completed Squarespace contact verification. Independent DNS checks now resolve apex, www and Clerk; the registrar hold is gone. Production sign-in controls and recipe APIs load. No domain/DNS code workaround was introduced.

## Still outstanding

- Complete staged and post-release authenticated verification.
- Owner-controlled MFA setup on hosting/registrar accounts.
- Shared profile/rate-limit protections and concurrency-safe history design; avoid claiming process-local locks solve distributed concurrency.
- Redacted diagnostic logging, retention/deletion/recovery runbooks and verification. No destructive cleanup is authorized by this document.
- Recipe owner review and kitchen testing require actual human/physical review; no recipe has been relabeled tested.
- Canada allergen/currency coverage, SEO, performance and broader accessibility follow-up from the audit.
- Deploy only a reviewed isolated commit after browser checks; do not include nearby MVP, contributor experiments or secret values.

## Additional candidate fixes

- Shared profile-api counters and transaction-scoped advisory locks using the existing recipe database and contributor schema. No migration. Real SQL tests verify serialized concurrent saves and quota handling.
- Operational logs contain only static route, request ID, method, status and duration; no private request bodies, IDs or errors.
- Owned catalog reads no longer share a 60-request process-wide limiter; their public responses can use a 60-second CDN cache. Contributor responses remain private/no-store and retain overload protection.
- Mustard, sulphites and triticale selections pause recommendations until adequate ingredient evidence is available. No allergy safety guarantees.
- Static recipe pages, canonical metadata, sitemap and robots generated from the unchanged 100 records, with truthful Recipe JSON-LD and no invented photographs/ratings/nutrition.
- Keyboard skip links, textarea focus and global reduced-motion support.
- Runbook and contributor deployment documentation updated. No destructive retention purge was performed.
- Exact pnpm 11.19.0 frozen install and full suite now reproduced.

The first phone-width measurement occurred before CSS finished loading; after load the page width matches the 390-pixel viewport without horizontal overflow. No persistent overflow defect was found.
