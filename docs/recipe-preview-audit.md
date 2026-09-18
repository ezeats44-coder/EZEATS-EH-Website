# Recipe preview audit

## Scope and actual completion

Base: production commit 5e74863, retaining existing account, recommendation/history, customer reviews and owner dashboard. Recipe-only changes are added; unrelated nearby Colorado Springs MVP and experimental preference/history changes are excluded and preserved in the original working directory.

Implemented: normalized Recipe v1, provider interface, 28-entry first-party adapter, parameter validation, per-process request limit, provider timeout/response bounds, first-party detail view after meal acceptance, local-only TheMealDB adapter, provenance/rights labels, fail-closed unknown restrictions, and tests/documentation.

Not complete recipes: owned entries have ingredient names and estimated total time/cost, but no authored servings, quantities or ordered instructions. Details explicitly show these as unavailable. Ordered-step rendering works when a development fixture/provider supplies steps; preview contains no such third-party content. Do not describe all 28 entries as fully specified recipes.

Moderation implemented as pure schema/lifecycle/public-projection/authentication boundaries and tests only. SQL migration remains unapplied. No recipe management API, public submission form, reports intake, upload system or recipe creation tool exists. Owner dashboard and customer-review moderation are existing features, not new recipe moderation tools.

## Checks before deployment

Pinned pnpm 11.19.0 and frozen lockfile installation succeeded. Full working repository: 50 tests, 55 JS syntax/link checks. Isolated preview: 30 tests, 44 JS syntax/link checks. Tests excluded from the preview belong to unrelated unshipped MVP work. git diff --check passed. Scan of tracked/release text for private keys, Clerk secret values, GitHub tokens and database URLs found no matches. This is pattern screening, not a guarantee of detection. Existing ignored local environments and sources are excluded.

All 28 normalized recipes have attribution, first-party provenance, licensing status and unverified suitability; unknown dates/quantities remain null. No public privileged recipe routes exist. Future management boundary independently authenticates each request; tests cover denied guests, denied non-owners, stale revisions and private-field protection.

Vercel configuration is unchanged. Legacy .openai/hosting.json in the original workspace is untouched. No production data or domain changes are needed or authorized. No migration is needed for first-party read-only recipes.

## Preview environment

Existing preview Clerk key pair is configured. No DATABASE_URL or REVIEW_ADMIN_USER_IDS exists in preview, so customer review storage is unavailable and owner access fails closed. Do not copy production credentials to resolve this. Separate authorized test data and a verified test-owner identity are needed for full reviews/owner verification.

RECIPE_THEMEALDB_DEV unset; TheMealDB is blocked on all Vercel environments even if set. First-party recipes only. Public submissions, recipe moderation dispatch, uploads and tracking disabled. No paid provider or credential activated.

## Production blockers

- Author and verify full local recipe quantities, servings and steps before marketing them as complete cooking recipes.
- Complete real authenticated browser checks of sign-in, saved preferences/history and owner visibility in an authorized test environment.
- Provision or authorize an isolated review test store and owner allowlist before preview review-write tests; do not reuse production database credentials.
- Complete separate provider licensing/credential/attribution and distributed quota decisions before any hosted external recipe provider.
- Apply and test a separately approved recipe schema and transactional adapter, ownership checks, shared limits, contributor privacy/copyright/safety controls before enabling recipe submissions/moderation.
- Review preview results and obtain explicit production deployment approval. This release is preview-only.
