import test from 'node:test';
import assert from 'node:assert/strict';
import {createProfileOperations} from '../server/profile-operations.js';
import {createProfileHandler} from '../api/profile.js';
import {observeEndpoint} from '../server/diagnostics.js';
const response=()=>({setHeader(){},status(n){this.code=n;return this;},json(body){this.body=body;return this;}});
test('Profile coordination takes a shared lock before reading/writing Clerk data',async()=>{
 const calls=[];const db={query:async(sql,params)=>{calls.push({sql,params});return {rows:[{operations:1}]};},transaction:async work=>{calls.push('begin');const value=await work(db);calls.push('commit');return value;}};
 const guard=createProfileOperations(()=>db);
 assert.equal(await guard('verified-user','POST',async()=>{calls.push('work');return 7;}),7);
 assert.ok(calls[0].sql.includes('ON CONFLICT'));assert.deepEqual(calls[0].params,['verified-user']);
 assert.ok(calls[3].sql.includes('pg_advisory_xact_lock'));
 assert.deepEqual(calls.slice(-2),['work','commit']);
 calls.length=0;await guard('verified-user','GET',()=>calls.push('read'));assert.equal(calls.length,2);
});
test('Profile quota and database failure fail closed without calling Clerk mutation',async()=>{
 let worked=false;
 await assert.rejects(createProfileOperations(()=>null)('u','POST',()=>{worked=true;}));
 await assert.rejects(createProfileOperations(()=>({query:async()=>({rows:[{operations:61}]})}))('u','POST',()=>{worked=true;}),e=>e.status===429);
 assert.equal(worked,false);
 const client=()=>({authenticateRequest:async()=>({toAuth:()=>({userId:'session-user'})})});
 const r=response();await createProfileHandler(client,{guard:async()=>{throw Object.assign(new Error('limit'),{status:429});}})({method:'GET',headers:{authorization:'Bearer fixture'}},r);assert.equal(r.code,429);
});
test('Operational logs exclude all request content and logging failures do not break requests',async()=>{
 const rows=[];const h=observeEndpoint('profile',async(req,res)=>res.status(403).json({error:'No'}),{write:v=>rows.push(v),id:()=> 'request-1',now:()=>1});
 const r=response();await h({method:'POST',body:{secret:'private draft'},url:'/api/profile?token=secret',headers:{authorization:'Bearer secret'},userId:'private-user'},r);
 assert.deepEqual(rows,[{event:'api-result',route:'profile',method:'POST',status:403,requestId:'request-1',durationMs:0}]);
 const r2=response();await observeEndpoint('profile',async(_,res)=>res.status(200).json({ok:true}),{write:()=>{throw Error('sink down');}})({method:'POST'},r2);assert.equal(r2.code,200);
});

import {applyProfile} from '../dist/profile-matching.js';
import {validateProfile} from '../dist/profile-schema.js';
import {meals} from '../dist/meals.js';
import {parseRecipeQuery} from '../api/recipes.js';
import {matchesRestrictions} from '../server/recipes/model.js';
import {ownedRecipes} from '../server/recipes/owned/catalog.js';
test('Additional Canadian allergen categories are accepted but conservatively pause suggestions',()=>{
 for(const allergy of ['Mustard','Sulphites','Triticale']){
  const profile=validateProfile({allergies:[allergy]});assert.deepEqual(applyProfile(meals,profile),[]);
  assert.deepEqual(parseRecipeQuery('/api/recipes?allergens='+allergy).allergens,[allergy]);
  assert.equal(matchesRestrictions(ownedRecipes[0],{allergens:[allergy]}),false);
 }
});

import {openLocalRecipeDatabase} from '../scripts/recipe-local-db.mjs';
import {readFile} from 'node:fs/promises';
test('Shared profile quota uses existing SQL and serialized history preserves simultaneous choices',async()=>{
 const {db}=await openLocalRecipeDatabase();
 try{
  await db.exec(await readFile(new URL('../server/recipes/contributors/schema.sql',import.meta.url),'utf8'));
  const guard=createProfileOperations(()=>db),metadata={ezeatsAgeConfirmation:{minimumAge:13},ezeatsMealHistory:[]};
  const client=()=>({authenticateRequest:async()=>({toAuth:()=>({userId:'user_profilefixture'})}),users:{getUser:async()=>({privateMetadata:structuredClone(metadata)}),updateUserMetadata:async(_,patch)=>Object.assign(metadata,patch.privateMetadata)}});
  const h=createProfileHandler(client,{guard});
  const save=async(choiceId)=>{const r=response();await h({method:'POST',headers:{authorization:'Bearer fixture'},body:{mealId:'chickpea-bowl',choiceId}},r);assert.equal(r.code,200);};
  await Promise.all([save('choice-parallel-a'),save('choice-parallel-b')]);
  assert.equal(metadata.ezeatsMealHistory.length,2);
  await db.query("UPDATE recipe_contributor_limits SET operations=60 WHERE actor=$1",['user_profilefixture']);
  await assert.rejects(guard('user_profilefixture','GET',()=>{}),e=>e.status===429);
 }finally{await db.close();}
});

test('All static recipe pages match the public catalog and retain unverified-safety disclosures',async()=>{
 for(const recipe of ownedRecipes){
  const html=await readFile(new URL('../dist/recipes/'+recipe.id.slice(7)+'/index.html',import.meta.url),'utf8');
  const structured=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(structured.name,recipe.title);
  assert.equal(structured.recipeIngredient.length,recipe.ingredients.length);
  assert.deepEqual(structured.recipeInstructions.map(s=>s.text),recipe.instructions.map(s=>s.text));
  assert.equal(structured.totalTime,`PT${recipe.time.totalMinutes}M`);
  assert.ok(html.includes('not kitchen-tested'));assert.ok(html.includes('suitability: unverified'));
  assert.ok(!('aggregateRating' in structured));assert.ok(!('nutrition' in structured));
 }
});
