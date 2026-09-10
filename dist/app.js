import { defaults, allowed, validatePreferences, rankMeals, reasonsFor } from './meals.js';
const flow = document.querySelector('#flow');
const moodTemplate = flow.innerHTML;
const state = { step: 1, prefs: { ...defaults, diets: [] }, ranked: [], index: 0, accepted: false };
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
    <fieldset class="detail-field"><legend>How much heat sounds good?</legend><div class="options" role="group" aria-label="Maximum spice level">${options('heat', [[0, 'Mild', 'Easy on the heat'], [1, 'A little kick', 'Some spice'], [2, 'Bring the heat', 'Spicy is welcome']])}</div></fieldset>
    <fieldset class="detail-field"><legend>Feeling adventurous?</legend><div class="options" role="group" aria-label="Food familiarity preference">${options('adventure', [['familiar', 'Keep it familiar', ''], ['adventurous', 'Try something new', ''], ['any', 'Either works', '']])}</div></fieldset>
    <div class="flow-actions"><button class="back-button" data-action="mood">← Back</button><button class="primary" data-action="recommend">Find my meal <span aria-hidden="true">✳</span></button></div><p class="estimate-note">Time and cost are estimates for the ingredients shown.</p>`;
  focusHeading();
}
function recommend() {
  state.ranked = rankMeals(state.prefs);
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
    flow.innerHTML = `<div class="empty-state"><span aria-hidden="true">🥣</span><h2>No match this time.</h2><p>No meal in our list fits all these choices. Try allowing more cooking time or a higher budget. Your dietary preferences will stay selected.</p><button class="primary" data-action="details">Adjust my choices <span aria-hidden="true">→</span></button></div>`;
    focusHeading();
    return;
  }
  const reasons = reasonsFor(item, state.prefs);
  const left = state.ranked.length - state.index - 1;
  flow.innerHTML = `<div class="result-heading"><span class="result-label ${state.accepted ? 'accepted' : ''}">${state.accepted ? '✓ DECISION MADE' : '✳ YOUR NEXT BITE, SORTED'}</span><span class="result-emoji" aria-hidden="true">${item.emoji}</span><p class="cuisine">${item.cuisine}</p><h2>${item.name}</h2><p>${state.accepted ? 'Good choice. The deciding is done — time for the delicious part.' : item.description}</p></div>
    <div class="meal-meta"><span><strong>${item.minutes} min</strong> estimated prep + cook</span><span><strong>~$${item.cost}</strong> per serving</span><span><strong>${['Mild', 'A little kick', 'Spicy'][item.heat]}</strong> spice level</span></div>
    <div class="match-reasons"><h3>Why this one works</h3><ul>${reasons.map(reason => `<li><span aria-hidden="true">✓</span>${reason}</li>`).join('')}</ul></div>
    <details class="ingredients" ${state.accepted ? 'open' : ''}><summary>What goes in it <span aria-hidden="true">+</span></summary><div class="ingredient-tags">${item.ingredients.map(ingredient => `<span>${ingredient}</span>`).join('')}</div><p class="small-note">Dietary labels apply to these ingredients. Check packaged products for your dietary needs.</p></details>
    <div class="result-actions">${state.accepted ? '<button class="primary" data-action="restart">Find another meal <span aria-hidden="true">→</span></button>' : `<button class="primary" data-action="accept">That’s the one <span aria-hidden="true">✓</span></button><button class="secondary" data-action="another" ${left === 0 ? 'disabled' : ''}>Another idea <span aria-hidden="true">↻</span></button>`}</div>
    <div class="result-foot"><button class="back-button" data-action="details">← Change my preferences</button><span>${state.accepted ? 'Enjoy every bite.' : left ? `${left} more ${left === 1 ? 'idea' : 'ideas'} fit your limits` : 'You’ve seen every match'}</span></div>${!state.accepted && !left ? '<p class="exhausted">Nothing clicked? Change your preferences or <button data-action="reshuffle">revisit these matches</button>.</p>' : ''}<p class="estimate-note">Home-cooking estimates. Actual prices and preparation times vary.</p>`;
  focusHeading();
}
function acceptMeal(id) {
  const item = state.ranked[state.index];
  if (!item || item.id !== id || state.step !== 3) throw new Error('This meal is not the current recommendation.');
  state.accepted = true;
  showResult();
  return currentResult();
}
flow.addEventListener('click', event => {
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
  if (action === 'mood') showMood();
  if (action === 'details') showDetails();
  if (action === 'recommend' || action === 'reshuffle') recommend();
  if (action === 'another' && state.index + 1 < state.ranked.length) { state.index++; state.accepted = false; showResult(); }
  if (action === 'accept') acceptMeal(state.ranked[state.index].id);
  if (action === 'restart') { state.ranked = []; state.accepted = false; state.index = 0; showMood(); }
});
// Feature-detect the proposed WebMCP API; normal browsers use the interface above.
const context = document.modelContext;
if (context?.registerTool) {
  const lifecycle = new AbortController();
  const toolSpecs = [
    {
      name: 'recommend_meal', title: 'Find a meal', description: 'Set food preferences and display one matching meal. This does not accept the meal or place an order.',
      inputSchema: { type: 'object', properties: { mood: { type: 'string', enum: allowed.mood }, diets: { type: 'array', items: { type: 'string', enum: allowed.diets }, uniqueItems: true }, time: { type: 'number', enum: allowed.time }, budget: { type: 'number', enum: allowed.budget }, heat: { type: 'number', enum: allowed.heat }, adventure: { type: 'string', enum: allowed.adventure } }, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) { const validated = validatePreferences(input); state.prefs = validated; return recommend(); }
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
