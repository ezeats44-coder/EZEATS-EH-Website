// Mounted only by the loopback development server. Never deployed as a Vercel API.
export function createLocalModerationHandler(store){return async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 const host=req.headers.host||'';
 if(!/^(localhost|127\.0\.0\.1):\d+$/.test(host)||req.headers['sec-fetch-site']==='cross-site')return res.status(403).json({error:'Open the local review-management page on this computer.'});
 if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Method not allowed.'});
 if(req.method==='POST'&&req.headers.origin!==`http://${host}`)return res.status(403).json({error:'Approval must come from the local review-management page.'});
 try{
  if(req.method==='GET')return res.status(200).json({pending:await store.pending(),published:await store.published(),local:true});
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
  if(!body||Object.keys(body).some(k=>!['id','status'].includes(k))||typeof body.id!=='string'||!['published','rejected'].includes(body.status))return res.status(400).json({error:'Choose a review and a valid action.'});
  await store.moderate(body.id,body.status);return res.status(200).json({saved:true});
 }catch{return res.status(503).json({error:'Could not update the local review queue. Please retry.'});}
};}
