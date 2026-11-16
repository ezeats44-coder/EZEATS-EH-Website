# Domain migration preparation

Prepared on 2026-11-15 from production commit 5f4c2a8f38fb475c43c6a8343248d8eae20f5487, in isolated branch `codex/domain-ezeatseh`.

The primary public URL is now configured once in `dist/site-config.js` as https://www.ezeatseh.com. Build-time metadata, browser recipe canonical links, first-party recipe source links, server origin checks and existing analytics host filtering use it. Both old-domain origins and ezeats.vercel.app remain supported. No redirect was added, and no hosting, authentication, database or environment setting was changed.

Generated recipe pages, the four public pages, sitemap and robots use the new canonical URL. Recipe content and stable IDs remain unchanged. Relative account and settings navigation remains unchanged. Existing analytics privacy restrictions remain intact.

## Audit scope and retained references

The pre-edit tracked-file inventory contains 443 old-domain occurrences on 137 lines across 119 files, including 100 generated recipe pages. See the accompanying old-domain-inventory.json for every original file and line. Old origin fixtures in tests are deliberately retained to verify compatibility. The legacy-origin list is deliberate. Historical domain mentions in documentation and privacy introductory text identify the transition, not redirects or canonical URLs. Read-only sources and unrelated development work were not edited.

No metadataBase, web manifest, implemented webhook route or domain-specific CSP was found in this release. CSP remains unchanged. Server origin checks cover authenticated APIs rather than adding permissive CORS. This does not establish what external provider dashboards may contain.

## Vercel environment changes to make manually at cutover

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: when changing Clerk's production primary domain, replace with the new production publishable key that Clerk generates. Do not display it in a report or use a development key.
- `CLERK_SECRET_KEY`: retain the current secret; do not rotate or replace merely because the site address changes. Follow Clerk's instance-specific instructions if they require otherwise.
- No `SITE_URL`, `APP_URL`, `NEXT_PUBLIC_SITE_URL` or Clerk redirect URL environment variables are required by this implementation or were listed in the inspected environment metadata.
- Do not manually set Vercel-managed `VERCEL_URL` or `VERCEL_ENV`.
- Database credentials, owner IDs, Feedback settings and contributor settings require no domain-related changes.

Encrypted/secret environment values were not decrypted or printed; therefore their contents cannot be certified free of old-domain references. Review any additional externally managed URL settings privately before cutover.

## Manual cutover checklist — not performed

1. Add and verify the new apex and www domains in the existing Vercel project; configure DNS/TLS. Keep the old domains attached. Configure any eventual old-domain redirect through Vercel only.
2. Coordinate Clerk production domain change, its DNS records and SSL certificates. Update the publishable key in Production only after obtaining the new production value. The application allowlist preserves old-domain support, but Clerk cross-domain session compatibility still requires real verification; do not assume existing sessions transfer.
3. Google: review authorized domains, branding homepage/privacy links, JavaScript origins where used, and exact Clerk-provided OAuth redirect URIs. Retain old callback entries during transition where supported.
4. Apple: review Service ID web domains and exact return URLs supplied by Clerk. Do not replace keys or identifiers blindly. Review private email relay sender registration and DNS if the sending domain changes.
5. Review any externally configured Clerk/webhook endpoints, JWT issuer/JWKS integrations and email links. No outbound email implementation or webhook endpoint was found in this release. The existing Gmail contact address is unchanged.
6. Before approved deployment, verify fresh Apple, Google and email sign-in, callbacks, sign-out, Settings, Owner authorization and private Feedback on both domains. Verify canonical URLs, recipe links and HTTPS. Record a rollback deployment and preserve old domain/provider configuration until acceptance.
7. Push, merge and deployment remain pending separate authorization. These code changes alone do not connect the new domain.

Official guidance: [Clerk domain migration](https://clerk.com/docs/guides/development/deployment/changing-domains), [Google OAuth web applications](https://developers.google.com/identity/protocols/oauth2/web-server), [Apple Sign in with Apple for the web](https://developer.apple.com/help/account/capabilities/configure-sign-in-with-apple-for-the-web/).
