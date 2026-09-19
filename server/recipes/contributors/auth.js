import {createClerkClient} from '@clerk/backend';
import {reviewOrigins} from '../../review-origins.js';
import {WorkspaceError} from '../workspace/input.js';
export const eligible=user=>[13,14].includes(user?.privateMetadata?.ezeatsAgeConfirmation?.minimumAge);
export async function betaIdentity(req,{makeClient=createClerkClient,allowedOrigins=reviewOrigins,owners=()=>process.env.REVIEW_ADMIN_USER_IDS||''}={}){
 const origins=allowedOrigins();
 if((req.method!=='GET'&&!req.headers.origin)||(req.headers.origin&&!origins.includes(req.headers.origin)))throw new WorkspaceError('Origin not allowed.',403);
 if(!req.headers.authorization?.startsWith('Bearer '))throw new WorkspaceError('Sign in to continue.',401);
 const client=makeClient({secretKey:process.env.CLERK_SECRET_KEY,publishableKey:process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY});
 const session=await client.authenticateRequest(new Request(origins[0]+'/api/contributor-recipes',{headers:{authorization:req.headers.authorization}}),{authorizedParties:origins});
 const {userId}=session.toAuth()||{};if(!userId)throw new WorkspaceError('Sign in to continue.',401);
 return {userId,owner:owners().split(',').map(x=>x.trim()).includes(userId),client};
}
export async function resolveAccount(client,identifier){
 if(typeof identifier!=='string'||identifier.length>254||!identifier.trim())throw new WorkspaceError('Enter an existing account email or Clerk user ID.');
 const value=identifier.trim();let user;
 if(value.includes('@')){
  const list=await client.users.getUserList({emailAddress:[value],limit:100});
  const exact=list.data.filter(u=>u.emailAddresses.some(e=>e.emailAddress.toLowerCase()===value.toLowerCase()&&e.verification?.status==='verified'));
  if(list.totalCount>100||exact.length!==1)throw new WorkspaceError('Email must match exactly one existing, verified account.');user=exact[0];
 }else{if(!/^user_[A-Za-z0-9]+$/.test(value))throw new WorkspaceError('Invalid account identifier.');try{user=await client.users.getUser(value);}catch{throw new WorkspaceError('Existing account not found.');}}
 if(!eligible(user))throw new WorkspaceError('This account must first confirm it meets the 13+ requirement.',403);
 return user.id;
}
