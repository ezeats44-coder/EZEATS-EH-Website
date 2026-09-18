# Original EZEATS catalog: 100 recipes

## Scope and release isolation

Branch `codex/first-party-100`, based on the inspected recipe foundation commit `b678b4baf4ce2529b692adf89ed8cf105f3e40eb`. The primary checkout contained unfinished nearby-provider, events/history and preference changes. Work was performed in a separate worktree without copying those changes. All 28 legacy IDs remain; 72 new IDs bring the catalog to exactly 100. No push, deployment, credentials change, hosted provider request, upload, tracking activation or migration is part of this work.

## Ownership and editorial status

Recipe titles, descriptions and directions were originally authored for EZEATS in this task, not imported from recipe websites. Official sources were consulted only for food-safety guidance. Every recipe has first-party attribution and reserved reuse rights; no third-party license or photograph is claimed. Images are null. This is original AI-assisted editorial content, subject to owner review; it does not assert exclusive copyright protection over generic cooking methods or facts.

Each normalized record has `editorial.status=editorially-reviewed-draft`, review date 2026-09-18, `ownerReviewRequired=true`, and `kitchenTested=false`. Ingredient/step coverage and internal consistency have been reviewed, not tested in a kitchen. `source.verifiedAt` remains null and `suitability.status` remains unverified. Owner review and kitchen testing are explicit per-ID columns in [recipe-review-report.md](recipe-review-report.md).

## Data flow and future compatibility

Original definitions and ingredient evidence live under `server/recipes/owned/`. Each instruction references its specified ingredients through internal `@ingredientKey` markers. Compilation rejects missing/unused references and produces ordinary Recipe v1 strings: markers and internal traits are not public API fields. No procedural template assembles recipe cooking steps; each recipe has authored instructions.

`pnpm catalog:generate` derives lightweight browser summaries and the review report. The browser loads 100 names, classifications, estimates, ingredient names and allergen warnings, not the full instructions/quantities. `dist/meals.js` retains the existing ranking/filtering implementation. Profile filtering reads the same generated ingredient warnings; known dietary exclusions remain hard filters and additional free-text allergy details still pause recommendations. Fish-dislike matching now also recognizes cod, trout and sardines. IDs continue to work with existing saved meal-history records.

The local RecipeProvider returns normalized full records; `/api/recipes` accepts up to 100 results, still with bounded queries, timeouts, fail-closed restrictions and request limits. Full content is server-local data, not a new database. Third-party normalization still supports unknown values. Optional `editorial` and `safety` fields preserve the provider-neutral model; no provider-specific fields leak to the browser. Non-cooking recipes use `cookingMinutes=0`, distinct from unknown/null.

The existing recipe record/revision/moderation envelope can store these normalized payloads without restructuring. No recipe moderation route, owner creation form or public submission form was added; the proposed SQL remains unapplied. Customer-review moderation and its store are untouched.

## Measurements, timing, heat and cost

Familiar cup/tablespoon/teaspoon measures are used, with 240/15/5 mL guidance on every owned detail page and gram equivalents for weighed portions. Canned beans are measured drained; rice/pasta state dry versus cooked; seafood/meat start thawed. Produce sizes are given with weights where they strongly affect cooking. Extra process water is explicitly measured, including boiling water that is drained. Oven settings are conventional, not fan-assisted. Times include estimated preparation plus cooking/rest; parallel tasks are described and longer timings replace optimistic legacy estimates where needed.

All recipes fit one of the existing picker limits up to 60 minutes. Times are editorial estimates, not measurements; temperature and tenderness checks take precedence. Heat is a conservative 0/1/2 preference band; brands and fresh chilies vary. Costs are deliberately rounded USD per-serving ingredient budgets, not verified market quotations, checkout totals or CAD conversions. They assume standard grocery ingredients and pantry portions, not the cost of buying every package from scratch. Owner review should validate prices and serving adequacy in the intended US and Canadian markets. Side/snack recipes identify that role instead of promising a full dinner.

## Dietary and allergen screening

Tags are derived from a controlled ingredient-evidence registry, with independent tests for meat, fish, eggs, dairy, honey and gluten-containing grains. Vegetarian cheese must use microbial/vegetarian rennet. Vegan kimchi excludes fish and shrimp; tamari, rice noodles, broth, blends and corn tortillas specify gluten-free products. Every packaged ingredient prompts label checking. Major known allergens include mustard for Canadian users; conservative product-dependent bun/curry/soup warnings may exclude more recipes rather than silently relax restrictions.

`ingredientsComplete`, `allergensComplete` and `dietEvidence` mean coverage of the stated recipe specifications only, not brand verification or medical safety. Substitutions, unexpected package ingredients, allergen traces and shared equipment can invalidate screening. The UI expressly disclaims allergy-safe and cross-contact guarantees. A person with an allergy must check products and handling; editorial or moderation approval never establishes universal suitability.

## Official food-safety review

References checked 2026-09-18:

- [USDA FSIS minimum cooking temperatures](https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart). Direct retrieval was blocked by the site; its indexed official table was inspected.
- [Health Canada safe cooking temperatures](https://www.canada.ca/en/health-canada/services/general-food-safety-tips/safe-internal-cooking-temperatures.html).
- [USDA washing and handling guidance](https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/washing-food-does-it-promote-food).
- [USDA leftovers and food safety](https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/leftovers-and-food-safety).

The catalog uses the higher applicable published target where these jurisdictions differ: poultry pieces/ground turkey 74°C/165°F; ground beef 71°C/160°F; fish 70°C/158°F; shrimp and egg dishes 74°C/165°F. The intact sirloin recipe uses 63°C/145°F plus a 3-minute rest. No whole poultry or pork recipe is included. These are minimum temperature targets, not guaranteed times. Each relevant cooking step contains a thermometer target. Handling notes cover separation, handwashing, refrigerator thawing, no raw meat/poultry rinsing and raw-egg tools. Leftovers require prompt refrigeration in shallow containers and reheating to 74°C/165°F.

## Before preview deployment

1. Owner reviews all 100 report rows and full ingredient/step records; prioritize raw proteins, eggs, oven dishes, serving yield and budget estimates.
2. Conduct kitchen trials and correct texture, liquid ratios, heating time and portion assumptions. Keep the not-kitchen-tested disclosure until actual testing is recorded accurately.
3. Review product specifications and dietary/allergen warnings, especially processed breads, sauces, blends and broths; consider qualified food-safety review.
4. Inspect representative desktop/phone views and authorize a preview separately. This task does not push or deploy.

No new provider, payment, storage, privacy/retention change or recipe database migration is required for this first-party catalog preview. Public recipe submissions and moderation activation remain a separate project with their existing documented authorization and safety requirements.

## Local verification completed

- Frozen-lockfile install with pinned pnpm 11.19.0: passed, dependencies unchanged.
- `pnpm test`: 136 passed, zero failed/skipped, including one test for every recipe, all original regression suites, and 10,368 preference combinations.
- `pnpm check`: generated summaries/report match all 100 records; 50 JavaScript syntax checks and local HTML link/asset validation passed. `git diff --check` passed. This static project has no separate build, TypeScript or linter command.
- Local HTTP: 100-record search returns 200; unmatched search returns an empty array; missing ID returns 404; disabled TheMealDB returns 403. Provider failure/timeouts remain covered by the test suite.
- Browser: guest home picker → select Tomato shrimp pasta → recipe details succeeded. Quantified ingredients, four ordered instructions, safety notes and attribution rendered. Original Avocado & egg toast and new 40-minute Roasted carrot & chickpea pita also rendered correctly.
- Visual inspection at 1280px desktop and 390px phone widths: readable two-column/one-column recipe content, no horizontal overflow at 390px. Keyboard focus reaches source links; missing-recipe recovery exposes a labeled Try again button. No recipe-page console warnings/errors observed.
- No local Clerk credentials were loaded. Fresh signed-in account flows were not repeated; account, preference, history, review and owner regression tests passed, and those service implementations were not changed. Local home uses its expected guest fallback when account configuration is absent.
- Automated ingredient-reference checks establish declared ingredient coverage, not culinary accuracy. Actual cooking time, taste, texture, yield, price and cross-contact remain unverified. Owner and kitchen review are still required for every row.
