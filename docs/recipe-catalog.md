# Recipe catalog phase one

Local development only. No deployment, provider account, paid subscription, production credential, tracking, or database migration is part of this phase.

## Existing behavior and ownership

EZEATS is static HTML/CSS/browser ES modules, with Node 24 Vercel functions. `dist/meals.js` remains the single source of 28 first-party meal ideas. The legacy picker IDs, hard limits, profile exclusion checks, ranking, history, account eligibility, guest flow and nearby work remain in place. `dist/app.js` adds a detail link after acceptance. `dist/profile-matching.js` exports its existing known-allergen map without changing its filtering behavior.

The local provider wraps each meal as `ezeats:<legacy-id>`. It does not claim the meal ideas are complete recipes: quantities, servings, preparation/cooking split, difficulty, meal-type classification, instructions, images and verification dates are unknown where absent. Total time and cost remain explicitly illustrative estimates. Authoring and kitchen-verifying full recipes is a separate content task. No fabricated directions, food-safety temperatures, nutrition or quantities are generated.

Third-party results use separate namespaces. They never replace or enter the 28-meal picker or its history. The recipe UI and catalog consume normalized records, not TheMealDB field names. Existing picker-specific scoring fields remain a compatibility layer; expanding picker ranking to provider recipes requires an explicit later integration and safety review.

## Recipe v1 schema

| Field | Meaning |
| --- | --- |
| schemaVersion | 1 |
| id | Stable provider namespace plus source identity, e.g. `ezeats:chickpea-bowl`, `themealdb:52772` |
| title, description | Title required; description nullable |
| servings | Positive number or null |
| time | preparationMinutes, cookingMinutes, totalMinutes: positive numbers or null; estimated boolean |
| ingredients | Array of `{quantity: string|null, unit: string|null, name: string, notes: string|null}` |
| instructions | Ordered `{order: 1-based integer, text: string}` entries, or null when unavailable |
| cuisine, difficulty | String or null |
| mealTypes, dietTags | Arrays; empty means no supplied classification, never proof of safety |
| knownAllergens | Known warnings; empty does not mean allergen-free |
| estimatedCost | `{amount, currency, basis, estimated}` or null |
| imageUrl | HTTPS URL or null; detail page deliberately does not load external images in this phase |
| source | provider, originalUrl (nullable), optional providerUrl, attribution, licensingStatus, verifiedAt (nullable), ownership (`first-party` or `third-party`) |
| suitability | status (`unverified` in current adapters), ingredientsComplete, allergensComplete, dietEvidence, notes |

Null is unknown, not zero. Lists do not imply completeness. Retrieval is not verification. Raw provider fields and credentials do not cross the API boundary. Invalid identity, attribution, ingredient structures or step ordering fail validation. Duplicate IDs are deduplicated without generating unstable replacements. UI text uses textContent and external links accept HTTPS only.

## RecipeProvider interface and API

`server/recipes/provider.js` documents the interface: namespace, async search({q,limit},{signal}), async getById(namespacedId,{signal}), normalize(raw). Search returns normalized records; retrieval returns one or null. Adapters own upstream fields. `catalog.js` validates results, namespaces, deduplicates, applies restrictions and limits, and aborts/times out after four seconds. No failed provider silently falls back to different recipes.

`GET /api/recipes`: optional provider (`ezeats` default), q (maximum 80 characters), limit (1–28, default 12), diets, allergens, exclude (comma-separated, maximum ten entries of 60 characters each). Unknown/duplicate parameters and unsupported enums fail with 400. `id` retrieves one normalized recipe and cannot be combined with q; namespace and provider must match. Detail result shape `{recipe}`, search `{recipes}`. Empty search returns 200/empty array; missing or excluded detail returns 404; disabled adapter 403; rate limit 429; upstream/malformed/timeout 503. Unsupported methods return 405. No account required.

Responses use private/no-store. Only search text or source ID goes upstream, never account identifiers, profile fields, location, or restriction lists. Provider URLs are fixed official endpoints, not user-controlled URLs. The upstream response is streamed with a 1 MB ceiling, at most 100 records inspected and no redirects. No bulk/list/random endpoints or background downloads.

A per-process global request budget permits 60 requests/minute without recording IPs or device IDs. This protects one warm instance, not a distributed production quota or billing cap. A shared limiter, provider concurrency budget, operational limits and denial-of-service assessment are required before live provider rollout. Search restrictions in a query string may appear in ordinary hosting logs; a future account-aware catalog should use a private server-side profile merge or non-logged body and an explicit privacy review before connecting saved sensitive answers.

## Restrictions and suitability

Recipe categories never establish diet/allergen compatibility. TheMealDB normalizer assigns no diet claims from its category field and marks ingredient/allergen completeness false. Recipe searches with allergy or ingredient exclusions fail closed when evidence is incomplete; diet constraints require explicit evidence and matching tags. No exclusion is relaxed to fill results. Current first-party tags retain the existing meal idea labels, but ingredient lists are not exhaustive and allergy completeness is false. Known allergens from the existing map remain visible as warnings. This stricter catalog screening does not silently alter the existing picker algorithm.

Detail lookup is an informational view, not a fresh personalized recommendation. It labels suitability unverified and does not claim to have checked a user's account. The first-party link comes from the already-filtered picker selection. Provider detail URLs are local development diagnostics only and must not be presented as personalized matches.

## Environment and local testing

Default: no provider key or recipe environment variable required. `pnpm dev` serves port 4175; guest recipes work with no Clerk credentials. `GET /api/recipes?id=ezeats:chickpea-bowl` and `/recipe/?id=ezeats:chickpea-bowl` exercise the owned provider.

Opt in only on localhost with `RECIPE_THEMEALDB_DEV=1 node scripts/dev.mjs`. The handler also requires a loopback Host and refuses TheMealDB whenever VERCEL, VERCEL_ENV or NODE_ENV=production is set. This flag cannot activate a hosted preview or production deployment. The server uses only the official development test key 1; there is no production-key configuration. Do not place provider keys in dist, public variables, URLs returned to clients or committed files.

Example development search: `/api/recipes?provider=themealdb&q=Arrabiata`. Detail example: `/recipe/?id=themealdb:52772`. No browser catalog-search screen is added yet. Tests use synthetic fixtures (not copied recipes). A bounded official lookup was tested successfully; third-party payloads are not persisted. Browser response memory and normal developer inspection are transient, not an application content store.

## Provider rights and decisions

Official documentation reviewed September 17, 2026:

- TheMealDB [API documentation](https://www.themealdb.com/api.php), [guide](https://www.themealdb.com/docs_api_guide.php) and [terms](https://www.themealdb.com/terms_of_use.php): key 1 is for development/educational use. Public app-store releases need paid support; production guidance calls for a supporter key. API content and artwork have attribution and rights conditions; third-party owner permissions may still be needed. This adapter labels all content development-only and all rights unverified. It preserves source links, identifies TheMealDB, and does not assume a CC flag licenses every component. No third-party images, instructions or nutrition are permanently stored.
- Edamam [recipe API](https://developer.edamam.com/edamam-recipe-api) and [documentation](https://developer.edamam.com/edamam-docs-recipe-api): web-recipe access provides source links, not cooking instructions; Edamam does not hold those web recipe copyrights. Fully licensed content with instructions is a separate commercial option. Caching is generally prohibited except explicitly permitted fields and uses under an applicable plan; neither access nor a paid subscription automatically authorizes a copied catalog or model training.

| Option | Detail experience | Production decision |
| --- | --- | --- |
| EZEATS owned | Owned meal ideas now; original full recipes can be authored and verified | Review authored quantities/steps, evidence, imagery and licensing |
| TheMealDB development | Ingredients/instructions where supplied; uncertain serving/time/allergens | Obtain permitted production access, confirm commercial and third-party rights, attribution and storage policy before enabling |
| Edamam web | Normalized metadata and source link; instructions unavailable | Choose authorized plan and source-link experience; never scrape publisher instructions |
| Edamam licensed | Instructions and licensed assets if agreement grants them | Explicit approval of costs/contract, credential scope, permitted display/retention and restrictions |

Before production: owner chooses provider and budget; approve required paid account or agreement; verify usage and content rights with provider; obtain server-only restricted credentials; implement distributed quotas and failure monitoring without new tracking; review privacy/logging; obtain ingredient/allergen evidence for any claimed suitability; test guest and signed-in hard-constraint merges, desktop/mobile and provider outage behavior; approve deployment separately. No such purchase, activation, agreement or deployment is authorized by this phase.

## Validation

Baseline: 39 tests and 43 JavaScript syntax/link checks passed before edits. New tests cover owned catalog identity/count, normalization, malformed fields/payloads, unavailable instructions, missing source URL versus required attribution, hard exclusions, timeout/abort/failure, empty results, duplicate IDs, request validation, rate-limit reset, hosted-provider denial and real guest local HTTP endpoints. Existing exhaustive picker, profile, history, nearby and review tests remain included. This static project has no build, dedicated linter, or TypeScript compiler script; `pnpm check` is the available syntax/link validation.

Final verification: 46 tests passed; 51 JavaScript files passed syntax checks and HTML links/assets validated; git diff whitespace checks passed. Browser: guest Stay in → default choices → recommendation → That's the one → View recipe details; owned unavailable-instructions state and live development-provider six-step instructions; desktop 1280px and phone 390px, no phone horizontal overflow, no recipe console errors. The localhost homepage reports unavailable Clerk configuration when run without credentials (expected pre-existing guest fallback). No production sign-in or deployment was attempted. Development provider server was used only for this test and should not be exposed publicly.

## Future user recipes and moderation foundation

Implemented as unmounted service boundaries in `server/recipes/moderation/`. No submission form, uploads, management HTTP route, persistence adapter, contributor registration, or recipe collection is enabled. `schema.sql` is a proposed initial PostgreSQL migration, **not applied to Neon or any database**. Existing customer-review tables and APIs are unchanged. This relational envelope wraps Recipe v1, so future contributor records do not require changing the recipe content model or replacing provider adapters.

### Record, revision, evidence and audit schema

- `recipe_records`: stable namespaced identity, origin (`ezeats-owned`, `licensed-provider`, `user-submitted`), provider, private submitting account, timestamps, public revision pointer, optimistic lock counter, removal actor/date.
- `recipe_revisions`: immutable content snapshots with increasing version and parent version; normalized Recipe v1 payload; original author name/source link; private submitting account; public attribution; copyright/source attestation; image rights; suitability evidence; duplicate-candidate fingerprint; lifecycle status; submission, review, approval, publication, update and creation dates; reviewing administrator. Missing dates remain null.
- Statuses: draft, pending, changes-requested, approved, rejected, published. Removal is separate record-level tombstoning, preserving the audit trail and immediately clearing the public pointer. Previously published snapshots retain their history but only the current public pointer is served.
- `recipe_moderation_events`: append-only action, revision, authenticated actor, timestamp and **private** moderation notes. Request-changes/rejection require a reason. Publication approval does not erase previous decisions.
- `recipe_reports`: references a specific recipe revision, private reporter and report details, pending/reviewed/dismissed/actioned state, reviewing administrator/date. No public reporting endpoint exists yet.
- Attestation: confirmed, basis (unknown/original-work/permission/licensed), statement, attesting account/date, license reference, storage permission. Original author and submitting account are distinct. Attesting/submitter IDs and timestamps must be set by the future trusted service, never accepted as identity claims from browser input.
- Image rights: ownership (unknown/author-owned/licensed/none), owner, license status (unknown/permission-confirmed/not-permitted/not-applicable), reference and required attribution. An image URL alone is not an ownership grant. Images remain disabled for uploads.
- Diet, allergens, and food-safety evidence independently record claimed/verified/unknown, claim text, verification basis, verifier and date. Verified requires recorded evidence; it never means a universal safety guarantee. Public projections keep suitability unverified and hard-filter evidence flags false pending a separately reviewed evidence policy. Moderation approval does not promote a user claim into verified suitability.

### Immutable revisions and publication

`service.js` implements pure transitions, not storage: create draft → submit pending → approve → publish (or approve-and-publish). Request changes and reject are supported with private notes. Resubmission appends a new pending revision. Every edit appends a snapshot; editing published v1 produces pending v2 while `publishedVersion=1` remains public. Rejecting v2 or requesting changes does not hide v1. Publishing the latest approved revision atomically changes the pointer. A stale lock version or moderation of a superseded candidate is rejected. Removing a record clears publication and retains private history; restoration needs a future explicit workflow.

The future persistence adapter must implement a single database transaction for compare-and-swap on lock_version, snapshot insert, moderation event insert and publication pointer update. It must enforce snapshot immutability at the database boundary and deny direct client credentials. Pure in-memory transforms alone are not a concurrency guarantee. `publishedRecipe` exposes only the normalized public recipe, public author name/attribution, origin, version and publication date; never submitter IDs, private notes, attestations, reports, or unpublished revisions. `compareRevisions` is a private workspace projection and returns both pending and published snapshots plus changed field names.

A content fingerprint supports candidate duplicate detection; it is not proof of copying and must not automatically reject legitimate similar recipes. Future detection should normalize units/ingredient variants and examine source IDs/URLs, while keeping decisions reviewable.

### Owner-tab workspace plan

Add a **Recipe catalog** card under the existing `/owner/` dashboard, linking to `/owner/recipes/`. Keep **Community reviews → Manage reviews** as its own tool and queue. No new card or active link is exposed in this phase.

Planned recipe workspace:

1. Pending queue with author, submission date, origin, current revision, and publication state. Filters for pending, changes-requested, approved, rejected, published, removed, and reported; bounded pagination.
2. Full recipe and provenance inspector with ingredients, steps, source, public attribution, copyright attestation, image rights and explicitly labeled suitability evidence. Private account/moderation details are owner-only.
3. Side-by-side pending versus public revision comparison, including rights/evidence changes. Show the exact revision being approved and require the current lock version.
4. Approve and publish, approve without publishing, request changes with private notes, reject, or remove. Removal withdraws the whole public recipe; rejection targets the candidate revision.
5. Reports queue linked to exact reported version, private reporter information, disposition and review history. Reports do not automatically expose reporter details or take down a recipe without a defined safety policy.
6. Immutable moderation timeline and current author, reviewer, dates, revision and publication status.

Every future recipe-management handler must use `createRecipeManagementBoundary` or an equivalent independently verified server boundary. It authenticates each call using Clerk and the server-side allowlist through `ownerIdentity`; it does not trust a visible Owner tab, client role, client email or earlier successful request. The current central list is `REVIEW_ADMIN_USER_IDS`, which already supports multiple owner/administrator Clerk IDs. Recipe-specific roles can later use a dedicated server allowlist without changing the recipe tables. No environment values or grants were changed in this phase. The boundary returns 501 after authorization until a trusted dispatch/persistence adapter is explicitly installed. It is intentionally not mounted in `api/`.

### Rollout and authorization gates

1. **Owner-created recipes:** authorize and apply the initial schema, implement transactional persistence and every-endpoint authorization, then enable a minimal creation workspace under Owner. Authors supply genuinely original or licensed content; do not auto-fill unverified steps. Complete backup, deletion, audit, restriction and publication tests before release.
2. **Invitation-only contributor beta:** explicit owner invitation and consent; contributor identity from verified session; server-side ownership checks for draft/read/edit/withdraw, bounded rate limits and invitation quotas. Contributor routes cannot call moderation actions. Any edited contributor content becomes pending. Contributors cannot set verified evidence, approver IDs, publication state or owner roles.
3. **Public account submissions:** separate explicit launch approval and privacy/legal review. Require account eligibility, rate limits shared across instances, plain-text validation/sanitization with safe rendering, payload caps, duplicate candidate detection, copyright/source confirmation, evidence ownership checks, food-safety notices, and moderation capacity. User-provided diet or allergy claims must be clearly labeled and never presented as safety guarantees.
4. **Owner-tab moderation:** ship the separate recipe queue, source inspector, pending/public comparison, author/dates and audit views. Validate unauthorized users against every endpoint, including list, detail, diff, reports and mutations. Invite contributors only after moderation is operational, even though public submission rollout is listed above.
5. **Changes requested through reporting:** deliver private change requests, revised pending submissions, approval, rejection, publication and removal with transactional version checking. Add report intake abuse controls, private handling, triage policy, appeals/restoration and retention/deletion procedures. Public recipes remain served from the approved publication pointer throughout.

Before image uploads: explicit activation approval, permitted storage provider and costs, signed limited uploads, size/type limits, metadata stripping, malware/content screening, ownership/license attestation, safe derivatives and takedown handling. No upload credentials, buckets or endpoints are created now. Before provider content persistence: written plan-specific permission covering instructions, images and nutrition, retention limits and attribution; no third-party data is migrated automatically.

Future privacy disclosures must explain public author attribution versus private submitting account/moderation/report data, retention, deletion and backups, user support, and moderation access. Food-safety warnings must explain ingredient brands, substitutions, cross-contact and the limits of dietary claims. Rate limits, ownership verification and safe plain-text ingestion are launch blockers, not features implied by this schema-only phase.

### Foundation verification

50 automated tests pass, including all previous picker/catalog/profile/review regressions. Moderation tests verify published-v1 preservation during pending edits/change requests/rejection, replacement after publication, removal, private-data projection, stale-lock conflicts, superseded revision denial, missing copyright/image rights, unknown/claimed evidence, plain-text rejection, per-request authentication, multiple allowlist entries and disabled dispatch. SQL is a reviewed design artifact and has not been executed or database-tested. No new browser flow exists in this phase.
