import {WorkspaceError,keys} from '../workspace/input.js';
export function body(req,allowed){
 if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))throw new WorkspaceError('Use application/json.',415);
 const raw=typeof req.body==='string'?req.body:JSON.stringify(req.body||{});if(Buffer.byteLength(raw)>65536)throw new WorkspaceError('Request exceeds 64 KB.',413);
 let data;try{data=JSON.parse(raw);}catch{throw new WorkspaceError('Invalid JSON.');}keys(data,allowed);return data;
}
export function endpoint(work){return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');
 try{if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');throw new WorkspaceError('Method not allowed.',405);}if((req.url||'').length>2048)throw new WorkspaceError('Query too long.');const params=new URL(req.url||'/','https://example.test').searchParams;for(const k of params.keys())if(params.getAll(k).length>1)throw new WorkspaceError('Duplicate query parameter.');await work(req,res);}catch(e){const status=e instanceof WorkspaceError?e.status:503;if(status===429)res.setHeader('Retry-After','60');res.status(status).json({error:e instanceof WorkspaceError?e.message:'Recipe service unavailable. Reload before retrying.'});}
};}
export function offset(q){if(q.offset!==undefined&&!/^\d{1,5}$/.test(String(q.offset)))throw new WorkspaceError('Invalid page.');return Number(q.offset||0);}
