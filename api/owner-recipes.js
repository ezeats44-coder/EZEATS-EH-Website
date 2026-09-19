import {createContributorStore} from '../server/recipes/contributors/store.js';
import {recipeDatabase} from '../server/recipes/workspace/database.js';
import {ownerIdentity} from '../server/owner-access.js';
import {productionRecipeStore} from '../server/recipes/workspace/database.js';
import {identity,keys,parseFilters,WorkspaceError} from '../server/recipes/workspace/input.js';
export function createOwnerRecipesHandler({store,authOptions,betaStore,betaEnabled=()=>process.env.RECIPE_CONTRIBUTOR_BETA==='true',enabled=()=>process.env.OWNER_RECIPES_ENABLED==='true'}={}){return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');
 try{
  const who=await ownerIdentity(req,authOptions);if(who.status!==200)return res.status(who.status).json({error:'Sign in with an authorized owner account.'});
  if(!enabled())return res.status(503).json({error:'Recipe workspace is not enabled. No recipe data has been changed.'});
  if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Method not allowed.'});}
  const db=store||productionRecipeStore();if(!db)throw Error('No recipe database');
  const actor={authorized:true,userId:who.userId,owner:true};
  if(req.method==='POST'&&!req.headers.origin)return res.status(403).json({error:'Origin required.'});await db.rateLimit(actor);
  const queryParams=new URL(req.url||'/', 'http://localhost').searchParams;
  if([...queryParams.keys()].some(k=>queryParams.getAll(k).length>1))throw new WorkspaceError('Duplicate query parameters are not supported.');
  if(req.method==='GET'){
   if(req.query?.before!==undefined||req.query?.version!==undefined){
    const key=req.query.before!==undefined?'before':'version';keys(req.query,['id',key]);identity(req.query.id);const value=String(req.query[key]);
    if(!/^[1-9]\d{0,14}$/.test(value)||!Number.isSafeInteger(Number(value)))throw new WorkspaceError('Invalid history cursor or version.');
    return res.status(200).json(key==='before'?await db.history(req.query.id,value,actor):{revision:await db.revision(req.query.id,Number(value),actor)});
   }
   const filters=parseFilters(req.query||{});
   if(req.query?.id){if(Object.keys(req.query).length!==1)throw new WorkspaceError('Do not combine recipe ID and list filters.');return res.status(200).json({record:await db.get(identity(req.query.id),actor),...(betaEnabled()?await (betaStore||createContributorStore(recipeDatabase())).duplicates(req.query.id,actor):{})});}
   return res.status(200).json(await db.list(filters,actor));
  }
  if(Object.keys(req.query||{}).length)throw new WorkspaceError('Unexpected query parameters.');
  if(!/^application\/json(?:;|$)/i.test(String(req.headers['content-type']||'')))throw new WorkspaceError('Use application/json.',415);
  const raw=typeof req.body==='string'?req.body:JSON.stringify(req.body||{});
  if(Buffer.byteLength(raw)>65536)throw new WorkspaceError('Recipe request exceeds 64 KB.',413);
  let b;try{b=JSON.parse(raw);}catch{throw new WorkspaceError('Invalid JSON.');}
  keys(b,['action','id','expectedLock','content','notes','contributorMessage']);identity(b.id);
  if(!['create','save','submit','approve','publish','approve-and-publish','request-changes','reject','remove'].includes(b.action))throw new WorkspaceError('Invalid action.');
  if(b.action==='create'){if(b.expectedLock!==undefined||b.notes!==undefined)throw new WorkspaceError('Unexpected creation fields.');}
  else if(!Number.isSafeInteger(b.expectedLock)||b.expectedLock<1)throw new WorkspaceError('Current revision lock is required.');
  if(['create','save'].includes(b.action)){if(!b.content)throw new WorkspaceError('Recipe content required.');}
  else if(b.content!==undefined)throw new WorkspaceError('Review decisions cannot change recipe content.');
  if(!betaEnabled()&&b.contributorMessage!==undefined)throw new WorkspaceError('Contributor beta disabled.');
  return res.status(b.action==='create'?201:200).json({record:betaEnabled()?await (betaStore||createContributorStore(recipeDatabase())).ownerMutate(b,actor):await db.mutate(b,actor)});
 }catch(e){const status=e instanceof WorkspaceError?e.status:503;if(status===429)res.setHeader('Retry-After','60');return res.status(status).json({error:e instanceof WorkspaceError?e.message:'Recipe storage is unavailable. Reload to check the last saved version before retrying.'});}
};}
export default createOwnerRecipesHandler();
