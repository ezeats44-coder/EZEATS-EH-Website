import {productionRecipeStore} from '../server/recipes/workspace/database.js';
import {createRecipeLimiter} from './recipes.js';
export function createCommunityHandler({store,enabled=()=>process.env.RECIPE_CONTRIBUTOR_BETA==='true'&&process.env.RECIPE_COMMUNITY_CATALOG==='true',limiter=createRecipeLimiter()}={}){return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');if(req.method!=='GET')return res.status(405).json({error:'Method not allowed.'});
 if(!enabled())return res.status(404).json({error:'Community catalog is not enabled.'});
 const p=new URL(req.url,'https://example.test').searchParams,id=p.get('id'),q=p.get('q')||'';
 if([...p.keys()].some(k=>!['id','q'].includes(k)||p.getAll(k).length!==1)||id&&(!/^ezeats-user:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)||id.length>100||p.has('q'))||q.length>80)return res.status(400).json({error:'Invalid recipe query.'});
 if(!limiter())return res.status(429).json({error:'Please try again in a minute.'});
 try{const db=store||productionRecipeStore();if(!db)throw Error();if(id){const recipe=await db.published(id);return recipe?res.status(200).json({recipe}):res.status(404).json({error:'Recipe not found.'});}const recipes=(await db.publishedSearch({q,limit:20,origin:'user-submitted'})).filter(r=>r.id.startsWith('ezeats-user:')).slice(0,20);res.status(200).json({recipes});}catch{res.status(503).json({error:'Community recipes are temporarily unavailable.'});}
 };}
export default createCommunityHandler();
