export const foodIcons={'Italian':'🍝','Mexican':'🌮','Mediterranean':'🫒','Indian':'🍛','Japanese':'🍣','Thai':'🥥','Korean':'🍚','American':'🍔','Chinese':'🥟','Vietnamese':'🍜','Greek':'🥗','Middle Eastern':'🧆','Caribbean':'🍍','French':'🥐','Spanish':'🥘','Ethiopian':'🍲','Brazilian':'🫘','Filipino':'🍋','Cajun':'🌶️','Turkish':'🫓','Pasta':'🍝','Pizza':'🍕','Tacos':'🌮','Burgers':'🍔','Rice bowls':'🍚','Noodles':'🍜','Salads':'🥗','Soups & stews':'🍲','Sandwiches & wraps':'🥪','Seafood':'🦐','Chicken':'🍗','Beef':'🥩','Tofu':'🧊','Beans & lentils':'🫘','Eggs':'🥚','Potatoes':'🥔','Mushrooms':'🍄','Avocado':'🥑','Olives':'🫒','Onions':'🧅','Tomatoes':'🍅','Cilantro':'🌿','Eggplant':'🍆','Broccoli':'🥦','Peppers':'🫑','Cheese':'🧀','Fish':'🐟','Shellfish':'🦐','Beans':'🫘','Lentils':'🫘'};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function bubbleField(f,values=[]) {
 return `<fieldset class="profile-field bubble-field"><legend>${f.label}</legend><p class="field-help">${f.help||''}</p><div class="bubble-toolbar"><span data-count-for="${f.key}" aria-live="polite">${values.length} selected</span><button type="button" class="text-button" data-clear-bubbles="${f.key}">Clear</button></div><div class="bubble-cloud" id="bubbles-${f.key}">${f.options.map((o,i)=>`<label class="taste-bubble tone-${i%4} ${i>=8&&!values.includes(o)?'bubble-extra':''}"><input type="checkbox" name="${f.key}" value="${escape(o)}" ${values.includes(o)?'checked':''}><span class="bubble-face"><span class="bubble-icon" aria-hidden="true">${foodIcons[o]||'🍽️'}</span><span>${escape(o)}</span><span class="bubble-tick" aria-hidden="true">✓</span></span></label>`).join('')}</div><button type="button" class="bubble-more" data-expand-bubbles="${f.key}" aria-expanded="false" aria-controls="bubbles-${f.key}">Show more choices +</button></fieldset>`;
}
export function bindBubbles(form,onChange) {
 const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const clouds=[...form.querySelectorAll('.bubble-cloud')];
 function pack(cloud){
  const width=cloud.clientWidth;if(!width)return;
  const circles=[];
  for(const label of cloud.querySelectorAll('.taste-bubble')){
   if(getComputedStyle(label).display==='none')continue;
   const r=label.offsetWidth/2,gap=5;let best=null;
   for(let x=r+6;x<=width-r-6;x+=4){
    let y=r+8;
    for(const c of circles){const dx=x-c.x,d=r+c.r+gap;if(Math.abs(dx)<d)y=Math.max(y,c.y+Math.sqrt(d*d-dx*dx));}
    const score=y+r+Math.abs(x-width/2)*0.015;
    if(!best||score<best.score)best={x,y,r,score};
   }
   if(!best)best={x:width/2,y:r+8,r};
   circles.push(best);label.style.left=`${best.x-r}px`;label.style.bottom=`${best.y-r}px`;
  }
  cloud.style.height=`${Math.max(0,...circles.map(c=>c.y+c.r))+18}px`;cloud.classList.add('bubble-pile');
 }
 function animateFace(face,frames,delay=0){
  if(reduced()||!face.animate)return;
  face.getAnimations().forEach(a=>a.cancel());
  face.animate(frames,{duration:650,easing:'ease-out',delay});
 }
 function bounce(input){
  const label=input.closest('.taste-bubble'),cloud=label.closest('.bubble-cloud');
  animateFace(label.querySelector('.bubble-face'),[
   {transform:'scale(1)'},{transform:'scale(0.88,1.08) rotate(-5deg)',offset:.16},
   {transform:'translateY(-10px) scale(1.1,.94) rotate(5deg)',offset:.38},
   {transform:'translateY(2px) scale(.97,1.03) rotate(-3deg)',offset:.62},{transform:'scale(1) rotate(0deg)'}
  ]);
  const origin=label.getBoundingClientRect();
  cloud.querySelectorAll('.taste-bubble').forEach(other=>{
   if(other===label||getComputedStyle(other).display==='none')return;
   const rect=other.getBoundingClientRect(),dx=(rect.left+rect.width/2)-(origin.left+origin.width/2),dy=(rect.top+rect.height/2)-(origin.top+origin.height/2);
   if(Math.hypot(dx,dy)>(origin.width+rect.width)/2+24)return;
   const direction=dx<0?-1:1;
   animateFace(other.querySelector('.bubble-face'),[{transform:'translate(0,0) rotate(0deg)'},{transform:`translate(${direction*5}px, -3px) rotate(${direction*4}deg)`,offset:.3},{transform:`translate(${-direction*2}px, 1px) rotate(${-direction*2}deg)`,offset:.6},{transform:'translate(0,0) rotate(0deg)'}],45);
  });
 }
 function update(key){form.querySelector(`[data-count-for="${key}"]`).textContent=`${form.querySelectorAll(`input[name="${key}"]:checked`).length} selected`;onChange();}
 form.querySelectorAll('.bubble-field input').forEach(input=>input.addEventListener('change',()=>{update(input.name);pack(input.closest('.bubble-cloud'));bounce(input);}));
 form.querySelectorAll('[data-clear-bubbles]').forEach(button=>button.onclick=()=>{const key=button.dataset.clearBubbles;form.querySelectorAll(`input[name="${key}"]`).forEach(input=>input.checked=false);update(key);pack(form.querySelector(`#bubbles-${key}`));});
 form.querySelectorAll('[data-expand-bubbles]').forEach(button=>button.onclick=()=>{const cloud=form.querySelector(`#bubbles-${button.dataset.expandBubbles}`);const open=cloud.classList.toggle('expanded');button.setAttribute('aria-expanded',String(open));button.textContent=open?'Show fewer choices −':'Show more choices +';pack(cloud);});
 const widths=new WeakMap();
 const observer=new ResizeObserver(entries=>entries.forEach(({target,contentRect})=>{if(widths.get(target)!==contentRect.width){widths.set(target,contentRect.width);pack(target);}}));
 clouds.forEach(cloud=>{observer.observe(cloud);pack(cloud);});
 form.querySelectorAll('.bubble-question').forEach(details=>details.addEventListener('toggle',()=>{if(details.open)pack(details.querySelector('.bubble-cloud'));}));
 return ()=>observer.disconnect();
}
