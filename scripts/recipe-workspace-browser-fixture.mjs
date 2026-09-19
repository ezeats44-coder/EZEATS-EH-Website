// Explicit, loopback-only UI verification fixture. Never deployed or used by normal dev.
import http from 'node:http';
import {openLocalRecipeDatabase} from './recipe-local-db.mjs';
import {createPreviewServer} from './dev.mjs';
import {createOwnerRecipesHandler} from '../api/owner-recipes.js';
import {createOwnerHandler} from '../api/owner.js';
import {ownerRecipe} from '../tests/fixtures/owner-recipe.js';
import recipes from '../api/recipes.js';
if(process.env.VERCEL)throw Error('Browser fixture is localhost only.');
const {db,store}=await openLocalRecipeDatabase(),actor={authorized:true,userId:'fixture-owner'};
const authOptions={allowedOrigins:()=>['http://localhost:4193'],owners:()=>actor.userId,makeClient:()=>({authenticateRequest:async req=>({toAuth:()=>({userId:req.headers.get('authorization')==='Bearer fixture-owner'?actor.userId:null})})})};
let initial=await store.mutate({action:'create',id:'ezeats-owner:fixture-bowl',content:ownerRecipe('ezeats-owner:fixture-bowl')},actor);
for(const action of ['submit','approve-and-publish'])initial=await store.mutate({action,id:initial.id,expectedLock:initial.lock_version},actor);
const app=createPreviewServer({owner:createOwnerHandler(authOptions),'owner-recipes':createOwnerRecipesHandler({store,authOptions,enabled:()=>true}),recipes});
const server=http.createServer((req,res)=>{
 if(req.url==='/account-client.js'){
  res.setHeader('Content-Type','text/javascript');res.end(`export async function accountReady(){const note=document.createElement('p');note.textContent='LOCAL VERIFICATION FIXTURE — simulated owner, disposable database';note.style.cssText='padding:16px;background:#fff0dc';document.body.prepend(note);return {session:{id:'fixture',getToken:async()=> 'fixture-owner'},addListener(){}};}`);return;
 }
 app.emit('request',req,res);
});
server.listen(4193,'127.0.0.1',()=>console.log('Disposable fixture: http://localhost:4193/owner/recipes/'));
process.on('SIGINT',()=>server.close(async()=>{await db.close();process.exit(0);}));
