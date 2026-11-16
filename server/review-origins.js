import {PRODUCTION_ORIGINS} from '../dist/site-config.js';
export function reviewOrigins(){return [...PRODUCTION_ORIGINS,...(process.env.VERCEL_URL?[`https://${process.env.VERCEL_URL}`]:[])];}
