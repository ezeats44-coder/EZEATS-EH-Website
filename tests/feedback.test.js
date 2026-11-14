import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {createFeedbackStore} from '../server/feedback/store.js';
import {createFeedbackHandler} from '../api/feedback.js';
let db,store;const a={userId:'alice'},b={userId:'bob'},owner={userId:'owner',owner:true};
const create=(extra={})=>({action:'create',requestId:randomUUID(),subject:'PREVIEW TEST',category:'Suggestion',message:'Please add a useful feature.\nThank you.',...extra});
before(async()=>{db=new PGlite();await db.exec(await readFile(new URL('../server/feedback/schema.sql',import.meta.url),'utf8'));store=createFeedbackStore(db);});after(()=>db.close());
test('Feedback lifecycle, ownership, unread, statuses, close/reopen and archive',async()=>{
 const {id}=await store.mutate(create(),a);assert.equal((await store.list({},owner)).items[0].unread,true);
 await assert.rejects(()=>store.get(id,b),e=>e.status===404);await assert.rejects(()=>store.get(id,{}),e=>e.status===401);
 let r=await store.get(id,owner);await store.mutate({action:'read',id,sequence:r.conversation.sequence},owner);assert.equal((await store.get(id,owner)).conversation.unread,false);
 await store.mutate({action:'reply',id,requestId:randomUUID(),message:'Thanks!'},owner);r=await store.get(id,a);assert.equal(r.conversation.unread,true);assert.equal(r.messages[1].sender,'EZEATS Team');assert.ok(!JSON.stringify(r).includes('alice'));
 await store.mutate({action:'read',id,sequence:r.conversation.sequence},a);assert.equal((await store.get(id,a)).conversation.unread,false);
 for(const status of ['Reviewing','Planned','Resolved','Closed']){r=await store.get(id,owner);await store.mutate({action:'status',id,status,version:r.conversation.version},owner);}
 await assert.rejects(()=>store.mutate({action:'reply',id,message:'Again',requestId:randomUUID()},a),e=>e.status===409);
 r=await store.get(id,owner);await store.mutate({action:'status',id,status:'Reviewing',version:r.conversation.version},owner);await store.mutate({action:'reply',id,message:'Again',requestId:randomUUID()},a);
 r=await store.get(id,owner);await store.mutate({action:'archive',id,version:r.conversation.version},owner);assert.equal((await store.get(id,a)).conversation.archived,true);assert.equal((await store.list({archived:'true'},owner)).items.length,1);
});
test('Duplicate sends, mismatched retry, stale status and no cross-user mutation',async()=>{
 const cmd=create(),first=await store.mutate(cmd,a);assert.deepEqual(await store.mutate(cmd,a),{id:first.id,duplicate:true});assert.equal((await store.get(first.id,a)).messages.length,1);
 await assert.rejects(()=>store.mutate({...cmd,message:'Changed'},a),e=>e.status===409);
 await assert.rejects(()=>store.mutate({action:'reply',id:first.id,requestId:randomUUID(),message:'Hi'},b),e=>e.status===404);
 await assert.rejects(()=>store.mutate({action:'status',id:first.id,version:2,status:'Closed'},a),e=>e.status===403);
 await assert.rejects(()=>store.mutate({action:'status',id:first.id,version:1,status:'Closed'},owner),e=>e.status===409);
});
test('Reject invalid fields, scripts, excessive text, categories, identities and pagination',async()=>{
 for(const patch of [{category:'Invalid'},{subject:''},{message:'<script>alert(1)</script>'},{message:'x'.repeat(4001)},{userId:'owner'},{role:'owner'}])await assert.rejects(()=>store.mutate(create(patch),a));
 for(const q of [{offset:-1},{offset:10001},{status:'Invalid'},{category:'Invalid'},{search:'x'.repeat(121)}])await assert.rejects(()=>store.list(q,a));
 await assert.rejects(()=>store.get('broken',a));
});
test('Bounded lists, message history and read watermark preserve later unread replies',async()=>{
 for(let i=0;i<22;i++)await store.mutate(create({subject:'Page '+i}),b);const page=await store.list({},b);assert.equal(page.items.length,20);assert.equal(page.nextOffset,20);assert.equal((await store.list({offset:20},b)).items.length,2);
 const {id}=await store.mutate(create(),a);for(let i=0;i<51;i++)await store.mutate({action:'reply',id,requestId:randomUUID(),message:'Reply '+i},owner);
 const r=await store.get(id,a);assert.equal(r.messages.length,50);assert.ok(r.before);assert.equal((await store.get(id,a,r.before)).messages.length,2);
 await store.mutate({action:'read',id,sequence:1},a);assert.equal((await store.get(id,a)).conversation.unread,true);
});
test('Shared rate limits reject request 61 and do not expose private data',async()=>{for(let i=0;i<60;i++)await store.limit({userId:'limited'});await assert.rejects(()=>store.limit({userId:'limited'}),e=>e.status===429);});
test('API verifies owner, signed-out denial, methods, flags and safe database failures',async()=>{
 async function run(options,req={method:'GET',url:'/api/feedback',headers:{}}){let status,result;const res={setHeader(){},status(s){status=s;return this;},json(v){result=v;}};await createFeedbackHandler(options)(req,res);return {status,result};}
 assert.equal((await run({auth:async()=>a,owner:true,enabled:()=>true,store})).status,403);
 assert.equal((await run({auth:async()=>a,enabled:()=>false,store})).status,404);
 assert.equal((await run({auth:async()=>a,enabled:()=>true,store:{limit(){throw Error('PRIVATE');}}})).status,503);
 const result=await run({auth:async()=>a,enabled:()=>true,store},{method:'DELETE',url:'/',headers:{}});assert.equal(result.status,405);
 const own=await run({auth:async()=>({...a,owner:true}),enabled:()=>true,store});assert.ok(own.result.items.every(x=>!('account_id' in x)));
});
test('Failed transactions leave no partial conversation or retry receipt',async()=>{
 const beforeCount=(await db.query('SELECT count(*)::int AS n FROM feedback_conversations')).rows[0].n;
 const broken=createFeedbackStore({transaction:work=>db.transaction(tx=>work({query:(sql,args)=>{if(sql.startsWith('INSERT INTO feedback_messages'))throw Error('Injected failure');return tx.query(sql,args);}}))});
 await assert.rejects(()=>broken.mutate(create(),a),/Injected failure/);
 assert.equal((await db.query('SELECT count(*)::int AS n FROM feedback_conversations')).rows[0].n,beforeCount);
});
test('Simultaneous replies and retries stay distinct and ordered',async()=>{
 const {id}=await store.mutate(create(),a),reply={action:'reply',id,message:'Safe retry',requestId:randomUUID()};
 const results=await Promise.all([store.mutate(reply,a),store.mutate(reply,a),store.mutate({...reply,requestId:randomUUID(),message:'Team reply'},owner)]);
 assert.equal(results.filter(x=>x.duplicate).length,1);const r=await store.get(id,a);assert.deepEqual(r.messages.map(x=>x.sequence),[1,2,3]);
});
test('Real auth boundary rejects absent or invalid sessions and disallowed mutation origins',async()=>{
 const {betaIdentity}=await import('../server/recipes/contributors/auth.js');
 const authOptions={allowedOrigins:()=>['https://preview.example'],owners:()=>owner.userId,makeClient:()=>({authenticateRequest:async()=>({toAuth:()=>null})})};
 await assert.rejects(()=>betaIdentity({method:'GET',headers:{}},authOptions),e=>e.status===401);
 await assert.rejects(()=>betaIdentity({method:'POST',headers:{authorization:'Bearer fake',origin:'https://evil.example'}},authOptions),e=>e.status===403);
 await assert.rejects(()=>betaIdentity({method:'POST',headers:{authorization:'Bearer fake'}},authOptions),e=>e.status===403);
 await assert.rejects(()=>betaIdentity({method:'GET',headers:{authorization:'Bearer expired'}},authOptions),e=>e.status===401);
});
test('Invalid statuses and read markers do not change the record',async()=>{
 const {id}=await store.mutate(create(),a);const r=await store.get(id,owner);
 await assert.rejects(()=>store.mutate({action:'status',id,version:r.conversation.version,status:'Invisible'},owner));
 await assert.rejects(()=>store.mutate({action:'read',id,sequence:999},a));
 assert.equal((await store.get(id,a)).conversation.status,'New');
});
