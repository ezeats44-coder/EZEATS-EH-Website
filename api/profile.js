import {createClerkClient} from '@clerk/backend';
import {validateProfile,fields,normalizeStoredProfile} from '../dist/profile-schema.js';
import {recordChoice} from '../dist/meal-history.js';
export function createProfileHandler(makeClient=createClerkClient) {return async function handler(req,res) {
 res.setHeader('Cache-Control','private, no-store');
 if(!['GET','PUT','POST','PATCH','DELETE'].includes(req.method)){res.setHeader('Allow','GET, PUT, POST, PATCH, DELETE');return res.status(405).json({error:'Method not allowed.'});}
 const origins=['https://ezeats.vercel.app','https://ezeats-eh.com','https://www.ezeats-eh.com',...(process.env.VERCEL_URL?[`https://${process.env.VERCEL_URL}`]:[]),...(process.env.VERCEL_ENV!=='production'?['http://localhost:4175']:[])];
 if(req.headers.origin && !origins.includes(req.headers.origin)) return res.status(403).json({error:'Origin not allowed.'});
 if(!req.headers.authorization?.startsWith('Bearer '))return res.status(401).json({error:'Sign in to access your preferences.'});
 try {
  const clerk=makeClient({secretKey:process.env.CLERK_SECRET_KEY,publishableKey:process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY});
  const request=new Request(`${origins[0]}/api/profile`,{headers:{authorization:req.headers.authorization}});
  const session=await clerk.authenticateRequest(request,{authorizedParties:origins});
  const {userId}=session.toAuth()||{};
  if(!userId)return res.status(401).json({error:'Your session expired. Please sign in again.'});
  if(req.method==='PATCH'){
   let body=req.body;try{if(typeof body==='string')body=JSON.parse(body);}catch{return res.status(400).json({error:'Please confirm your age eligibility.'});}
   if(!body||body.ageConfirmed!==true||Object.keys(body).length!==1)return res.status(400).json({error:'Please confirm that you are 13 or older.'});
   const existing=await clerk.users.getUser(userId);
   if(![13,14].includes(existing.privateMetadata.ezeatsAgeConfirmation?.minimumAge))await clerk.users.updateUserMetadata(userId,{privateMetadata:{ezeatsAgeConfirmation:{minimumAge:13,confirmedAt:new Date().toISOString()}}});
   return res.status(200).json({confirmed:true});
  }
  const user=await clerk.users.getUser(userId);
  if(req.method!=='DELETE'&&![13,14].includes(user.privateMetadata.ezeatsAgeConfirmation?.minimumAge))return res.status(403).json({code:'AGE_REQUIRED',error:'Confirm that you are 13 or older before using account preferences.'});
  if(req.method==='GET') {
   return res.status(200).json({profile:normalizeStoredProfile(user.privateMetadata.ezeatsProfile||{}),history:user.privateMetadata.ezeatsMealHistory||[],completed:Boolean(user.privateMetadata.ezeatsOnboarded)});
  }
  if(req.method==='DELETE') {
   if(req.query?.history==='1'){
    await clerk.users.updateUserMetadata(userId,{privateMetadata:{ezeatsMealHistory:null}});
    return res.status(200).json({history:[]});
   }
   await clerk.users.updateUserMetadata(userId,{privateMetadata:{ezeatsProfile:null,ezeatsOnboarded:null}});
   return res.status(200).json({profile:{},completed:false});
  }
  if(Number(req.headers['content-length']||0)>12000)return res.status(413).json({error:'Profile is too large.'});
  if(req.method==='POST'){
   let history;
   try{history=recordChoice(user.privateMetadata.ezeatsMealHistory,typeof req.body==='string'?JSON.parse(req.body):req.body);}catch{return res.status(400).json({error:'Please choose a valid meal.'});}
   await clerk.users.updateUserMetadata(userId,{privateMetadata:{ezeatsMealHistory:history}});
   return res.status(200).json({history});
  }
  let body=req.body;
  try {
   if(typeof body==='string')body=JSON.parse(body);
   if(!body||Object.keys(body).some(k=>!['profile','completed'].includes(k))||typeof body.completed!=='boolean')throw new Error('Invalid profile request.');
   body.profile=validateProfile(body.profile);
  } catch {return res.status(400).json({error:'Please check your answers and try again.'});}
  await clerk.users.updateUserMetadata(userId,{privateMetadata:{ezeatsProfile:{genderDescription:null,...Object.fromEntries(fields.map(f=>[f.key,null])),...body.profile},ezeatsOnboarded:body.completed}});
  return res.status(200).json(body);
 } catch {return res.status(503).json({error:'Your preferences could not be accessed. Please try again.'});}
};}
export default createProfileHandler();
