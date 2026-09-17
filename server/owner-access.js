import {createClerkClient} from '@clerk/backend';
import {reviewOrigins} from './review-origins.js';
export async function ownerIdentity(req,{makeClient=createClerkClient,owners=()=>process.env.REVIEW_ADMIN_USER_IDS||''}={}){
 const origins=reviewOrigins();
 if(req.headers.origin&&!origins.includes(req.headers.origin))return {status:403};
 if(!req.headers.authorization?.startsWith('Bearer '))return {status:401};
 const client=makeClient({secretKey:process.env.CLERK_SECRET_KEY,publishableKey:process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY});
 const session=await client.authenticateRequest(new Request(`${origins[0]}/api/owner`,{headers:{authorization:req.headers.authorization}}),{authorizedParties:origins});
 const {userId}=session.toAuth()||{};
 return userId&&owners().split(',').map(s=>s.trim()).filter(Boolean).includes(userId)?{status:200,userId}:{status:403};
}
