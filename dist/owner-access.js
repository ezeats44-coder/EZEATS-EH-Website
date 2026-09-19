import './contributor-access.js';
import {accountReady} from './account-client.js';
const nav=document.querySelector('.site-nav');
const tools=document.querySelector('#owner-tools');
const status=document.querySelector('#owner-status');
const retry=document.querySelector('#owner-retry');
let sequence=0,clerk,link;
function hide(){link?.remove();link=null;if(tools)tools.hidden=true;}
async function refresh(){
 const version=++sequence;hide();if(retry)retry.hidden=true;
 if(status)status.textContent='Checking owner access…';
 try{
  clerk=await accountReady();
  const token=await clerk.session?.getToken();
  if(version!==sequence)return;
  if(!token){if(status)status.textContent='Sign in with an authorized owner account, then return here.';return;}
  const response=await fetch('/api/owner',{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});
  const data=await response.json();if(version!==sequence)return;
  if(!response.ok||data.owner!==true){if(response.status===401||response.status===403){if(status)status.textContent='This area is available only to authorized EZEATS owners.';return;}throw new Error();}
  if(nav){link=document.createElement('a');link.href='/owner/';link.className='text-button';link.textContent='Owner';if(location.pathname.startsWith('/owner'))link.setAttribute('aria-current','page');nav.append(link);}
  if(tools)tools.hidden=false;if(status)status.textContent='Owner access verified.';
 }catch{if(version===sequence){hide();if(status)status.textContent='Could not check owner access. Please try again.';if(retry)retry.hidden=false;}}
}
retry?.addEventListener('click',refresh);
await refresh();
if(clerk){let sessionId=clerk.session?.id;clerk.addListener(({session})=>{const id=session?.id;if(id!==sessionId){sessionId=id;refresh();}});}
window.addEventListener('pageshow',event=>{if(event.persisted)refresh();});
