import {randomUUID} from 'node:crypto';
// Deliberately excludes request bodies, query strings, account IDs, URLs,
// error messages, attestations and tokens. These are operational logs, not analytics.
export function observeEndpoint(route,handler,{write=entry=>console.warn(JSON.stringify(entry)),now=Date.now,id=randomUUID}={}){
 if(!/^[a-z-]+$/.test(route))throw new Error('Static route name required');
 return async(req,res)=>{
  const started=now(),requestId=id();let status=200,logged=false;
  res.setHeader('X-Request-ID',requestId);
  const originalStatus=res.status.bind(res),originalJson=res.json.bind(res);
  res.status=n=>{status=n;return originalStatus(n);};
  const log=()=>{if(logged)return;logged=true;if(status>=400||['POST','PUT','PATCH','DELETE'].includes(req.method)){
   try{write({event:'api-result',route,method:['GET','POST','PUT','PATCH','DELETE','OPTIONS'].includes(req.method)?req.method:'OTHER',status,requestId,durationMs:Math.max(0,now()-started)});}catch{}
  }};
  res.json=body=>{log();return originalJson(body);};
  try{return await handler(req,res);}catch{status=503;log();if(!res.headersSent)return res.status(503).json({error:'Service temporarily unavailable. Please retry.'});}
 };
}
