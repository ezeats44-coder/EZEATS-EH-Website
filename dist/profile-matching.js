// Conservative ingredient screening for the curated recipes, not an allergen-free guarantee.
import {foodPreferenceMatch} from './food-preferences.js';
export const allergens={
 'grilled-cheese':['Milk','Wheat'], 'salmon-rice':['Fish','Soy','Sesame'],
 'pesto-pasta':['Milk','Wheat','Tree nuts'], 'avocado-toast':['Eggs','Wheat'],
 'tofu-stir-fry':['Soy','Sesame'], 'chicken-wrap':['Wheat','Sesame'],
 'baked-potato':['Milk'], 'shrimp-tacos':['Shellfish'], 'rice-noodles':['Peanuts','Soy'],
 'margherita':['Milk','Wheat'], 'kimchi-rice':['Soy','Sesame'],
 'mushroom-polenta':['Tree nuts'], 'greek-salad':['Milk'], 'breakfast-tacos':['Eggs'],
 'spicy-basil-tofu':['Soy'], 'cajun-shrimp':['Shellfish'], 'sweet-potato-bowl':['Sesame'],
 'beef-burger':['Wheat','Eggs','Soy','Sesame'], 'tuna-bowl':['Fish']
};
const reviewed=new Set(['chickpea-bowl','tomato-pasta','black-bean-tacos','grilled-cheese','salmon-rice','coconut-curry','pesto-pasta','avocado-toast','tofu-stir-fry','chicken-wrap','chili-bowl','baked-potato','shrimp-tacos','rice-noodles','margherita','chicken-rice','lentil-salad','kimchi-rice','mushroom-polenta','greek-salad','breakfast-tacos','spicy-basil-tofu','cajun-shrimp','sweet-potato-bowl','beef-burger','tomato-gf-pasta','tuna-bowl','stuffed-peppers']);
allergens['tomato-pasta']=['Wheat'];
export function applyProfile(meals,profile={}) {
 if(profile.otherAllergies?.trim())return [];
 const avoid=(profile.avoid||'').toLowerCase().split(',').map(s=>s.trim()).filter(Boolean);
 return meals.filter(m=>{
  if(foodPreferenceMatch(m,profile).excluded)return false;
  if(profile.allergies?.length&&(!reviewed.has(m.id)||profile.allergies.some(a=>(allergens[m.id]||[]).includes(a))))return false;
  const content=(m.name+' '+m.ingredients.join(' ')).toLowerCase();
  return !avoid.some(term=>content.includes(term));
 }).map(m=>({...m,profileScore:((profile.cuisines||[]).some(c=>m.cuisine.toLowerCase().includes(c.toLowerCase()))?2:0)+foodPreferenceMatch(m,profile).bonus}))
 .sort((a,b)=>(b.score+b.profileScore)-(a.score+a.profileScore)||b.tie-a.tie);
}
