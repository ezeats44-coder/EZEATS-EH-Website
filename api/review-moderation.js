import {createClerkClient} from '@clerk/backend';
import {createDatabaseReviewStore} from '../server/review-store.js';
import {ownerIdentity} from '../server/owner-access.js';
export function createModerationHandler({store,makeClient=createClerkClient,owners=()=>process.env.REVIEW_ADMIN_USER_IDS||''}={}){return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');
 if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Method not allowed.'});
 try{
  const access=await ownerIdentity(req,{makeClient,owners});
  if(access.status!==200)return res.status(access.status).json({error:access.status===401?'Sign in with your owner account to manage reviews.':'Only an EZEATS owner can manage reviews.'});
  const userId=access.userId;
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
