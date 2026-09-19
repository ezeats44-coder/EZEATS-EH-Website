import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {openLocalRecipeDatabase} from '../scripts/recipe-local-db.mjs';
import {createContributorStore} from '../server/recipes/contributors/store.js';
import {resolveAccount,eligible} from '../server/recipes/contributors/auth.js';
import {createContributorHandler} from '../api/contributor-recipes.js';
import {createInvitationsHandler} from '../api/recipe-contributors.js';
import {createOwnerRecipesHandler} from '../api/owner-recipes.js';
import {createCommunityHandler} from '../api/community-recipes.js';
import {ownerRecipe} from './fixtures/owner-recipe.js';
import {normalizeContent} from '../server/recipes/workspace/input.js';
import {matchesRestrictions} from '../server/recipes/model.js';
let db,core,beta;const owner={owner:true,userId:'user_owner'},alice={userId:'user_alice'},bob={userId:'user_bob'};
const expiry=()=>new Date(Date.now()+86400000).toISOString();
const content=id=>({...ownerRecipe(id),privateNotes:'',copyrightStatement:'Original contributor text; permission to display on EZEATS.'});
const command=(action,r,extra={})=>({action,id:r.id,expectedLock:r.lock_version,requestId:randomUUID(),...extra});
const latest=r=>r.revisions.at(-1).document.content;
const create=(slug,a=alice)=>beta.mutate({action:'create',id:'ezeats-user:'+slug,content:content('ezeats-user:'+slug),requestId:randomUUID()},a);
const decision=(r,action,extra={})=>beta.ownerMutate({action,id:r.id,expectedLock:r.lock_version,notes:'PRIVATE OWNER NOTE',...extra},owner);
before(async()=>{const opened=await openLocalRecipeDatabase();db=opened.db;core=opened.store;await db.transaction(async tx=>tx.exec(await readFile(new URL('../server/recipes/contributors/schema.sql',import.meta.url),'utf8')));beta=createContributorStore(db);await beta.invite(alice.userId,expiry(),owner);await beta.invite(bob.userId,expiry(),owner);});
after(async()=>db.close());
test('Invitations are idempotent while active, audited, immediately revoked and can expire',async()=>{
 const id='user_invitee';const first=await beta.invite(id,expiry(),owner);assert.equal(first.duplicate,false);assert.equal((await beta.invite(id,expiry(),owner)).duplicate,true);assert.equal((await beta.invitationHistory(id,owner)).events.length,1);assert.ok((await beta.invitationHistory(id,owner)).events[0].expires_at);
 await beta.access({userId:id});await beta.revoke(id,owner);await assert.rejects(()=>beta.access({userId:id}),e=>e.status===403);assert.equal((await beta.invitations(0,owner)).items.find(i=>i.account_id===id).status,'revoked');
 await beta.invite(id,expiry(),owner);await db.query("UPDATE recipe_invitations SET invited_at=now()-interval '2 days',expires_at=now()-interval '1 day' WHERE account_id=$1",[id]);await assert.rejects(()=>beta.access({userId:id}),e=>e.status===403);assert.equal((await beta.invitations(0,owner)).items.find(i=>i.account_id===id).status,'expired');
 await assert.rejects(()=>beta.invite('user_bad','2000-01-01',owner));await assert.rejects(()=>beta.invite('user_bad',expiry(),alice),e=>e.status===403);
});
test('Exact Clerk email resolution requires one verified existing account and 13+ or legacy 14+',async()=>{
 const user={id:'user_match',emailAddresses:[{emailAddress:'Owner@example.test',verification:{status:'verified'}}],privateMetadata:{ezeatsAgeConfirmation:{minimumAge:13}}};
 let rows=[user];const client={users:{getUserList:async()=>({data:rows,totalCount:rows.length}),getUser:async()=>user}};
 assert.equal(await resolveAccount(client,'owner@example.test'),'user_match');user.privateMetadata.ezeatsAgeConfirmation.minimumAge=14;assert.ok(eligible(user));assert.equal(await resolveAccount(client,'user_match'),'user_match');
 user.privateMetadata.ezeatsAgeConfirmation.minimumAge=12;await assert.rejects(()=>resolveAccount(client,'owner@example.test'),e=>e.status===403);user.privateMetadata.ezeatsAgeConfirmation.minimumAge=13;
 rows=[user,{...user,id:'user_duplicate'}];await assert.rejects(()=>resolveAccount(client,'owner@example.test'),/exactly one/);rows=[];await assert.rejects(()=>resolveAccount(client,'owner@example.test'));rows=[{...user,emailAddresses:[{emailAddress:'owner@example.test',verification:{status:'unverified'}}]}];await assert.rejects(()=>resolveAccount(client,'owner@example.test'));
});
test('Contributor create, reload, edit, submit read-only, owner changes and resubmission',async()=>{
 let r=await create('lifecycle');assert.equal(r.origin,'user-submitted');assert.equal((await beta.get(r.id,alice)).latest_version,1);
 r=await beta.mutate(command('save',r,{content:{...latest(r),description:'Revised contributor description.'}}),alice);assert.equal(r.latest_version,2);
 r=await beta.mutate(command('submit',r),alice);assert.equal(r.latest_status,'pending');await assert.rejects(()=>beta.mutate(command('save',r,{content:latest(r)}),alice),e=>e.status===409);
 await assert.rejects(()=>decision(r,'request-changes'),/message/);r=await decision(r,'request-changes',{contributorMessage:'Please clarify the cooking step.'});
 const projected=await beta.get(r.id,alice);assert.equal(projected.changeRequests[0].message,'Please clarify the cooking step.');assert.ok(!JSON.stringify(projected).includes('PRIVATE OWNER NOTE'));assert.ok(!JSON.stringify(projected).includes(owner.userId));
 r=await beta.mutate(command('save',r,{content:{...latest(r),steps:['Put the beans and water in a clean saucepan.','Heat until steaming throughout, stir, then serve.']}}),alice);r=await beta.mutate(command('submit',r),alice);assert.equal(r.latest_status,'pending');
 r=await decision(r,'approve');assert.equal(await core.published(r.id),null);r=await decision(r,'publish');const old=await core.published(r.id);assert.equal(old.source.provider,'EZEATS contributor');assert.equal(old.suitability.status,'unverified');assert.equal(matchesRestrictions(old,{diets:['vegan']}),false);
 r=await beta.mutate(command('save',r,{content:{...latest(r),title:'Revised published bowl'}}),alice);assert.equal(r.latest_status,'pending');assert.deepEqual(await core.published(r.id),old);
 r=await decision(r,'reject',{contributorMessage:'Please correct the yield.'});assert.deepEqual(await core.published(r.id),old);r=await beta.mutate(command('save',r,{content:latest(r)}),alice);r=await decision(r,'approve-and-publish');assert.equal((await core.published(r.id)).title,'Revised published bowl');
 r=await decision(r,'remove');assert.equal(await core.published(r.id),null);assert.ok(r.events.some(e=>e.action==='publish'));
});
test('Contributor ownership, invitation, moderation and private-data boundaries',async()=>{
 const r=await create('ownership');for(const a of [bob,{userId:'user_uninvited'},{}])await assert.rejects(()=>beta.get(r.id,a));assert.ok(!(await beta.list(0,bob)).items.some(x=>x.id===r.id));
 for(const action of ['approve','publish','approve-and-publish','reject','request-changes','remove','invite','verify'])await assert.rejects(()=>beta.mutate(command(action,r),alice),e=>e.status===403);
 await assert.rejects(()=>beta.mutate(command('save',r,{content:{...latest(r),privateNotes:'forged owner note'}}),alice));
 const projection=JSON.stringify(await beta.get(r.id,alice));for(const field of ['accountId','actor_account_id','submitting_account_id','attestation','created_by'])assert.ok(!projection.includes(field));
});
test('Withdrawal preserves immutable private audit; published and pending cannot be withdrawn',async()=>{
 let r=await create('withdraw');r=await beta.mutate(command('withdraw',r),alice);assert.ok(r.removed_at);assert.equal(r.events.at(-1).action,'remove');await assert.rejects(()=>beta.mutate(command('save',r,{content:latest(r)}),alice));
 r=await create('pending-withdraw');r=await beta.mutate(command('submit',r),alice);await assert.rejects(()=>beta.mutate(command('withdraw',r),alice),e=>e.status===409);r=await decision(r,'approve-and-publish');await assert.rejects(()=>beta.mutate(command('withdraw',r),alice));
});
test('Retries deduplicate revisions, conflicting request reuse and stale simultaneous edits fail',async()=>{
 const c={action:'create',id:'ezeats-user:retry',content:content('ezeats-user:retry'),requestId:randomUUID()};let r=await beta.mutate(c,bob);assert.equal((await beta.mutate(c,bob)).latest_version,1);await assert.rejects(()=>beta.mutate({...c,content:{...c.content,title:'Other'}},bob),e=>e.status===409);
 const edit=command('save',r,{content:latest(r)});r=await beta.mutate(edit,bob);assert.equal((await beta.mutate(edit,bob)).latest_version,2);
 const edits=await Promise.allSettled([beta.mutate(command('save',r,{content:latest(r)}),bob),beta.mutate(command('save',r,{content:latest(r)}),bob)]);assert.equal(edits.filter(x=>x.status==='fulfilled').length,1);assert.equal(edits.find(x=>x.status==='rejected').reason.status,409);
});
test('Plain-text, source URLs, quantities, duplicate step objects, extra fields and safety claims are validated',async()=>{
 const a={userId:'user_validation'};await beta.invite(a.userId,expiry(),owner);
 for(const patch of [{title:'<script>alert(1)</script>'},{role:'owner'},{sourceUrl:'javascript:alert(1)'},{sourceUrl:'https://secret:pass@example.test'},{sourceUrl:'https://127.0.0.1'},{steps:[{order:1,text:'one'},{order:1,text:'two'}]},{ingredients:[{name:'beans',quantity:'1/0',unit:'cup'}]},{ingredients:[{name:'beans',quantity:'0',unit:'cup'}]},{rightsBasis:'permission',sourceUrl:'',sourceAttribution:''},{title:'x'.repeat(201)},{verified:true}])await assert.rejects(()=>beta.mutate({action:'create',id:'ezeats-user:validation',content:{...content('ezeats-user:validation'),...patch},requestId:randomUUID()},a));
 let r=await beta.mutate({action:'create',id:'ezeats-user:incomplete',content:{...content('ezeats-user:incomplete'),servings:null},requestId:randomUUID()},a);await assert.rejects(()=>beta.mutate(command('submit',r),a));
});
test('Candidate duplicate matches are owner-only advisory and never block creation',async()=>{
 const r=await create('similar-one',bob);await create('similar-two',bob);const matches=await beta.duplicates(r.id,owner);assert.ok(matches.candidates.length);await assert.rejects(()=>beta.duplicates(r.id,alice),e=>e.status===403);
});
test('Shared request limits persist across instances and quotas bound drafts/submissions',async()=>{
 const a={userId:'user_limits'};await beta.invite(a.userId,expiry(),owner);const other=createContributorStore(db);for(let i=0;i<60;i++)await other.attempt(a,'test');await assert.rejects(()=>beta.attempt(a,'test'),e=>e.status===429);
 let drafts=[];for(let i=0;i<10;i++)drafts.push(await create('quota-'+i,a));await assert.rejects(()=>create('quota-eleven',a),e=>e.status===429);
 for(let i=0;i<3;i++)await beta.mutate(command('submit',drafts[i]),a);await assert.rejects(()=>beta.mutate(command('submit',drafts[3]),a),e=>e.status===429);
});
test('Revocation and deleted accounts cannot continue; published content is retained',async()=>{
 const a={userId:'user_deleted'};await beta.invite(a.userId,expiry(),owner);let r=await create('deleted-author',a);r=await beta.mutate(command('submit',r),a);r=await decision(r,'approve-and-publish');const original=await core.published(r.id);await beta.accountDeleted(a.userId,owner);await assert.rejects(()=>beta.get(r.id,a),e=>e.status===403);assert.deepEqual(await core.published(r.id),original);assert.equal((await beta.invitationHistory(a.userId,owner)).events[0].action,'account-deleted');
});
test('Transactions roll back a failed idempotency insert; append-only tables cannot be rewritten',async()=>{
 const a={userId:'user_rollback'};await beta.invite(a.userId,expiry(),owner);const broken=createContributorStore({query:(...x)=>db.query(...x),transaction:fn=>db.transaction(tx=>fn({query:(sql,args)=>{if(sql.startsWith('INSERT INTO recipe_contributor_requests'))throw Error('Injected failure');return tx.query(sql,args);}}))});
 const c={action:'create',id:'ezeats-user:rollback',content:content('ezeats-user:rollback'),requestId:randomUUID()};await assert.rejects(()=>broken.mutate(c,a),/Injected/);assert.equal((await db.query('SELECT * FROM recipe_records WHERE id=$1',[c.id])).rows.length,0);
 for(const t of ['recipe_invitation_events','recipe_contributor_requests','recipe_change_requests'])await assert.rejects(()=>db.query('DELETE FROM '+t),/append-only/);
});
const users=new Map(['user_owner','user_alice','user_bob','user_uninvited','user_young'].map(id=>[id,{id,emailAddresses:[{emailAddress:id+'@example.test',verification:{status:'verified'}}],privateMetadata:{ezeatsAgeConfirmation:{minimumAge:id==='user_young'?12:13}}}]));
const authOptions={owners:()=>owner.userId,allowedOrigins:()=>['https://www.ezeats-eh.com'],makeClient:()=>({authenticateRequest:async r=>({toAuth:()=>({userId:r.headers.get('authorization')?.slice(7)})}),users:{getUser:async id=>{if(!users.has(id))throw Object.assign(Error('not found'),{status:404});return users.get(id);},getUserList:async({emailAddress})=>({data:[...users.values()].filter(u=>u.emailAddresses[0].emailAddress===emailAddress[0]),totalCount:1})}})};
const req=(method='GET',b,q={},user='user_alice')=>({method,body:b,query:q,url:'/?'+new URLSearchParams(q),headers:{origin:'https://www.ezeats-eh.com',authorization:'Bearer '+user,'content-type':'application/json'}});
const response=()=>({code:0,setHeader(){},status(n){this.code=n;return this;},json(x){this.data=x;}});
test('HTTP enforces signed-in age-eligible invitations, origins, methods, sizes and fields',async()=>{
 const h=createContributorHandler({store:beta,authOptions,enabled:()=>true});for(const [r,code] of [[{...req(),headers:{}},401],[req('GET',null,{},'user_uninvited'),403],[req('GET',null,{},'user_young'),403],[req('DELETE'),405],[{...req('POST',{}),headers:{authorization:'Bearer user_alice','content-type':'application/json'}},403],[req('POST','x'.repeat(66000)),413],[req('POST',{actor:'forged'}),400],[req('GET',null,{unexpected:'1'}),400]]){const s=response();await h(r,s);assert.equal(s.code,code);}
 const s=response();await createContributorHandler({store:beta,authOptions,enabled:()=>false})(req(),s);assert.equal(s.code,403);
});
test('Every contributor moderation attempt denied, every owner action independently checks allowlist',async()=>{
 const h=createContributorHandler({store:beta,authOptions,enabled:()=>true}),oh=createOwnerRecipesHandler({store:core,betaStore:beta,betaEnabled:()=>true,authOptions,enabled:()=>true});
 for(const action of ['approve','publish','approve-and-publish','request-changes','reject','remove','verify']){const b={action,id:'ezeats-user:ownership',expectedLock:1,requestId:randomUUID()};let s=response();await h(req('POST',b),s);assert.equal(s.code,403);s=response();await oh(req('POST',b),s);assert.equal(s.code,403);}
});
test('Owner invitation HTTP exact resolution and deletion reconciliation are server controlled',async()=>{
 const h=createInvitationsHandler({store:beta,authOptions,enabled:()=>true});let s=response();await h(req('POST',{action:'invite',identifier:'user_bob@example.test',expiresAt:expiry()},{},'user_owner'),s);assert.equal(s.code,200);
 s=response();await h(req('POST',{action:'invite',identifier:'user_bob',expiresAt:expiry()}),s);assert.equal(s.code,403);
 s=response();await h(req('POST',{action:'account-deleted',identifier:'user_bob'},{},'user_owner'),s);assert.equal(s.code,400);
});
test('Community catalog is separately disabled and returns only publication projections',async()=>{
 let h=createCommunityHandler({store:core,enabled:()=>false}),s=response();await h(req(),s);assert.equal(s.code,404);h=createCommunityHandler({store:core,enabled:()=>true,limiter:()=>true});s=response();await h(req('GET',null,{id:'ezeats-user:ownership'}),s);assert.equal(s.code,404);
 s=response();await h(req('GET',null,{id:'ezeats-user:deleted-author'}),s);assert.equal(s.code,200);assert.equal(s.data.recipe.suitability.status,'unverified');assert.ok(!JSON.stringify(s.data).includes('PRIVATE'));assert.ok(!JSON.stringify(s.data).includes('user_deleted'));
});

test('Source URLs reject local/numeric destinations and preserve permitted attribution without attestation leakage',async()=>{
 const raw=content('ezeats-user:source-validation');
 for(const sourceUrl of ['javascript:alert(1)','http://example.test/recipe','https://127.0.0.1/','https://172.16.1.1/','https://metadata.local/','https://a.localhost/','https://user:password@example.test/'])assert.throws(()=>normalizeContent({...raw,sourceUrl},alice));
 const doc=normalizeContent({...raw,rightsBasis:'permission',sourceUrl:'https://example.test/original',sourceAttribution:'Original author with permission'},alice);
 assert.equal(doc.attestation.basis,'permission');
 assert.throws(()=>normalizeContent({...raw,rightsBasis:'permission'},alice));
});

test('Deleted-account pending content stays private and is retained for owner resolution',async()=>{
 const a={userId:'user_deletedpending'};await beta.invite(a.userId,expiry(),owner);let r=await create('deleted-pending',a);r=await beta.mutate(command('submit',r),a);await beta.accountDeleted(a.userId,owner);
 await assert.rejects(()=>beta.get(r.id,a),e=>e.status===403);assert.equal((await core.get(r.id,{authorized:true,userId:owner.userId})).latest_status,'pending');assert.equal(await core.published(r.id),null);
});
