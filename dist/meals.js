// Picker summaries are generated from the owned recipe catalog; ranking stays here.
import {meals} from './meal-catalog.js';
export {meals};
export const defaults = { mood: 'any', diets: [], time: 30, budget: 10, heat: 1, adventure: 'any' };
export const allowed = { mood: ['any', 'comfort', 'fresh', 'bold'], diets: ['vegetarian', 'vegan', 'pescatarian', 'gluten-free', 'dairy-free'], time: [15, 30, 60], budget: [5, 10, 20], heat: [0, 1, 2], adventure: ['any', 'familiar', 'adventurous'] };
export function validatePreferences(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Preferences must be an object.');
  for (const key of Object.keys(input)) if (!Object.hasOwn(allowed, key)) throw new Error(`Unknown preference: ${key}`);
  const prefs = { ...defaults, ...input, diets: input.diets ?? [] };
  for (const [key, values] of Object.entries(allowed)) {
    if (key === 'diets') {
      if (!Array.isArray(prefs.diets) || prefs.diets.some(diet => !values.includes(diet))) throw new Error('Choose supported dietary preferences.');
    } else if (!values.includes(prefs[key])) throw new Error(`Unsupported ${key} preference.`);
  }
  prefs.diets = [...new Set(prefs.diets)];
  return prefs;
}
// Filter hard limits first. Rank by mood (6 points), heat (2), familiarity (2).
// Randomness breaks ties only; it never displaces a higher-scoring match.
export function rankMeals(input, random = Math.random) {
  const prefs = validatePreferences(input);
  return meals.filter(item => prefs.diets.every(diet => item.diets.includes(diet)) && item.minutes <= prefs.time && item.cost <= prefs.budget && item.heat <= prefs.heat)
    .map(item => ({ ...item, score: (prefs.mood === 'any' ? 3 : item.mood.includes(prefs.mood) ? 6 : 0) + (prefs.heat === item.heat ? 2 : 1) + (prefs.adventure === 'any' ? 1 : Number(item.adventure === (prefs.adventure === 'adventurous' ? 1 : 0)) * 2), tie: random() }))
    .sort((a, b) => b.score - a.score || b.tie - a.tie);
}
export function reasonsFor(item, prefs) {
  const reasons = [];
  if (prefs.mood !== 'any' && item.mood.includes(prefs.mood)) reasons.push({ comfort: 'Comfort food for your cozy-food mood', fresh: 'A fresh pick for your lighter-food mood', bold: 'Big flavors to match your craving' }[prefs.mood]);
  if (prefs.diets.length) reasons.push(`Fits your ${prefs.diets.join(' + ')} preferences`);
  reasons.push(`Ready in ${item.minutes} minutes, within your ${prefs.time}-minute limit`);
  reasons.push(`About $${item.cost} per serving, within your $${prefs.budget} budget`);
  if (prefs.heat === 0) reasons.push('Mild, with no added chili heat');
  else if (prefs.heat === 2 && item.heat === 2) reasons.push('Brings the heat you asked for');
  return reasons.slice(0, 4);
}
