import {safeUrl,validateRecipe,uniqueRecipes} from './model.js';
const text=(s,max=15000)=>{if(typeof s!=='string'||!s.trim())return null;if(s.trim().length>max)throw new Error('Provider field too large');return s.trim();};
export function createMealDBProvider(fetcher=fetch){
 async function call(path,signal){
  const response=await fetcher(`https://www.themealdb.com/api/json/v1/1/${path}`,{signal,redirect:'error',headers:{Accept:'application/json'}});
  if(!response.ok)throw new Error('Provider unavailable');
  // Bounded streaming body: never buffer an unlimited upstream response.
  const reader=response.body?.getReader();if(!reader)throw new Error('Invalid provider response');
  let size=0;const chunks=[];try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>1_000_000)throw new Error('Provider response too large');chunks.push(value);}}finally{await reader.cancel();}
  const data=JSON.parse(Buffer.concat(chunks).toString());
  if(data.meals===null)return [];if(!Array.isArray(data.meals)||data.meals.length>100)throw new Error('Malformed provider response');return data.meals;
 }
 return {namespace:'themealdb',
 normalize(m){
  if(!m||typeof m.idMeal!=='string'||!/^\d{1,12}$/.test(m.idMeal)||!text(m.strMeal,200))throw new Error('Malformed meal');
  const ingredients=[];for(let i=1;i<=20;i++){const name=text(m[`strIngredient${i}`],300),measure=text(m[`strMeasure${i}`],200);if(name)ingredients.push({name,quantity:null,unit:null,notes:measure?`Provider measurement: ${measure}`:null});}
  const instructions=text(m.strInstructions);const source=safeUrl(m.strSource);
  return validateRecipe({schemaVersion:1,id:`themealdb:${m.idMeal}`,title:text(m.strMeal,200),description:null,servings:null,time:{preparationMinutes:null,cookingMinutes:null,totalMinutes:null,estimated:false},ingredients,
   instructions:instructions?instructions.split(/\r?\n+/).map(s=>s.trim()).filter(Boolean).map((text,i)=>({order:i+1,text})):null,
   cuisine:text(m.strArea,100),mealTypes:[],difficulty:null,dietTags:[],knownAllergens:[],estimatedCost:null,imageUrl:safeUrl(m.strMealThumb),
   source:{provider:'TheMealDB (development)',originalUrl:source,providerUrl:`https://www.themealdb.com/meal/${m.idMeal}`,attribution:'Recipe data provided by TheMealDB. Original source rights may apply.',licensingStatus:'development-only; third-party rights unverified',verifiedAt:null,ownership:'third-party'},
   suitability:{status:'unverified',ingredientsComplete:false,allergensComplete:false,dietEvidence:false,notes:'Provider categories are not dietary or allergen verification. Review the original recipe and all ingredients.'}});
 },
 async search({q,limit=12},{signal}={}){const rows=await call(`search.php?s=${encodeURIComponent(q)}`,signal);return uniqueRecipes(rows.map(m=>this.normalize(m))).slice(0,limit);},
 async getById(id,{signal}={}){if(!/^themealdb:\d{1,12}$/.test(id))return null;const rows=await call(`lookup.php?i=${id.split(':')[1]}`,signal);const r=rows.length?this.normalize(rows[0]):null;if(r&&r.id!==id)throw new Error('Provider identity mismatch');return r;}
 };
}
