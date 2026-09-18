import {allergens} from '../../dist/profile-matching.js';
import {meals} from '../../dist/meals.js';
import {validateRecipe} from './model.js';
// Use the picker catalogue as the single source of first-party identity and estimates.
export const localProvider={namespace:'ezeats',
 normalize(m){return validateRecipe({schemaVersion:1,id:`ezeats:${m.id}`,title:m.name,description:m.description,servings:null,
 time:{preparationMinutes:null,cookingMinutes:null,totalMinutes:m.minutes,estimated:true},
 ingredients:m.ingredients.map(name=>({quantity:null,unit:null,name,notes:null})),instructions:null,
 cuisine:m.cuisine,mealTypes:[],difficulty:null,dietTags:[...m.diets],knownAllergens:[...(allergens[m.id]||[])],
 estimatedCost:{amount:m.cost,currency:'USD',basis:'per-serving',estimated:true},imageUrl:null,
 source:{provider:'EZEATS',originalUrl:'https://www.ezeats-eh.com/',attribution:'EZEATS original meal idea',licensingStatus:'first-party; no external reuse license granted',verifiedAt:null,ownership:'first-party'},
 suitability:{status:'unverified',ingredientsComplete:false,allergensComplete:false,dietEvidence:true,notes:'Meal idea only. Quantities, servings and cooking instructions have not been authored or verified. Check product labels, substitutions and cross-contact.'}});},
 async search({q='',limit=12}){return meals.filter(m=>(m.name+' '+m.description).toLowerCase().includes(q.toLowerCase())).slice(0,limit).map(m=>this.normalize(m));},
 async getById(id){const m=meals.find(m=>`ezeats:${m.id}`===id);return m?this.normalize(m):null;}
};
