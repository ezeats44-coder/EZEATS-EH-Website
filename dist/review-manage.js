import {accountReady} from './account-client.js';
const local=['localhost','127.0.0.1'].includes(location.hostname);
async function request(options={}){
 const headers={...options.headers};
 if(!local){const clerk=await accountReady();const token=await clerk.session?.getToken();if(!token)throw new Error('Sign in with your owner account, then return to this page.');headers.Authorization=`Bearer ${token}`;}
 const response=await fetch('/api/review-moderation',{...options,headers,cache:'no-store'});const data=await response.json();if(!response.ok)throw new Error(data.error||'The review queue is unavailable.');return data;
}
const status=document.querySelector('#queue-status'),retry=document.querySelector('#queue-retry');
const el=(tag,text)=>{const node=document.createElement(tag);node.textContent=text;return node;};
function cards(target,rows,pending){
 target.replaceChildren();if(!rows.length){target.append(el('p',pending?'No reviews waiting for approval.':'No published reviews.'));return;}
 for(const review of rows){const card=el('article','');card.className='review-card';card.append(el('h3',review.name),el('p',review.rating?`${review.rating} out of 5 stars`:'No rating'),el('p',review.comment));const actions=el('div','');actions.className='settings-actions';
  for(const [action,label] of pending?[['published','Approve & publish'],['rejected','Keep private']]:[['rejected','Hide review']]){const button=el('button',label);button.type='button';button.className=action==='published'?'primary':'secondary';button.setAttribute('aria-label',`${label}: ${review.name}`);button.addEventListener('click',()=>moderate(review.id,action,button));actions.append(button);}card.append(actions);target.append(card);
 }
}
async function load(){retry.hidden=true;try{const data=await request();cards(document.querySelector('#pending-reviews'),data.pending,true);cards(document.querySelector('#published-reviews'),data.published,false);status.textContent=`${data.pending.length} waiting for approval. ${data.local?'Changes apply only to this local preview.':'Only approved reviews appear publicly.'}`;}catch(error){status.textContent=error.message;retry.hidden=false;}}
async function moderate(id,action,button){button.disabled=true;try{await request({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status:action})});await load();status.textContent=action==='published'?'Review approved and published.':'Review hidden from the public page.';status.tabIndex=-1;status.focus();}catch{status.textContent='Could not save your decision. Please retry.';button.disabled=false;}}
retry.addEventListener('click',load);load();
