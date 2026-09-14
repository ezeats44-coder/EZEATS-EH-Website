export default function handler(req,res) {
 res.setHeader('Cache-Control','no-store');
 const publishableKey=process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
 if(!publishableKey) return res.status(503).json({error:'Account service is not configured.'});
 res.status(200).json({publishableKey});
}
