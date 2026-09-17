import {validateReview} from './review-schema.js';
const form=document.querySelector('#review-form'),submit=document.querySelector('#review-submit'),status=document.querySelector('#review-status'),list=document.querySelector('#review-list'),summary=document.querySelector('#review-summary'),retry=document.querySelector('#review-retry');
let submissionId=crypto.randomUUID(),busy=false,available=false;
const node=(tag,text,className)=>{const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;return el;};
function render(reviews){
 list.replaceChildren();
 summary.textContent=reviews.length?`${reviews.length} published ${reviews.length===1?'review':'reviews'}`:'Every experience helps us improve.';
 if(!reviews.length){const empty=node('div','','review-empty');empty.append(node('h3','The conversation starts with you.'),node('p','No published reviews yet. Share your experience—good or bad.'));list.append(empty);return;}
 for(const review of reviews){const card=node('article','','review-card');card.append(node('h3',review.name));const date=node('time',new Date(review.createdAt).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}));date.dateTime=review.createdAt;card.append(date);if(review.rating){const rating=node('div',`${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}`,'review-stars');rating.setAttribute('aria-label',`${review.rating} out of 5 stars`);card.append(rating);}card.append(node('p',review.comment));list.append(card);}
}
async function load(){retry.hidden=true;try{const response=await fetch('/api/reviews',{cache:'no-store'});const data=await response.json();if(!response.ok)throw new Error(data.error);available=true;document.querySelector('#review-preview').hidden=!data.local;render(data.reviews);submit.disabled=false;submit.textContent='Submit for approval';}catch{available=false;summary.textContent='Reviews are temporarily unavailable.';retry.hidden=false;submit.disabled=true;submit.textContent='Submissions unavailable';status.textContent='Your text stays here while this page is open. Please try loading again.';}}
document.querySelector('#review-comment').addEventListener('input',e=>{document.querySelector('#comment-count').textContent=`${e.target.value.length} / 2,000`;});
document.querySelector('#clear-rating').addEventListener('click',()=>form.querySelectorAll('[name=rating]').forEach(input=>input.checked=false));
retry.addEventListener('click',load);
form.addEventListener('submit',async e=>{
 e.preventDefault();if(busy||!available)return;
 const fields=new FormData(form);let payload;
 try{payload={name:fields.get('name'),comment:fields.get('comment'),rating:fields.has('rating')?Number(fields.get('rating')):null,consent:fields.has('consent'),submissionId};validateReview(payload);}catch(error){status.textContent=error.message;status.focus();return;}
 busy=true;submit.disabled=true;submit.textContent='Sending…';status.textContent='';
 try{const response=await fetch('/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await response.json();if(!response.ok)throw new Error(data.error||'Please retry.');form.reset();submissionId=crypto.randomUUID();document.querySelector('#comment-count').textContent='0 / 2,000';status.textContent=data.local?'Saved on this computer for local review. It will appear here after approval; nothing was sent to the live website.':'Thank you. Your review is awaiting approval and is not public yet.';status.focus();}catch(error){status.textContent=error.message||'Could not send your review. Please retry.';status.focus();}finally{busy=false;submit.disabled=!available;submit.textContent='Submit for approval';}
});
load();
