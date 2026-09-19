import {guestHeatOptions, guestAdventureQuestion, guestAdventureOptions, readGuestPicker, writeGuestPicker} from './guest-picker.js';
import { accountReady, profileRequest } from './account-client.js';
import { mealDefaults } from './profile-schema.js';
import { applyProfile } from './profile-matching.js';
import {rankWithHistory} from './meal-history.js';
let personalMode=false,mealHistory=[],choiceId='',savingChoice=false;
let savedProfile = {}, pickerTouched = false;
import { defaults, allowed, validatePreferences, rankMeals, reasonsFor } from './meals.js';
const flow = document.querySelector('#flow');
const moodTemplate = flow.innerHTML;
const state = { step: 1, prefs: { ...defaults, diets: [] }, ranked: [], index: 0, accepted: false };
let guestStorage;
try { guestStorage = window.sessionStorage; } catch {}
const restoredGuest = readGuestPicker(guestStorage);
if (restoredGuest) state.prefs = restoredGuest.prefs;
function saveGuestAnswers() { if (!personalMode) writeGuestPicker(guestStorage, state.prefs, state.step); }
const dialog = document.querySelector('#how-dialog');
document.querySelector('#how-button').addEventListener('click', () => dialog.showModal());
document.querySelectorAll('.close-dialog, .close-how').forEach(button => button.addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
function updateProgress(step) {
  state.step = step;
  document.querySelectorAll('.steps li').forEach((item, index) => {
    item.classList.toggle('active', index + 1 === step);
    item.classList.toggle('done', index + 1 < step);
    item.querySelector('span').textContent = index + 1 < step ? '✓' : index + 1;
    if (index + 1 === step) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
}
function focusHeading() {
  const heading = flow.querySelector('h2');
  if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
  if (window.matchMedia('(max-width: 760px)').matches) document.querySelector('.picker').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function syncMood() {
  flow.querySelectorAll('[data-mood]').forEach(button => {
    const selected = button.dataset.mood === state.prefs.mood;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  flow.querySelectorAll('[data-diet]').forEach(button => {
    const selected = button.dataset.diet === 'any' ? state.prefs.diets.length === 0 : state.prefs.diets.includes(button.dataset.diet);
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}
function showMood() {
  updateProgress(1);
  flow.innerHTML = moodTemplate;
  syncMood();
  focusHeading();
}
function options(key, items) {
  return items.map(([value, title, sub]) => `<button class="option ${state.prefs[key] === value ? 'selected' : ''}" data-pref="${key}" data-value="${value}" aria-pressed="${state.prefs[key] === value}"><strong>${title}</strong>${sub ? `<small>${sub}</small>` : ''}</button>`).join('');
}
function showDetails() {
  updateProgress(2);
  flow.innerHTML = `<div class="step-heading"><span class="step-caption">JUST A FEW PRACTICAL THINGS</span><h2>Make it fit your day.</h2><p>Your time, your budget, your kind of good.</p></div>
    <fieldset class="detail-field"><legend>How much cooking time do you have?</legend><div class="options" role="group" aria-label="Maximum cooking time">${options('time', [[15, '15 minutes', 'Quick & easy'], [30, '30 minutes', 'A little time'], [60, '60 minutes', 'No hurry']])}</div></fieldset>
    <fieldset class="detail-field"><legend>What’s your budget per serving? <span>USD, at home</span></legend><div class="options" role="group" aria-label="Maximum cost per serving">${options('budget', [[5, 'Up to $5', 'Keep it simple'], [10, 'Up to $10', 'A little room'], [20, 'Up to $20', 'Treat myself']])}</div></fieldset>
    <fieldset class="detail-field"><legend>How much heat sounds good?</legend><div class="options" role="group" aria-label="Maximum spice level">${options('heat', personalMode ? [[0, 'Mild', 'Easy on the heat'], [1, 'A little kick', 'Some spice'], [2, 'Bring the heat', 'Spicy is welcome']] : guestHeatOptions)}</div></fieldset>
    <fieldset class="detail-field"><legend>${personalMode ? 'Feeling adventurous?' : guestAdventureQuestion}</legend><div class="options" role="group" aria-label="${personalMode ? 'Food familiarity preference' : guestAdventureQuestion}">${options('adventure', personalMode ? [['familiar', 'Keep it familiar', ''], ['adventurous', 'Try something new', ''], ['any', 'Either works', '']] : guestAdventureOptions)}</div></fieldset>
    <div class="flow-actions"><button class="back-button" data-action="mood">← Back</button><button class="primary" data-action="recommend">Find my meal <span aria-hidden="true">✳</span></button></div><p class="estimate-note">Time and cost are estimates for the ingredients shown.</p>`;
  focusHeading();
}
function showPersonalPicker() {
 document.querySelector('.steps').hidden=true;
 state.step=1;
 flow.innerHTML=`<div class="one-tap"><span class="step-caption">YOUR TASTE. ONE TAP.</span><h2>Leave the choosing to us.</h2><p>Your usuals, a little variety, and one delicious answer.</p><div class="bite-orbit"><span class="orbit-snack snack-one" aria-hidden="true">🍋</span><span class="orbit-snack snack-two" aria-hidden="true">🍝</span><span class="orbit-snack snack-three" aria-hidden="true">🌶️</span><button class="bite-button" data-action="personal"><span class="bite-spark" aria-hidden="true">✳</span><strong>Pick my bite</strong><span>Less thinking. More eating.</span></button></div><p class="one-tap-note">${mealHistory.length?'Inspired by your preferences and recent picks.':'Your saved food preferences lead the way.'}</p><a class="text-button" href="/settings/">Fine-tune my preferences →</a><p class="small-note">Choosing “That’s the one” saves this meal to your recent picks. Clear them here any time.</p><button class="back-button" data-action="clear-history" ${mealHistory.length?'':'hidden'}>Clear recent picks</button></div>`;
}
function recommend() {
  state.ranked = applyProfile(rankMeals(state.prefs), savedProfile);
  if(personalMode)state.ranked=rankWithHistory(state.ranked,mealHistory);
  saveGuestAnswers();
  choiceId=crypto.randomUUID();
  state.index = 0;
  state.accepted = false;
  showResult();
  return currentResult();
}
function currentResult() {
  const item = state.ranked[state.index];
  return item ? { id: item.id, name: item.name, minutes: item.minutes, estimatedCostUSD: item.cost, ingredients: item.ingredients, reasons: reasonsFor(item, state.prefs), accepted: state.accepted } : { matched: false, message: 'No meals fit these limits. Adjust your preferences.' };
}
function showResult() {
  updateProgress(3);
  const item = state.ranked[state.index];
  if (!item) {
    flow.innerHTML = `<div class="empty-state"><span aria-hidden="true">🥣</span><h2>No match this time.</h2><p>No meal in our list fits these choices and any saved ingredient exclusions. You can review your limits or your saved preferences in Settings. Additional allergy details pause suggestions because we cannot reliably screen them.</p><button class="primary" data-action="details">Adjust my choices <span aria-hidden="true">→</span></button></div>`;
    focusHeading();
    return;
  }
  const reasons = reasonsFor(item, state.prefs);
  if(personalMode&&item.historyReason)reasons.push(item.historyReason);
  const left = state.ranked.length - state.index - 1;
  flow.innerHTML = `<div class="result-heading"><span class="result-label ${state.accepted ? 'accepted' : ''}">${state.accepted ? '✓ DECISION MADE' : '✳ YOUR NEXT BITE, SORTED'}</span><span class="result-emoji" aria-hidden="true">${item.emoji}</span><p class="cuisine">${item.cuisine}</p><h2>${item.name}</h2><p>${state.accepted ? 'Good choice. The deciding is done — time for the delicious part.' : item.description}</p></div>
    <div class="meal-meta"><span><strong>${item.minutes} min</strong> estimated prep + cook</span><span><strong>~$${item.cost}</strong> per serving</span><span><strong>${(personalMode ? ['Mild', 'A little kick', 'Spicy'] : ['No heat', 'Medium', 'Hot'])[item.heat]}</strong> spice level</span></div>
    <div class="match-reasons"><h3>Why this one works</h3><ul>${reasons.map(reason => `<li><span aria-hidden="true">✓</span>${reason}</li>`).join('')}</ul></div>
    <details class="ingredients" ${state.accepted ? 'open' : ''}><summary>What goes in it <span aria-hidden="true">+</span></summary><div class="ingredient-tags">${item.ingredients.map(ingredient => `<span>${ingredient}</span>`).join('')}</div><p class="small-note">Dietary labels apply to these ingredients. Check packaged products for your dietary needs. Ingredient screening cannot verify brands, substitutions, or cross-contact; a match is not a guarantee that a meal is allergen-free.</p></details>
    <div class="result-actions">${state.accepted ? `<a class="primary" href="/recipe/?id=ezeats:${encodeURIComponent(item.id)}">View recipe details</a><button class="primary" data-action="restart">Find another meal <span aria-hidden="true">→</span></button>` : `<button class="primary" data-action="accept">That’s the one <span aria-hidden="true">✓</span></button><button class="secondary" data-action="another" ${left === 0 ? 'disabled' : ''}>Another idea <span aria-hidden="true">↻</span></button>`}</div>
    <div class="result-foot"><button class="back-button" data-action="details">← Change my preferences</button><span>${state.accepted ? 'Enjoy every bite.' : left ? `${left} more ${left === 1 ? 'idea' : 'ideas'} fit your limits` : 'You’ve seen every match'}</span></div>${!state.accepted && !left ? '<p class="exhausted">Nothing clicked? Change your preferences or <button data-action="reshuffle">revisit these matches</button>.</p>' : ''}<p class="estimate-note">Home-cooking estimates. Actual prices and preparation times vary.</p>`;
  focusHeading();
}
async function acceptMeal(id) {
  const item = state.ranked[state.index];
  if (!item || item.id !== id || state.step !== 3) throw new Error('This meal is not the current recommendation.');
  if(savingChoice||state.accepted)return currentResult();
  if(personalMode){
   savingChoice=true;
   const button=flow.querySelector('[data-action="accept"]');if(button){button.disabled=true;button.textContent='Saving your pick…';}
   try{const data=await profileRequest('POST',{mealId:id,choiceId});mealHistory=data.history;}
   catch(error){if(button){button.disabled=false;button.textContent='Retry saving this pick';}let message=flow.querySelector('.choice-error');if(!message){message=document.createElement('p');message.className='choice-error';message.setAttribute('role','status');flow.append(message);}message.textContent='Your pick could not be saved. Please retry.';return currentResult();}
   finally{savingChoice=false;}
  }
  state.accepted = true;
  showResult();
  return currentResult();
}
flow.addEventListener('click', event => {
  pickerTouched = true;
  const button = event.target.closest('button');
  if (!button || button.disabled) return;
  if (button.dataset.mood) { state.prefs.mood = button.dataset.mood; syncMood(); }
  if (button.dataset.diet) {
    const diet = button.dataset.diet;
    if (diet === 'any') state.prefs.diets = [];
    else if (state.prefs.diets.includes(diet)) state.prefs.diets = state.prefs.diets.filter(item => item !== diet);
    else state.prefs.diets.push(diet);
    syncMood();
  }
  if (button.dataset.pref) {
    const key = button.dataset.pref;
    state.prefs[key] = ['time', 'budget', 'heat'].includes(key) ? Number(button.dataset.value) : button.dataset.value;
    flow.querySelectorAll(`[data-pref="${key}"]`).forEach(item => {
      item.classList.toggle('selected', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
  }
  const action = button.dataset.action || (button.id === 'next-button' ? 'details' : '');
  if(savingChoice)return;
  if(action==='personal'){state.prefs={...defaults,...mealDefaults(savedProfile)};recommend();}
  if(action==='clear-history'){
   button.disabled=true;profileRequest('DELETE',undefined,'?history=1').then(()=>{mealHistory=[];showPersonalPicker();}).catch(()=>{button.disabled=false;button.textContent='Could not clear picks. Retry';});
  }
  if (action === 'mood') showMood();
  if (action === 'details') showDetails();
  if (action === 'recommend' || action === 'reshuffle') recommend();
  if (action === 'another' && state.index + 1 < state.ranked.length) { state.index++; choiceId=crypto.randomUUID();state.accepted = false; showResult(); }
  if (action === 'accept') acceptMeal(state.ranked[state.index].id);
  if (action === 'restart') { state.ranked = []; state.accepted = false; state.index = 0; if(personalMode)showPersonalPicker();else showMood(); }
  saveGuestAnswers();
});
if (restoredGuest?.step === 2) showDetails(); else syncMood();
// Feature-detect the proposed WebMCP API; normal browsers use the interface above.
const context = document.modelContext;
if (context?.registerTool) {
  const lifecycle = new AbortController();
  const toolSpecs = [
    {
      name: 'recommend_meal', title: 'Find a meal', description: 'Set food preferences and display one matching meal. This does not accept the meal or place an order.',
      inputSchema: { type: 'object', properties: { mood: { type: 'string', enum: allowed.mood }, diets: { type: 'array', items: { type: 'string', enum: allowed.diets }, uniqueItems: true }, time: { type: 'number', enum: allowed.time }, budget: { type: 'number', enum: allowed.budget }, heat: { type: 'number', enum: allowed.heat }, adventure: { type: 'string', enum: allowed.adventure } }, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) { const validated = validatePreferences(input); pickerTouched = true; state.prefs = validated; return recommend(); }
    },
    {
      name: 'accept_meal', title: 'Choose this meal', description: 'Mark the current recommendation as the user’s decision and display its ingredients. This does not place an order.',
      inputSchema: { type: 'object', properties: { mealId: { type: 'string' } }, required: ['mealId'], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) { if (!input || typeof input.mealId !== 'string' || Object.keys(input).some(key => key !== 'mealId')) throw new Error('Provide the current mealId.'); return acceptMeal(input.mealId); }
    }
  ];
  for (const spec of toolSpecs) {
    try { Promise.resolve(context.registerTool(spec, { signal: lifecycle.signal })).catch(error => console.warn('Meal tools unavailable:', error.message)); }
    catch (error) { console.warn('Meal tools unavailable:', error.message); }
  }
  window.addEventListener('pagehide', () => lifecycle.abort(), { once: true });
}

// Guests keep the original picker; account failure never blocks guest access.
(async () => {
 const note=document.querySelector('#personalization-note');
 try {
  const clerk=await accountReady();
  if(!clerk.user)return;
  document.querySelector('.account-link').textContent='Account';
  document.querySelector('.account-link').href='/settings/';
  const data=await profileRequest();savedProfile=data.profile;mealHistory=data.history||[];personalMode=true;
  note.replaceChildren();
  const label=document.createElement('span');
  label.textContent=data.completed?'Your preferences are in. Let’s pick something good.':'One tap to start. Add your usuals in Settings for a closer match.';
  if(savedProfile.otherAllergies)label.textContent='Your profile includes additional allergy details we cannot screen. Meal suggestions are paused; review your Settings.';
  const link=document.createElement('a');link.href='/settings/';link.textContent=data.completed?'Edit preferences →':'Personalize my experience →';note.append(label,link);
  if(!pickerTouched){state.prefs={...state.prefs,...mealDefaults(savedProfile)};showPersonalPicker();document.querySelector('.page-intro>p').textContent='One little tap. One delicious answer.';}
  else if(state.step===3){state.ranked=applyProfile(state.ranked,savedProfile);state.index=0;state.accepted=false;showResult();}
 }catch(error) { const label=note.querySelector('span');if(label)label.textContent=error.code==='AGE_REQUIRED'?'Finish your one-time age confirmation in Settings to unlock your personal picker.':'Saved preferences could not be loaded. This picker is using guest choices; check your dietary needs before choosing.'; }
})();
