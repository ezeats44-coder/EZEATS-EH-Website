const title=document.querySelector('#recipe-title'),content=document.querySelector('#recipe-content'),status=document.querySelector('#recipe-status'),retry=document.querySelector('#recipe-retry');
const el=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;return n;};
function sourceLink(label,url){if(!url)return el('span',`${label}: unavailable`);try{if(new URL(url).protocol!=='https:')throw new Error();}catch{return el('span',`${label}: unavailable`);}const a=el('a',label);a.href=url;a.rel='noopener noreferrer';return a;}
function render(r){
 title.textContent=r.title;document.title=`${r.title} — EZEATS`;content.replaceChildren();
 if(r.description)content.append(el('p',r.description));
 if(r.editorial)content.append(el('p',`${r.cuisine} · ${r.mealTypes.join(', ')} · ${r.difficulty}. Measurements: 1 cup = about 240 mL, 1 tablespoon = 15 mL, 1 teaspoon = 5 mL; weights in ingredient notes. Oven temperatures are conventional.`));
 const stats=el('div','');stats.className='recipe-stats';
 for(const text of [`Servings: ${r.servings??'not provided'}`,`Prep: ${r.time.preparationMinutes===null?'not provided':r.time.preparationMinutes+' min'}`,`Cook: ${r.time.cookingMinutes===null?'not provided':r.time.cookingMinutes+' min'}`,`Total: ${r.time.totalMinutes===null?'not provided':r.time.totalMinutes+' min'+(r.time.estimated?' (estimate)':'')}`])stats.append(el('p',text));content.append(stats);
 if(r.estimatedCost)content.append(el('p',`Estimated cost: ${r.estimatedCost.currency} ${r.estimatedCost.amount} ${r.estimatedCost.basis}. Editorial ingredient budget, not a price quote. Actual US and Canadian costs vary.`));
 const warning=el('p',`Diet and allergy suitability: unverified. ${r.suitability.notes}`);warning.className='recipe-warning';content.append(warning);
 if(r.knownAllergens.length)content.append(el('p',`Known allergens: ${r.knownAllergens.join(', ')}. This list may be incomplete.`));
 if(r.safety){const safety=el('section','');safety.className='recipe-safety';safety.append(el('h2','Before you cook'));const list=el('ul','');for(const text of r.safety.handling)list.append(el('li',text));safety.append(list);content.append(safety);}
 const columns=el('div','');columns.className='recipe-columns';
 const ingredients=el('section','');ingredients.append(el('h2','Ingredients'));const ul=el('ul','');
 for(const i of r.ingredients)ul.append(el('li',[i.quantity,i.unit,i.name,i.notes?`(${i.notes})`:null].filter(Boolean).join(' ')));
 ingredients.append(r.ingredients.length?ul:el('p','Ingredients are unavailable. Check the original source.'));
 if(r.ingredients.some(i=>i.quantity===null&&!i.notes))ingredients.append(el('p','Some quantities are not provided. This is not a fully specified cooking recipe.'));
 else if(r.ingredients.some(i=>i.quantity===null))ingredients.append(el('p','Measurements are shown as supplied by the provider; they have not been converted or verified.'));
 const steps=el('section','');steps.append(el('h2','Cooking instructions'));if(r.instructions?.length){const ol=el('ol','');for(const s of r.instructions)ol.append(el('li',s.text));steps.append(ol);}else steps.append(el('p','Cooking instructions are not available for this meal yet. We won’t guess the missing steps.'));
 columns.append(ingredients,steps);content.append(columns);
 const source=el('section','');source.className='recipe-source';source.append(el('h2','Source & attribution'),el('p',r.source.attribution),el('p',`Provider: ${r.source.provider}`),sourceLink('Original source',r.source.originalUrl));
 if(r.source.providerUrl){source.append(el('span',' · '),sourceLink('Provider record',r.source.providerUrl));}
 if(r.editorial)source.append(el('p',`Editorial review: ${r.editorial.reviewedAt} · ${r.editorial.reviewer}. Owner review required. Not kitchen-tested.`),el('p',r.editorial.notes));
 if(r.safety){source.append(el('p',`Cooking-temperature references checked ${r.safety.checkedAt}:`));for(const [i,url] of r.safety.sources.entries()){source.append(sourceLink(i===0?'USDA cooking temperatures':i===1?'Health Canada cooking temperatures':i===2?'USDA handling guidance':'USDA leftover storage guidance',url),el('br',''));}}
 source.append(el('p',`Licensing: ${r.source.licensingStatus}`),el('p',`Recipe verification: ${r.source.verifiedAt??'not verified'}`));content.append(source);
 content.hidden=false;status.textContent=r.source.ownership==='third-party'?'Development provider content. Not part of the EZEATS-owned catalog.':r.editorial?'Original EZEATS recipe · editorially reviewed draft · not kitchen-tested.':'EZEATS meal idea. Missing recipe details are clearly marked.';
}
async function load(){content.hidden=true;retry.hidden=true;status.textContent='Loading your meal…';const id=new URLSearchParams(location.search).get('id');
 if(!id||!/^(ezeats:[a-z0-9-]{1,80}|themealdb:\d{1,12})$/.test(id)){status.textContent='Choose a meal in the picker to see its details.';return;}
 try{const response=await fetch(`/api/recipes?id=${encodeURIComponent(id)}`,{cache:'no-store',signal:AbortSignal.timeout(7000)});const data=await response.json();if(!response.ok)throw new Error(data.error);render(data.recipe);}catch(error){status.textContent=error.name==='TimeoutError'?'Recipe loading timed out. Please try again.':error.message||'Recipe unavailable. Please try again.';retry.hidden=false;}
}
retry.addEventListener('click',load);load();
