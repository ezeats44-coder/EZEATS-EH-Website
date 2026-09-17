import {createClerkClient} from '@clerk/backend';
import {createDatabaseReviewStore} from '../server/review-store.js';
import {reviewOrigins} from '../server/review-origins.js';
export function createModerationHandler({store,makeClient=createClerkClient,owners=()=>process.env.REVIEW_ADMIN_USER_IDS||''}={}){return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');
 if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Method not allowed.'});
 const origins=reviewOrigins();
 if(req.headers.origin&&!origins.includes(req.headers.origin))return res.status(403).json({error:'Origin not allowed.'});
 if(!req.headers.authorization?.startsWith('Bearer '))return res.status(401).json({error:'Sign in with your owner account to manage reviews.'});
 try{
  const client=makeClient({secretKey:process.env.CLERK_SECRET_KEY,publishableKey:process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY});
  const session=await client.authenticateRequest(new Request(`${origins[0]}/api/review-moderation`,{headers:{authorization:req.headers.authorization}}),{authorizedParties:origins});
  const {userId}=session.toAuth()||{};
  if(!userId||!owners().split(',').map(s=>s.trim()).filter(Boolean).includes(userId))return res.status(403).json({error:'Only the EZEATS owner can manage reviews.'});
  const db=store||createDatabaseReviewStore();
  if(!db)throw new Error('Storage unavailable');
  if(req.method==='GET')return res.status(200).json({pending:await db.pending(),published:await db.published(),local:false});
  let body;try{body=typeof req.body==='string'?JSON.parse(req.body):req.body;
   if(!body||Object.keys(body).some(k=>!['id','status'].includes(k))||!/^[-a-f0-9]{36}$/i.test(body.id)||!['published','rejected'].includes(body.status))throw new Error();
  }catch{return res.status(400).json({error:'Invalid review decision.'});}
  await db.moderate(body.id,body.status,userId);
  return res.status(200).json({ok:true});
 }catch{return res.status(503).json({error:'The review queue is unavailable. Please retry.'});}
};}
export default createModerationHandler();
