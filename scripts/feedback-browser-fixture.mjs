// Loopback-only disposable database and simulated identities. Never used on Vercel.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {createPreviewServer} from './dev.mjs';
import {createFeedbackStore} from '../server/feedback/store.js';
import {createFeedbackHandler} from '../api/feedback.js';
import {WorkspaceError} from '../server/recipes/workspace/input.js';
if(process.env.VERCEL||process.env.NODE_ENV==='production')throw Error('Local fixture only.');
const db=new PGlite();await db.exec(await readFile(new URL('../server/feedback/schema.sql',import.meta.url),'utf8'));const store=createFeedbackStore(db);
const auth=async req=>{const userId=req.headers.authorization?.slice(7);if(!['alice','bob','owner'].includes(userId))throw new WorkspaceError('Sign in to continue.',401);return {userId,owner:userId==='owner'};};
const app=createPreviewServer({feedback:createFeedbackHandler({store,auth,enabled:()=>true}),'owner-feedback':createFeedbackHandler({store,auth,owner:true,enabled:()=>true})});
const server=http.createServer((req,res)=>{
 if(!['localhost:4196','127.0.0.1:4196'].includes(req.headers.host)){res.writeHead(403);res.end();return;}
 const role=req.headers.cookie?.match(/fixture_feedback=(owner|alice|bob|guest)/)?.[1]||'alice';
 if(/^\/__fixture\/(owner|alice|bob|guest)$/.test(req.url)){const next=req.url.split('/').pop();res.writeHead(302,{'Set-Cookie':`fixture_feedback=${next}; HttpOnly; SameSite=Strict; Path=/`,Location:next==='owner'?'/owner/feedback/':'/feedback/'});res.end();return;}
 if(req.url==='/account-client.js'){res.setHeader('Content-Type','text/javascript');res.end(`export async function accountReady(){const n=document.createElement('nav');n.textContent='LOCAL SIMULATED ${role}: ';for(const r of ['owner','alice','bob','guest']){const a=document.createElement('a');a.href='/__fixture/'+r;a.textContent=r+' ';n.append(a);}document.body.prepend(n);return {session:${role==='guest'?'null':`{getToken:async()=> '${role}'}`},addListener(){}};}`);return;}
 app.emit('request',req,res);
});server.listen(4196,'127.0.0.1',()=>console.log('Local disposable feedback: http://localhost:4196/feedback/'));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(async()=>{await db.close();process.exit(0);}));
