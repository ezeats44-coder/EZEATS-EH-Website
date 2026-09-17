const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function fieldHeading(field,id,label=true){
 const title=label?`<label for="${id}">${escape(field.label)}</label>`:`<span>${escape(field.label)}</span>`;
 return `<div class="field-heading">${title}${field.help?`<button type="button" class="field-help-button" aria-label="About ${escape(field.label)}" aria-expanded="false" aria-controls="${id}-help">?</button><p class="field-help-panel" id="${id}-help" hidden>${escape(field.help)}</p>`:''}</div>`;
}
export function bindFieldHelp(root){
 root.querySelectorAll('.field-help-button').forEach(button=>{
  const panel=button.nextElementSibling;
  let pinned=false;
  const show=value=>{panel.hidden=!value;button.setAttribute('aria-expanded',String(value));};
  button.addEventListener('click',()=>{pinned=!pinned;show(pinned);});
  button.addEventListener('focus',()=>show(true));
  button.addEventListener('blur',()=>{pinned=false;show(false);});
  button.parentElement.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')show(true);});
  button.parentElement.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&!pinned)show(false);});
  button.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();pinned=false;show(false);}});
 });
}
