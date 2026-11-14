import {accountReady} from './account-client.js';
const nav=document.querySelector('.site-nav'),card=document.getElementById('feedback-owner-card');
let version=0,link,clerk;
async function refresh(){
 const request=++version;link?.remove();link=null;if(card)card.hidden=true;
 try{
 clerk=await accountReady();const session=clerk.session?.id,token=await clerk.session?.getToken();if(!token)return;
 const response=await fetch('/api/feedback?access=1',{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});
 const result=await response.json();if(request!==version||session!==clerk.session?.id||!response.ok||result.available!==true)return;
 if(nav){link=document.createElement('a');link.href='/feedback/';link.className='text-button';link.textContent='Feedback';nav.append(link);}if(card)card.hidden=false;
 }catch{/* Fail closed; unrelated navigation still works. */}
}
async function start(){await refresh();if(clerk){let sessionId=clerk.session?.id;clerk.addListener(({session})=>{if(session?.id!==sessionId){sessionId=session?.id;refresh();}});}}
start();
window.addEventListener('pageshow',e=>{if(e.persisted)refresh();});
