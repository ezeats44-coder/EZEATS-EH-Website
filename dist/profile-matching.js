// Conservative ingredient screening for the curated recipes, not an allergen-free guarantee.
import {foodPreferenceMatch} from './food-preferences.js';
import {meals as catalogMeals} from './meal-catalog.js';
export const allergens=Object.fromEntries(catalogMeals.map(m=>[m.id,m.knownAllergens]));
// Reviewed ingredient specifications, not tested or allergen-safe claims. Unknown IDs fail closed.
const reviewed=new Set(catalogMeals.map(m=>m.id));
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
