import test from 'node:test';
import assert from 'node:assert/strict';
import {validateProfile,mealDefaults,fields} from '../dist/profile-schema.js';
import {meals,rankMeals} from '../dist/meals.js';
import {applyProfile} from '../dist/profile-matching.js';
import handler from '../api/profile.js';
test('Profile rejects unknown fields, invalid enums and oversized text',()=>{
 for(const input of [{userId:'someone-else'},{spice:9},{allergies:'Milk'},{avoid:'a'.repeat(201)},null])assert.throws(()=>validateProfile(input));
 assert.deepEqual(validateProfile({name:'   ',allergies:['Milk','Milk']}),{name:'',allergies:['Milk']});
});
test('Every questionnaire answer can be saved and cleared',()=>{
 const p=Object.fromEntries(fields.map(f=>[f.key,f.text?'Test':f.multiple?[f.options[0]]:f.options[0]]));
 assert.deepEqual(validateProfile(p),p);assert.deepEqual(validateProfile({}),{});
});
test('Diet, cooking budget and spice are applied without demographic inference',()=>{
 assert.deepEqual(mealDefaults({diet:'Pescatarian',spice:'Not spicy',time:'15 minutes',budget:'Up to $5',pregnancy:'Yes',gender:'Woman'}),{heat:0,time:15,budget:5,diets:['pescatarian']});
 const m=rankMeals({diets:['pescatarian'],time:60,budget:20,heat:2});
 assert.ok(m.some(m=>m.id==='salmon-rice'));assert.ok(!m.some(m=>m.id==='chicken-rice'||m.id==='beef-burger'));
});
test('Allergy screening excludes known ingredients and pauses on additional allergies',()=>{
 const all=rankMeals({time:60,budget:20,heat:2});
 for(const [allergy,id] of [['Milk','grilled-cheese'],['Eggs','avocado-toast'],['Peanuts','rice-noodles'],['Tree nuts','mushroom-polenta'],['Fish','salmon-rice'],['Shellfish','shrimp-tacos'],['Soy','tofu-stir-fry'],['Sesame','sweet-potato-bowl'],['Wheat','tomato-pasta']])assert.ok(!applyProfile(all,{allergies:[allergy]}).some(m=>m.id===id));
 assert.deepEqual(applyProfile(all,{otherAllergies:'Celery'}),[]);
 assert.ok(!applyProfile(all,{avoid:'mushroom, avocado'}).some(m=>/mushroom|avocado/i.test(m.ingredients.join(' '))));
 assert.equal(new Set(meals.map(m=>m.id)).size,meals.length);
});
test('Unauthenticated profile requests cannot read, change, or delete data',async()=>{
 for(const method of ['GET','PUT','DELETE']){
 const response={setHeader(){},status(n){this.code=n;return this;},json(b){this.body=b;return this;}};
 await handler({method,headers:{},body:{profile:{name:'Intruder'},completed:true}},response);assert.equal(response.code,401);
 }
});
test('Cross-origin writes and unsupported methods fail closed',async()=>{
 const r={setHeader(){},status(n){this.code=n;return this;},json(){return this;}};
 await handler({method:'PUT',headers:{origin:'https://evil.example'}},r);assert.equal(r.code,403);
 await handler({method:'POST',headers:{}},r);assert.equal(r.code,405);
});
