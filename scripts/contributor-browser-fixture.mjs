// Disposable localhost-only verification, with clearly labeled simulated Clerk accounts.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {openLocalRecipeDatabase} from './recipe-local-db.mjs';
import {createPreviewServer} from './dev.mjs';
import {createContributorStore} from '../server/recipes/contributors/store.js';
import {createContributorHandler} from '../api/contributor-recipes.js';
import {createInvitationsHandler} from '../api/recipe-contributors.js';
import {createCommunityHandler} from '../api/community-recipes.js';
import {createOwnerRecipesHandler} from '../api/owner-recipes.js';
import {createOwnerHandler} from '../api/owner.js';
import recipes from '../api/recipes.js';
if(process.env.VERCEL||process.env.NODE_ENV==='production')throw Error('Local fixture only.');
const {db,store}=await openLocalRecipeDatabase();await db.exec(await readFile(new URL('../server/recipes/contributors/schema.sql',import.meta.url),'utf8'));
const beta=createContributorStore(db),owner={owner:true,userId:'user_owner'};
const users=['owner','alice','bob','uninvited'].map(name=>({id:'user_'+name,emailAddresses:[{emailAddress:name+'@example.test',verification:{status:'verified'}}],privateMetadata:{ezeatsAgeConfirmation:{minimumAge:13}}}));
const authOptions={allowedOrigins:()=>['http://localhost:4195','http://127.0.0.1:4195'],owners:()=>owner.userId,makeClient:()=>({authenticateRequest:async r=>({toAuth:()=>({userId:users.find(u=>u.id===r.headers.get('authorization')?.slice(7))?.id})}),users:{getUser:async id=>{const u=users.find(u=>u.id===id);if(!u)throw Object.assign(Error('Not found'),{status:404});return u;},getUserList:async({emailAddress})=>{const data=users.filter(u=>u.emailAddresses.some(e=>e.emailAddress===emailAddress[0]));return {data,totalCount:data.length};}}})};
await beta.invite('user_alice',new Date(Date.now()+86400000).toISOString(),owner);
const app=createPreviewServer({owner:createOwnerHandler(authOptions),'owner-recipes':createOwnerRecipesHandler({store,betaStore:beta,betaEnabled:()=>true,authOptions,enabled:()=>true}),'contributor-recipes':createContributorHandler({store:beta,authOptions,enabled:()=>true}),'recipe-contributors':createInvitationsHandler({store:beta,authOptions,enabled:()=>true}),'community-recipes':createCommunityHandler({store,enabled:()=>true}),recipes});
const server=http.createServer((req,res)=>{
 if(!['localhost:4195','127.0.0.1:4195'].includes(req.headers.host)){res.writeHead(403);res.end();return;}
 const role=req.headers.cookie?.match(/(?:^|; )fixture_role=(owner|alice|bob|uninvited)(?:;|$)/)?.[1]||'alice';
 if(/^\/__fixture\/(owner|alice|bob|uninvited)$/.test(req.url)){const next=req.url.split('/').pop();res.writeHead(302,{'Set-Cookie':`fixture_role=${next}; HttpOnly; SameSite=Strict; Path=/`,Location:next==='owner'?'/owner/recipes/':'/recipes/contribute/'});res.end();return;}
 if(req.url==='/account-client.js'){res.setHeader('Content-Type','text/javascript');res.end(`export async function accountReady(){if(!document.querySelector('#fixture-notice')){const n=document.createElement('nav');n.id='fixture-notice';n.style.cssText='padding:12px;background:#fff0dc';n.textContent='LOCAL TEST ONLY — simulated ${role}. Switch: ';for(const role of ['owner','alice','bob','uninvited']){const a=document.createElement('a');a.href='/__fixture/'+role;a.textContent=role+' ';n.append(a);}document.body.prepend(n);}return {session:{id:'fixture-${role}',getToken:async()=> 'user_${role}'},addListener(){}};}`);return;}
 app.emit('request',req,res);
});
server.listen(4195,'127.0.0.1',()=>console.log('Disposable contributor fixture: http://localhost:4195/recipes/contribute/'));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(async()=>{await db.close();process.exit(0);}));
