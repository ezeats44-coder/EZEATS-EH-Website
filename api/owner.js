import {ownerIdentity} from '../server/owner-access.js';
export function createOwnerHandler(options){return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({owner:false});}
 try{const access=await ownerIdentity(req,options);return res.status(access.status).json({owner:access.status===200});}
 catch{return res.status(503).json({owner:false});}
};}
export default createOwnerHandler();
