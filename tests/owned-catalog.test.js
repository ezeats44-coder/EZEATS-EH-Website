import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ownedRecipes,compileRecipe} from '../server/recipes/owned/catalog.js';
import {drafts} from '../server/recipes/owned/recipes.js';
import {ingredients} from '../server/recipes/owned/ingredients.js';
import {meals,rankMeals,validatePreferences,allowed} from '../dist/meals.js';
import {applyProfile} from '../dist/profile-matching.js';
import {foodPreferenceMatch} from '../dist/food-preferences.js';
import {validateRecipe,matchesRestrictions} from '../server/recipes/model.js';
import {localProvider} from '../server/recipes/local.js';
const legacy=JSON.parse(readFileSync(new URL('./fixtures/legacy-meal-ids.json',import.meta.url)));
const number=s=>s.split(' ').reduce((sum,p)=>sum+(p.includes('/')?Number(p.split('/')[0])/Number(p.split('/')[1]):Number(p)),0);
const units=new Set(['cup','cups','tablespoon','tablespoons','teaspoon','teaspoons','ounce','ounces','pound','medium','large','small','whole','slices','thick slices','cloves','leaves','stalks']);
for(const r of ownedRecipes)test(`Complete owned record: ${r.id}`,async()=>{
 const d=drafts.find(d=>'ezeats:'+d.id===r.id),m=meals.find(m=>'ezeats:'+m.id===r.id);
 assert.equal(validateRecipe(r),r);assert.ok(r.description.length>30);assert.ok(Number.isInteger(r.servings)&&r.servings>0&&r.servings<=8);
 assert.equal(r.time.totalMinutes,r.time.preparationMinutes+r.time.cookingMinutes);assert.equal(m.minutes,r.time.totalMinutes);assert.ok(m.minutes<=60);
 assert.ok(r.ingredients.length>=3);assert.ok(r.instructions.length>=4);
 assert.deepEqual(r.instructions.map(s=>s.order),r.instructions.map((_,i)=>i+1));
 for(const i of r.ingredients){assert.ok(Number.isFinite(number(i.quantity))&&number(i.quantity)>0,i.name);assert.ok(units.has(i.unit),i.unit);assert.ok(i.name.trim());}
 const refs=d.steps.flatMap(s=>[...s.matchAll(/@([A-Za-z]+)/g)].map(m=>m[1]));
 assert.deepEqual([...new Set(refs)].sort(),d.items.map(i=>i.key).sort());
 assert.ok(!JSON.stringify(r).match(/placeholder|todo|tbd|not provided|@\w+/i));
 assert.ok(r.instructions.every(s=>s.text.length>=15));
 assert.deepEqual(r.ingredients.map(i=>i.name),m.ingredients);assert.equal(r.title,m.name);assert.deepEqual(r.dietTags,m.diets);assert.deepEqual(r.knownAllergens,m.knownAllergens);
 assert.equal(r.estimatedCost.amount,m.cost);assert.ok(m.cost>=2&&m.cost<=20);assert.ok([0,1,2].includes(m.heat));
 assert.equal(r.source.ownership,'first-party');assert.equal(r.source.provider,'EZEATS');assert.match(r.source.attribution,/Original EZEATS/);assert.match(r.source.licensingStatus,/First-party/);assert.equal(r.imageUrl,null);
 assert.equal(r.source.verifiedAt,null);assert.equal(r.editorial.kitchenTested,false);assert.equal(r.editorial.ownerReviewRequired,true);assert.match(r.editorial.reviewedAt,/^\d{4}-\d{2}-\d{2}$/);assert.equal(r.suitability.status,'unverified');
 assert.match(r.suitability.notes,/not kitchen testing/);assert.ok(r.safety.sources.some(s=>s.includes('canada.ca')));assert.ok(r.safety.sources.some(s=>s.includes('usda.gov')));
 assert.match(r.safety.handling.join(' '),/package.*label|packaged ingredient label/);assert.match(r.safety.handling.join(' '),/cross-contact/);
 const text=r.instructions.map(s=>s.text).join(' '),keys=d.items.map(i=>i.key);
 if(keys.some(k=>['chicken','chickenThigh','turkey','shrimp','eggs'].includes(k)))assert.match(text,/74°C\/165°F/);
 if(keys.some(k=>['salmon','cod','trout'].includes(k)))assert.match(text,/70°C\/158°F/);
 if(keys.includes('beef'))assert.match(text,/71°C\/160°F/);
 if(keys.includes('steak')){assert.match(text,/63°C\/145°F/);assert.match(text,/rest for 3 minutes/);}
 if(keys.some(k=>['chicken','chickenThigh','beef','steak','turkey','salmon','cod','trout','shrimp'].includes(k)))assert.match(r.safety.handling.join(' '),/separate board/);
 if(keys.some(k=>['cookedRice','brownRice'].includes(k)))assert.match(text,/74°C\/165°F/);
 assert.deepEqual(await localProvider.getById(r.id),r);
 // One feasible picker request for every full record, including snacks and longer meals.
 assert.ok(rankMeals({mood:'any',time:60,budget:20,heat:2},()=>0).some(x=>x.id===m.id));
});
test('Exactly 100 unique recipes preserve every legacy ID and map in both directions',()=>{
 assert.equal(meals.length,100);assert.equal(ownedRecipes.length,100);assert.equal(new Set(ownedRecipes.map(r=>r.id)).size,100);assert.equal(new Set(ownedRecipes.map(r=>r.title)).size,100);
 assert.deepEqual(meals.map(m=>'ezeats:'+m.id).sort(),ownedRecipes.map(r=>r.id).sort());assert.equal(legacy.length,28);
 for(const id of legacy)assert.ok(meals.some(m=>m.id===id));assert.equal(meals.filter(m=>!legacy.includes(m.id)).length,72);
 assert.equal(new Set(ownedRecipes.map(r=>r.instructions.map(s=>s.text).join('\n'))).size,100);
});
test('Independent ingredient checks catch diet and allergen mistakes across all records',()=>{
 const animal=['chicken','chickenThigh','cookedChicken','beef','steak','turkey'];const fish=['salmon','cod','trout','tuna','sardines','shrimp'];
 const dairy=['milk','yogurt','cheddar','mozzarella','feta','ricotta','butter','pesto','tomatoSoup'];const gluten=['pasta','bread','tortilla','flatbread','bun','pita','couscous','flour','breadcrumbs','barley','tomatoSoup'];
 const warning={eggs:['Eggs'],milk:['Milk'],yogurt:['Milk'],cheddar:['Milk'],mozzarella:['Milk'],feta:['Milk'],ricotta:['Milk'],butter:['Milk'],pesto:['Milk','Tree nuts'],tomatoSoup:['Milk','Wheat'],almondMilk:['Tree nuts'],walnuts:['Tree nuts'],peanutButter:['Peanuts'],peanuts:['Peanuts'],tofu:['Soy'],edamame:['Soy'],soyMilk:['Soy'],tamari:['Soy'],miso:['Soy'],sesame:['Sesame'],sesameOil:['Sesame'],tahini:['Sesame'],hummus:['Sesame'],mustard:['Mustard'],curry:['Mustard'],shrimp:['Shellfish'],salmon:['Fish'],cod:['Fish'],trout:['Fish'],tuna:['Fish'],sardines:['Fish']};
 for(const [i,d] of drafts.entries()){
  const r=ownedRecipes[i],keys=d.items.map(x=>x.key),has=list=>list.some(x=>keys.includes(x));
  assert.equal(r.dietTags.includes('pescatarian'),!has(animal),d.id);
  assert.equal(r.dietTags.includes('vegetarian'),!has([...animal,...fish]),d.id);
  assert.equal(r.dietTags.includes('vegan'),!has([...animal,...fish,...dairy,'eggs','honey']),d.id);
  assert.equal(r.dietTags.includes('dairy-free'),!has(dairy),d.id);assert.equal(r.dietTags.includes('gluten-free'),!has(gluten),d.id);
  for(const k of keys){for(const a of warning[k]||[])assert.ok(r.knownAllergens.includes(a),`${d.id}/${k}/${a}`);if(gluten.includes(k)&&k!=='barley')assert.ok(r.knownAllergens.includes('Wheat'));}
  for(const a of r.knownAllergens)assert.equal(matchesRestrictions(r,{allergens:[a]}),false);
 }
});
test('Ingredient coverage checks reject unused or absent ingredients and invalid evidence',()=>{
 const d=structuredClone(drafts[0]);d.steps[0]+=' Add @missing.';assert.throws(()=>compileRecipe(d),/Missing ingredient/);
 const unused=structuredClone(drafts[0]);unused.items.push({key:'cumin',quantity:'1',unit:'teaspoon'});assert.throws(()=>compileRecipe(unused),/Unused ingredient/);
 assert.throws(()=>validateRecipe({...ownedRecipes[0],time:{...ownedRecipes[0].time,cookingMinutes:-1}}));
 assert.throws(()=>validateRecipe({...ownedRecipes[0],editorial:{...ownedRecipes[0].editorial,kitchenTested:true}}));
});
test('All picker combinations preserve hard limits and consistent ranking',()=>{
 const diets=allowed.diets;
 for(let mask=0;mask<1<<diets.length;mask++)for(const mood of allowed.mood)for(const time of allowed.time)for(const budget of allowed.budget)for(const heat of allowed.heat)for(const adventure of allowed.adventure){
  const request={diets:diets.filter((_,i)=>mask&(1<<i)),mood,time,budget,heat,adventure};
  validatePreferences(request);const matches=rankMeals(request,()=>0.5);
  assert.equal(new Set(matches.map(m=>m.id)).size,matches.length);
  for(const [index,m] of matches.entries()){assert.ok(m.minutes<=time&&m.cost<=budget&&m.heat<=heat);assert.ok(request.diets.every(d=>m.diets.includes(d)));if(index)assert.ok(matches[index-1].score>=m.score);}
 }
});
test('Expanded profile screening blocks known allergens and new fish species without relaxing exclusions',()=>{
 const all=rankMeals({time:60,budget:20,heat:2});
 for(const allergy of ['Milk','Eggs','Fish','Shellfish','Peanuts','Tree nuts','Wheat','Soy','Sesame'])for(const m of applyProfile(all,{allergies:[allergy]}))assert.ok(!m.knownAllergens.includes(allergy));
 for(const id of ['lemon-cod-potatoes','dill-trout-skillet','sardine-lemon-toast'])assert.equal(foodPreferenceMatch(meals.find(m=>m.id===id),{foodDislikes:['Fish']}).excluded,true);
 assert.deepEqual(applyProfile(all,{otherAllergies:'Mustard'}),[]);
 assert.deepEqual(applyProfile([{...meals[0],id:'unreviewed'}],{allergies:['Milk']}),[]);
});
test('Catalog variety includes short, everyday, longer, low-budget and all supported diets',()=>{
 for(const check of [m=>m.minutes<=15,m=>m.minutes>=20&&m.minutes<=30,m=>m.minutes>=40,m=>m.cost<=5,m=>m.heat===2])assert.ok(meals.filter(check).length>=5);
 for(const tag of allowed.diets)assert.ok(meals.filter(m=>m.diets.includes(tag)).length>=5);
 for(const type of ['breakfast','lunch','dinner','snack','side','soup','salad','bowl','pasta'])assert.ok(ownedRecipes.some(r=>r.mealTypes.includes(type)));
 assert.ok(Object.values(ingredients).every(i=>Array.isArray(i.traits)&&Array.isArray(i.allergens)));
});
