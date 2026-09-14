import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import config from '../api/config.js';
import profile from '../api/profile.js';
const root=path.resolve('dist');
http.createServer(async(req,res)=>{
 try{
 const url=new URL(req.url,'http://localhost:4175');
 if(['/api/config','/api/profile'].includes(url.pathname)){
 let size=0;const chunks=[];for await(const c of req){size+=c.length;if(size>12000){res.writeHead(413);res.end();return;}chunks.push(c);}req.body=Buffer.concat(chunks).toString();
 res.status=n=>{res.statusCode=n;return res;};res.json=data=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};
 return await (url.pathname==='/api/config'?config:profile)(req,res);
 }
 if(['/account','/settings','/about'].includes(url.pathname)){res.writeHead(302,{Location:url.pathname+'/'+url.search});res.end();return;}
 const target=path.resolve(root,'.'+decodeURIComponent(url.pathname)+(url.pathname.endsWith('/')?'index.html':''));
 if(!target.startsWith(root+path.sep))throw new Error('Invalid path');
 const data=await readFile(target);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp'})[path.extname(target)]||'application/octet-stream');res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(4175,'127.0.0.1',()=>console.log('EZEATS preview ready at http://localhost:4175'));
