import {createHash} from 'node:crypto';
import {createRecipeStore} from '../workspace/store.js';
import {WorkspaceError,text,identity,normalizeContent,requireComplete} from '../workspace/input.js';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const owner=a=>{if(!a?.owner||!a.userId)throw new WorkspaceError('Owner access required.',403);};
const actor=a=>({authorized:true,userId:a.userId,contributor:true});
const nested=tx=>createRecipeStore({query:(...a)=>tx.query(...a),transaction:work=>work(tx)});
const requestId=id=>{if(typeof id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))throw new WorkspaceError('A UUID request ID is required.');};
export function contributorProjection(r,messages=[]){
 return {id:r.id,origin:r.origin,latest_version:r.latest_version,latest_status:r.latest_status,published_version:r.published_version,lock_version:r.lock_version,created_at:r.created_at,updated_at:r.updated_at,removed_at:r.removed_at,
 revisions:r.revisions.map(v=>({version:v.version,status:v.status,created_at:v.created_at,document:{content:{...v.document.content,privateNotes:''}}})),
 events:r.events.map(e=>({action:e.action,status:e.status,version:e.version,created_at:e.created_at})),nextBefore:null,
 changeRequests:messages.map(m=>({version:m.version,message:m.message,created_at:m.created_at}))};
}
export function createContributorStore(db){
 async function rate(tx,id,category,max,window='1 minute'){
  const r=await tx.query(`INSERT INTO recipe_contributor_limits(actor,category,window_start,operations) VALUES($1,$2,now(),1)
   ON CONFLICT(actor,category) DO UPDATE SET window_start=CASE WHEN recipe_contributor_limits.window_start<now()-$3::interval THEN now() ELSE recipe_contributor_limits.window_start END,
   operations=CASE WHEN recipe_contributor_limits.window_start<now()-$3::interval THEN 1 ELSE recipe_contributor_limits.operations+1 END RETURNING operations`,[id,category,window]);
  if(r.rows[0].operations>max)throw new WorkspaceError('Rate limit reached. Please try again later.',429);
 }
 async function invitation(tx,a){
  if(!a?.userId)throw new WorkspaceError('Sign in to continue.',401);
  const r=(await tx.query('SELECT * FROM recipe_invitations WHERE account_id=$1 FOR UPDATE',[a.userId])).rows[0];
  if(!r||r.revoked_at||new Date(r.expires_at)<=new Date())throw new WorkspaceError('An active contributor invitation is required.',403);
  return r;
 }
 async function own(tx,id,a){identity(id);const r=(await tx.query('SELECT * FROM recipe_records WHERE id=$1 FOR UPDATE',[id])).rows[0];if(!r||r.origin!=='user-submitted'||r.submitting_account_id!==a.userId)throw new WorkspaceError('Recipe not found.',404);return r;}
 async function detail(tx,id,a){await own(tx,id,a);const r=await nested(tx).get(id,actor(a));const messages=(await tx.query('SELECT version,message,created_at FROM recipe_change_requests WHERE recipe_id=$1 ORDER BY event_id DESC LIMIT 100',[id])).rows;return contributorProjection(r,messages);}
 return {
  async attempt(a,category){if(!a?.userId)throw new WorkspaceError('Sign in to continue.',401);await rate(db,a.userId,category,60);},
  async access(a){return db.transaction(async tx=>{await invitation(tx,a);await rate(tx,a.userId,'read',60);return {contributor:true};});},
  async invite(accountId,expiresAt,a){owner(a);if(!/^user_[A-Za-z0-9]+$/.test(accountId))throw new WorkspaceError('Verified account ID required.');const expiry=new Date(expiresAt);if(!Number.isFinite(+expiry)||expiry<=new Date()||+expiry>Date.now()+90*86400000)throw new WorkspaceError('Choose an expiration within 90 days.');
   return db.transaction(async tx=>{await rate(tx,a.userId,'invitations',20);await tx.query('SELECT pg_advisory_xact_lock(hashtext($1))',[accountId]);
    const old=(await tx.query('SELECT * FROM recipe_invitations WHERE account_id=$1 FOR UPDATE',[accountId])).rows[0];
    if(old&&!old.revoked_at&&new Date(old.expires_at)>new Date())return {invitation:old,duplicate:true};
    const r=await tx.query(`INSERT INTO recipe_invitations(account_id,invited_by,expires_at) VALUES($1,$2,$3) ON CONFLICT(account_id) DO UPDATE SET invited_by=$2,invited_at=now(),expires_at=$3,revoked_at=NULL,revoked_by=NULL RETURNING *`,[accountId,a.userId,expiry.toISOString()]);
    await tx.query("INSERT INTO recipe_invitation_events(account_id,actor_id,action,expires_at) VALUES($1,$2,'invite',$3)",[accountId,a.userId,expiry.toISOString()]);return {invitation:r.rows[0],duplicate:false};});
  },
  async revoke(accountId,a){owner(a);return db.transaction(async tx=>{await rate(tx,a.userId,'invitations',20);const r=await tx.query('UPDATE recipe_invitations SET revoked_at=now(),revoked_by=$2 WHERE account_id=$1 AND revoked_at IS NULL RETURNING account_id',[accountId,a.userId]);if(r.rows.length)await tx.query("INSERT INTO recipe_invitation_events(account_id,actor_id,action) VALUES($1,$2,'revoke')",[accountId,a.userId]);return {revoked:true};});},
  async invitations(offset,a){owner(a);if(!Number.isInteger(offset)||offset<0||offset>10000)throw new WorkspaceError('Invalid page.');return db.transaction(async tx=>{await rate(tx,a.userId,'invitations',20);const rows=(await tx.query(`SELECT *,CASE WHEN revoked_at IS NOT NULL THEN 'revoked' WHEN expires_at<=now() THEN 'expired' ELSE 'active' END AS status FROM recipe_invitations ORDER BY invited_at DESC,account_id LIMIT 21 OFFSET $1`,[offset])).rows;return {items:rows.slice(0,20),nextOffset:rows.length>20?offset+20:null};});},
  async invitationHistory(accountId,a){owner(a);return {events:(await db.query('SELECT * FROM recipe_invitation_events WHERE account_id=$1 ORDER BY event_id DESC LIMIT 100',[text(accountId,100,true)])).rows};},
  async list(offset,a){return db.transaction(async tx=>{await invitation(tx,a);await rate(tx,a.userId,'read',60);if(!Number.isInteger(offset)||offset<0||offset>10000)throw new WorkspaceError('Invalid page.');const rows=(await tx.query(`SELECT r.id,r.origin,r.latest_status,r.latest_version,r.published_version,r.removed_at,r.updated_at,r.created_at,v.document->'content'->>'title' AS title,v.document->'content'->>'author' AS author FROM recipe_records r JOIN recipe_revisions v ON v.recipe_id=r.id AND v.version=r.latest_version WHERE r.submitting_account_id=$1 AND r.origin='user-submitted' ORDER BY r.updated_at DESC,r.id LIMIT 21 OFFSET $2`,[a.userId,offset])).rows;return {items:rows.slice(0,20),nextOffset:rows.length>20?offset+20:null};});},
  async get(id,a){return db.transaction(async tx=>{await invitation(tx,a);await rate(tx,a.userId,'read',60);return detail(tx,id,a);});},
  async mutate(command,a){requestId(command.requestId);const {action,id,expectedLock}=command;if(!['create','save','submit','withdraw'].includes(action))throw new WorkspaceError('Contributors cannot moderate recipes.',403);
   identity(id);if(!id.startsWith('ezeats-user:'))throw new WorkspaceError('Use ezeats-user:recipe-name.');
   return db.transaction(async tx=>{await invitation(tx,a);const old=(await tx.query('SELECT * FROM recipe_contributor_requests WHERE actor=$1 AND request_id=$2',[a.userId,command.requestId])).rows[0];
    if(old){if(old.fingerprint!==hash(command))throw new WorkspaceError('Request ID was already used for different content.',409);return detail(tx,old.recipe_id,a);}
    await rate(tx,a.userId,'write',30);await rate(tx,a.userId,'revisions',100,'1 day');
    let row;if(action!=='create'){row=await own(tx,id,a);if(row.lock_version!==expectedLock)throw new WorkspaceError('Recipe changed. Reload before saving.',409);if(row.removed_at)throw new WorkspaceError('Withdrawn recipe cannot be edited.',409);}
    if(action==='create'){
     await rate(tx,a.userId,'drafts',10,'1 day');const count=(await tx.query("SELECT count(*)::int AS count FROM recipe_records WHERE submitting_account_id=$1 AND origin='user-submitted' AND removed_at IS NULL AND published_version IS NULL",[a.userId])).rows[0].count;if(count>=10)throw new WorkspaceError('You may keep at most 10 unpublished recipes.',429);
    }
    if(['create','save'].includes(action)){
     if(row&&!['draft','changes-requested','published','rejected'].includes(row.latest_status))throw new WorkspaceError('Submitted revisions are read-only until moderation is complete.',409);
     if(command.content?.privateNotes)throw new WorkspaceError('Private owner notes are not contributor fields.');
     const doc=normalizeContent(command.content,actor(a));
     // Drafts may omit quantities, but malformed supplied quantities and numbered objects are rejected.
     for(const i of doc.content.ingredients)if(i.quantity&&(!/^(?:\d+(?:\.\d+)?|\d+\/[1-9]\d*|\d+ \d+\/[1-9]\d*)$/.test(i.quantity)||i.quantity.split(/[\s/]+/).every(n=>Number(n)===0)||Number(i.quantity)===0||/^0\/[1-9]/.test(i.quantity)))throw new WorkspaceError('Invalid ingredient quantity.');
     if(row?.published_version){requireComplete(doc.content);await rate(tx,a.userId,'submissions',5,'1 day');const pending=(await tx.query("SELECT count(*)::int AS count FROM recipe_records WHERE submitting_account_id=$1 AND removed_at IS NULL AND latest_status='pending'",[a.userId])).rows[0].count;if(pending>=3)throw new WorkspaceError('At most three recipes may await review.',429);}
    }
    if(action==='submit'){await rate(tx,a.userId,'submissions',5,'1 day');const count=(await tx.query("SELECT count(*)::int AS count FROM recipe_records WHERE submitting_account_id=$1 AND origin='user-submitted' AND removed_at IS NULL AND latest_status='pending'",[a.userId])).rows[0].count;if(count>=3)throw new WorkspaceError('At most three recipes may await review.',429);}
    if(action==='withdraw'&&(row.published_version||!['draft','changes-requested','rejected'].includes(row.latest_status)))throw new WorkspaceError('Only unpublished editable drafts may be withdrawn. Contact an owner about pending or published recipes.',409);
    const core={action:action==='withdraw'?'remove':action,id,...(expectedLock===undefined?{}:{expectedLock}),...(['save','create'].includes(action)?{content:command.content}:{}),...(action==='withdraw'?{notes:'Contributor withdrew unpublished draft.'}:{})};
    await nested(tx).mutate(core,actor(a));await tx.query('INSERT INTO recipe_contributor_requests(actor,request_id,fingerprint,recipe_id) VALUES($1,$2,$3,$4)',[a.userId,command.requestId,hash(command),id]);return detail(tx,id,a);
   });
  },
  async ownerMutate(command,a){owner(a);return db.transaction(async tx=>{
   const row=(await tx.query('SELECT * FROM recipe_records WHERE id=$1 FOR UPDATE',[command.id])).rows[0];
   const message=text(command.contributorMessage,2000);
   if(row?.origin==='user-submitted'&&['request-changes','reject'].includes(command.action)&&!message)throw new WorkspaceError('Add a message explaining the decision to this contributor.');
   const {contributorMessage,...core}=command;const result=await nested(tx).mutate(core,{authorized:true,userId:a.userId});
   if(message&&row?.origin==='user-submitted')await tx.query('INSERT INTO recipe_change_requests(event_id,recipe_id,version,message) VALUES($1,$2,$3,$4)',[result.events.at(-1).event_id,row.id,result.latest_version,message]);return result;
  });},
  async duplicates(id,a){owner(a);return {candidates:(await db.query(`SELECT r.id,v.document->'content'->>'title' AS title FROM recipe_records r JOIN recipe_revisions v ON r.id=v.recipe_id AND r.latest_version=v.version JOIN recipe_revisions current ON current.recipe_id=$1 WHERE current.version=(SELECT latest_version FROM recipe_records WHERE id=$1) AND r.id<>$1 AND r.removed_at IS NULL AND (v.content_fingerprint=current.content_fingerprint OR lower(v.document->'content'->>'title')=lower(current.document->'content'->>'title')) ORDER BY r.id LIMIT 10`,[identity(id)])).rows};},
  // Explicit operator/owner workflow; not an unauthenticated webhook. Caller must prove Clerk account absence.
  async accountDeleted(accountId,a){owner(a);return db.transaction(async tx=>{await tx.query('SELECT * FROM recipe_invitations WHERE account_id=$1 FOR UPDATE',[accountId]);const r=await tx.query('UPDATE recipe_invitations SET revoked_at=now(),revoked_by=$2 WHERE account_id=$1 AND revoked_at IS NULL RETURNING account_id',[accountId,a.userId]);if(r.rows.length)await tx.query("INSERT INTO recipe_invitation_events(account_id,actor_id,action) VALUES($1,$2,'account-deleted')",[accountId,a.userId]);return {revoked:true,recipesRetained:true};});}
 };
}
