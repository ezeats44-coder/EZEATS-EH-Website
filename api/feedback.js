import {Pool} from '@neondatabase/serverless';
import {betaIdentity} from '../server/recipes/contributors/auth.js';
import {neonDatabase} from '../server/recipes/workspace/database.js';
import {WorkspaceError,keys} from '../server/recipes/workspace/input.js';
import {body} from '../server/recipes/contributors/http.js';
import {createFeedbackStore} from '../server/feedback/store.js';
import {observeEndpoint} from '../server/diagnostics.js';
let live;
export function createFeedbackHandler({store,auth=betaIdentity,owner=false,enabled=()=>process.env.FEEDBACK_ENABLED==='true'}={}){return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');
 try{
 if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');throw new WorkspaceError('Method not allowed.',405);}
 const verified=await auth(req);if(owner&&!verified.owner)throw new WorkspaceError('Owner access required.',403);
 // User inbox remains ownership-scoped even for an owner account.
 const actor={userId:verified.userId,owner};
 if(!enabled())throw new WorkspaceError('Feedback is not enabled in this environment.',404);
 if(!store){const connection=process.env.FEEDBACK_DATABASE_URL||(process.env.VERCEL_ENV==='preview'?process.env.RECIPE_DATABASE_URL:null);if(!connection)throw Error('Unconfigured');live??=createFeedbackStore(neonDatabase(new Pool({connectionString:connection,max:3,connectionTimeoutMillis:5000,query_timeout:10000})));}
 const db=store||live;await db.limit(actor);
 if((req.url||'').length>2048)throw new WorkspaceError('Query too long.');
 const params=new URL(req.url||'/','https://example.test').searchParams;for(const key of params.keys())if(params.getAll(key).length!==1)throw new WorkspaceError('Duplicate query parameter.');
 const q=Object.fromEntries(params);if(req.method==='GET'){if(q.id){keys(q,['id','before']);return res.status(200).json(await db.get(q.id,actor,q.before));}return res.status(200).json(await db.list(q,actor));}
 keys(q,[]);return res.status(200).json(await db.mutate(body(req,['action','id','requestId','category','subject','message','version','status','sequence']),actor));
 }catch(e){const status=e instanceof WorkspaceError?e.status:503;if(status===429)res.setHeader('Retry-After','60');res.status(status).json({error:e instanceof WorkspaceError?e.message:'Feedback is temporarily unavailable. Your message has not been cleared; retry safely.'});}
 };}
export default observeEndpoint('feedback',createFeedbackHandler());
