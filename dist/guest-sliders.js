export const sliders = {
 time: {question:'How much cooking time do you have?', values:[15,30,60], labels:['15 min','30 min','60 min']},
 budget: {question:'What’s your budget per serving?', values:[5,10,20], labels:['$5','$10','$20'], pills:['Up to $5','Up to $10','Up to $20'], description:'USD, at home'},
 heat: {question:'How much heat sounds good?', values:[0,1,2], labels:['No heat','Medium','Hot'], descriptions:['No spice or noticeable heat','Some noticeable heat','Spicy is welcome']},
 adventure: {question:'How adventurous should this pick be?', values:['familiar','adventurous','any'], labels:['Classic','A little different','Surprise me'], descriptions:['Broadly recognizable crowd-pleasers','Explore cuisines and ingredients','The widest variety within your choices']}
};
export function sliderSelection(key, position) {
 const spec=sliders[key];
 if(!spec || !Number.isFinite(Number(position))) throw new Error('Invalid slider selection');
 const index=Math.max(0,Math.min(2,Math.round(Number(position))));
 return {index,value:spec.values[index],label:spec.labels[index],pill:(spec.pills||spec.labels)[index],announcement:[(spec.pills||spec.labels)[index],spec.descriptions?.[index]||spec.description].filter(Boolean).join('. ')};
}
export function renderGuestSliders(prefs) {
 return Object.entries(sliders).map(([key,spec])=>{
 const selected=sliderSelection(key,spec.values.indexOf(prefs[key]));
 return `<div class="guest-slider" data-slider="${key}" style="--progress:${selected.index*50}%"><div class="slider-heading"><label for="guest-${key}">${spec.question}</label><output class="slider-pill" for="guest-${key}">${selected.pill}</output></div><div class="slider-control"><div class="slider-track" aria-hidden="true"><span></span></div><input id="guest-${key}" data-guest-slider="${key}" type="range" min="0" max="2" step="1" value="${selected.index}" aria-valuetext="${selected.announcement}"></div><div class="slider-labels">${spec.labels.map((label,index)=>`<button type="button" tabindex="-1" data-slider-stop="${key}" data-position="${index}" aria-label="${spec.question} ${sliderSelection(key,index).announcement}" aria-pressed="${index===selected.index}" class="${index===selected.index?'selected':''}">${label}</button>`).join('')}</div></div>`;
 }).join('');
}
export function updateGuestSlider(container,key,position) {
 const selected=sliderSelection(key,position);
 const row=container.querySelector(`[data-slider="${key}"]`), input=row.querySelector('input');
 input.value=selected.index;input.setAttribute('aria-valuetext',selected.announcement);
 row.style.setProperty('--progress',`${selected.index*50}%`);row.querySelector('output').textContent=selected.pill;
 row.querySelectorAll('[data-slider-stop]').forEach((button,index)=>{button.classList.toggle('selected',index===selected.index);button.setAttribute('aria-pressed',String(index===selected.index));});
 return selected.value;
}
