import test from 'node:test';
import assert from 'node:assert/strict';
import {meals,rankMeals,defaults} from '../dist/meals.js';
import {localProvider} from '../server/recipes/local.js';
import {createMealDBProvider} from '../server/recipes/themealdb.js';
import {createCatalog} from '../server/recipes/catalog.js';
import {validateRecipe,matchesRestrictions,uniqueRecipes} from '../server/recipes/model.js';
import {createRecipesHandler,parseRecipeQuery,createRecipeLimiter} from '../api/recipes.js';
import {createPreviewServer} from '../scripts/dev.mjs';
const fixture={idMeal:'12345',strMeal:'Synthetic test bowl',strIngredient1:'Test beans',strMeasure1:'1 cup',strInstructions:'First test step.\r\n\r\nSecond test step.',strArea:'Test cuisine',strCategory:'Vegan',strSource:'https://example.com/recipe',strMealThumb:'javascript:bad'};
const provider=createMealDBProvider();
const response=()=>({statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.statusCode=n;return this;},json(b){this.body=b;return this;}});
test('100 first-party recipes retain picker mapping and ranking',async()=>{
 assert.equal(meals.length,100);const all=await localProvider.search({limit:100});assert.equal(all.length,100);
 for(const m of meals){const r=await localProvider.getById(`ezeats:${m.id}`);assert.equal(r.title,m.name);assert.equal(r.time.totalMinutes,m.minutes);assert.deepEqual(r.ingredients.map(i=>i.name),m.ingredients);assert.ok(r.instructions.length);assert.ok(r.servings>0);}
 assert.equal(await localProvider.getById('ezeats:missing'),null);
 assert.equal(rankMeals({...defaults,time:60,budget:20,heat:2},()=>0).length,100);
 for(const m of rankMeals({...defaults,diets:['vegan']},()=>0)){assert.ok(m.diets.includes('vegan'));assert.ok(await localProvider.getById('ezeats:'+m.id));}
});
test('Provider normalization retains attribution, unknowns, order and raw ambiguous measures without inventing diet safety',()=>{
 const r=provider.normalize(fixture);assert.equal(r.id,'themealdb:12345');assert.equal(r.servings,null);assert.equal(r.imageUrl,null);assert.deepEqual(r.dietTags,[]);assert.equal(r.instructions[1].order,2);assert.equal(r.ingredients[0].notes,'Provider measurement: 1 cup');assert.equal(r.source.ownership,'third-party');assert.equal(r.suitability.status,'unverified');assert.equal(r.source.verifiedAt,null);
 const missing=provider.normalize({...fixture,strInstructions:null,strSource:null});assert.equal(missing.instructions,null);assert.equal(missing.source.originalUrl,null);assert.ok(missing.source.attribution);
 for(const bad of [null,{}, {...fixture,idMeal:'../evil'}, {...fixture,strMeal:4}])assert.throws(()=>provider.normalize(bad));
 assert.throws(()=>validateRecipe({...r,source:{}}));assert.throws(()=>validateRecipe({...r,ingredients:[{name:5}]}));assert.throws(()=>validateRecipe({...r,instructions:[{order:2,text:'bad'}]}));
 assert.equal(uniqueRecipes([r,r]).length,1);
});
test('Hard exclusions reject unknown evidence, conflicting ingredients and unsupported diets without relaxing',async()=>{
 const r=provider.normalize(fixture);for(const restrictions of [{allergens:['Milk']},{diets:['vegan']},{exclude:['beans']}])assert.equal(matchesRestrictions(r,restrictions),false);
 const known={...r,knownAllergens:['Milk'],dietTags:['vegetarian'],suitability:{...r.suitability,ingredientsComplete:true,allergensComplete:true,dietEvidence:true}};
 assert.equal(matchesRestrictions(known,{allergens:['Milk']}),false);assert.equal(matchesRestrictions(known,{exclude:['beans']}),false);assert.equal(matchesRestrictions(known,{diets:['vegan']}),false);
 assert.ok((await createCatalog(localProvider)({allergens:['Milk']})).every(r=>!r.knownAllergens.includes('Milk')));
});
test('Catalog handles empty results, duplicate IDs, missing attribution, failure and timeout',async()=>{
 const base={...provider,search:async()=>[]};assert.deepEqual(await createCatalog(base)({}),[]);
 const r=provider.normalize(fixture);assert.equal((await createCatalog({...base,search:async()=>[r,r]})({})).length,1);
 await assert.rejects(createCatalog({...base,search:async()=>[{...r,source:{}}]})({}));
 await assert.rejects(createCatalog({...base,search:async()=>{throw new Error('offline');}})({}));
 let signal;await assert.rejects(createCatalog({...base,search:async(q,o)=>{signal=o.signal;return new Promise(()=>{});}},{timeoutMs:5})({}),/timeout/);assert.equal(signal.aborted,true);
});
test('TheMealDB uses only exact official endpoints and rejects malformed or failed upstream results',async()=>{
 let called;const p=createMealDBProvider(async(url)=>{called=url;return new Response(JSON.stringify({meals:[fixture]}));});
 await p.search({q:'test bowl',limit:2});assert.equal(called,'https://www.themealdb.com/api/json/v1/1/search.php?s=test%20bowl');
 await p.getById('themealdb:12345');assert.equal(called,'https://www.themealdb.com/api/json/v1/1/lookup.php?i=12345');
 await assert.rejects(p.getById('themealdb:999'));
 for(const body of ['bad',JSON.stringify({meals:{}})])await assert.rejects(createMealDBProvider(async()=>new Response(body)).search({q:'aa'}));
 await assert.rejects(createMealDBProvider(async()=>new Response('',{status:503})).search({q:'aa'}));
 assert.deepEqual(await createMealDBProvider(async()=>new Response('{"meals":null}')).search({q:'aa'}),[]);
});
test('API validates queries, denies hosted development provider, enforces limits, handles missing/failing providers',async()=>{
 for(const q of ['?limit=0','?limit=101','?limit=2x','?id=ezeats:a&q=x','?id=../x','?q=a&q=b','?unknown=1','?diets=magic','?allergens=unknown','?provider=themealdb&q=a'])assert.throws(()=>parseRecipeQuery('/api/recipes'+q));
 const call=async(h,url,headers={host:'localhost:4184'},method='GET')=>{const r=response();await h({url,headers,method},r);return r;};
 assert.equal((await call(createRecipesHandler(),'/api/recipes?id=ezeats:chickpea-bowl')).statusCode,200);
 assert.equal((await call(createRecipesHandler(),'/api/recipes?id=ezeats:missing')).statusCode,404);
 assert.deepEqual((await call(createRecipesHandler(),'/api/recipes?q=zzzz')).body.recipes,[]);
 assert.equal((await call(createRecipesHandler(),'/api/recipes',{},'POST')).statusCode,405);
 for(const env of [{},{RECIPE_THEMEALDB_DEV:'1',VERCEL:'1'},{RECIPE_THEMEALDB_DEV:'1',NODE_ENV:'production'}])assert.equal((await call(createRecipesHandler({env}),'/api/recipes?provider=themealdb&q=rice')).statusCode,403);
 assert.equal((await call(createRecipesHandler({env:{RECIPE_THEMEALDB_DEV:'1'}}),'/api/recipes?provider=themealdb&q=rice',{host:'public.example'})).statusCode,403);
 const h=createRecipesHandler({limiter:()=>false});assert.equal((await call(h,'/api/recipes')).statusCode,429);
 const bad={...localProvider,search:async()=>{throw new Error('secret key');}};const fail=await call(createRecipesHandler({providers:{ezeats:bad}}),'/api/recipes');assert.equal(fail.statusCode,503);assert.ok(!JSON.stringify(fail.body).includes('secret'));
 let now=0;const limit=createRecipeLimiter({max:1,now:()=>now});assert.equal(limit(),true);assert.equal(limit(),false);now=60000;assert.equal(limit(),true);
});
test('Guest HTTP recipe route serves normalized details with no-store and catches duplicate query keys',async()=>{
 const server=createPreviewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 try{let r=await fetch(base+'/api/recipes?id=ezeats:chickpea-bowl');assert.equal(r.status,200);assert.match(r.headers.get('cache-control'),/no-store/);assert.equal((await r.json()).recipe.id,'ezeats:chickpea-bowl');r=await fetch(base+'/api/recipes?q=a&q=b');assert.equal(r.status,400);assert.equal((await fetch(base+'/recipe/?id=ezeats:chickpea-bowl')).status,200);}finally{await new Promise(r=>server.close(r));}
});
