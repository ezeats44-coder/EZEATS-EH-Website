import {ownerIdentity} from '../../owner-access.js';
/** Future management handler factory. Intentionally not mounted under api/.
 * Every invocation verifies a Clerk session and the server allowlist independently.
 * Dispatch must implement an atomic transaction with optimistic lock_version checking.
 * No configured dispatch means no reads/writes/collection are enabled.
 */
export function createRecipeManagementBoundary({dispatch=null,authOptions}={}){
 return async(req,res)=>{
  res.setHeader('Cache-Control','private, no-store');
  try{
   const identity=await ownerIdentity(req,authOptions);
   if(identity.status!==200)return res.status(identity.status).json({error:'Authorized owner or administrator required.'});
   if(!dispatch)return res.status(501).json({error:'Recipe management is not enabled.'});
   if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Method not allowed.'});
   const data=await dispatch(req,{authorized:true,userId:identity.userId});return res.status(200).json(data);
  }catch{return res.status(503).json({error:'Recipe management unavailable.'});}
 };
}
/** Persistence port, to be implemented before enabling any route:
 * transaction(id, expectedLock, transform): atomically compare lockVersion and save
 *   complete state + immutable revision payload + moderation event; fail on conflict.
 * getForModeration(id): private record, revisions, audit trail, reports.
 * listQueue({status,cursor,limit}): bounded, paginated recipe-only queue.
 * findDuplicates(fingerprint): candidate references, never automatic rejection.
 * getPublished(id): explicit public projection only, never latest revision.
 * listReports({status,cursor,limit}), resolveReport(id, decision, actor).
 * Only the authorized management boundary may call private methods.
 * No runtime adapter is installed in this phase.
 */
