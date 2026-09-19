import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {sliders,sliderSelection,renderGuestSliders,updateGuestSlider} from '../dist/guest-sliders.js';
import {defaults,rankMeals} from '../dist/meals.js';
import {writeGuestPicker,readGuestPicker} from '../dist/guest-picker.js';
test('four discrete sliders preserve every supported internal category',()=>{
 assert.deepEqual(Object.fromEntries(Object.entries(sliders).map(([k,v])=>[k,v.values])),{time:[15,30,60],budget:[5,10,20],heat:[0,1,2],adventure:['familiar','adventurous','any']});
 for(const [key,spec] of Object.entries(sliders))for(let i=0;i<3;i++){assert.equal(sliderSelection(key,i).value,spec.values[i]);assert.equal(sliderSelection(key,i+.2).value,spec.values[i]);}
 assert.equal(sliderSelection('time',.6).value,30);assert.equal(sliderSelection('time',1.6).value,60);assert.equal(sliderSelection('time',-10).value,15);assert.throws(()=>sliderSelection('time','bad'));
});
test('native keyboard/touch controls expose names, three stops and accurate current values',()=>{
 const html=renderGuestSliders(defaults);assert.equal((html.match(/type="range" min="0" max="2" step="1"/g)||[]).length,4);
 for(const key of Object.keys(sliders)){assert.ok(html.includes(`for="guest-${key}"`));assert.ok(html.includes(`id="guest-${key}"`));}
 assert.ok(html.includes('Up to $10'));assert.ok(html.includes('aria-valuetext="Medium. Some noticeable heat"'));assert.ok(html.includes('Classic'));assert.ok(!/Mild|Keep it familiar|recent picks|your history/i.test(html));
});
test('stop and drag input keep pill, selected label, announcement and persisted value synchronized',()=>{
 for(const key of Object.keys(sliders))for(const position of [0,1,2,.6,1.8]){
 const selected=sliderSelection(key,position), attrs={},css={},pill={},input={setAttribute:(k,v)=>attrs[k]=v};
 const buttons=[0,1,2].map(()=>({classList:{toggle(k,v){this.selected=v}},setAttribute(k,v){this[k]=v}}));
 const row={querySelector:s=>s==='input'?input:pill,querySelectorAll:()=>buttons,style:{setProperty:(k,v)=>css[k]=v}};
 const value=updateGuestSlider({querySelector:()=>row},key,position);
 assert.equal(value,selected.value);assert.equal(pill.textContent,selected.pill);assert.equal(attrs['aria-valuetext'],selected.announcement);assert.equal(css['--progress'],`${selected.index*50}%`);assert.equal(buttons[selected.index]['aria-pressed'],'true');
 const storage={getItem(){return this.data},setItem(k,v){this.data=v}};writeGuestPicker(storage,{...defaults,[key]:value},2);assert.equal(readGuestPicker(storage).prefs[key],value);
 }
});
test('guest control branch does not replace signed-in controls or history ranking',()=>{
 const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');assert.ok(source.includes('!personalMode ? renderGuestSliders(state.prefs)'));assert.ok(source.includes('if (!key || personalMode) return;'));assert.ok(source.includes('if(personalMode)state.ranked=rankWithHistory(state.ranked,mealHistory)'));assert.ok(source.includes("['familiar', 'Keep it familiar'"));
 for(const value of sliders.adventure.values){const rows=rankMeals({...defaults,adventure:value,heat:0,diets:['vegan']});assert.ok(rows.every(r=>r.heat===0&&r.diets.includes('vegan')));}
});
