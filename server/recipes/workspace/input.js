import {createHash} from 'node:crypto';
import {plainText} from '../moderation/model.js';
import {validateRecipe} from '../model.js';
export class WorkspaceError extends Error { constructor(message,status=400){super(message);this.status=status;} }
export const statuses=['draft','pending','approved','published','changes-requested','rejected','removed'];
export const diets=['vegetarian','vegan','pescatarian','gluten-free','dairy-free'];
export const mealTypes=['breakfast','lunch','dinner','snack','side','soup','salad','bowl','pasta','wrap','sandwich','pizza','curry','stir-fry','casserole','other'];
export function keys(value,allowed){if(!value||Array.isArray(value)||typeof value!=='object'||Object.keys(value).some(k=>!allowed.includes(k)))throw new WorkspaceError('Unexpected or invalid fields.');}
export function text(value,max=2000,required=false){try{const s=plainText(value??'',max);if(required&&!s)throw Error();return s;}catch{throw new WorkspaceError('Use plain text within the field length limit.');}}
function number(v,min,max,nullable=true){if(v===null&&nullable)return null;if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw new WorkspaceError('Invalid quantity, cost or time.');return v;}
function choices(v,options,max=20){if(!Array.isArray(v)||v.length>max||v.some(x=>!options.includes(x))||new Set(v).size!==v.length)throw new WorkspaceError('Invalid selection.');return v;}
export function identity(id){if(typeof id!=='string'||!/^ezeats-(?:owner|user):[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)||id.length>100)throw new WorkspaceError('Use a stable ezeats-owner:recipe-name ID. Existing file-recipe IDs are reserved.');return id;}
const contentFields=['id','title','description','servings','preparationMinutes','cookingMinutes','totalMinutes','ingredients','steps','cuisine','mealTypes','difficulty','dietTags','knownAllergens','estimatedCost','currency','moods','heat','familiarity','budget','author','copyrightConfirmed','copyrightStatement','safetyEvidence','dietEvidence','allergenEvidence','privateNotes','imageRights','rightsBasis','sourceUrl','sourceAttribution'];
export function normalizeContent(raw,actor,now=new Date().toISOString()){
 keys(raw,contentFields);const id=identity(raw.id);
 const rightsBasis=raw.rightsBasis??'original-work';if(!['original-work','permission'].includes(rightsBasis))throw new WorkspaceError('Invalid copyright basis.');
 if(!id.startsWith('ezeats-user:')&&rightsBasis!=='original-work')throw new WorkspaceError('First-party EZEATS recipes require original-work rights.');
 const sourceUrl=text(raw.sourceUrl,1000);if(sourceUrl){let u;try{u=new URL(sourceUrl);}catch{throw new WorkspaceError('Use a valid HTTPS source URL.');}if(u.protocol!=='https:'||u.username||u.password||!u.hostname.includes('.')||u.hostname.endsWith('.local')||u.hostname.endsWith('.localhost')||/^(?:\d{1,3}(?:\.\d{1,3}){3}|\[)/.test(u.hostname))throw new WorkspaceError('Use a public HTTPS source URL without credentials.');}
 const sourceAttribution=text(raw.sourceAttribution,500);if(rightsBasis==='permission'&&(!sourceUrl||!sourceAttribution))throw new WorkspaceError('Permission-based recipes require source URL and attribution.');
 if(!Array.isArray(raw.ingredients)||raw.ingredients.length>60||!Array.isArray(raw.steps)||raw.steps.length>60)throw new WorkspaceError('At most 60 ingredients and steps.');
 const ingredients=raw.ingredients.map(i=>{keys(i,['quantity','unit','name','notes']);return {quantity:text(i.quantity,40),unit:text(i.unit,40),name:text(i.name,200),notes:text(i.notes,500)};});
 const steps=raw.steps.map(s=>text(s,2500));
 const image=raw.imageRights;keys(image,['ownership','owner','licenseStatus','licenseReference']);
 if(!['none','author-owned','licensed','unknown'].includes(image.ownership)||!['not-applicable','unknown','permission-confirmed','not-permitted'].includes(image.licenseStatus))throw new WorkspaceError('Invalid image rights.');
 if(typeof raw.copyrightConfirmed!=='boolean')throw new WorkspaceError('Copyright confirmation must be true or false.');
 const c={id,rightsBasis,sourceUrl,sourceAttribution,title:text(raw.title,200,true),description:text(raw.description,1200),servings:number(raw.servings,1,100),preparationMinutes:number(raw.preparationMinutes,0,1440),cookingMinutes:number(raw.cookingMinutes,0,1440),totalMinutes:number(raw.totalMinutes,1,2880),ingredients,steps,cuisine:text(raw.cuisine,150),mealTypes:choices(raw.mealTypes,mealTypes),difficulty:text(raw.difficulty,20),dietTags:choices(raw.dietTags,diets),knownAllergens:choices(raw.knownAllergens,['Milk','Eggs','Fish','Shellfish','Wheat','Soy','Peanuts','Tree nuts','Sesame','Mustard','Sulphites']),estimatedCost:number(raw.estimatedCost,0.01,500),currency:text(raw.currency,3),moods:choices(raw.moods,['comfort','fresh','bold']),heat:number(raw.heat,0,2,false),familiarity:text(raw.familiarity,20),budget:text(raw.budget,20),author:text(raw.author,200),copyrightConfirmed:raw.copyrightConfirmed,copyrightStatement:text(raw.copyrightStatement,2000),safetyEvidence:text(raw.safetyEvidence,4000),dietEvidence:text(raw.dietEvidence,3000),allergenEvidence:text(raw.allergenEvidence,3000),privateNotes:text(raw.privateNotes,4000),imageRights:{ownership:image.ownership,licenseStatus:image.licenseStatus,owner:text(image.owner,200),licenseReference:text(image.licenseReference,1000)}};
 if(!['easy','moderate','advanced'].includes(c.difficulty)||!['USD','CAD'].includes(c.currency)||!['familiar','adventurous'].includes(c.familiarity)||!['budget','everyday','treat'].includes(c.budget)||!Number.isInteger(c.heat))throw new WorkspaceError('Invalid picker metadata.');
 return {content:c,attestation:{confirmed:c.copyrightConfirmed,basis:c.copyrightConfirmed?rightsBasis:'unknown',accountId:actor.userId,at:now,statement:c.copyrightStatement},evidence:{diet:{status:c.dietEvidence?'claimed':'unknown',basis:c.dietEvidence},allergens:{status:c.allergenEvidence?'claimed':'unknown',basis:c.allergenEvidence},foodSafety:{status:c.safetyEvidence?'claimed':'unknown',basis:c.safetyEvidence}},fingerprint:createHash('sha256').update(JSON.stringify([c.title.toLowerCase(),c.ingredients,c.steps])).digest('hex')};
}
export function requireComplete(c){
 if(!c.description||!c.author||!c.cuisine||!c.servings||!c.totalMinutes||c.preparationMinutes===null||c.cookingMinutes===null||c.preparationMinutes+c.cookingMinutes!==c.totalMinutes)throw new WorkspaceError('Complete description, author, cuisine, servings and consistent timing before review.');
 if(!c.mealTypes.length||!c.moods.length||!c.ingredients.length||!c.steps.length||c.steps.some(s=>!s))throw new WorkspaceError('Add meal types, mood, ingredients and complete cooking steps.');
 const positiveQuantity=q=>{if(!/^\d+(?:\.\d+)?$|^\d+\/\d+$|^\d+\s+\d+\/\d+$/.test(q))return false;const parts=q.split(/\s+/),fraction=parts.at(-1);if(fraction.includes('/')){const [n,d]=fraction.split('/').map(Number);return d>0&&(parts.length>1?Number(parts[0]):0)+n/d>0;}return Number(q)>0;};
 if(c.ingredients.some(i=>!i.name||!i.unit||!positiveQuantity(i.quantity)))throw new WorkspaceError('Every ingredient needs a positive quantity, unit and name.');
 if(!c.copyrightConfirmed||!c.copyrightStatement)throw new WorkspaceError('Confirm original-work rights before review.');
 if(!c.safetyEvidence||!c.allergenEvidence||(c.dietTags.length&&!c.dietEvidence))throw new WorkspaceError('Document food safety, allergen assessment and evidence for dietary claims.');
 const conflicts={vegan:['Milk','Eggs','Fish','Shellfish'],vegetarian:['Fish','Shellfish'],'dairy-free':['Milk'],'gluten-free':['Wheat']};
 if(c.dietTags.some(d=>(conflicts[d]||[]).some(a=>c.knownAllergens.includes(a))))throw new WorkspaceError('Dietary claims conflict with declared allergens.');
}
// Explicit allowlist projection. Private evidence, IDs, notes and attestations never escape.
export function publicRecipe(revision){
 const c=revision.content,user=c.id.startsWith('ezeats-user:');
 return validateRecipe({schemaVersion:1,id:c.id,title:c.title,description:c.description,servings:c.servings,time:{preparationMinutes:c.preparationMinutes,cookingMinutes:c.cookingMinutes,totalMinutes:c.totalMinutes},ingredients:c.ingredients.map(i=>({quantity:i.quantity||null,unit:i.unit||null,name:i.name,notes:i.notes||null})),instructions:c.steps.map((s,i)=>({order:i+1,text:s})),cuisine:c.cuisine,mealTypes:c.mealTypes,difficulty:c.difficulty,dietTags:c.dietTags,knownAllergens:c.knownAllergens,estimatedCost:c.estimatedCost===null?null:{amount:c.estimatedCost,currency:c.currency,basis:'per-serving estimate'},imageUrl:null,source:{provider:user?'EZEATS contributor':'EZEATS',originalUrl:user?(c.sourceUrl||null):null,providerUrl:null,attribution:user?`Recipe contributed by ${c.author}.${c.sourceAttribution?' Source: '+c.sourceAttribution:''}`:`Original EZEATS recipe by ${c.author}.`,licensingStatus:user?'Contributor attests original work or submission permission; no external reuse license granted.':'First-party EZEATS content; no external reuse license granted.',verifiedAt:null},suitability:{status:'unverified',ingredientsComplete:false,allergensComplete:false,dietEvidence:false}});
}
export function parseFilters(q={}){
 keys(q,['id','q','status','author','from','to','mealType','diet','offset','limit']);
 const f={q:text(q.q,200),author:text(q.author,200),status:text(q.status,30),mealType:text(q.mealType,30),diet:text(q.diet,30),from:text(q.from,10),to:text(q.to,10)};
 for(const [k,opts] of [['status',statuses],['mealType',mealTypes],['diet',diets]])if(f[k]&&!opts.includes(f[k]))throw new WorkspaceError('Invalid filter.');
 for(const k of ['from','to'])if(f[k]&&(!/^\d{4}-\d{2}-\d{2}$/.test(f[k])||!Number.isFinite(Date.parse(f[k]))||new Date(f[k]).toISOString().slice(0,10)!==f[k]))throw new WorkspaceError('Invalid date.');
 if(f.from&&f.to&&f.from>f.to)throw new WorkspaceError('Date range is reversed.');
 for(const [k,def,max] of [['offset',0,10000],['limit',20,50]]){if(q[k]!==undefined&&!/^\d+$/.test(String(q[k])))throw new WorkspaceError('Invalid pagination.');f[k]=q[k]===undefined?def:Number(q[k]);if(f[k]>max||f[k]<(k==='limit'?1:0))throw new WorkspaceError('Invalid pagination.');}
 return f;
}
