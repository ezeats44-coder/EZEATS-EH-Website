import {validateReview} from '../dist/review-schema.js';
import {createDatabaseReviewStore} from '../server/review-store.js';
import {reviewOrigins} from '../server/review-origins.js';
export function createReviewsHandler(store=null){return async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Method not allowed.'});}
 if(!store)return res.status(503).json({error:'Reviews are not open for submissions yet. Please check back soon.'});
 if(req.method==='POST'){
  if(Number(req.headers['content-length']||0)>12000)return res.status(413).json({error:'Review is too large.'});
  const origin=req.headers.origin;
  if(origin&&!(store.local===false?reviewOrigins().includes(origin):origin===`http://${req.headers.host}`))return res.status(403).json({error:'Please submit from the EZEATS review page.'});
  let review;try{review=validateReview(typeof req.body==='string'?JSON.parse(req.body):req.body);}catch(error){return res.status(400).json({error:error.message});}
  try{await store.submit(review,req.headers['x-vercel-forwarded-for']||'unknown');return res.status(201).json({status:'pending',local:store.local!==false});}catch(error){if(error.message?.includes('REVIEW_LIMIT'))return res.status(429).json({error:'Please wait until tomorrow before submitting another review.'});return res.status(503).json({error:'Your review could not be saved. Your text is still here; please retry.'});}
 }
 try{return res.status(200).json({reviews:await store.published(),local:store.local!==false});}catch{return res.status(503).json({error:'Reviews could not be loaded. Please retry.'});}
};}
export default async function handler(req,res){
 let store;try{store=createDatabaseReviewStore();}catch{store=null;}
 return createReviewsHandler(store)(req,res);
}
