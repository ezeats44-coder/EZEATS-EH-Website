import contributorRecipes from '../api/contributor-recipes.js';
import contributors from '../api/recipe-contributors.js';
import communityRecipes from '../api/community-recipes.js';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import owner from '../api/owner.js';
import ownerRecipes from '../api/owner-recipes.js';
import recipes from '../api/recipes.js';
import config from '../api/config.js';
import profile from '../api/profile.js';
import {createReviewsHandler} from '../api/reviews.js';
import {createLocalReviewStore} from './review-store.mjs';
import {createLocalModerationHandler} from './review-moderation.mjs';
const reviewStore=createLocalReviewStore(path.resolve('.local-data/reviews.json'));
const reviews=createReviewsHandler(reviewStore),reviewModeration=createLocalModerationHandler(reviewStore);
const root=path.resolve('dist');
export function createPreviewServer(handlers={'contributor-recipes':contributorRecipes,'recipe-contributors':contributors,'community-recipes':communityRecipes,config,profile,recipes,owner,'owner-recipes':ownerRecipes,reviews,'review-moderation':reviewModeration}) { return http.createServer(async(req,res)=>{
 try{
 const url=new URL(req.url,'http://localhost:4175');
 req.query=Object.fromEntries(url.searchParams);
 if(['/api/contributor-recipes','/api/recipe-contributors','/api/community-recipes','/api/owner','/api/owner-recipes','/api/recipes','/api/config','/api/profile','/api/reviews','/api/review-moderation'].includes(url.pathname)){
 let size=0;const chunks=[];for await(const c of req){size+=c.length;if(size>(['/api/owner-recipes','/api/contributor-recipes'].includes(url.pathname)?65536:12000)){res.writeHead(413);res.end();return;}chunks.push(c);}req.body=Buffer.concat(chunks).toString();
 res.status=n=>{res.statusCode=n;return res;};res.json=data=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};
 return await handlers[url.pathname.split('/').pop()](req,res);
 }
 if(['/recipes/contribute','/owner/recipes/contributors','/owner','/owner/recipes','/recipe','/account','/settings','/about','/privacy','/reviews','/reviews/manage'].includes(url.pathname)){res.writeHead(302,{Location:url.pathname+'/'+url.search});res.end();return;}
 const target=path.resolve(root,'.'+decodeURIComponent(url.pathname)+(url.pathname.endsWith('/')?'index.html':''));
 if(!target.startsWith(root+path.sep))throw new Error('Invalid path');
 const data=await readFile(target);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp'})[path.extname(target)]||'application/octet-stream');res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
}); }
if(process.argv[1] && path.resolve(process.argv[1])===new URL(import.meta.url).pathname)createPreviewServer().listen(4175,'127.0.0.1',()=>console.log('EZEATS preview ready at http://localhost:4175'));
