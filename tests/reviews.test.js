import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {validateReview} from '../dist/review-schema.js';
import {createLocalReviewStore} from '../scripts/review-store.mjs';
import {createReviewsHandler} from '../api/reviews.js';
import {createLocalModerationHandler} from '../scripts/review-moderation.mjs';
const valid={name:'Tester',comment:'The meal picker could offer more variety.',rating:2,consent:true,submissionId:'test-review-00000001'};
test('Review validation allows criticism, optional ratings and anonymous display names',()=>{
 assert.equal(validateReview(valid).rating,2);
 assert.equal(validateReview({...valid,name:' ',rating:null}).name,'Anonymous');
 for(const patch of [{comment:'short'},{comment:'x'.repeat(2001)},{rating:6},{rating:'5'},{name:'x'.repeat(41)},{consent:false},{submissionId:'bad'},{status:'published'}])assert.throws(()=>validateReview({...valid,...patch}));
});
test('Pending reviews stay private, persist, and publish independently of rating; retries do not duplicate',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'ezeats-review-test-'));
 try{
 const file=path.join(dir,'reviews.json'),store=createLocalReviewStore(file),review=validateReview(valid);
 await Promise.all([store.submit(review),store.submit(review)]);
 assert.equal((await store.pending()).length,1);assert.deepEqual(await store.published(),[]);
 const [pending]=await createLocalReviewStore(file).pending();await store.moderate(pending.id,'published');
 const [published]=await createLocalReviewStore(file).published();assert.equal(published.rating,2);assert.equal(published.comment,valid.comment);assert.equal(published.submissionId,undefined);
 await store.moderate(pending.id,'rejected');assert.deepEqual(await store.published(),[]);
 }finally{await rm(dir,{recursive:true,force:true});}
});
function response(){return {statusCode:200,setHeader(){},status(code){this.statusCode=code;return this;},json(body){this.body=body;return this;}};}
test('Local moderation rejects external hosts and origins and accepts only valid local decisions',async()=>{
 let saves=0;const handler=createLocalModerationHandler({moderate:async()=>saves++});
 for(const headers of [{host:'evil.test:4183',origin:'http://evil.test:4183'},{host:'localhost:4183',origin:'https://evil.test'},{host:'localhost:4183'}]){const res=response();await handler({method:'POST',headers,body:{id:'id',status:'published'}},res);assert.equal(res.statusCode,403);}
 const res=response();await handler({method:'POST',headers:{host:'localhost:4183',origin:'http://localhost:4183'},body:{id:'id',status:'published'}},res);assert.equal(res.statusCode,200);assert.equal(saves,1);
});
test('Reviews API fails closed without storage and rejects client publication or cross-origin posts',async()=>{
 let res=response();await createReviewsHandler()({method:'POST',headers:{},body:valid},res);assert.equal(res.statusCode,503);
 const handler=createReviewsHandler({published:async()=>[],submit:async()=>{}});
 res=response();await handler({method:'POST',headers:{origin:'https://unrelated.test',host:'localhost:4183'},body:valid},res);assert.equal(res.statusCode,403);
 res=response();await handler({method:'POST',headers:{},body:{...valid,status:'published'}},res);assert.equal(res.statusCode,400);
 res=response();await handler({method:'POST',headers:{},body:valid},res);assert.equal(res.statusCode,201);assert.equal(res.body.status,'pending');
 res=response();await handler({method:'DELETE',headers:{}},res);assert.equal(res.statusCode,405);
});

import {createModerationHandler} from '../api/review-moderation.js';
test('Production moderation requires verified owner identity, rejects guests and other accounts',async()=>{
 let writes=0;
 const store={pending:async()=>[],published:async()=>[],moderate:async()=>writes++};
 const makeClient=userId=>()=>({authenticateRequest:async()=>({toAuth:()=>({userId})})});
 for(const [userId,expected] of [['other',403],['owner',200],[null,403]]){
  const handler=createModerationHandler({store,makeClient:makeClient(userId),owners:()=> 'owner'}),res=response();
  await handler({method:'GET',headers:{authorization:'Bearer test'}},res);assert.equal(res.statusCode,expected);
 }
 const handler=createModerationHandler({store,makeClient:makeClient('owner'),owners:()=> 'owner'});
 let res=response();await handler({method:'GET',headers:{}},res);assert.equal(res.statusCode,401);
 res=response();await handler({method:'POST',headers:{authorization:'Bearer test',origin:'https://evil.test'},body:{}},res);assert.equal(res.statusCode,403);
 res=response();await handler({method:'POST',headers:{authorization:'Bearer test'},body:{id:'12345678-1234-1234-1234-123456789abc',status:'published'}},res);assert.equal(res.statusCode,200);assert.equal(writes,1);
 res=response();await createModerationHandler({store,makeClient:makeClient('owner'),owners:()=>''})({method:'GET',headers:{authorization:'Bearer test'}},res);assert.equal(res.statusCode,403);
});
test('Shared review API uses production origin allowlist and reports throttling',async()=>{
 const handler=createReviewsHandler({local:false,submit:async()=>{throw new Error('REVIEW_LIMIT');}});
 let res=response();await handler({method:'POST',headers:{origin:'https://www.ezeats-eh.com'},body:valid},res);assert.equal(res.statusCode,429);
 res=response();await handler({method:'POST',headers:{host:'evil.test',origin:'http://evil.test'},body:valid},res);assert.equal(res.statusCode,403);
});

import {createOwnerHandler} from '../api/owner.js';
test('Owner dashboard access accepts every explicitly listed owner and denies others or failures',async()=>{
 for(const [id,list,expected] of [['first','first, second',200],['second','first, second',200],['stranger','first, second',403],['first','',403],[null,'first',403]]){
  const handler=createOwnerHandler({owners:()=>list,makeClient:()=>({authenticateRequest:async()=>({toAuth:()=>({userId:id})})})});
  const res=response();await handler({method:'GET',headers:{authorization:'Bearer verified'}},res);assert.equal(res.statusCode,expected);assert.equal(res.body.owner,expected===200);
 }
 const handler=createOwnerHandler({makeClient:()=>{throw new Error('unavailable');}});
 let res=response();await handler({method:'GET',headers:{}},res);assert.equal(res.statusCode,401);
 res=response();await handler({method:'POST',headers:{}},res);assert.equal(res.statusCode,405);
 res=response();await handler({method:'GET',headers:{authorization:'Bearer invalid'}},res);assert.equal(res.statusCode,503);assert.equal(res.body.owner,false);
 res=response();await handler({method:'GET',headers:{authorization:'Bearer token',origin:'https://unrelated.test'}},res);assert.equal(res.statusCode,403);
});
