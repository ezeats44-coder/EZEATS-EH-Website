# EZEATS

A responsive food picker for people who cannot decide what to eat.

Choose a mood and dietary preferences, set a cooking-time limit, budget, spice tolerance, and preference for familiar or adventurous food, then get one meal with a plain-language explanation. Cycle through alternatives without repeats, or confirm your choice to see its ingredients.

## Run locally

Serve `dist` with any static HTTP server. For example:

```sh
python3 -m http.server 4173 --directory dist
```

Open http://localhost:4173. JavaScript modules require HTTP; do not open `index.html` directly as a file.

## Deployment

Live website: https://ezeats.vercel.app

This repository is connected to the existing `ezeats` Vercel project in the EZEats Eh team. The root `vercel.json` selects the static `dist` directory, skips installation/build commands, and enables automatic Git deployments. Pushes to `main` update production; pushes to other branches create preview deployments. No environment variables are required.

## How matching works

`dist/meals.js` contains 28 curated meal ideas. First, remove every meal that exceeds cooking time, estimated per-serving cost, or maximum heat, or fails any selected dietary preference. Rank the remainder by mood (up to 6 points), heat preference (up to 2), and familiarity preference (up to 2). Randomness breaks score ties only. Alternatives walk through the ranked list without repeating or silently relaxing limits.

Dietary tags apply to the exact listed ingredients, including specified gluten-free products and vegetarian cheeses. Costs and times are illustrative home-cooking estimates, not live grocery or restaurant prices. No live restaurant search, ordering, account system, or external AI service is used. Preferences stay in memory for the current page session.

## Files

- `dist/index.html`: page, first step, and explanation dialog
- `dist/styles.css`: responsive visual design
- `dist/app.js`: accessible UI, recommendation flow, and optional WebMCP integration
- `dist/meals.js`: meal catalog, preference validation, filtering, ranking, and explanations
- `dist/assets/grain-bowl.webp`: original AI-generated food inspiration image
- `vercel.json`: static hosting and automatic Git deployment configuration

## Validation

Verified all 5,184 allowed preference combinations for dietary, time, budget, and heat limits; non-repeating results; descending preference rank; and invalid-input handling. JavaScript syntax and local asset references were checked. Browser interaction testing was not requested. Optional WebMCP registration is feature-detected; a supported browser context was unavailable for live WebMCP validation.

Vercel documentation: https://vercel.com/docs/git and https://vercel.com/docs/project-configuration/vercel-json

## Recipe catalog preview

See [recipe catalog](docs/recipe-catalog.md) and [preview audit](docs/recipe-preview-audit.md). First-party meal details are available after selection. Missing authored quantities and instructions stay unknown. TheMealDB is local-development-only; submissions, uploads and recipe moderation routes are disabled.
