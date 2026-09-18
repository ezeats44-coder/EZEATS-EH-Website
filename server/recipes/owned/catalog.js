import {drafts} from './recipes.js';
import {ingredients,dietTags} from './ingredients.js';
import {validateRecipe} from '../model.js';
export const reviewDate='2026-09-18';
export const safetySources=[
 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart',
 'https://www.canada.ca/en/health-canada/services/general-food-safety-tips/safe-internal-cooking-temperatures.html',
 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/washing-food-does-it-promote-food',
 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/leftovers-and-food-safety',
];
export function compileRecipe(d){
 const keys=d.items.map(i=>i.key),used=new Set();
 if(new Set(keys).size!==keys.length)throw new Error(`Duplicate ingredient: ${d.id}`);
 const steps=d.steps.map((text,index)=>({order:index+1,text:text.replace(/@([A-Za-z]+)/g,(_,key)=>{
  if(!keys.includes(key)||!ingredients[key])throw new Error(`Missing ingredient ${d.id}/${key}`);
  used.add(key);return ingredients[key].name;
 })}));
 for(const key of keys)if(!used.has(key))throw new Error(`Unused ingredient ${d.id}/${key}`);
 const rawMeat=keys.some(k=>['chicken','chickenThigh','beef','steak','turkey'].includes(k));
 const rawSeafood=keys.some(k=>['salmon','cod','trout','shrimp'].includes(k));
 const handling=[
  'Before starting, wash hands with soap and water for 20 seconds. Rinse fresh produce under running water and use clean utensils.',
  'Check every packaged ingredient label for dietary requirements and allergens, including cross-contact notices. Choose products with no additional allergenic ingredients beyond the warnings listed here; otherwise these ingredient-based recommendations no longer apply. Listed tags apply only to the specified ingredients; they are not allergy-safe guarantees.',
  'Refrigerate perishable ingredients until needed. Refrigerate leftovers in shallow containers within 2 hours (within 1 hour above 90°F/32°C); reheat leftovers to 74°C/165°F.',
 ];
 if(rawMeat||rawSeafood)handling.push('Thaw raw meat or seafood in the refrigerator. Use a separate board and utensils for raw ingredients; wash hands and clean and sanitize tools and surfaces afterward. Never put cooked food on a plate that held raw food. Check internal temperature with a clean food thermometer in the thickest part of each piece.');
 if(rawMeat)handling.push('Do not rinse raw meat or poultry; splashes can spread bacteria. Cooking times are estimates: the required internal temperature controls doneness.');
 if(rawSeafood)handling.push('Keep raw seafood chilled and separate from ready-to-eat food. Use a thermometer rather than color alone to judge doneness.');
 if(keys.includes('eggs'))handling.push('Keep eggs refrigerated. Discard cracked eggs; wash hands, bowls and tools after raw egg or shell contact. Cook until fully set and the stated internal temperature is reached.');
 const recipe={
  schemaVersion:1,id:'ezeats:'+d.id,title:d.title,description:d.description,servings:d.servings,
  time:{preparationMinutes:d.prep,cookingMinutes:d.cook,totalMinutes:d.prep+d.cook,estimated:true},
  ingredients:d.items.map(i=>{const base=ingredients[i.key];if(!base)throw new Error(`Unknown ingredient ${i.key}`);return {quantity:i.quantity,unit:i.unit,name:base.name,notes:[i.notes,base.notes].filter(Boolean).join(' ')||null};}),
  instructions:steps,cuisine:d.cuisine,mealTypes:d.mealTypes,difficulty:d.prep+d.cook>=40?'moderate':'easy',
  dietTags:dietTags(keys),knownAllergens:[...new Set(keys.flatMap(k=>ingredients[k].allergens))].sort(),
  estimatedCost:{amount:d.cost,currency:'USD',basis:'per-serving',estimated:true},imageUrl:null,
  source:{provider:'EZEATS',originalUrl:`https://www.ezeats-eh.com/recipe/?id=ezeats:${d.id}`,attribution:'Original EZEATS recipe text, authored for EZEATS EH LLC.',licensingStatus:'First-party EZEATS content; no external reuse license granted.',verifiedAt:null,ownership:'first-party'},
  suitability:{status:'unverified',ingredientsComplete:true,allergensComplete:true,dietEvidence:true,notes:'Ingredient-list screening only, for the exact products specified. Brands, substitutions and cross-contact can change suitability. Editorial review is not kitchen testing or a medical or allergy-safety guarantee.'},
  editorial:{status:'editorially-reviewed-draft',reviewedAt:reviewDate,reviewer:'AI-assisted editorial review',ownerReviewRequired:true,kitchenTested:false,notes:'Checked for ingredient coverage, recipe structure and consistency against the cited temperature guidance. Owner review and kitchen testing are still required.'},
  safety:{handling,sources:safetySources,checkedAt:reviewDate},
 };
 return validateRecipe(recipe);
}
export const ownedRecipes=drafts.map(compileRecipe);
export const recipeById=new Map(ownedRecipes.map(r=>[r.id,r]));
if(recipeById.size!==ownedRecipes.length)throw new Error('Duplicate recipe IDs');
