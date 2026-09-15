import test from 'node:test';
import assert from 'node:assert/strict';
import {recordChoice,rankWithHistory} from '../dist/meal-history.js';
import {rankMeals,defaults} from '../dist/meals.js';
import {applyProfile} from '../dist/profile-matching.js';
import {createProfileHandler} from '../api/profile.js';
test('Choice history validates catalog IDs, deduplicates retries and stays bounded',()=>{
 assert.throws(()=>recordChoice([],{mealId:'unknown',choiceId:'12345678'}));
 let history=[];for(let i=0;i<25;i++)history=recordChoice(history,{mealId:'black-bean-tacos',choiceId:`choice-${i}-id`},i);
 assert.equal(history.length,20);assert.equal(history[0].at,24);
 assert.deepEqual(recordChoice(history,{mealId:'black-bean-tacos',choiceId:'choice-24-id'},26),history);
});
test('History is tied to authenticated identity, gated by age, and clears independently',async()=>{
 const metadata={ezeatsProfile:{diet:'Vegan'}};
 const handler=createProfileHandler(()=>({authenticateRequest:async()=>({toAuth:()=>({userId:'session-user'})}),users:{getUser:async()=>({privateMetadata:metadata}),updateUserMetadata:async(id,patch)=>{assert.equal(id,'session-user');Object.assign(metadata,patch.privateMetadata);}}}));
 const call=async(method,body,query)=>{const res={setHeader(){},status(n){this.code=n;return this;},json(b){this.body=b;return this;}};await handler({method,body,query,headers:{authorization:'Bearer fixture'}},res);return res;};
 const choice={mealId:'black-bean-tacos',choiceId:'test-choice-1'};
 assert.equal((await call('POST',choice)).code,403);
 metadata.ezeatsAgeConfirmation={minimumAge:13};
 assert.equal((await call('POST',{...choice,userId:'someone-else'})).code,400);
 assert.equal((await call('POST',choice)).code,200);
 await call('POST',choice);
 assert.equal((await call('GET')).body.history.length,1);
 await call('DELETE',undefined,{history:'1'});
 assert.deepEqual((await call('GET')).body.history,[]);
 assert.equal(metadata.ezeatsProfile.diet,'Vegan');
});
test('History changes ranking without reintroducing excluded meals',()=>{
 const candidates=applyProfile(rankMeals({...defaults,time:60,budget:20}),{allergies:['Milk']});
 const first=candidates[0];const history=[{mealId:first.id,at:1000}];
 const ranked=rankWithHistory(candidates,history,2000);
 assert.deepEqual(new Set(ranked.map(m=>m.id)),new Set(candidates.map(m=>m.id)));
 assert.ok(ranked.findIndex(m=>m.id===first.id)>0);
 assert.equal(rankWithHistory(candidates,history,100*86400000)[0].id,first.id);
});
