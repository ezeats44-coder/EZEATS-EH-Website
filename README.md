# EZEATS

Static HTML/CSS/ES-module meal picker with Node 24 Vercel APIs for Clerk accounts, saved preferences/history, moderated customer reviews and owner access. The Staying In picker has 100 original EZEATS recipes, including all 28 stable legacy IDs. Every recipe is an editorially reviewed draft, **not kitchen-tested**; owner review is still required.

## Local development

Use Node 24 and pinned `pnpm@11.19.0`:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:4175. The local server provides the recipe API; a static-only server cannot load full recipe details. Guest recipes need no external credentials. Accounts require the existing Clerk environment; local reviews use `.local-data/`. Do not reuse production credentials for casual tests.

## Catalog authoring

- `server/recipes/owned/recipes.js`: original ingredient quantities and specific ordered directions.
- `server/recipes/owned/ingredients.js`: ingredient specifications, dietary evidence and allergen warnings.
- `server/recipes/owned/catalog.js`: normalization, editorial disclosure and handling guidance.
- `scripts/recipe-catalog.mjs`: generates lightweight `dist/meal-catalog.js` and the per-ID review report.
- `dist/meals.js`: unchanged validation/ranking logic consumes generated summaries; no full directions in the picker bundle.
- `api/recipes.js`: provider-neutral guest API. Full content is retrieved only when needed.

After an editorial change, run `pnpm catalog:generate`. Generated files are committed and `pnpm check` detects drift. No database migration is needed for first-party content.

## Validation

```sh
pnpm test
pnpm check
 git diff --check
```

Tests cover all 100 records, legacy IDs, one-to-one mapping, ingredient references, dietary/allergen consistency, safe cooking instructions, all 10,368 picker preference combinations, history/accounts/reviews/owner regressions, provider failures and moderation boundaries. `check` validates generated files, JavaScript syntax, HTML links and assets. There is no separate TypeScript compiler, formatter, linter or compiled build step.

## Hosting and boundaries

The existing `vercel.json` installs with the frozen lockfile, serves `dist`, and deploys Node API functions. Existing production configuration uses Clerk keys, `DATABASE_URL` for customer reviews, and `REVIEW_ADMIN_USER_IDS` for server-side owner authorization. Recipe data adds no external service. Production lives at https://www.ezeats-eh.com/; a push can trigger deployment, so do not push this catalog branch before review.

TheMealDB stays opt-in localhost development only. Public recipe submissions, image uploads, hosted recipe providers and recipe-management API routes remain disabled. The proposed moderation SQL remains unapplied. No new tracking or nearby-food MVP is included.

See [recipe architecture](docs/recipe-catalog.md), [100-recipe authoring and safety notes](docs/first-party-100.md), and [per-recipe review report](docs/recipe-review-report.md). The [previous preview audit](docs/recipe-preview-audit.md) is historical evidence for the earlier 28-meal foundation, not the current catalog's completion status.
