import {betaIdentity,eligible} from '../server/recipes/contributors/auth.js';
import {createContributorStore} from '../server/recipes/contributors/store.js';
import {recipeDatabase} from '../server/recipes/workspace/database.js';
import {WorkspaceError,keys} from '../server/recipes/workspace/input.js';
import {endpoint,body,offset} from '../server/recipes/contributors/http.js';
export function createContributorHandler({store,authOptions,enabled=()=>process.env.RECIPE_CONTRIBUTOR_BETA==='true'}={}){return endpoint(async(req,res)=>{
 const a=await betaIdentity(req,authOptions);if(!enabled())throw new WorkspaceError('Contributor beta is not enabled.',403);
 const db=store||createContributorStore(recipeDatabase());await db.attempt(a,'contributor-api');
 if(!eligible(await a.client.users.getUser(a.userId)))throw new WorkspaceError('Confirm your 13+ eligibility in Settings first.',403);
 const q=req.query||{};
 if(req.method==='GET'){keys(q,['id','offset','access']);if(q.id){keys(q,['id']);return res.status(200).json({record:await db.get(q.id,a)});}if(q.access){keys(q,['access']);if(q.access!=='1')throw new WorkspaceError('Invalid access query.');return res.status(200).json(await db.access(a));}return res.status(200).json(await db.list(offset(q),a));}
 keys(q,[]);const b=body(req,['action','id','expectedLock','content','requestId']);if(b.action==='create'){if(b.expectedLock!==undefined)throw new WorkspaceError('Unexpected lock.');}else if(!Number.isSafeInteger(b.expectedLock)||b.expectedLock<1)throw new WorkspaceError('Current revision lock required.');
 if(!['create','save'].includes(b.action)&&b.content!==undefined)throw new WorkspaceError('Unexpected content.');
 res.status(200).json({record:await db.mutate(b,a)});
 });}
export default createContributorHandler();
