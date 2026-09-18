import {localProvider} from '../server/recipes/local.js';
import {createMealDBProvider} from '../server/recipes/themealdb.js';
import {createCatalog} from '../server/recipes/catalog.js';
const diets=['vegetarian','vegan','pescatarian','gluten-free','dairy-free'];
const allergens=['Milk','Wheat','Fish','Soy','Sesame','Eggs','Tree nuts','Shellfish','Peanuts'];
export function parseRecipeQuery(raw){
 const params=new URL(raw,'http://localhost').searchParams,keys=['id','q','provider','limit','diets','allergens','exclude'];
 for(const k of params.keys())if(!keys.includes(k)||params.getAll(k).length!==1)throw new Error('Invalid query parameter');
 const id=params.get('id'),q=params.get('q')||'',provider=params.get('provider')||id?.split(':')[0]||'ezeats';
 if(!['ezeats','themealdb'].includes(provider)||id&&(!/^(ezeats:[a-z0-9-]{1,80}|themealdb:\d{1,12})$/.test(id)||!id.startsWith(provider+':'))||q.length>80||/[\x00-\x1f]/.test(q)||id&&params.has('q'))throw new Error('Invalid recipe query');
 const rawLimit=params.get('limit')||'12';if(!/^\d{1,2}$/.test(rawLimit)||+rawLimit<1||+rawLimit>28)throw new Error('Limit must be 1–28');
 const list=k=>{const raw=params.get(k);if(!raw)return [];const values=raw.split(',').map(s=>s.trim());if(values.length>10||values.some(s=>!s||s.length>60||/[\x00-\x1f]/.test(s)))throw new Error('Invalid restriction');return values;};
 const d=list('diets'),a=list('allergens'),exclude=list('exclude');if(d.some(v=>!diets.includes(v))||a.some(v=>!allergens.includes(v)))throw new Error('Unsupported restriction');
 if(provider==='themealdb'&&!id&&q.trim().length<2)throw new Error('Enter at least two search characters');
 return {id,q:q.trim(),provider,limit:+rawLimit,diets:d,allergens:a,exclude};
}
// Bounded, per-process request budget; no IP/device identifiers or tracking.
export function createRecipeLimiter({now=Date.now,max=60}={}){let start=now(),count=0;return ()=>{if(now()-start>=60000){start=now();count=0;}return ++count<=max;};}
export function createRecipesHandler({env=process.env,limiter=createRecipeLimiter(),providers,timeoutMs=4000}={}){return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed.'});}
 let query;try{if(req.url.length>2048)throw new Error();query=parseRecipeQuery(req.url);}catch{return res.status(400).json({error:'Please check your recipe search and restrictions.'});}
 if(query.provider==='themealdb'&&!(env.RECIPE_THEMEALDB_DEV==='1'&&!env.VERCEL&&!env.VERCEL_ENV&&env.NODE_ENV!=='production'&&/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.host||'')))return res.status(403).json({error:'This provider is available only in explicitly enabled local development.'});
 if(!limiter()){res.setHeader('Retry-After','60');return res.status(429).json({error:'Recipe request limit reached. Try again in a minute.'});}
 try{
  const provider=providers?.[query.provider]||(query.provider==='ezeats'?localProvider:createMealDBProvider());
  const recipes=await createCatalog(provider,{timeoutMs})(query);
  if(query.id&&!recipes.length)return res.status(404).json({error:'Recipe unavailable or does not meet the supplied restrictions.'});
  return res.status(200).json(query.id?{recipe:recipes[0]}:{recipes});
 }catch{return res.status(503).json({error:'Recipes are temporarily unavailable. Please try again.'});}
};}
export default createRecipesHandler();
