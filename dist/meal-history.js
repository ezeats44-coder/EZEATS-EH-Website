import {meals} from './meals.js';
export function recordChoice(history, body, now=Date.now()) {
 if(!body||Object.keys(body).some(k=>!['mealId','choiceId'].includes(k))||!meals.some(m=>m.id===body.mealId)||typeof body.choiceId!=='string'||!/^[a-zA-Z0-9-]{8,64}$/.test(body.choiceId))throw new Error('Invalid meal choice.');
 const previous=Array.isArray(history)?history:[];
 if(previous.some(e=>e.choiceId===body.choiceId))return previous;
 return [{mealId:body.mealId,choiceId:body.choiceId,at:now},...previous].slice(0,20);
}
export function rankWithHistory(candidates,history=[],now=Date.now()) {
 const recent=history.filter(e=>Number.isFinite(e.at)&&e.at<=now&&now-e.at<90*86400000);
 return candidates.map(m=>{
  const familiar=recent.filter(e=>meals.find(x=>x.id===e.mealId)?.cuisine===m.cuisine).length;
  const repeated=recent.some(e=>e.mealId===m.id&&now-e.at<7*86400000);
  return {...m,historyReason:repeated?'A meal you have chosen before':familiar?'A cuisine you have chosen before':recent.length?'A little variety alongside your recent choices':null,personalScore:m.score+(m.profileScore||0)+Math.min(familiar,3)*0.6-(repeated?4:0)};
 }).sort((a,b)=>b.personalScore-a.personalScore||b.tie-a.tie);
}
