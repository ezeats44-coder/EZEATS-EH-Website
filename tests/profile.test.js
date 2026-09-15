import test from 'node:test';
import assert from 'node:assert/strict';
import {validateProfile,mealDefaults,fields,normalizeStoredProfile} from '../dist/profile-schema.js';
import {meals,rankMeals} from '../dist/meals.js';
import {applyProfile} from '../dist/profile-matching.js';
import handler,{createProfileHandler} from '../api/profile.js';
test('Profile rejects unknown fields, invalid enums and oversized text',()=>{
 for(const input of [{userId:'someone-else'},{spice:9},{allergies:'Milk'},{avoid:'a'.repeat(201)},null])assert.throws(()=>validateProfile(input));
 assert.deepEqual(validateProfile({name:'   ',allergies:['Milk','Milk']}),{name:'',allergies:['Milk']});
});
test('Every questionnaire answer can be saved and cleared',()=>{
 const p=Object.fromEntries(fields.map(f=>[f.key,f.text?'Test':f.multiple?[f.options[0]]:f.options[0]]));
 assert.deepEqual(validateProfile(p),p);assert.deepEqual(validateProfile({}),{});
});
test('Diet, cooking budget and spice are applied without demographic inference',()=>{
 assert.deepEqual(mealDefaults({diet:'Pescatarian',spice:'Not spicy',time:'15 minutes',budget:'Up to $5',pregnancy:'Yes',gender:'Female'}),{heat:0,time:15,budget:5,diets:['pescatarian']});
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
 for(const method of ['GET','PUT','POST','PATCH','DELETE']){
 const response={setHeader(){},status(n){this.code=n;return this;},json(b){this.body=b;return this;}};
 await handler({method,headers:{},body:{profile:{name:'Intruder'},completed:true}},response);assert.equal(response.code,401);
 }
});
test('Age confirmation is required server-side and cannot be asserted through profile data',async()=>{
 const privateMetadata={},writes=[];
 const h=createProfileHandler(()=>({authenticateRequest:async()=>({toAuth:()=>({userId:'verified-user'})}),users:{getUser:async()=>({privateMetadata}),updateUserMetadata:async(id,patch)=>{writes.push(id);Object.assign(privateMetadata,patch.privateMetadata);}}}));
 const call=async(method,body)=>{const r={setHeader(){},status(n){this.code=n;return this;},json(b){this.body=b;return this;}};await h({method,headers:{authorization:'Bearer fixture'},body},r);return r;};
 assert.equal((await call('GET')).body.code,'AGE_REQUIRED');
 assert.equal((await call('PUT',{profile:{name:'Test'},completed:true})).code,403);
 assert.equal((await call('PATCH',{ageConfirmed:false})).code,400);
 assert.equal((await call('PATCH',{ageConfirmed:true,userId:'another-user'})).code,400);
 assert.equal((await call('DELETE')).code,200);
 assert.equal((await call('PATCH',{ageConfirmed:true})).code,200);
 assert.equal((await call('GET')).code,200);
 assert.ok(writes.every(id=>id==='verified-user'));
 assert.equal(privateMetadata.ezeatsAgeConfirmation.minimumAge,13);
 const confirmation=privateMetadata.ezeatsAgeConfirmation;
 const writeCount=writes.length;
 await call('PATCH',{ageConfirmed:true});
 assert.equal(writes.length,writeCount);
 assert.equal(privateMetadata.ezeatsAgeConfirmation,confirmation);
 await call('DELETE');
 assert.equal((await call('GET')).code,200);
 privateMetadata.ezeatsAgeConfirmation={minimumAge:14,confirmedAt:'2026-09-15T00:00:00.000Z'};
 assert.equal((await call('GET')).code,200);
 await call('PATCH',{ageConfirmed:true});
 assert.equal(privateMetadata.ezeatsAgeConfirmation.minimumAge,14);
});
test('Cross-origin writes and unsupported methods fail closed',async()=>{
 const r={setHeader(){},status(n){this.code=n;return this;},json(){return this;}};
 await handler({method:'PUT',headers:{origin:'https://evil.example'}},r);assert.equal(r.code,403);
 await handler({method:'OPTIONS',headers:{}},r);assert.equal(r.code,405);
});

test('Existing profiles remain usable after removing gender write-ins',()=>{
 assert.deepEqual(validateProfile(normalizeStoredProfile({gender:'Man',genderDescription:'old text',diet:'Vegan',name:null})),{gender:'Male',diet:'Vegan'});
 assert.deepEqual(validateProfile(normalizeStoredProfile({gender:'Self-described',genderDescription:'old text',spice:'Mild'})),{spice:'Mild'});
 assert.throws(()=>validateProfile({genderDescription:'new text'}));
});
