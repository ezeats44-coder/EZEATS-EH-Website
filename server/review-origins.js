export function reviewOrigins(){return ['https://www.ezeats-eh.com','https://ezeats-eh.com','https://ezeats.vercel.app',...(process.env.VERCEL_URL?[`https://${process.env.VERCEL_URL}`]:[])];}
