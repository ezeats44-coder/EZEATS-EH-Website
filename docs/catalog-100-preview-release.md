# 100-recipe preview release

Release branch: codex/first-party-100. Catalog commit: 11054bc71f4f58de323bdc6b7ad7d4b6316f62cb. Clean isolated worktree based on b678b4b; only catalog, detail, test and required ingredient-screening/model changes are included. Original nearby-MVP working tree was not copied or modified.

Preflight: frozen pnpm 11.19.0 install; 136 tests passing, including all 100 complete records and picker mappings; 50 JS syntax checks plus generated-catalog, local link/asset and diff checks pass. All 82 tracked files screened for credential patterns with no matches. Pattern scanning is not proof that every possible secret format is detected.

Hosted providers are blocked in code. Public recipe submission, image upload and recipe-management HTTP endpoints are absent. Moderation schema remains a pure foundation; no Neon migration is required or applied. Vercel configuration and legacy hosting identity are unchanged. Production environment settings are read-only for this release.

Preview environment has development Clerk credentials but no review database or owner allowlist. Review storage must fail unavailable, and owner authorization must fail closed. Successful signed-in checks require a development-account browser session. Do not copy production database credentials or owner identities into preview to make checks pass.

Production rollback candidate at preflight: dpl_BDLtX4Zg1D26o6EsCFuBobzZZFkZ (recipe foundation b678b4b). Production must remain on that deployment. This preview is not approval to promote. Every recipe still needs owner review and kitchen testing as detailed in recipe-review-report.md.
