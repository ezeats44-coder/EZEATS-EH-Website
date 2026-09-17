import {fieldHeading,bindFieldHelp} from './field-help.js';
import {accountReady,profileRequest} from './account-client.js';
import {setupSections as sections,validateProfile} from './profile-schema.js';
import {bubbleField,bindBubbles} from './preference-bubbles.js';
const area=document.querySelector('#settings-content');
const message=document.querySelector('#settings-status');
let profile={},step=0,onboarding=false,busy=false,dirty=false;
let cleanupBubbles=()=>{};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function field(f){
 const v=profile[f.key],id=`field-${f.key}`;
 if(f.bubbles)return `<details class="bubble-question" ${f.key==='cuisines'?'open':''}><summary>${f.label}<span class="bubble-question-hint">Tap to choose</span></summary>${bubbleField(f,v||[])}</details>`;
 if(f.text)return `<div class="profile-field">${fieldHeading(f,id)}<input id="${id}" name="${f.key}" maxlength="${f.max}" value="${esc(v||'')}" ${f.help?`aria-describedby="${id}-help"`:''} autocomplete="off"></div>`;
 if(f.multiple)return `<fieldset class="profile-field"><legend>${f.label}</legend>${fieldHeading(f,id,false)}<div class="profile-options">${f.options.map((o,i)=>`<label><input type="checkbox" name="${f.key}" value="${esc(o)}" ${(v||[]).includes(o)?'checked':''}><span>${o}</span></label>`).join('')}</div></fieldset>`;
 return `<div class="profile-field">${fieldHeading(f,id)}<select id="${id}" name="${f.key}" ${f.help?`aria-describedby="${id}-help"`:''}>${f.key==='gender'?'':'<option value="">Skip / no answer</option>'}${f.options.map(o=>`<option ${(v===o||(f.key==='gender'&&!v&&o==='Prefer not to say'))?'selected':''} value="${esc(o)}">${o}</option>`).join('')}</select></div>`;
}
function render(){
 cleanupBubbles();
 const visible=onboarding?[sections[step]]:sections;
 area.innerHTML=`${onboarding?`<nav class="setup-trail" aria-label="Setup progress">${sections.map((s,i)=>`<span ${i===step?'aria-current="step"':''}>${i<step?'✓':i+1} ${['Your tastes','Your needs','The extras'][i]}</span>`).join('')}</nav><p class="setup-progress">STEP ${step+1} OF ${sections.length} · ALL QUESTIONS OPTIONAL</p>`:''}<form id="profile-form">${visible.map(s=>`<section class="settings-section"><h2>${s.title}</h2><p class="section-description">${s.intro}</p>${s.extras?'<details class="extra-questions"><summary>Add optional lifestyle and personal details</summary>':''}<div class="profile-grid">${s.fields.map(field).join('')}</div>${s.extras?'</details>':''}</section>`).join('')}<p class="field-help">Your answers are private to your account. Saving includes any optional personal or allergy information you entered. You can clear individual answers or delete all saved preferences below.</p><div class="settings-actions">${onboarding&&step>0?'<button class="secondary" type="button" data-action="back">← Back</button>':''}<button class="primary" type="submit">${onboarding&&step<sections.length-1?'Save & continue':onboarding?'Finish & find my bite':'Save preferences'} <span aria-hidden="true">→</span></button>${onboarding?'<button class="text-button" type="button" data-action="skip">Save picks & finish later</button>':''}</div></form>${!onboarding?'<section class="account-tools"><h2>Your account</h2><p>Manage your email, sign-in methods, or delete your account.</p><div class="settings-actions"><button class="secondary" data-action="account">Manage account</button><button class="secondary" data-action="signout">Sign out</button><button class="text-button danger" data-action="clear">Delete saved preferences</button></div></section>':''}`;
 bindFieldHelp(area);
 cleanupBubbles=bindBubbles(area.querySelector('form'),()=>{dirty=true;});
 area.querySelector('form').addEventListener('input',()=>{dirty=true;});
 area.querySelector('form').addEventListener('submit',save);
 area.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>action(b.dataset.action)));
}
function collect(){
 const data=new FormData(area.querySelector('form'));
 for(const f of (onboarding?sections[step].fields:sections.flatMap(s=>s.fields)))profile[f.key]=f.multiple?data.getAll(f.key):data.get(f.key)||'';
 profile=validateProfile(profile);
}
function lock(value){busy=value;area.querySelectorAll('button,input,select').forEach(el=>el.disabled=value);}
async function save(e){
 e?.preventDefault();if(busy)return;
 try{collect();lock(true);message.textContent='Saving your preferences…';
 await profileRequest('PUT',{profile,completed:!onboarding||step===sections.length-1});dirty=false;
 if(onboarding&&step<sections.length-1){step++;render();message.textContent='Saved. You can skip any of the next questions.';area.querySelector('h2').tabIndex=-1;area.querySelector('h2').focus();}
 else if(onboarding){location.assign('/');}
 else {onboarding=false;render();message.textContent='Saved to your account. Your next meal starts with these preferences.';document.querySelector('#settings-title').textContent='Your preferences, your way.';}
 }catch(e){message.textContent=e.message;}finally{lock(false);}
}
async function action(name){
 if(busy)return;
 if(name==='back'){collect();step--;render();return;}
 if(name==='clear'){document.querySelector('#clear-dialog').showModal();return;}
 try{
  if(name==='skip'){collect();lock(true);await profileRequest('PUT',{profile,completed:true});dirty=false;location.assign('/');}
  if(name==='account'){const c=await accountReady();c.openUserProfile();}
  if(name==='signout'){if(dirty&&!confirm('Leave without saving your changes?'))return;dirty=false;await (await accountReady()).signOut({redirectUrl:'/'});}
 }catch(e){message.textContent=e.message;lock(false);}
}
document.querySelector('#cancel-clear').onclick=()=>document.querySelector('#clear-dialog').close();
document.querySelector('#confirm-clear').onclick=async()=>{
 const b=document.querySelector('#confirm-clear');b.disabled=true;
 try{await profileRequest('DELETE');profile={};dirty=false;render();message.textContent='Your saved preferences have been deleted.';document.querySelector('#clear-dialog').close();}
 catch(e){document.querySelector('#clear-error').textContent=e.message;}finally{b.disabled=false;}
};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
try{
 const clerk=await accountReady();
 if(!clerk.user)location.replace('/account/');
 else {const data=await profileRequest();profile=validateProfile(data.profile);onboarding=!data.completed;if(onboarding)document.querySelector('#settings-title').textContent='Let’s make this feel like you.';render();message.textContent='';}
}catch(e){
 message.textContent=e.message;
 if(e.code==='AGE_REQUIRED'){
  area.innerHTML='<form id="age-confirmation" class="settings-section"><h2>Accounts are for ages 13+</h2><p class="field-help">Confirm your eligibility to save personal preferences. We save this confirmation and its date with your account, not your date of birth.</p><label><input type="checkbox" required> I am 13 years old or older.</label><p class="field-help">Read our <a href="/privacy/">Privacy Policy</a>.</p><div class="settings-actions"><button class="primary" type="submit">Confirm and continue</button><button class="secondary" type="button" id="age-guest">Sign out and use guest mode</button><button class="text-button" type="button" id="age-account">Manage or delete account</button></div></form>';
  area.querySelector('form').onsubmit=async event=>{event.preventDefault();const button=area.querySelector('[type=submit]');button.disabled=true;try{await profileRequest('PATCH',{ageConfirmed:true});location.reload();}catch(error){message.textContent=error.message;button.disabled=false;}};
  document.querySelector('#age-guest').onclick=async()=>{await(await accountReady()).signOut({redirectUrl:'/'});};
  document.querySelector('#age-account').onclick=async()=>{(await accountReady()).openUserProfile();};
 }else area.innerHTML='<a class="secondary" href="/settings/">Retry loading settings</a>';
}
