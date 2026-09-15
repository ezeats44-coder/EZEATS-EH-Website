import {accountReady,profileRequest} from './account-client.js';
import {sections,validateProfile} from './profile-schema.js';
const area=document.querySelector('#settings-content');
const message=document.querySelector('#settings-status');
let profile={},step=0,onboarding=false,busy=false,dirty=false;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function field(f){
 const v=profile[f.key],id=`field-${f.key}`;
 if(f.text)return `<div class="profile-field"><label for="${id}">${f.label}</label>${f.help?`<p id="${id}-help" class="field-help">${f.help}</p>`:''}<input id="${id}" name="${f.key}" maxlength="${f.max}" value="${esc(v||'')}" ${f.help?`aria-describedby="${id}-help"`:''} autocomplete="off"></div>`;
 if(f.multiple)return `<fieldset class="profile-field"><legend>${f.label}</legend>${f.help?`<p class="field-help">${f.help}</p>`:''}<div class="profile-options">${f.options.map((o,i)=>`<label><input type="checkbox" name="${f.key}" value="${esc(o)}" ${(v||[]).includes(o)?'checked':''}><span>${o}</span></label>`).join('')}</div></fieldset>`;
 return `<div class="profile-field"><label for="${id}">${f.label}</label>${f.help?`<p id="${id}-help" class="field-help">${f.help}</p>`:''}<select id="${id}" name="${f.key}" ${f.help?`aria-describedby="${id}-help"`:''}><option value="">Skip / no answer</option>${f.options.map(o=>`<option ${v===o?'selected':''} value="${esc(o)}">${o}</option>`).join('')}</select></div>`;
}
function render(){
 const visible=onboarding?[sections[step]]:sections;
 area.innerHTML=`${onboarding?`<p class="setup-progress">STEP ${step+1} OF ${sections.length} · OPTIONAL SETUP</p>`:''}<form id="profile-form">${visible.map(s=>`<section class="settings-section"><h2>${s.title}</h2><p class="section-description">${s.intro}</p><div class="profile-grid">${s.fields.map(field).join('')}</div></section>`).join('')}<p class="field-help">Your answers are private to your account. Saving includes any optional personal or allergy information you entered. You can clear individual answers or delete all saved preferences below.</p><div class="settings-actions">${onboarding&&step>0?'<button class="secondary" type="button" data-action="back">← Back</button>':''}<button class="primary" type="submit">${onboarding&&step<2?'Save & continue':'Save preferences'} <span aria-hidden="true">→</span></button>${onboarding?'<button class="text-button" type="button" data-action="skip">Skip setup for now</button>':''}</div></form>${!onboarding?'<section class="account-tools"><h2>Your account</h2><p>Manage your email, sign-in methods, or delete your account.</p><div class="settings-actions"><button class="secondary" data-action="account">Manage account</button><button class="secondary" data-action="signout">Sign out</button><button class="text-button danger" data-action="clear">Delete saved preferences</button></div></section>':''}`;
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
 await profileRequest('PUT',{profile,completed:!onboarding||step===2});dirty=false;
 if(onboarding&&step<2){step++;render();message.textContent='Saved. You can skip any of the next questions.';area.querySelector('h2').tabIndex=-1;area.querySelector('h2').focus();}
 else {onboarding=false;render();message.textContent='Saved to your account. Your next meal starts with these preferences.';document.querySelector('#settings-title').textContent='Your preferences, your way.';}
 }catch(e){message.textContent=e.message;}finally{lock(false);}
}
async function action(name){
 if(busy)return;
 if(name==='back'){collect();step--;render();return;}
 if(name==='clear'){document.querySelector('#clear-dialog').showModal();return;}
 try{
  if(name==='skip'){lock(true);await profileRequest('PUT',{profile,completed:true});dirty=false;location.assign('/');}
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
  area.innerHTML='<form id="age-confirmation" class="settings-section"><h2>Accounts are for ages 14+</h2><p class="field-help">Confirm your eligibility to save personal preferences. We save this confirmation and its date with your account, not your date of birth.</p><label><input type="checkbox" required> I am 14 years old or older.</label><p class="field-help">Read our <a href="/privacy/">Privacy Policy</a>.</p><div class="settings-actions"><button class="primary" type="submit">Confirm and continue</button><button class="secondary" type="button" id="age-guest">Sign out and use guest mode</button><button class="text-button" type="button" id="age-account">Manage or delete account</button></div></form>';
  area.querySelector('form').onsubmit=async event=>{event.preventDefault();const button=area.querySelector('[type=submit]');button.disabled=true;try{await profileRequest('PATCH',{ageConfirmed:true});location.reload();}catch(error){message.textContent=error.message;button.disabled=false;}};
  document.querySelector('#age-guest').onclick=async()=>{await(await accountReady()).signOut({redirectUrl:'/'});};
  document.querySelector('#age-account').onclick=async()=>{(await accountReady()).openUserProfile();};
 }else area.innerHTML='<a class="secondary" href="/settings/">Retry loading settings</a>';
}
