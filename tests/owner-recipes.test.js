import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {openLocalRecipeDatabase} from '../scripts/recipe-local-db.mjs';
import {createRecipeStore} from '../server/recipes/workspace/store.js';
import {neonDatabase,productionRecipeStore} from '../server/recipes/workspace/database.js';
import {createOwnerRecipesHandler} from '../api/owner-recipes.js';
import {normalizeContent,requireComplete,parseFilters,publicRecipe,WorkspaceError} from '../server/recipes/workspace/input.js';
import {publishedDatabaseProvider} from '../server/recipes/workspace/provider.js';
import {createCatalog} from '../server/recipes/catalog.js';
import {ownerRecipe} from './fixtures/owner-recipe.js';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRecipesHandler} from '../api/recipes.js';
const actor={authorized:true,userId:'owner-private-1'};let db,store;
before(async()=>{({db,store}=await openLocalRecipeDatabase());});after(async()=>{await db?.close();}); // In-memory database discarded, never touches Neon.
const create=content=>store.mutate({action:'create',id:content.id,content},actor);
const mutate=(r,action,extra={})=>store.mutate({action,id:r.id,expectedLock:r.lock_version,...extra},actor);
const latest=r=>r.revisions.at(-1).document.content;
test('Draft save/reload, immutable revision creation, author/origin, approval/publication and pending replacement',async()=>{
 let r=await create(ownerRecipe());assert.equal(r.origin,'ezeats-owned');assert.equal(r.latest_status,'draft');assert.equal(r.submitting_account_id,actor.userId);assert.equal((await store.get(r.id,actor)).revisions[0].document.content.privateNotes,'PRIVATE DRAFT NOTE');
 const first=structuredClone(r.revisions[0].document);r=await mutate(r,'save',{content:{...latest(r),description:'Updated original description'}});assert.equal(r.latest_version,2);assert.equal(r.latest_status,'draft');assert.deepEqual(r.revisions[0].document,first);
 r=await mutate(r,'submit');assert.equal(r.latest_status,'pending');r=await mutate(r,'approve');assert.equal(r.latest_status,'approved');assert.equal(await store.published(r.id),null);r=await mutate(r,'publish');assert.equal(r.published_version,2);const old=await store.published(r.id);
 r=await mutate(r,'save',{content:{...latest(r),title:'Replacement bowl'}});assert.equal(r.latest_status,'pending');assert.equal(r.published_version,2);assert.deepEqual(await store.published(r.id),old);
 r=await mutate(r,'request-changes',{notes:'Private correction'});assert.equal(r.latest_status,'changes-requested');assert.deepEqual(await store.published(r.id),old);
 r=await mutate(r,'save',{content:latest(r)});r=await mutate(r,'reject',{notes:'Private rejection'});assert.equal(r.latest_status,'rejected');assert.deepEqual(await store.published(r.id),old);
 r=await mutate(r,'save',{content:latest(r)});r=await mutate(r,'approve-and-publish');assert.equal((await store.published(r.id)).title,'Replacement bowl');assert.equal(r.published_version,r.latest_version);
 assert.ok(r.events.some(e=>e.action==='request-changes'));assert.equal(r.events.at(-1).actor_account_id,actor.userId);
});
test('Removal withdraws catalog pointer and preserves private audit; removed records cannot be edited',async()=>{
 let r=await create(ownerRecipe('ezeats-owner:remove'));r=await mutate(await mutate(r,'submit'),'approve-and-publish');const count=r.revisions.length;
 r=await mutate(r,'remove',{notes:'Withdraw for editorial correction'});assert.ok(r.removed_at);assert.equal(r.published_version,null);assert.equal(await store.published(r.id),null);assert.equal(r.revisions.length,count);assert.equal(r.events.at(-1).status,'removed');await assert.rejects(()=>mutate(r,'save',{content:latest(r)}),/Removed/);
});
test('Concurrent owners cannot overwrite stale versions; duplicate IDs and file namespace are rejected',async()=>{
 let r=await create(ownerRecipe('ezeats-owner:concurrent'));const old=r;const results=await Promise.allSettled([mutate(r,'save',{content:latest(r)}),mutate(r,'save',{content:{...latest(r),title:'Other owner edit'}})]);assert.equal(results.filter(x=>x.status==='fulfilled').length,1);assert.equal(results.filter(x=>x.status==='rejected'&&x.reason.status===409).length,1);
 await assert.rejects(()=>mutate(old,'submit'),/Another owner/);await assert.rejects(()=>create(ownerRecipe(r.id)),/already exists/);await assert.rejects(()=>create(ownerRecipe('ezeats:chickpea-bowl')),/reserved/);
 await assert.rejects(()=>store.get(r.id,{authorized:false,userId:'intruder'}),/Authorized/);
});
test('Schema rejects updates/deletions/truncation of revision and event audit rows',async()=>{
 for(const table of ['recipe_revisions','recipe_moderation_events']){
  await assert.rejects(()=>db.query(`DELETE FROM ${table}`),/append-only/);await assert.rejects(()=>db.query(`TRUNCATE ${table} CASCADE`),/append-only/);
 }
 await assert.rejects(()=>db.query("UPDATE recipe_revisions SET document='{}'::jsonb"),/append-only/);await assert.rejects(()=>db.query("UPDATE recipe_moderation_events SET private_notes='altered'"),/append-only/);
});
test('Transaction failure after revision and record inserts rolls everything back',async()=>{
 const bad=createRecipeStore({transaction:work=>db.transaction(tx=>work({query:(sql,params)=>{if(sql.startsWith('INSERT INTO recipe_moderation_events'))throw Error('Injected event insert failure');return tx.query(sql,params);}})),query:(...a)=>db.query(...a)});
 const c=ownerRecipe('ezeats-owner:rollback');await assert.rejects(()=>bad.mutate({action:'create',id:c.id,content:c},actor),/Injected/);assert.equal((await db.query('SELECT * FROM recipe_records WHERE id=$1',[c.id])).rows.length,0);assert.equal((await db.query('SELECT * FROM recipe_revisions WHERE recipe_id=$1',[c.id])).rows.length,0);
 let r=await create(ownerRecipe('ezeats-owner:rollback-save'));const lock=r.lock_version;await assert.rejects(()=>bad.mutate({action:'save',id:r.id,content:latest(r),expectedLock:lock},actor),/Injected/);r=await store.get(r.id,actor);assert.equal(r.lock_version,lock);assert.equal(r.revisions.length,1);
});
test('Neon transaction adapter commits, rolls back on failure and releases clients',async()=>{
 const statements=[];let releases=0;const client={query:async sql=>{statements.push(sql);return {rows:[]};},release:()=>releases++};const adapter=neonDatabase({connect:async()=>client});assert.equal(await adapter.transaction(async()=>42),42);await assert.rejects(()=>adapter.transaction(async()=>{throw Error('fail');}),/fail/);assert.equal(releases,2);assert.ok(statements.includes('COMMIT'));assert.ok(statements.includes('ROLLBACK'));
});
test('Published provider returns only approved pointer, conservative safety and no private fields',async()=>{
 const provider=publishedDatabaseProvider(store),recipe=await provider.getById('ezeats-owner:test-bean-bowl');assert.equal(recipe.suitability.status,'unverified');assert.equal(recipe.suitability.allergensComplete,false);assert.equal(recipe.suitability.dietEvidence,false);assert.equal(recipe.imageUrl,null);
 const raw=JSON.stringify(recipe);for(const secret of ['PRIVATE','owner-private','copyrightStatement','attestation','privateNotes','imageRights','reviewingAdministrator'])assert.ok(!raw.includes(secret),secret);
 const query=createCatalog(provider);assert.equal((await query({q:'Replacement',limit:10})).length,1);assert.equal((await query({q:'Replacement',limit:10,diets:['vegan']})).length,0);assert.equal((await query({q:'Replacement',limit:10,allergens:['Milk']})).length,0);assert.equal((await query({q:'Replacement',limit:10,exclude:['peanut']})).length,0);
});
test('Ingredient quantities, ordered instructions, timing, claims and rights are required at review gates',async()=>{
 const c=ownerRecipe('ezeats-owner:incomplete');c.ingredients=[];c.steps=[];c.servings=null;let r=await create(c);assert.equal(r.latest_status,'draft');await assert.rejects(()=>mutate(r,'submit'),/Complete/);
 for(const patch of [{ingredients:[{quantity:'0',unit:'cup',name:'beans',notes:''}]},{ingredients:[{quantity:'1/0',unit:'cup',name:'beans',notes:''}]},{steps:['']},{totalMinutes:16},{copyrightConfirmed:false},{safetyEvidence:''},{allergenEvidence:''},{dietEvidence:''},{knownAllergens:['Milk']}])assert.throws(()=>requireComplete({...ownerRecipe(),...patch}));
 const normal=normalizeContent(ownerRecipe(),actor);assert.equal(normal.evidence.diet.status,'claimed');assert.equal(normal.attestation.accountId,actor.userId);assert.equal(publicRecipe(normal).instructions[1].order,2);
});
test('Plain-text and exact-field validation rejects nested injection, forged authorship, uploads and unsafe values',()=>{
 for(const patch of [{title:'<img src=x onerror=alert(1)>'},{privateNotes:'<script>bad</script>'},{role:'owner'},{submittingAccountId:'other'},{imageUrl:'https://x/image.png'},{heat:1.5},{servings:'2'},{steps:[{text:'bad'}]},{ingredients:[{quantity:'1',unit:'cup',name:'beans',html:'bad'}]},{imageRights:{ownership:'none',licenseStatus:'unknown',owner:'',licenseReference:'',upload:'x'}}])assert.throws(()=>normalizeContent({...ownerRecipe(),...patch},actor));
});
test('Bounded queue search, status/author/date/meal/diet filters, empty results and invalid filters',async()=>{
 let page=await store.list(parseFilters({q:'Replacement',author:'Test',status:'published',mealType:'bowl',diet:'vegan',from:'2020-01-01',to:'2099-01-01'}),actor);assert.equal(page.items.length,1);
 page=await store.list(parseFilters({status:'removed'}),actor);assert.equal(page.items[0].id,'ezeats-owner:remove');assert.equal((await store.list(parseFilters({q:'zz-no-match'}),actor)).items.length,0);
 page=await store.list(parseFilters({limit:'1'}),actor);assert.equal(page.items.length,1);assert.equal(page.nextOffset,1);
 for(const q of [{status:'reported'},{from:'2026-02-31'},{from:'2026-02-01',to:'2025-01-01'},{offset:'-1'},{limit:'1000'},{admin:'true'},{q:['a','b']}])assert.throws(()=>parseFilters(q));
});
const response=()=>({setHeader(){},status(n){this.code=n;return this;},json(data){this.data=data;return this;}});
const authOptions={owners:()=>actor.userId,makeClient:()=>({authenticateRequest:async request=>({toAuth:()=>({userId:request.headers.get('authorization')==='Bearer owner'?actor.userId:'intruder'})})})};
const req=(method='GET',body,query={})=>({method,body,query,headers:{authorization:'Bearer owner','content-type':'application/json'}});
test('Every owner API operation checks Clerk/allowlist; nonowners, guest, forged IDs and wrong origins fail',async()=>{
 let writes=0;const handler=createOwnerRecipesHandler({store:{rateLimit:async()=>{},list:async()=>({items:[]}),mutate:async()=>{writes++;}},authOptions,enabled:()=>true});
 for(const action of ['create','save','submit','approve','publish','approve-and-publish','request-changes','reject','remove']){const r=req('POST',{action,userId:actor.userId,role:'owner'});r.headers.authorization='Bearer attacker';const s=response();await handler(r,s);assert.equal(s.code,403);}
 let s=response();await handler({...req(),headers:{}},s);assert.equal(s.code,401);s=response();await handler({...req(),headers:{authorization:'Bearer owner',origin:'https://attacker.example'}},s);assert.equal(s.code,403);assert.equal(writes,0);
 s=response();await handler(req(),s);assert.equal(s.code,200);s=response();await handler(req('POST',{action:'create',id:'ezeats-owner:spoof',content:ownerRecipe('ezeats-owner:spoof'),userId:'forged'}),s);assert.equal(s.code,400);
});
test('Disabled workspace, malformed/oversized bodies, unexpected query, stale lock and database failures return bounded errors',async()=>{
 let h=createOwnerRecipesHandler({store,authOptions,enabled:()=>false}),s=response();await h(req(),s);assert.equal(s.code,503);
 h=createOwnerRecipesHandler({store,authOptions,enabled:()=>true});
 for(const [r,code] of [[req('POST','{'),400],[req('POST','x'.repeat(66000)),413],[req('GET',null,{id:'ezeats-owner:no-such'}),404],[req('GET',null,{id:'ezeats-owner:no-such',q:'x'}),400],[req('POST',{action:'save',id:'ezeats-owner:concurrent',expectedLock:1,content:ownerRecipe('ezeats-owner:concurrent')}),409],[req('DELETE'),405]]){s=response();await h(r,s);assert.equal(s.code,code);}
 const broken=createOwnerRecipesHandler({store:{rateLimit:async()=>{throw Error('postgres://SECRET');}},authOptions,enabled:()=>true});s=response();await broken(req(),s);assert.equal(s.code,503);assert.ok(!JSON.stringify(s.data).includes('SECRET'));
});
test('Shared owner operation limit persists across store instances and remains bounded',async()=>{
 const limitedActor={authorized:true,userId:'limited-owner'},other=createRecipeStore(db);for(let n=0;n<60;n++)await (n%2?store:other).rateLimit(limitedActor);await assert.rejects(()=>other.rateLimit(limitedActor),e=>e.status===429);assert.equal((await db.query('SELECT * FROM recipe_owner_limits WHERE actor=$1',['limited-owner'])).rows.length,1);
});
test('No production recipe store without explicit flag and dedicated credentials',()=>{const saved=process.env.OWNER_RECIPES_ENABLED;delete process.env.OWNER_RECIPES_ENABLED;assert.equal(productionRecipeStore(),null);if(saved!==undefined)process.env.OWNER_RECIPES_ENABLED=saved;});
test('Disk-local drafts survive database close and reopen; fixtures are cleaned',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'ezeats-recipe-test-'));let instance;
 try{instance=await openLocalRecipeDatabase(dir);const c=ownerRecipe('ezeats-owner:persistent');await instance.store.mutate({action:'create',id:c.id,content:c},actor);await instance.db.close();instance=await openLocalRecipeDatabase(dir);assert.equal((await instance.store.get(c.id,actor)).revisions[0].document.content.title,c.title);}
 finally{await instance?.db.close();await rm(dir,{recursive:true,force:true});}
});
test('Public recipe route cannot retrieve database recipes even after owner publication',async()=>{
 const h=createRecipesHandler({env:{VERCEL:'1'},limiter:()=>true}),s=response();await h({method:'GET',url:'/api/recipes?id=ezeats-owner:test-bean-bowl',headers:{}},s);assert.equal(s.code,400);
 const all=response();await h({method:'GET',url:'/api/recipes?limit=100',headers:{}},all);assert.equal(all.data.recipes.length,100);assert.ok(all.data.recipes.every(r=>r.id.startsWith('ezeats:')));
});
test('Owner API rejects repeated query keys, forged metadata, wrong media types, and reports throttling',async()=>{
 const h=createOwnerRecipesHandler({store,authOptions,enabled:()=>true});let s=response();await h({...req(),url:'/api/owner-recipes?status=draft&status=published'},s);assert.equal(s.code,400);
 s=response();const r=req('POST',{action:'create',id:'ezeats-owner:wrong-media',content:ownerRecipe('ezeats-owner:wrong-media')});r.headers['content-type']='application/jsonp';await h(r,s);assert.equal(s.code,415);
 s=response();await h({...req(),headers:{authorization:'Bearer owner',origin:'http://localhost:4193'}},s);assert.equal(s.code,403); // localhost is never a production default.
 const limited=createOwnerRecipesHandler({store:{rateLimit:()=>{throw new WorkspaceError('Too many operations',429);}},authOptions,enabled:()=>true});s=response();await limited(req(),s);assert.equal(s.code,429);
 const q=ownerRecipe();q.ingredients[0].quantity='1/00';assert.throws(()=>requireComplete(q));
});
test('Long revision histories are bounded, keep the published snapshot, and expose older revisions only through owner reads',async()=>{
 let r=await create(ownerRecipe('ezeats-owner:long-history'));r=await mutate(await mutate(r,'submit'),'approve-and-publish');
 for(let i=0;i<102;i++)r=await mutate(r,'save',{content:{...latest(r),description:'Revision '+i}});
 assert.equal(r.revisions.length,21);assert.equal(r.revisions[0].version,1);assert.equal(r.revisions.at(-1).version,103);assert.equal(r.events.length,100);assert.ok(r.nextBefore);
 const earlier=await store.history(r.id,r.nextBefore,actor);assert.equal(earlier.events.length,5);assert.equal(earlier.nextBefore,null);assert.ok(!earlier.events.some(e=>r.events.some(current=>current.event_id===e.event_id)));
 assert.equal((await store.revision(r.id,2,actor)).document.content.description,'Revision 0');await assert.rejects(()=>store.revision(r.id,2,{authorized:false,userId:'x'}),/Authorized/);
 const h=createOwnerRecipesHandler({store,authOptions,enabled:()=>true});let s=response();await h(req('GET',null,{id:r.id,version:'2'}),s);assert.equal(s.code,200);s=response();await h(req('GET',null,{id:r.id,before:r.nextBefore}),s);assert.equal(s.code,200);
 s=response();await h({...req('GET',null,{id:r.id,version:'2'}),headers:{authorization:'Bearer attacker'}},s);assert.equal(s.code,403);
});
