import {validatePreferences} from './meals.js';
export const guestEmptyMessage = 'No meal in our current catalog fits these choices. Try adjusting your time, budget, heat, or dietary selections. Your answers are still here; no restrictions have been changed.';
export function guestReasons(reasons) {
 return reasons.map(reason => reason === 'Mild, with no added chili heat' ? 'No added chili heat' : reason);
}
export const guestHeatOptions = [[0, 'No heat', 'No spice or noticeable heat'], [1, 'Medium', 'Some noticeable heat'], [2, 'Hot', 'Spicy is welcome']];
export const guestAdventureQuestion = 'How adventurous should this pick be?';
export const guestAdventureOptions = [['familiar', 'Classic crowd-pleaser', 'Broadly recognizable dishes'], ['adventurous', 'A little different', 'Explore cuisines and ingredients'], ['any', 'Surprise me', 'The widest variety within your choices']];
const key = 'ezeats.guest-picker.v1';
// Only current answers and editing step, never identity or meal-pick history.
export function readGuestPicker(storage) {
 try {
  const value = JSON.parse(storage.getItem(key));
  if (!value || ![1, 2].includes(value.step)) return null;
  return {prefs: validatePreferences(value.prefs), step: value.step};
 } catch { return null; }
}
export function writeGuestPicker(storage, prefs, step) {
 try { storage.setItem(key, JSON.stringify({prefs: validatePreferences(prefs), step: step === 1 ? 1 : 2})); } catch { /* Storage denial must never block picking. */ }
}
