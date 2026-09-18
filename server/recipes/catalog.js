import {assertProvider} from './provider.js';
import {validateRecipe,uniqueRecipes,matchesRestrictions} from './model.js';
export function createCatalog(provider,{timeoutMs=4000}={}){
 assertProvider(provider);
 return async function query({id,q='',limit=12,...restrictions}){
  const controller=new AbortController();let timer;
  try{
   const work=id?provider.getById(id,{signal:controller.signal}):provider.search({q,limit:100},{signal:controller.signal});
   const result=await Promise.race([work,new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('Provider timeout'));},timeoutMs);})]);
   const rows=uniqueRecipes(id?(result?[validateRecipe(result)]:[]):result);
   if(rows.some(r=>r.id.split(':')[0]!==provider.namespace))throw new Error('Wrong provider namespace');
   return rows.filter(r=>matchesRestrictions(r,restrictions)).slice(0,limit);
  }finally{clearTimeout(timer);}
 };
}
