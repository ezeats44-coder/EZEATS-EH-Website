import test from 'node:test';
import assert from 'node:assert/strict';
import {feedbackAccess} from '../server/feedback/access.js';
import {createFeedbackHandler} from '../api/feedback.js';
const on={FEEDBACK_ENABLED:'true'},user={userId:'user_test'},owner={userId:'user_owner',owner:true};
test('Feedback test mode defaults closed to non-owners and matches exact verified IDs',()=>{
 assert.equal(feedbackAccess(user,on),false);assert.equal(feedbackAccess(owner,on),true);
 assert.equal(feedbackAccess(user,{...on,FEEDBACK_TEST_USER_IDS:' user_test ,user_other'}),true);
 for(const id of ['user_t','user_test_extra','test@example.com'])assert.equal(feedbackAccess({userId:id},{...on,FEEDBACK_TEST_USER_IDS:'user_test'}),false);
 assert.equal(feedbackAccess({...user,contributor:true},on),false);
});
test('Feedback master switch and invalid modes fail closed; broad access is explicit',()=>{
 assert.equal(feedbackAccess(owner,{}),false);assert.equal(feedbackAccess(owner,{...on,FEEDBACK_ACCESS_MODE:'typo'}),false);
 assert.equal(feedbackAccess(user,{...on,FEEDBACK_ACCESS_MODE:'signed-in'}),true);assert.equal(feedbackAccess({}, {...on,FEEDBACK_ACCESS_MODE:'signed-in'}),false);
});
test('Feedback access gate covers reads and writes before touching the database',async()=>{
 let calls=0;const store={limit(){calls++;throw Error('Must not run');}};
 for(const method of ['GET','POST']){let code,payload;const res={setHeader(){},status(v){code=v;return this;},json(v){payload=v;}};await createFeedbackHandler({auth:async()=>user,store,enabled:()=>true,access:()=>false})({method,url:'/api/feedback',headers:{},body:{action:'create',userId:'user_owner'}},res);assert.equal(code,403);assert.ok(!JSON.stringify(payload).includes('user_owner'));}assert.equal(calls,0);
});
test('Access discovery exposes only a boolean and cannot bypass Owner authorization',async()=>{
 async function run(ownerOnly=false){let code,data;const res={setHeader(){},status(v){code=v;return this;},json(v){data=v;}};await createFeedbackHandler({owner:ownerOnly,auth:async()=>user,enabled:()=>true,access:()=>true})({method:'GET',url:'/api/feedback?access=1',headers:{}},res);return {code,data};}
 assert.deepEqual(await run(),{code:200,data:{available:true}});assert.equal((await run(true)).code,403);
});
test('Feedback draft is labeled and contains actual retention limits without automatic-erasure promises',async()=>{
 const {readFile}=await import('node:fs/promises');const text=await readFile(new URL('../dist/feedback/privacy/index.html',import.meta.url),'utf8');
 for(const phrase of ['Draft for Owner review','90 days','30 days','12 months','not automatic deletion promises','does not automatically delete Feedback','Back to Feedback'])assert.ok(text.includes(phrase),phrase);
 assert.ok(!text.includes('<script'));
});
