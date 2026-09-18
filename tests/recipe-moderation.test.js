import test from 'node:test';
import assert from 'node:assert/strict';
import {localProvider} from '../server/recipes/local.js';
import {createRecipeRecord,reviseRecipe,moderateRecipe,publishedRecipe,compareRevisions} from '../server/recipes/moderation/service.js';
import {normalizeRevisionInput} from '../server/recipes/moderation/model.js';
import {createRecipeManagementBoundary} from '../server/recipes/moderation/boundary.js';
const actor={authorized:true,userId:'owner-1'};
const input=async()=>({payload:await localProvider.getById('ezeats:chickpea-bowl'),originalAuthor:{name:'Test author'},publicAttribution:'By test author',copyrightAttestation:{confirmed:true,basis:'original-work',statement:'I own this original work.',attestedBy:'owner-1',attestedAt:'2026-09-17T00:00:00Z'}});
const make=async()=>createRecipeRecord({origin:'user-submitted',submittingAccountId:'author-1',input:await input()},actor,0);
function action(r,action,version=r.revisions.at(-1).version,notes){return moderateRecipe(r,{action,version,notes,expectedLock:r.lockVersion},actor,1000);}
test('Published content survives pending edits, changes requested and rejection; publishing atomically replaces pointer',async()=>{
 let r=await make();assert.equal(publishedRecipe(r),null);r=action(r,'submit');r=action(r,'approve-and-publish');const old=publishedRecipe(r);
 const edited=await input();edited.payload.title='Edited draft title';r=reviseRecipe(r,edited,actor,r.lockVersion,2000);
 assert.equal(r.revisions[1].status,'pending');assert.deepEqual(publishedRecipe(r),old);assert.equal(compareRevisions(r,2).published.version,1);
 r=action(r,'request-changes',2,'Private correction needed');assert.deepEqual(publishedRecipe(r),old);
 r=reviseRecipe(r,edited,actor,r.lockVersion,3000);r=action(r,'reject',3,'Private rejected reason');assert.deepEqual(publishedRecipe(r),old);
 r=reviseRecipe(r,edited,actor,r.lockVersion,4000);r=action(r,'approve');assert.deepEqual(publishedRecipe(r),old);r=action(r,'publish');assert.equal(publishedRecipe(r).recipe.title,'Edited draft title');assert.equal(r.publishedVersion,4);
 assert.equal(r.revisions[0].payload.title,old.recipe.title);assert.ok(!JSON.stringify(publishedRecipe(r)).includes('Private'));assert.ok(!JSON.stringify(publishedRecipe(r)).includes('author-1'));
 r=action(r,'remove');assert.equal(publishedRecipe(r),null);assert.equal(r.revisions.length,4);
});
test('Stale edits, unauthorized actors, superseded approval and missing copyright rights fail closed',async()=>{
 let r=await make();assert.throws(()=>reviseRecipe(r,{},actor,0),/conflict/);assert.throws(()=>action(r,'publish'),/transition/);
 assert.throws(()=>moderateRecipe(r,{action:'submit',version:1,expectedLock:r.lockVersion},{userId:'attacker'}),/Authorized/);
 r=action(r,'submit');r=reviseRecipe(r,await input(),actor,r.lockVersion);assert.throws(()=>action(r,'approve',1),/Superseded/);
 const noRights=await input();noRights.copyrightAttestation={};let other=createRecipeRecord({origin:'ezeats-owned',input:noRights},actor);other=action(other,'submit');assert.throws(()=>action(other,'approve'),/Copyright/);
 assert.throws(()=>createRecipeRecord({origin:'licensed-provider',input:noRights},actor),/storage permission/);
});
test('Attribution, rights, image ownership and evidence remain explicit; user claims never imply safe matching',async()=>{
 const i=await input();i.suitability={allergens:{status:'claimed',claim:'No nuts'}};const normalized=normalizeRevisionInput(i);assert.equal(normalized.suitability.allergens.status,'claimed');assert.equal(normalized.suitability.foodSafety.status,'unknown');
 assert.throws(()=>normalizeRevisionInput({...i,suitability:{allergens:{status:'verified'}}}),/Verification/);
 assert.throws(()=>normalizeRevisionInput({...i,publicAttribution:'<script>bad</script>'}),/Plain text/);
 const r=action(action(createRecipeRecord({origin:'user-submitted',input:i},actor),'submit'),'approve-and-publish');assert.equal(publishedRecipe(r).recipe.suitability.allergensComplete,false);assert.equal(publishedRecipe(r).recipe.suitability.dietEvidence,false);
 i.payload.imageUrl='https://example.com/photo.jpg';const photo=action(createRecipeRecord({origin:'user-submitted',input:i},actor),'submit');assert.throws(()=>action(photo,'approve'),/Image rights/);
});
test('Every management call authenticates independently; disabled dispatch cannot collect data',async()=>{
 let calls=0,writes=0;const authOptions={owners:()=> 'owner-1,admin-2',makeClient:()=>({authenticateRequest:async()=>{calls++;return {toAuth:()=>({userId:'owner-1'})};}})};
 const response=()=>({setHeader(){},status(n){this.code=n;return this;},json(body){this.body=body;}});
 const req={method:'POST',headers:{authorization:'Bearer token'}};
 const disabled=createRecipeManagementBoundary({authOptions});let res=response();await disabled(req,res);assert.equal(res.code,501);
 const boundary=createRecipeManagementBoundary({authOptions,dispatch:async(req,actor)=>{assert.equal(actor.userId,'owner-1');writes++;return {};}});
 for(let n=0;n<2;n++){res=response();await boundary(req,res);assert.equal(res.code,200);}assert.equal(calls,3);assert.equal(writes,2);
 res=response();await boundary({...req,headers:{}},res);assert.equal(res.code,401);assert.equal(writes,2);
 res=response();await createRecipeManagementBoundary({authOptions:{...authOptions,owners:()=>''},dispatch:async()=>writes++})(req,res);assert.equal(res.code,403);assert.equal(writes,2);
});
