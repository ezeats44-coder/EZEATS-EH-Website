// JSON-compatible Recipe v1. null means unknown; [] means no supplied entries.
export const safeUrl=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}};
export function validateRecipe(r){
 if(!r||!/^([a-z][a-z0-9-]*):([a-z0-9-]+)$/.test(r.id)||typeof r.title!=='string'||!r.title.trim()||r.title.length>200)throw new Error('Invalid recipe identity');
 if(Object.keys(r).some(k=>!['schemaVersion','id','title','description','servings','time','ingredients','instructions','cuisine','mealTypes','difficulty','dietTags','knownAllergens','estimatedCost','imageUrl','source','suitability'].includes(k)))throw new Error('Unexpected recipe fields');
 if(r.schemaVersion!==1||!r.time||!r.suitability||r.suitability.status!=='unverified')throw new Error('Invalid recipe evidence');
 for(const key of ['mealTypes','dietTags','knownAllergens'])if(!Array.isArray(r[key])||r[key].some(v=>typeof v!=='string'||v.length>100))throw new Error('Invalid recipe tags');
 for(const value of [r.imageUrl,r.source?.originalUrl,r.source?.providerUrl??null])if(value!==null&&!safeUrl(value))throw new Error('Invalid source URL');
 if(!r.source?.provider||!r.source.attribution||!r.source.licensingStatus)throw new Error('Missing attribution');
 if(!Array.isArray(r.ingredients)||r.ingredients.length>100||r.ingredients.some(i=>!i||typeof i.name!=='string'||!i.name.trim()||i.name.length>300||!(i.quantity===null||typeof i.quantity==='string')||!(i.unit===null||typeof i.unit==='string')))throw new Error('Invalid ingredients');
 if(r.instructions!==null&&(!Array.isArray(r.instructions)||r.instructions.length>100||r.instructions.some((s,i)=>s.order!==i+1||typeof s.text!=='string'||!s.text.trim()||s.text.length>15000)))throw new Error('Invalid instructions');
 for(const n of [r.servings,r.time.preparationMinutes,r.time.cookingMinutes,r.time.totalMinutes])if(n!==null&&(!Number.isFinite(n)||n<=0))throw new Error('Invalid quantity');
 return r;
}
export function uniqueRecipes(rows){const seen=new Set();return rows.map(validateRecipe).filter(r=>{if(seen.has(r.id))return false;seen.add(r.id);return true;});}
export function matchesRestrictions(r,{diets=[],allergens=[],exclude=[]}={}){
 // Unknown evidence cannot satisfy a hard restriction. No fallbacks relax it.
 if(diets.length&&(!r.suitability.dietEvidence||!diets.every(d=>r.dietTags.includes(d))))return false;
 if(allergens.length&&(!r.suitability.allergensComplete||allergens.some(a=>r.knownAllergens.includes(a))))return false;
 if(exclude.length&&(!r.suitability.ingredientsComplete||exclude.some(e=>JSON.stringify([r.title,r.ingredients]).toLowerCase().includes(e.toLowerCase()))))return false;
 return true;
}
