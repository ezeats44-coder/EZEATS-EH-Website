import {accountReady} from './account-client.js';
let clerk,link,sequence=0;
async function refresh(){const version=++sequence;link?.remove();link=null;try{clerk??=await accountReady();const token=await clerk.session?.getToken();if(!token)return;const r=await fetch('/api/contributor-recipes?access=1',{headers:{Authorization:`Bearer ${token}`},cache:'no-store',signal:AbortSignal.timeout(8000)});const data=await r.json();if(version!==sequence||!r.ok||data.contributor!==true)return;const nav=document.querySelector('.site-nav');if(!nav)return;link=document.createElement('a');link.href='/recipes/contribute/';link.className='text-button';link.textContent='Contribute';nav.append(link);}catch{/* No invitation means no link, not a broken account page. */}}
refresh().then(()=>{let sessionId=clerk?.session?.id;clerk?.addListener(({session})=>{if(session?.id!==sessionId){sessionId=session?.id;refresh();}});});
window.addEventListener('pageshow',e=>{if(e.persisted)refresh();});
// Re-check invitation visibility on return; APIs always re-check synchronously.
window.addEventListener('focus',refresh);
