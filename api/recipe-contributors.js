import {betaIdentity,resolveAccount} from '../server/recipes/contributors/auth.js';
import {createContributorStore} from '../server/recipes/contributors/store.js';
import {recipeDatabase} from '../server/recipes/workspace/database.js';
import {WorkspaceError,keys,text} from '../server/recipes/workspace/input.js';
import {endpoint,body,offset} from '../server/recipes/contributors/http.js';
export function createInvitationsHandler({store,authOptions,enabled=()=>process.env.RECIPE_CONTRIBUTOR_BETA==='true'}={}){return endpoint(async(req,res)=>{
 const a=await betaIdentity(req,authOptions);if(!a.owner)throw new WorkspaceError('Owner access required.',403);if(!enabled())throw new WorkspaceError('Contributor beta is not enabled.',403);
 const db=store||createContributorStore(recipeDatabase()),q=req.query||{};await db.attempt(a,'invitation-api');
 if(req.method==='GET'){keys(q,['offset','account']);if(q.account){keys(q,['account']);return res.status(200).json(await db.invitationHistory(q.account,a));}return res.status(200).json(await db.invitations(offset(q),a));}
 keys(q,[]);const b=body(req,['action','identifier','expiresAt']);
 if(b.action==='invite'){const userId=await resolveAccount(a.client,b.identifier);return res.status(200).json(await db.invite(userId,b.expiresAt,a));}
 if(!['revoke','account-deleted'].includes(b.action)||b.expiresAt!==undefined)throw new WorkspaceError('Invalid invitation action.');const id=text(b.identifier,100,true);if(!/^user_[A-Za-z0-9]+$/.test(id))throw new WorkspaceError('Use the stored account ID.');
 if(b.action==='account-deleted'){try{await a.client.users.getUser(id);}catch(e){if(e.status===404)return res.status(200).json(await db.accountDeleted(id,a));throw e;}throw new WorkspaceError('Account still exists. Use revoke instead.');}
 res.status(200).json(await db.revoke(id,a));
 });}
export default createInvitationsHandler();
