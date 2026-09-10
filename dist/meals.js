// Illustrative home-cooking estimates in USD per serving, not live prices.
const plant = ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'];
const veg = ['vegetarian'];
const vg = ['vegetarian', 'gluten-free'];
const both = ['dairy-free', 'gluten-free'];
function meal(id, name, emoji, cuisine, mood, minutes, cost, heat, adventure, diets, description, ingredients) {
  return { id, name, emoji, cuisine, mood, minutes, cost, heat, adventure, diets, description, ingredients };
}
export const meals = [
  meal('chickpea-bowl', 'Lemony chickpea bowl', '🥑', 'Mediterranean-inspired', ['fresh'], 15, 5, 0, 1, plant, 'Bright lemon, creamy avocado, and chickpeas over ready-cooked rice. A little crunch in every bite.', ['Chickpeas', 'Ready-cooked rice', 'Avocado', 'Cucumber', 'Tomatoes', 'Lemon & olive oil']),
  meal('tomato-pasta', 'Garlic & tomato pasta', '🍝', 'Italian-inspired', ['comfort'], 25, 4, 0, 0, ['vegetarian', 'vegan', 'dairy-free'], 'Pasta in a simple, garlicky tomato sauce. Cozy, familiar, and very hard to regret.', ['Pasta', 'Canned tomatoes', 'Garlic', 'Olive oil', 'Basil']),
  meal('black-bean-tacos', 'Smoky black bean tacos', '🌮', 'Mexican-inspired', ['bold', 'comfort'], 20, 4, 1, 0, plant, 'Warm corn tortillas, smoky beans, crunchy cabbage, and a squeeze of lime.', ['Gluten-free corn tortillas', 'Black beans', 'Cabbage', 'Lime', 'Mild salsa', 'Smoked paprika']),
  meal('grilled-cheese', 'Grilled cheese & tomato soup', '🥪', 'American', ['comfort'], 15, 5, 0, 0, veg, 'Crisp golden bread, melted cheddar, and warm tomato soup for dipping. The comfort-food classic.', ['Bread', 'Cheddar', 'Butter', 'Vegetarian tomato soup']),
  meal('salmon-rice', 'Ginger salmon rice bowl', '🍚', 'Japanese-inspired', ['fresh', 'bold'], 30, 10, 0, 1, both, 'Ginger-glazed salmon with fluffy rice and cool cucumber. Fresh with a satisfying savory finish.', ['Salmon', 'Rice', 'Cucumber', 'Ginger', 'Gluten-free tamari', 'Sesame oil']),
  meal('coconut-curry', 'Coconut chickpea curry', '🍛', 'Indian-inspired', ['bold', 'comfort'], 30, 5, 1, 1, plant, 'Creamy coconut, warming spices, and tender chickpeas. Best scooped over a bowl of rice.', ['Chickpeas', 'Coconut milk', 'Tomatoes', 'Rice', 'Spinach', 'Mild curry powder']),
  meal('pesto-pasta', 'Pesto pasta with tomatoes', '🍝', 'Italian-inspired', ['fresh', 'comfort'], 20, 6, 0, 0, veg, 'Herby pesto coats warm pasta, with juicy tomatoes adding a bright little pop.', ['Pasta', 'Vegetarian pesto with microbial-rennet cheese', 'Cherry tomatoes', 'Olive oil']),
  meal('avocado-toast', 'Avocado & egg toast', '🥑', 'Café-style', ['fresh', 'comfort'], 10, 4, 0, 0, ['vegetarian', 'dairy-free'], 'Creamy avocado on crisp toast with a soft egg. Easy enough for breakfast, good enough for dinner.', ['Bread', 'Avocado', 'Eggs', 'Lemon', 'Olive oil']),
  meal('tofu-stir-fry', 'Sesame tofu stir-fry', '🥦', 'East Asian-inspired', ['fresh', 'bold'], 25, 5, 0, 1, plant, 'Golden tofu, crisp broccoli, and ginger-sesame sauce make a colorful bowl with plenty of texture.', ['Firm tofu', 'Broccoli', 'Ready-cooked rice', 'Ginger', 'Gluten-free tamari', 'Sesame oil']),
  meal('chicken-wrap', 'Lemon chicken wrap', '🌯', 'Mediterranean-inspired', ['fresh'], 15, 6, 0, 0, ['dairy-free'], 'A soft wrap filled with ready-cooked chicken, lemony hummus, and crisp vegetables.', ['Flour tortilla', 'Ready-cooked chicken', 'Hummus', 'Lettuce', 'Cucumber', 'Lemon']),
  meal('chili-bowl', 'Three-bean chili', '🥣', 'Tex-Mex-inspired', ['comfort', 'bold'], 35, 4, 1, 0, plant, 'A thick, smoky bowl of beans and tomatoes with just enough spice to keep things interesting.', ['Kidney beans', 'Black beans', 'Pinto beans', 'Tomatoes', 'Onion', 'Mild chili powder']),
  meal('baked-potato', 'Broccoli & cheddar baked potato', '🥔', 'American', ['comfort'], 15, 4, 0, 0, vg, 'A fluffy microwave-baked potato piled with broccoli and melted cheddar. Simple and satisfying.', ['Large potato', 'Broccoli', 'Cheddar', 'Butter']),
  meal('shrimp-tacos', 'Chili-lime shrimp tacos', '🌮', 'Mexican-inspired', ['bold', 'fresh'], 20, 9, 1, 1, both, 'Quick-cooked shrimp, crunchy slaw, and fresh lime tucked into warm corn tortillas.', ['Shrimp', 'Gluten-free corn tortillas', 'Cabbage', 'Lime', 'Olive oil', 'Mild chili powder']),
  meal('rice-noodles', 'Chilled peanut rice noodles', '🍜', 'Southeast Asian-inspired', ['fresh', 'bold'], 15, 5, 1, 1, plant, 'Cool rice noodles and crunchy vegetables tossed with a creamy peanut-lime dressing.', ['Rice noodles', 'Peanut butter', 'Carrot', 'Cucumber', 'Lime', 'Gluten-free tamari', 'Chili flakes']),
  meal('margherita', 'Quick margherita flatbread', '🍕', 'Italian-inspired', ['comfort'], 20, 6, 0, 0, veg, 'A crisp flatbread with tomato, melty mozzarella, and basil. All the pizza-night feelings, less waiting.', ['Flatbread', 'Tomato sauce', 'Microbial-rennet mozzarella', 'Basil', 'Olive oil']),
  meal('chicken-rice', 'Garlic chicken & rice', '🍗', 'Homestyle', ['comfort'], 30, 7, 0, 0, both, 'Juicy garlic chicken, warm rice, and green beans. A reliable answer when everything sounds complicated.', ['Chicken breast', 'Rice', 'Green beans', 'Garlic', 'Olive oil']),
  meal('lentil-salad', 'Herby lentil salad', '🥗', 'Mediterranean-inspired', ['fresh'], 10, 4, 0, 1, plant, 'Ready-cooked lentils, crunchy cucumber, and plenty of fresh herbs in a lemon dressing.', ['Ready-cooked lentils', 'Cucumber', 'Cherry tomatoes', 'Parsley', 'Lemon', 'Olive oil']),
  meal('kimchi-rice', 'Spicy kimchi fried rice', '🍚', 'Korean-inspired', ['bold', 'comfort'], 15, 5, 2, 1, plant, 'Tangy kimchi and sizzling rice with tofu. Big flavor from a very short ingredient list.', ['Ready-cooked rice', 'Vegan gluten-free kimchi', 'Tofu', 'Gluten-free tamari', 'Sesame oil', 'Scallions']),
  meal('mushroom-polenta', 'Creamy mushroom polenta', '🍄', 'Italian-inspired', ['comfort'], 25, 6, 0, 1, plant, 'Golden mushrooms over creamy quick-cooking polenta. Earthy, cozy, and entirely plant-based.', ['Quick-cooking polenta', 'Mushrooms', 'Garlic', 'Unsweetened almond milk', 'Olive oil', 'Thyme']),
  meal('greek-salad', 'Greek-style chickpea salad', '🥗', 'Greek-inspired', ['fresh'], 10, 5, 0, 0, vg, 'Cucumber, tomatoes, chickpeas, and tangy feta, with a lemon-oregano dressing.', ['Chickpeas', 'Cucumber', 'Tomatoes', 'Olives', 'Microbial-rennet feta', 'Lemon & oregano']),
  meal('breakfast-tacos', 'Egg & potato breakfast tacos', '🌮', 'Tex-Mex-inspired', ['comfort'], 25, 4, 0, 0, ['vegetarian', 'dairy-free', 'gluten-free'], 'Fluffy eggs and golden potatoes in corn tortillas. Breakfast rules do not apply here.', ['Eggs', 'Potatoes', 'Gluten-free corn tortillas', 'Avocado', 'Olive oil']),
  meal('spicy-basil-tofu', 'Chili-basil tofu rice', '🍛', 'Thai-inspired', ['bold'], 25, 5, 2, 1, plant, 'Tofu seared with garlic, fresh chili, and basil, spooned over rice. A proper wake-up for your taste buds.', ['Tofu', 'Rice', 'Basil', 'Fresh chili', 'Garlic', 'Gluten-free tamari']),
  meal('cajun-shrimp', 'Cajun shrimp & rice', '🍤', 'Cajun-inspired', ['bold'], 30, 9, 2, 1, both, 'Spiced shrimp and bell peppers over fluffy rice, finished with a squeeze of lemon.', ['Shrimp', 'Rice', 'Bell peppers', 'Gluten-free dairy-free Cajun spice mix', 'Olive oil', 'Lemon']),
  meal('sweet-potato-bowl', 'Roasted sweet potato bowl', '🍠', 'Everyday plant-based', ['fresh', 'comfort'], 40, 5, 0, 1, plant, 'Caramelized sweet potato, black beans, and crisp greens with a creamy tahini-lemon dressing.', ['Sweet potato', 'Black beans', 'Ready-cooked rice', 'Mixed greens', 'Tahini', 'Lemon']),
  meal('beef-burger', 'Classic burger & potato wedges', '🍔', 'American', ['comfort'], 40, 9, 0, 0, ['dairy-free'], 'A juicy beef burger with crisp lettuce and oven-roasted wedges. Sometimes the obvious choice is the one.', ['Ground beef', 'Dairy-free burger bun', 'Lettuce', 'Tomato', 'Potatoes', 'Mustard']),
  meal('tomato-gf-pasta', 'Tomato & basil rice pasta', '🍝', 'Italian-inspired', ['comfort'], 20, 5, 0, 0, plant, 'A simple tomato sauce and fresh basil over gluten-free pasta. Familiar, cozy, and easy to make.', ['Gluten-free rice pasta', 'Canned tomatoes', 'Garlic', 'Basil', 'Olive oil']),
  meal('tuna-bowl', 'Lemon tuna & white bean bowl', '🥣', 'Mediterranean-inspired', ['fresh'], 10, 5, 0, 0, both, 'Tuna and creamy white beans with crunchy cucumber, parsley, and plenty of lemon.', ['Canned tuna', 'White beans', 'Cucumber', 'Parsley', 'Lemon', 'Olive oil']),
  meal('stuffed-peppers', 'Black bean stuffed peppers', '🫑', 'Tex-Mex-inspired', ['comfort', 'bold'], 55, 6, 1, 1, plant, 'Sweet roasted peppers filled with smoky black beans and rice. A little more time, a very good payoff.', ['Bell peppers', 'Black beans', 'Ready-cooked rice', 'Tomatoes', 'Corn', 'Mild chili powder'])
];
export const defaults = { mood: 'any', diets: [], time: 30, budget: 10, heat: 1, adventure: 'any' };
export const allowed = { mood: ['any', 'comfort', 'fresh', 'bold'], diets: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'], time: [15, 30, 60], budget: [5, 10, 20], heat: [0, 1, 2], adventure: ['any', 'familiar', 'adventurous'] };
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
