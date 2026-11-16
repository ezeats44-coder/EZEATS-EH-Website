// Public, non-secret deployment identity. Keep old origins during the domain transition.
export const SITE_URL = 'https://www.ezeatseh.com';
export const LEGACY_SITE_ORIGINS = Object.freeze(['https://www.ezeats-eh.com', 'https://ezeats-eh.com']);
export const PRODUCTION_ORIGINS = Object.freeze([SITE_URL, 'https://ezeatseh.com', ...LEGACY_SITE_ORIGINS, 'https://ezeats.vercel.app']);
export const PRODUCTION_HOSTS = Object.freeze(PRODUCTION_ORIGINS.map(origin => new URL(origin).hostname));
