import test from 'node:test';
import assert from 'node:assert/strict';
import {guestHeatOptions, guestAdventureOptions, guestAdventureQuestion, readGuestPicker, writeGuestPicker} from '../dist/guest-picker.js';
import {defaults, rankMeals} from '../dist/meals.js';
test('guest labels retain legacy values and describe recommendation styles',()=>{
 assert.deepEqual(guestHeatOptions.map(x=>x[0]),[0,1,2]);
 assert.deepEqual(guestHeatOptions[0],[0,'No heat','No spice or noticeable heat']);
 assert.equal(guestAdventureQuestion,'How adventurous should this pick be?');
 assert.deepEqual(guestAdventureOptions.map(x=>x.slice(0,2)),[['familiar','Classic crowd-pleaser'],['adventurous','A little different'],['any','Surprise me']]);
});
test('guest current answers round-trip across refresh, back and changed answers',()=>{
 const storage={getItem(){return this.value},setItem(k,v){this.value=v}};
 for(const step of [2,1,2]) for(const adventure of ['familiar','adventurous','any']){
  const prefs={...defaults,diets:['vegan'],heat:0,adventure};writeGuestPicker(storage,prefs,step);assert.deepEqual(readGuestPicker(storage),{prefs,step});
 }
 assert.equal(storage.value.includes('history'),false);
});
test('malformed or unavailable guest storage cannot block picker',()=>{
 for(const value of ['{','null',JSON.stringify({step:2,prefs:{heat:99}}),JSON.stringify({step:9,prefs:defaults})]) assert.equal(readGuestPicker({getItem:()=>value}),null);
 assert.equal(readGuestPicker(undefined),null);assert.doesNotThrow(()=>writeGuestPicker(undefined,defaults,2));
});
test('all guest styles retain identical hard-filter eligibility, with distinct ranking preferences',()=>{
 const p={...defaults,mood:'any',diets:['vegan'],heat:0,time:60,budget:20};
 const results=['familiar','adventurous','any'].map(adventure=>rankMeals({...p,adventure},()=>0));
 for(const rows of results){assert.ok(rows.length);assert.ok(rows.every(r=>r.heat===0&&r.diets.includes('vegan')&&r.minutes<=60&&r.cost<=20));assert.deepEqual(rows.map(r=>r.id).sort(),results[0].map(r=>r.id).sort());}
 assert.equal(results[0][0].adventure,0);assert.equal(results[1][0].adventure,1);assert.ok(results[2].every(r=>r.score===6));
});
