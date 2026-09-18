// Original EZEATS drafts authored for this catalog. No imported recipe text.
// Ingredient references in steps are expanded from this controlled list, then removed from public records.
// Recipe: ID, title, description, cuisine, meal types, prep, cook, cost USD/serving,
// heat (0 mild / 1 medium / 2 spicy), adventure (0 familiar / 1 adventurous), servings, ingredients, steps.
const r=(id,title,description,cuisine,mealTypes,prep,cook,cost,heat,adventure,servings,items,steps)=>({id,title,description,cuisine,mealTypes:mealTypes.split(','),prep,cook,cost,heat,adventure,servings,items:items.split(';').map(x=>{const [key,quantity,unit,notes]=x.split('|');return {key,quantity,unit,notes:notes||null};}),steps});
export const drafts=[
r('chickpea-bowl','Lemony chickpea bowl','Cool vegetables and chickpeas brighten warm rice with a simple lemon dressing.','Mediterranean-inspired','lunch,dinner,bowl',10,5,5,0,1,2,
'chickpeas|1 1/2|cups;cookedRice|2|cups;avocado|1|medium;cucumber|1/2|medium;tomato|1|medium;lemon|2|tablespoons;oil|1|tablespoon;salt|1/4|teaspoon',[
'Dice the @cucumber and @tomato. Halve the @avocado, remove the stone and scoop the flesh into slices.',
'Heat the @cookedRice according to its package in a microwave-safe bowl, stirring halfway, until 74°C/165°F throughout.',
'Whisk the @lemon, @oil and @salt in a mixing bowl. Fold in the @chickpeas and diced vegetables.',
'Divide the warm rice between two bowls. Spoon over the dressed mixture and finish with the avocado. Serve immediately.'
]),
r('tomato-pasta','Garlic & tomato pasta','A quick tomato sauce clings to pasta with a fragrant basil finish.','Italian-inspired','dinner,pasta',5,20,4,0,0,2,
'pasta|6|ounces|170 g;cannedTomato|1 1/2|cups;garlic|2|cloves|minced;oil|1|tablespoon;basil|1/4|cup|torn;water|8|cups|1.9 L, for boiling;salt|1/4|teaspoon',[
'Bring the @water to a boil in a large pot. Add the @pasta and cook for the package time, stirring so it does not stick; drain.',
'While the pasta cooks, warm the @oil in a skillet over medium-low heat. Stir in the @garlic for 30 seconds without browning.',
'Add the @cannedTomato and @salt. Simmer uncovered for 12 minutes, stirring and crushing larger pieces with a spoon.',
'Toss the drained pasta in the sauce over low heat for 1 minute. Fold in the @basil and divide between two plates.'
]),
r('black-bean-tacos','Smoky black bean tacos','Smoky beans and crisp cabbage make an easy small-tortilla supper.','Mexican-inspired','lunch,dinner,tacos',10,10,4,1,0,2,
'blackBeans|1 1/2|cups;cornTortilla|6|small;cabbage|1|cup|finely shredded;lime|1|tablespoon;salsa|1/3|cup;paprika|1|teaspoon;water|1/4|cup',[
'Combine the @blackBeans, @paprika, @water and @salsa in a small saucepan. Simmer over medium-low heat for 7 minutes, stirring and mashing a third of the beans.',
'Toss the @cabbage with the @lime in a bowl.',
'Warm the @cornTortilla in a dry skillet over medium heat for 20–30 seconds per side; keep covered with a clean towel.',
'Divide the bean mixture and cabbage among the six tortillas. Serve three per person while warm.'
]),
r('grilled-cheese','Grilled cheese & tomato soup','A crisp cheddar sandwich served with a small bowl of tomato soup.','North American','lunch,dinner,sandwich,soup',5,10,5,0,0,2,
'bread|4|slices;cheddar|3|ounces|85 g;butter|1|tablespoon|softened;tomatoSoup|2|cups',[
'Heat the @tomatoSoup in a saucepan according to its package, stirring often until steaming throughout.',
'Spread the @butter thinly on one side of each slice of @bread. Sandwich the @cheddar between the unbuttered sides.',
'Place sandwiches in a skillet over medium-low heat. Cook for 3–4 minutes per side, pressing lightly, until the bread is golden and the cheese has melted.',
'Cut each sandwich in half and serve beside one cup of hot soup per person.'
]),
r('salmon-rice','Ginger salmon rice bowl','Pan-cooked salmon sits over rice with cucumber and a ginger-tamari glaze.','Japanese-inspired','dinner,bowl',10,20,10,0,1,2,
'salmon|12|ounces|340 g, two equal fillets;rice|3/4|cup;water|1 1/2|cups;cucumber|1/2|medium|thinly sliced;ginger|2|teaspoons|grated;tamari|1|tablespoon;sesameOil|2|teaspoons',[
'Combine the @rice and @water in a small saucepan. Bring to a boil, cover and cook on low for 15 minutes, then rest covered off heat for 5 minutes.',
'Mix the @ginger and @tamari. Heat the @sesameOil in a nonstick skillet on medium. Add the @salmon skin-side down if skin is present.',
'Cook for 5 minutes, turn with a clean spatula and cook 4–7 minutes more. Add the ginger mixture for the final minute. Check the center of each fillet reaches 70°C/158°F; continue gently if needed.',
'Fluff the rice and split between bowls. Add the fish, cooked glaze and @cucumber. Keep raw-fish tools away from the finished bowls.'
]),
r('coconut-curry','Coconut chickpea curry','Chickpeas and spinach simmer in a mellow tomato-coconut sauce.','Indian-inspired','dinner,curry',10,20,5,1,1,2,
'chickpeas|1 1/2|cups;coconutMilk|3/4|cup;cannedTomato|1|cup;rice|3/4|cup;spinach|2|cups;curry|2|teaspoons;water|1 1/2|cups;oil|1|teaspoon',[
'Bring the @rice and @water to a boil in a covered saucepan. Reduce to low for 15 minutes; remove from heat and rest covered for 5 minutes.',
'Warm the @oil in a deep skillet over medium-low heat. Stir the @curry for 20 seconds, then add the @cannedTomato and @coconutMilk.',
'Add the @chickpeas and simmer uncovered for 12 minutes, stirring occasionally, until the sauce coats a spoon.',
'Fold in the @spinach and simmer 2 minutes until wilted. Spoon over the fluffed rice and serve hot.'
]),
r('pesto-pasta','Pesto pasta with tomatoes','Warm pasta loosens a basil pesto coating around juicy tomatoes.','Italian-inspired','lunch,dinner,pasta',5,15,6,0,0,2,
'pasta|6|ounces|170 g;pesto|1/4|cup;cherryTomato|1|cup|halved;oil|1|teaspoon;water|8|cups|1.9 L, for boiling',[
'Boil the @water in a pot. Cook the @pasta for its package time until tender; reserve 1/4 cup cooking water before draining.',
'Warm the @oil in a skillet on medium. Add the @cherryTomato and cook for 3 minutes until softened at the edges.',
'Turn off the heat. Add the pasta and @pesto, then stir in reserved cooking water a tablespoon at a time until coated, using up to 1/4 cup.',
'Divide between two bowls and serve warm; do not boil the pesto sauce.'
]),
r('avocado-toast','Avocado & egg toast','Mashed avocado and fully cooked eggs turn toast into a quick meal.','Café-style','breakfast,lunch',5,10,4,0,0,2,
'bread|4|slices;avocado|1|medium;eggs|4|large;lemon|1|tablespoon;oil|1|teaspoon;salt|1/8|teaspoon',[
'Toast the @bread. Halve and pit the @avocado, scoop into a bowl and mash with the @lemon and @salt.',
'Crack the @eggs into a separate bowl and whisk. Warm the @oil in a nonstick skillet over medium-low heat.',
'Add the eggs and stir gently for 4–6 minutes until fully set with no wet streaks and 74°C/165°F. Wash the bowl and utensils that touched raw egg.',
'Spread avocado over the toast, add the cooked eggs and serve immediately.'
]),
r('tofu-stir-fry','Sesame tofu stir-fry','Golden tofu and broccoli meet a light ginger-tamari coating.','East Asian-inspired','dinner,bowl',10,15,5,0,1,2,
 'tofu|12|ounces|340 g, cut into 3/4-inch cubes;broccoli|3|cups;cookedRice|2|cups;ginger|2|teaspoons|grated;tamari|1|tablespoon;sesameOil|2|teaspoons;water|1/4|cup',[
'Heat the @sesameOil in a large nonstick skillet on medium-high. Add the @tofu in one layer and cook for 6–8 minutes, turning twice.',
'Add the @broccoli and @water. Cover and steam for 4 minutes until the stems are just tender.',
'Uncover, stir in the @ginger and @tamari and cook for 1 minute, turning the tofu gently.',
'Heat the @cookedRice following its package to 74°C/165°F throughout. Divide into bowls and add the stir-fry.'
]),
r('chicken-wrap','Lemon chicken wrap','Ready-cooked chicken, hummus and crisp greens fill a lemony wrap.','Mediterranean-inspired','lunch,wrap',10,0,6,0,0,2,
 'tortilla|2|large;cookedChicken|8|ounces|225 g, shredded;hummus|1/4|cup;lettuce|1|cup|shredded;cucumber|1/2|medium|cut into thin sticks;lemon|1|tablespoon',[
'Stir the @lemon into the @hummus and spread over the center of each @tortilla, leaving an inch around the edges.',
'Arrange the chilled @cookedChicken, @lettuce and @cucumber over the spread. Use only ready-to-eat chicken that has stayed refrigerated.',
'Fold the sides inward, then roll firmly from the bottom to enclose the filling.',
'Cut each wrap in half and serve cold promptly, or refrigerate covered until serving.'
]),
r('chili-bowl','Three-bean chili','Three kinds of beans make a thick tomato chili with gentle heat.','Tex-Mex-inspired','dinner,soup',10,25,4,1,0,4,
'kidneyBeans|1 1/2|cups;blackBeans|1 1/2|cups;pintoBeans|1 1/2|cups;cannedTomato|3|cups;onion|1|medium|diced;chiliPowder|2|teaspoons;oil|1|tablespoon;water|1/2|cup;salt|1/4|teaspoon',[
'Heat the @oil in a heavy pot on medium. Add the @onion and cook for 5 minutes, stirring until translucent.',
'Stir in the @chiliPowder for 30 seconds. Add the @cannedTomato, @water and @salt and bring to a gentle simmer.',
'Add the @kidneyBeans, @blackBeans and @pintoBeans. Simmer uncovered for 18 minutes, stirring from the bottom so nothing catches.',
'Mash a scoop of beans against the pot to thicken, stir it back in and ladle into four bowls.'
]),
r('baked-potato','Broccoli & cheddar microwave potatoes','Tender potatoes hold steamed broccoli and a melted cheddar cap.','North American','lunch,dinner',5,15,4,0,0,2,
'potato|2|medium|about 8 ounces/225 g each;broccoli|2|cups;cheddar|2|ounces|55 g;butter|1|tablespoon;water|2|tablespoons',[
'Scrub the @potato and pierce each several times with a fork. Place on a microwave-safe plate and microwave on high for 8–12 minutes, turning halfway, until a knife slides in easily. Let stand for 2 minutes.',
'Place the @broccoli and @water in a microwave-safe bowl. Cover with a vented lid and microwave for 2–3 minutes until tender; drain carefully.',
'Split the potatoes and fluff the centers with the @butter. Spoon in the broccoli and scatter over the @cheddar.',
'Microwave for 30–60 seconds until the cheese melts. Let steam escape before serving. Microwave strength changes timing.'
]),
r('shrimp-tacos','Chili-lime shrimp tacos','Warm shrimp and crunchy lime cabbage tuck into soft corn tortillas.','Mexican-inspired','dinner,tacos',10,10,9,1,1,2,
'shrimp|12|ounces|340 g;cornTortilla|6|small;cabbage|1 1/2|cups|shredded;lime|2|tablespoons;oil|2|teaspoons;chiliPowder|1|teaspoon',[
'Toss the @cabbage with half the @lime in a bowl and set aside away from raw seafood.',
'Warm the @cornTortilla in a dry skillet for 20 seconds per side; cover with a towel.',
'Heat the @oil in the skillet on medium-high. Add the @shrimp and @chiliPowder; cook for 4–6 minutes, turning, until the thickest shrimp reach 74°C/165°F.',
'Remove from heat and add the remaining lime. Fill the tortillas with shrimp and slaw, using clean serving utensils.'
]),
r('rice-noodles','Chilled peanut rice noodles','A creamy peanut-lime dressing coats quick noodles and crisp vegetables.','Southeast Asian-inspired','lunch,dinner,noodles',9,6,5,1,1,2,
'noodles|6|ounces|170 g;peanutButter|3|tablespoons;carrot|1|medium|grated;cucumber|1/2|medium|thinly sliced;lime|2|tablespoons;tamari|1|tablespoon;chili|1/4|teaspoon;water|6|cups|plus 3 tablespoons for dressing',[
'Boil the 6 cups of @water and cook the @noodles for their package time, choosing the specified quick-cooking variety. Drain and rinse under cold drinking water, then drain thoroughly.',
'Whisk the @peanutButter, @lime, @tamari and 3 tablespoons of water until smooth. Stir in the @chili.',
'Toss the noodles with the dressing, @carrot and @cucumber until evenly coated.',
'Divide into two bowls and serve promptly, or refrigerate covered; do not leave the noodles at room temperature to cool further.'
]),
r('margherita','Quick margherita flatbread','Crisp flatbread carries tomato sauce, mozzarella and torn basil.','Italian-inspired','dinner,pizza',10,10,6,0,0,2,
'flatbread|2|medium|about 6 inches/15 cm;sauce|1/2|cup;mozzarella|3|ounces|85 g;basil|1/4|cup|torn;oil|1|teaspoon',[
'Heat the oven to 425°F/220°C. Place the @flatbread on a baking sheet and brush the edges with the @oil.',
'Spread the @sauce over the centers, leaving a small border, and scatter on the @mozzarella.',
'Bake for 8–10 minutes until the edges are crisp and the cheese bubbles. Rotate the sheet if one side browns faster.',
'Top with the @basil, rest for 1 minute and cut each flatbread into quarters.'
]),
r('chicken-rice','Garlic chicken & rice','Garlic chicken strips and green beans share a plate with steamed rice.','North American','dinner',10,20,7,0,0,2,
'chicken|12|ounces|340 g, cut into 1/2-inch strips;rice|3/4|cup;greenBeans|2|cups|trimmed;garlic|2|cloves|minced;oil|1|tablespoon;water|1 3/4|cups;salt|1/4|teaspoon',[
'Combine the @rice with 1 1/2 cups of @water. Bring to a boil, cover, cook on low for 15 minutes and rest off heat for 5 minutes.',
'Heat the @oil in a skillet on medium-high. Add the @chicken and @salt; cook for 6–8 minutes, turning, until every strip reaches 74°C/165°F. Transfer to a clean plate.',
'Lower the heat to medium. Add the @greenBeans, @garlic and remaining 1/4 cup water. Cover for 4 minutes, then uncover and cook for 2 minutes until tender.',
'Return the chicken and its cooked juices to the skillet for 1 minute. Serve alongside the fluffed rice.'
]),
r('lentil-salad','Herby lentil salad','Ready-cooked lentils and chopped vegetables make a lemony, herb-filled lunch.','Mediterranean-inspired','lunch,salad',10,0,4,0,1,2,
'lentils|2|cups;cucumber|1/2|medium;cherryTomato|1|cup;parsley|1/3|cup;lemon|2|tablespoons;oil|1|tablespoon;salt|1/4|teaspoon',[
'Dice the @cucumber, halve the @cherryTomato and finely chop the @parsley.',
'Whisk the @lemon, @oil and @salt in a large bowl.',
'Fold the chilled @lentils and chopped vegetables into the dressing, breaking up any clumps gently.',
'Divide into two bowls and serve cold. Refrigerate any portion that will not be eaten promptly.'
]),
r('kimchi-rice','Spicy kimchi fried rice','Chopped kimchi gives sizzling tofu and rice a sharp, spicy finish.','Korean-inspired','dinner,rice',5,10,5,2,1,2,
'cookedRice|2|cups;kimchi|3/4|cup|chopped;tofu|8|ounces|225 g, crumbled;tamari|2|teaspoons;sesameOil|2|teaspoons;scallion|2|stalks|sliced',[
'Heat the @sesameOil in a wide skillet on medium-high. Add the @tofu and cook for 4 minutes, breaking it into small pieces.',
'Add the @kimchi and cook for 2 minutes, stirring so its juices reduce slightly.',
'Fold in the @cookedRice and @tamari. Fry for 3–4 minutes, turning and breaking up clumps, until the rice reaches 74°C/165°F throughout.',
'Scatter over the @scallion and serve hot. Use vegan kimchi with no seafood ingredients.'
]),
r('mushroom-polenta','Creamy mushroom polenta','Browned mushrooms top soft polenta enriched with almond milk.','Italian-inspired','dinner,bowl',10,15,6,0,1,2,
'polenta|1/2|cup;mushroom|8|ounces|225 g, sliced;garlic|2|cloves|minced;almondMilk|1|cup;water|1|cup;oil|1|tablespoon;thyme|1/2|teaspoon;salt|1/4|teaspoon',[
'Heat the @oil in a skillet on medium-high. Spread out the @mushroom and cook for 8 minutes, stirring occasionally until browned.',
'Add the @garlic and @thyme to the mushrooms and cook for 1 minute; keep warm on low.',
'Bring the @almondMilk, @water and @salt to a simmer in a saucepan. Slowly whisk in the @polenta. Reduce heat and stir for 5 minutes, or the package time, until soft and thick.',
'Spoon the polenta into bowls and top with the mushroom mixture. Serve before the polenta firms up.'
]),
r('greek-salad','Greek-style chickpea salad','Chickpeas, feta and crisp vegetables make a substantial chopped salad.','Greek-inspired','lunch,salad',10,0,5,0,0,2,
'chickpeas|1 1/2|cups;cucumber|1/2|medium;tomato|2|medium;olives|1/4|cup;feta|2|ounces|55 g;lemon|2|tablespoons;oregano|1/2|teaspoon;oil|1|tablespoon',[
'Dice the @cucumber and @tomato into bite-size pieces. Halve the @olives.',
'Whisk the @lemon, @oregano and @oil in a large bowl.',
'Fold in the @chickpeas and chopped vegetables until coated.',
'Divide between bowls, crumble the @feta over the top and serve cold.'
]),
r('breakfast-tacos','Egg & potato breakfast tacos','Small potato cubes and fully cooked eggs fill soft corn tortillas.','Tex-Mex-inspired','breakfast,tacos',10,15,4,0,0,2,
'eggs|4|large;potato|1|medium|225 g, cut into 1/2-inch cubes;cornTortilla|6|small;avocado|1|medium;oil|2|teaspoons;water|2|tablespoons;salt|1/4|teaspoon',[
'Put the @potato and @water in a microwave-safe bowl, cover loosely and microwave for 4–5 minutes until tender. Drain.',
'Heat the @oil in a nonstick skillet on medium. Add the potatoes and @salt and cook for 4 minutes until lightly golden.',
'Beat the @eggs in a clean bowl, pour into the skillet and stir for 3–5 minutes until fully set and 74°C/165°F. Wash tools that touched raw egg.',
'Warm the @cornTortilla in a dry skillet. Slice the pitted @avocado and divide it and the hot filling among the tortillas.'
]),
r('spicy-basil-tofu','Chili-basil tofu rice','Crumbled tofu picks up garlic, chili and basil in a quick skillet sauce.','Thai-inspired','dinner,bowl',10,20,5,2,1,2,
 'tofu|12|ounces|340 g;rice|3/4|cup;basil|1/2|cup;jalapeno|1|small|finely chopped;garlic|2|cloves|minced;tamari|1|tablespoon;oil|2|teaspoons;water|1 1/2|cups',[
'Bring the @rice and @water to a boil. Cover, cook on low for 15 minutes and rest off heat for 5 minutes.',
'Heat the @oil in a skillet on medium-high. Crumble in the @tofu and cook for 7 minutes, turning occasionally.',
'Add the @garlic and @jalapeno, wash hands after handling the chili, and stir for 1 minute. Add the @tamari and cook for 1 minute more.',
'Turn off the heat and fold in the @basil until wilted. Serve over the rice.'
]),
r('cajun-shrimp','Cajun shrimp & rice','Spiced shrimp and softened peppers make a lively rice supper.','Cajun-inspired','dinner,bowl',10,20,9,2,1,2,
'shrimp|12|ounces|340 g;rice|3/4|cup;bellPepper|1|medium|thinly sliced;cajun|2|teaspoons;oil|1|tablespoon;lemon|1|tablespoon;water|1 1/2|cups',[
'Bring the @rice and @water to a boil. Cover, cook on low for 15 minutes and rest off heat for 5 minutes.',
'Heat the @oil in a skillet on medium-high and cook the @bellPepper for 5 minutes, turning until softened.',
'Add the @shrimp and @cajun. Cook for 4–6 minutes, turning the shrimp, until the thickest pieces reach 74°C/165°F.',
'Remove from heat, stir in the @lemon and spoon over the rice with the pan juices.'
]),
r('sweet-potato-bowl','Roasted sweet potato bowl','Roasted sweet potatoes and black beans meet a lemon-tahini drizzle.','North American plant-based','dinner,bowl',10,30,5,0,1,2,
'sweetPotato|1|large|about 12 ounces/340 g, 3/4-inch cubes;blackBeans|1 1/2|cups;cookedRice|2|cups;greens|2|cups;tahini|2|tablespoons;lemon|1|tablespoon;water|2|tablespoons;oil|2|teaspoons;salt|1/4|teaspoon',[
'Heat the oven to 425°F/220°C. Toss the @sweetPotato with the @oil and @salt on a sheet pan. Roast for 25–30 minutes, turning halfway, until tender.',
'Whisk the @tahini, @lemon and @water into a pourable sauce.',
'Heat the @cookedRice and @blackBeans in a covered microwave-safe bowl, stirring halfway, until 74°C/165°F throughout.',
'Put the @greens into bowls, add the rice, beans and roasted potato, then drizzle with the sauce.'
]),
r('beef-burger','Classic burger & potato wedges','A pan-cooked beef burger pairs with oven-browned potato wedges.','North American','dinner,burger',10,35,9,0,0,2,
'beef|12|ounces|340 g;bun|2|whole;lettuce|2|leaves;tomato|1|small|sliced;potato|2|medium|450 g total;mustard|2|teaspoons;oil|1|tablespoon;salt|1/4|teaspoon',[
'Heat the oven to 425°F/220°C. Cut the @potato into 1/2-inch-thick wedges. Toss with the @oil and half the @salt, spread on a baking sheet and roast 30–35 minutes, turning halfway.',
'Form the @beef into two 3/4-inch-thick patties without overworking it. Season with the remaining salt; wash hands and raw-meat tools.',
'Heat a skillet on medium-high. Cook patties for about 5–6 minutes per side, until the center of each reaches 71°C/160°F. Insert the thermometer through the side; do not judge by color.',
'Spread @mustard on the @bun and add the cooked patties, @lettuce and @tomato. Serve with the tender, browned wedges.'
]),
r('tomato-gf-pasta','Tomato & basil rice pasta','Rice pasta carries a simple garlic-tomato sauce without wheat ingredients.','Italian-inspired','dinner,pasta',5,15,5,0,0,2,
'gfPasta|6|ounces|170 g;cannedTomato|1 1/2|cups;garlic|2|cloves|minced;basil|1/4|cup|torn;oil|1|tablespoon;water|8|cups|1.9 L, for boiling;salt|1/4|teaspoon',[
'Bring the @water to a boil. Cook the @gfPasta for its package time, stirring gently; drain as soon as tender.',
'Meanwhile, heat the @oil in a skillet on medium-low and stir in the @garlic for 30 seconds.',
'Add the @cannedTomato and @salt. Simmer for 10 minutes, stirring and crushing larger tomato pieces.',
'Toss the pasta in the sauce and fold in the @basil. Serve immediately before the rice pasta softens further.'
]),
r('tuna-bowl','Lemon tuna & white bean bowl','Tuna and white beans turn chopped cucumber into a filling cold lunch.','Mediterranean-inspired','lunch,bowl',10,0,5,0,0,2,
 'tuna|6|ounces|170 g drained;whiteBeans|1 1/2|cups;cucumber|1/2|medium|diced;parsley|1/4|cup|chopped;lemon|2|tablespoons;oil|1|tablespoon;pepper|1/8|teaspoon',[
'Whisk the @lemon, @oil and @pepper in a bowl.',
'Flake the drained @tuna with a fork, checking for any unwanted bones.',
'Fold the tuna, @whiteBeans, @cucumber and @parsley into the dressing without crushing the beans.',
'Divide between two bowls and serve cold. Refrigerate promptly if preparing ahead.'
]),
r('stuffed-peppers','Black bean stuffed peppers','Baked peppers hold a spoonable filling of beans, rice, corn and tomatoes.','Tex-Mex-inspired','dinner',15,40,6,1,1,2,
 'bellPepper|2|large;blackBeans|1 1/2|cups;cookedRice|1|cup;cannedTomato|1|cup;corn|1/2|cup;chiliPowder|1|teaspoon;oil|1|teaspoon;water|1/4|cup',[
'Heat the oven to 400°F/200°C. Halve the @bellPepper lengthwise and remove seeds. Rub with @oil and place cut-side up in a small baking dish.',
'Mix the @blackBeans, @cookedRice, @cannedTomato, @corn and @chiliPowder in a bowl. Spoon into the pepper halves.',
'Pour the @water around the peppers, cover the dish tightly with foil and bake for 25 minutes.',
'Uncover and bake for 15 minutes more, until the peppers are tender and the filling reaches 74°C/165°F. Serve two halves per person.'
]),
// Breakfast and quick lunches, 29–44.
r('apple-walnut-oats','Apple-walnut stovetop oats','Warm apple pieces and cinnamon add texture to a creamy oat breakfast.','North American','breakfast',5,10,3,0,0,2,
'oats|1|cup;soyMilk|1 1/2|cups;water|1/2|cup;apple|1|medium|small dice;walnuts|1/4|cup|chopped;cinnamon|1/2|teaspoon;maple|1|tablespoon',[
'Combine the @soyMilk, @water, @oats and @apple in a saucepan.',
'Bring to a gentle simmer over medium heat, then lower the heat and stir for 7–8 minutes until the oats and apple are tender.',
'Stir in the @cinnamon and @maple, then remove from the heat.',
'Spoon into two bowls and sprinkle with the @walnuts. Let cool briefly before eating.'
]),
r('banana-peanut-porridge','Banana-peanut porridge','Mashed banana sweetens a simple oat bowl with a peanut butter swirl.','North American','breakfast',5,10,3,0,0,2,
'oats|1|cup;water|2|cups;banana|1|large;peanutButter|2|tablespoons;cinnamon|1/4|teaspoon',[
'Bring the @water and @oats to a simmer in a saucepan. Cook over low heat for 7 minutes, stirring frequently.',
'Mash half the @banana and slice the other half.',
'Stir the mashed banana, @peanutButter and @cinnamon into the oats for 1 minute until creamy.',
'Divide into bowls and arrange the banana slices on top. Serve warm.'
]),
r('berry-yogurt-crunch','Berry yogurt crunch bowls','Cold yogurt, berries and toasted oats make a quick breakfast with contrast.','Café-style','breakfast,snack',5,5,4,0,0,2,
'yogurt|1 1/2|cups;berries|1|cup;oats|1/2|cup;maple|2|teaspoons;cinnamon|1/4|teaspoon',[
'Toast the @oats in a dry skillet over medium-low heat for 4 minutes, stirring until fragrant; transfer to a plate to cool briefly.',
'Wash and dry the @berries, cutting large berries into bite-size pieces.',
'Divide the @yogurt between two bowls and scatter the berries and toasted oats over it.',
'Drizzle with the @maple and dust with the @cinnamon. Serve immediately to keep the oats crisp.'
]),
r('spinach-feta-eggs','Spinach-feta skillet eggs','Soft spinach and salty feta run through fully cooked scrambled eggs.','Greek-inspired','breakfast,lunch',5,10,4,0,0,2,
'eggs|4|large;spinach|2|cups;feta|2|ounces|55 g;oil|1|teaspoon;pepper|1/8|teaspoon',[
'Beat the @eggs and @pepper in a bowl. Keep the raw egg bowl away from ready-to-eat food.',
'Heat the @oil in a nonstick skillet on medium-low. Add the @spinach and stir for 2 minutes until wilted.',
'Pour in the eggs and fold gently for 4–6 minutes. Add the @feta for the last minute and cook until the eggs are fully set and reach 74°C/165°F.',
'Divide between two warm plates and serve promptly. Wash the raw egg bowl and whisk.'
]),
r('tomato-breakfast-skillet','Tomato breakfast skillet','Eggs set in a chunky tomato and pepper sauce for a spoonable breakfast.','North African-inspired','breakfast,dinner',10,20,5,1,1,2,
'eggs|4|large;cannedTomato|2|cups;bellPepper|1|small|diced;onion|1/2|medium|diced;oil|1|tablespoon;cumin|1/2|teaspoon;paprika|1/2|teaspoon;chili|1/8|teaspoon',[
'Heat the @oil in a deep skillet on medium. Cook the @onion and @bellPepper for 5 minutes until softened.',
'Stir in the @cumin, @paprika and @chili, then the @cannedTomato. Simmer for 6 minutes until slightly thickened.',
'Make four hollows. Crack the @eggs one at a time into a cup, then slide into the sauce. Cover and cook on low for 7–9 minutes until whites and yolks are set and the eggs reach 74°C/165°F.',
'Wash raw-egg tools. Serve two eggs and half the sauce per person while hot; extend gentle cooking if the centers are not set.'
]),
r('potato-tofu-breakfast','Golden potato & tofu breakfast','Small potato cubes and crumbled tofu make a savory plant-based skillet.','North American','breakfast',10,20,4,0,0,2,
'potato|2|small|340 g total, 1/2-inch dice;tofu|8|ounces|225 g;spinach|2|cups;oil|1|tablespoon;turmeric|1/4|teaspoon;paprika|1/2|teaspoon;water|1/4|cup;salt|1/4|teaspoon',[
'Put the @potato and @water in a covered microwave-safe bowl. Microwave for 5–6 minutes until just tender; drain.',
'Heat the @oil in a skillet on medium-high and cook the potatoes for 6 minutes, turning until golden.',
'Crumble in the @tofu. Add the @turmeric, @paprika and @salt and cook for 5 minutes, stirring.',
'Fold in the @spinach for 2 minutes until wilted and divide between two plates.'
]),
r('cinnamon-french-toast','Cinnamon French toast','Fully cooked egg-soaked bread gets a warm cinnamon crust and berry topping.','North American','breakfast',5,15,4,0,0,2,
'bread|4|thick slices;eggs|2|large;milk|1/3|cup;cinnamon|1/2|teaspoon;butter|2|teaspoons;berries|1|cup;maple|1|tablespoon',[
'Whisk the @eggs, @milk and @cinnamon in a shallow dish. Dip each slice of @bread for 10 seconds per side; do not leave it to become soggy.',
'Melt half the @butter in a nonstick skillet over medium-low heat. Cook two slices for 3–4 minutes per side until browned and the egg-soaked center reaches 74°C/165°F.',
'Repeat with the remaining butter and bread. Discard leftover raw egg mixture and wash the dish and tools.',
'Top the toast with washed @berries and the @maple. Serve two slices per person.'
]),
r('corn-cheddar-pancakes','Corn & cheddar pancakes','Small savory pancakes pair sweet corn with a little sharp cheddar.','North American','breakfast,lunch',10,15,4,0,0,2,
'flour|3/4|cup;eggs|1|large;milk|1/2|cup;corn|1/2|cup|thawed;cheddar|1/2|cup;bakingPowder|1|teaspoon;oil|2|teaspoons',[
'Mix the @flour and @bakingPowder in a bowl. Whisk the @eggs and @milk in another, then stir the wet mixture into the dry just until combined.',
'Fold in the @corn and @cheddar. Do not taste the raw batter.',
'Heat a large nonstick skillet on medium-low and brush with half the @oil. Spoon four small pancakes using half the batter. Cook 3–4 minutes per side until the centers reach 74°C/165°F.',
'Repeat with the remaining oil and batter. Serve four small pancakes per person; wash tools that touched raw batter.'
]),
r('pumpkin-breakfast-oats','Pumpkin breakfast oats','Pumpkin and cinnamon turn everyday oats into a warm, mild breakfast.','North American','breakfast',5,10,3,0,0,2,
'oats|1|cup;milk|1 1/2|cups;water|1/2|cup;pumpkin|1/2|cup;cinnamon|1/2|teaspoon;maple|1|tablespoon',[
'Combine the @oats, @milk and @water in a saucepan and bring to a gentle simmer.',
'Stir in the @pumpkin and @cinnamon. Cook on low for 7–8 minutes, stirring along the bottom until creamy.',
'Remove from heat and stir in the @maple.',
'Let stand for 1 minute, then spoon into two bowls. Keep the pot at a gentle simmer to prevent scorching.'
]),
r('white-bean-toast','White bean & tomato toast','Mashed lemony beans and chopped tomato sit on crunchy toast.','Mediterranean-inspired','breakfast,lunch',8,2,4,0,0,2,
'bread|4|slices;whiteBeans|1 1/2|cups;tomato|1|medium|diced;lemon|1|tablespoon;oil|1|tablespoon;parsley|2|tablespoons|chopped;pepper|1/8|teaspoon',[
'Toast the @bread until crisp.',
'Mash the @whiteBeans in a bowl with the @lemon, @oil and @pepper, leaving some texture.',
'Spread the bean mixture over the toast. Add the @tomato and @parsley.',
'Serve two slices per person immediately so the bread stays crunchy.'
]),
r('chickpea-crunch-wrap','Chickpea crunch wraps','Mashed chickpeas and tahini hold crunchy vegetables inside a soft wrap.','Mediterranean-inspired','lunch,wrap',15,0,4,0,0,2,
'tortilla|2|large;chickpeas|1 1/2|cups;tahini|1|tablespoon;lemon|1|tablespoon;water|1|tablespoon;carrot|1|medium|grated;lettuce|1|cup|shredded;pepper|1/8|teaspoon',[
'Mash the @chickpeas with a fork in a medium bowl.',
'Stir the @tahini, @lemon, @water and @pepper into the chickpeas until spreadable.',
'Spread down the center of each @tortilla and add the @carrot and @lettuce.',
'Fold the sides inward, roll tightly and cut in half. Serve cold promptly or refrigerate covered.'
]),
r('tuna-yogurt-pita','Tuna & yogurt pita pockets','A yogurt-bound tuna filling brings cucumber crunch to a quick pita lunch.','Café-style','lunch,sandwich',10,0,5,0,0,2,
'pita|2|medium;tuna|6|ounces|170 g drained;yogurt|1/4|cup;cucumber|1/2|medium|diced;dill|1|tablespoon|chopped;lemon|1|tablespoon;lettuce|2|leaves',[
'Flake the @tuna into a bowl. Stir in the @yogurt, @lemon and @dill.',
'Fold in the @cucumber, keeping the pieces small enough to fit inside the bread.',
'Halve the @pita and open each pocket gently. Line with torn @lettuce and spoon in the tuna filling.',
'Serve two filled halves per person, or keep covered and refrigerated until lunch.'
]),
r('hummus-vegetable-flatbread','Hummus vegetable flatbreads','Warm flatbread supports cool hummus and a chopped vegetable topping.','Mediterranean-inspired','lunch,flatbread',10,5,5,0,0,2,
'flatbread|2|medium;hummus|1/2|cup;cucumber|1/2|medium|diced;cherryTomato|1|cup|quartered;parsley|2|tablespoons|chopped;lemon|1|tablespoon',[
'Heat the oven to 375°F/190°C. Warm the @flatbread on a baking sheet for 5 minutes.',
'Toss the @cucumber, @cherryTomato, @parsley and @lemon in a bowl.',
'Spread the @hummus over the warm flatbread, leaving a border for holding.',
'Spoon the vegetables on top, cut into wedges and serve immediately.'
]),
r('black-bean-quesadilla','Black bean & cheddar quesadillas','Mashed beans keep a modest cheddar filling tucked inside crisp tortillas.','Tex-Mex-inspired','lunch,dinner',10,10,4,1,0,2,
'tortilla|2|large;blackBeans|1|cup;cheddar|1/2|cup;salsa|1/4|cup;cumin|1/4|teaspoon;oil|1|teaspoon',[
'Mash the @blackBeans with the @salsa and @cumin.',
'Spread the filling over half of each @tortilla, scatter with @cheddar and fold closed.',
'Brush a wide skillet with the @oil and heat on medium-low. Cook the folded tortillas for 3–4 minutes per side until golden and hot in the center.',
'Let stand for 1 minute before cutting into triangles. Serve one quesadilla per person.'
]),
r('sardine-lemon-toast','Sardine & lemon toast','Ready-to-eat sardines and chopped tomato make a savory open sandwich.','Portuguese-inspired','lunch,sandwich',8,2,5,0,1,2,
'bread|4|slices;sardines|6|ounces|170 g drained;tomato|1|medium|diced;lemon|1|tablespoon;parsley|2|tablespoons|chopped;pepper|1/8|teaspoon',[
'Toast the @bread until firm and crisp.',
'Gently separate the @sardines with a fork; remove any bones you do not want to eat.',
'Toss the @tomato with the @lemon, @parsley and @pepper.',
'Divide the sardines among the toast slices and spoon the tomato mixture over them. Serve promptly.'
]),
r('cucumber-edamame-rice','Cucumber-edamame rice bowls','Warm rice and edamame contrast with crisp cucumber and rice vinegar.','Japanese-inspired','lunch,bowl',5,10,5,0,1,2,
'edamame|1 1/2|cups;cookedRice|2|cups;cucumber|1/2|medium|diced;vinegar|1|tablespoon;tamari|2|teaspoons;sesame|1|teaspoon;water|3|cups',[
'Bring the @water to a boil and cook the @edamame for its package time, usually 4–5 minutes; drain.',
'Heat the @cookedRice according to its package until it reaches 74°C/165°F throughout.',
'Toss the @cucumber with the @vinegar and @tamari.',
'Divide the rice and edamame between bowls, add the dressed cucumber and finish with @sesame.'
]),
// Poultry, beef and seafood, 45–64.
r('sheet-pan-lemon-chicken','Sheet-pan lemon chicken','Chicken thighs roast beside small potato cubes and green beans.','Mediterranean-inspired','dinner',15,35,7,0,0,2,
'chickenThigh|12|ounces|340 g;potato|2|medium|450 g, 1/2-inch cubes;greenBeans|2|cups|trimmed;lemon|2|tablespoons;oil|1|tablespoon;oregano|1|teaspoon;salt|1/4|teaspoon',[
'Heat the oven to 425°F/220°C. Toss the @potato with half the @oil and half the @salt on a rimmed sheet pan.',
'Coat the @chickenThigh with the remaining oil and salt, @lemon and @oregano in a separate bowl. Place beside the potatoes; wash the raw chicken bowl and tools.',
'Roast for 20 minutes. Turn the potatoes and add the @greenBeans to the pan.',
'Roast for 10–15 minutes more until the potatoes are tender and each chicken piece reaches 74°C/165°F. Check the vegetables are cooked through where chicken juices touched them; serve using clean utensils.'
]),
r('chicken-pepper-skillet','Chicken & pepper skillet','Thin chicken strips and sweet peppers cook quickly with smoky spices.','Tex-Mex-inspired','dinner',10,20,7,1,0,2,
'chicken|12|ounces|340 g, 1/2-inch strips;bellPepper|2|medium|sliced;onion|1/2|medium|sliced;cornTortilla|6|small;oil|1|tablespoon;paprika|1|teaspoon;chili|1/4|teaspoon;lime|1|tablespoon',[
'Heat half the @oil in a wide skillet over medium-high. Cook the @bellPepper and @onion for 6 minutes, then transfer to a clean bowl.',
'Add the remaining oil, @chicken, @paprika and @chili. Cook for 7–9 minutes, turning, until each strip reaches 74°C/165°F.',
'Return the vegetables and stir for 1 minute. Remove from heat and add the @lime.',
'Warm the @cornTortilla in a dry skillet, keeping them covered as you work, and serve with the chicken mixture.'
]),
r('chicken-couscous','Chicken & parsley couscous','Small pieces of chicken and zucchini brighten quick-cooking couscous.','Mediterranean-inspired','dinner,bowl',10,20,6,0,0,2,
'chicken|10|ounces|285 g, 1/2-inch cubes;couscous|3/4|cup;broth|1|cup;zucchini|1|medium|diced;oil|1|tablespoon;lemon|1|tablespoon;parsley|1/4|cup|chopped',[
'Bring the @broth to a boil in a small saucepan. Stir in the @couscous, cover, remove from heat and leave for 5 minutes.',
'Heat the @oil in a skillet on medium-high. Add the @chicken and cook for 7–9 minutes, turning until all pieces reach 74°C/165°F. Move to a clean plate.',
'Cook the @zucchini in the same skillet for 4–5 minutes until tender. Return the cooked chicken for 1 minute.',
'Fluff the couscous with a fork and fold in the chicken, zucchini, @lemon and @parsley. Divide into two bowls.'
]),
r('turkey-spinach-pasta','Turkey & spinach tomato pasta','Ground turkey thickens a simple tomato sauce with wilted spinach.','Italian-inspired','dinner,pasta',10,20,6,0,0,2,
 'turkey|10|ounces|285 g;pasta|5|ounces|140 g;sauce|1 1/2|cups;spinach|2|cups;garlic|2|cloves|minced;oil|2|teaspoons;water|8|cups|1.9 L, for pasta',[
'Bring the @water to a boil and cook the @pasta according to its package; drain.',
'Heat the @oil in a deep skillet on medium. Add the @turkey and break it into pieces, cooking for 7–9 minutes until several thick portions reach 74°C/165°F.',
'Add the @garlic for 30 seconds, then the @sauce. Simmer for 5 minutes, stirring.',
'Fold in the @spinach until wilted, then toss in the drained pasta and serve hot.'
]),
r('turkey-bean-chili','Turkey & white bean chili','Turkey, white beans and corn make a mild, broth-based chili.','North American','dinner,soup',10,30,6,1,0,4,
 'turkey|1|pound|450 g;whiteBeans|3|cups;corn|1|cup;broth|2|cups;onion|1|medium|diced;cumin|1|teaspoon;chiliPowder|1|teaspoon;oil|1|tablespoon;lime|1|tablespoon',[
'Heat the @oil in a pot over medium heat. Cook the @onion for 5 minutes.',
'Add the @turkey and cook for 8–10 minutes, breaking it up, until it reaches 74°C/165°F in several thick portions.',
'Stir in the @cumin and @chiliPowder, then add the @whiteBeans, @corn and @broth. Simmer uncovered for 15 minutes, stirring occasionally.',
'Mash a few beans to thicken, stir in the @lime and ladle into four bowls.'
]),
r('ginger-beef-broccoli','Ginger beef & broccoli','Thin beef strips and broccoli share a ginger sauce over rice.','Chinese-inspired','dinner,bowl',10,20,9,0,1,2,
 'steak|12|ounces|340 g, thin strips;broccoli|3|cups;cookedRice|2|cups;tamari|1|tablespoon;ginger|2|teaspoons|grated;oil|1|tablespoon;water|1/4|cup',[
'Heat half the @oil in a wide skillet on medium-high. Add the @broccoli and @water; cover for 4 minutes, then transfer to a clean bowl.',
'Add the remaining oil and the @steak in a single layer. Cook for 3–5 minutes, turning. Check the thickest strips reach at least 63°C/145°F, then move to a clean plate and rest for 3 minutes.',
'Lower the heat to medium and stir the @ginger and @tamari in the skillet for 30 seconds. Return the vegetables and rested beef, tossing briefly to coat.',
'Heat the @cookedRice to 74°C/165°F according to its package and serve the beef and broccoli on top.'
]),
r('beef-bean-rice','Beef & bean tomato rice','Ground beef and black beans stretch into a hearty tomato rice bowl.','Tex-Mex-inspired','dinner,bowl',10,20,6,1,0,2,
'beef|8|ounces|225 g;blackBeans|1|cup;cookedRice|2|cups;cannedTomato|1|cup;onion|1/2|medium|diced;chiliPowder|1|teaspoon;oil|1|teaspoon',[
'Heat the @oil in a deep skillet on medium. Cook the @onion for 4 minutes.',
'Add the @beef, break it up and cook for 6–8 minutes until thick portions reach 71°C/160°F.',
'Stir in the @chiliPowder, @blackBeans and @cannedTomato; simmer for 5 minutes.',
'Fold in the @cookedRice and cook, stirring, for 3 minutes or until the rice reaches 74°C/165°F throughout. Serve in bowls.'
]),
r('beef-mushroom-barley','Beef, mushroom & barley pot','Ground beef and mushrooms cook with barley into a thick, warming pot meal.','North American','dinner,stew',10,50,7,0,0,4,
'beef|1|pound|450 g;barley|3/4|cup;mushroom|8|ounces|225 g, sliced;carrot|2|medium|diced;onion|1|medium|diced;broth|4|cups;water|1|cup;oil|1|tablespoon;thyme|1|teaspoon',[
'Heat the @oil in a heavy pot on medium. Add the @beef and cook for 8 minutes, breaking it apart until thick portions reach 71°C/160°F.',
'Add the @onion, @carrot and @mushroom and cook for 5 minutes, stirring.',
'Add the @barley, @thyme, @broth and @water. Bring to a simmer, cover and cook on low for 35–40 minutes, stirring occasionally, until the barley is tender.',
'Check the center is piping hot, then ladle into four bowls. Keep the pot at a gentle simmer so the barley does not catch.'
]),
r('turkey-lentil-meatballs','Turkey-lentil meatballs','Mashed lentils keep baked turkey meatballs tender in tomato sauce.','Italian-inspired','dinner',15,25,6,0,0,4,
 'turkey|1|pound|450 g;lentils|1|cup;breadcrumbs|1/3|cup;eggs|1|large;garlic|2|cloves|minced;oregano|1|teaspoon;sauce|2|cups;oil|1|teaspoon',[
'Heat the oven to 425°F/220°C. Grease a rimmed sheet pan with the @oil. Mash the @lentils thoroughly in a large bowl.',
'Mix in the @turkey, @breadcrumbs, @eggs, @garlic and @oregano just until combined. Shape into 16 equal meatballs; wash hands and raw-mixture tools.',
'Bake for 18–22 minutes until the centers of several meatballs reach 74°C/165°F, checking the largest ones.',
'Heat the @sauce in a saucepan until simmering. Fold in the cooked meatballs and simmer for 2 minutes. Serve four per person with sauce.'
]),
r('chicken-noodle-soup','Chicken & noodle soup','Small chicken pieces, vegetables and noodles make a straightforward soup.','North American','lunch,dinner,soup',10,25,6,0,0,4,
'chicken|1|pound|450 g, 1/2-inch cubes;pasta|4|ounces|115 g, small shapes;carrot|2|medium|diced;celery|2|stalks|diced;onion|1|medium|diced;broth|5|cups;water|1|cup;oil|1|tablespoon;thyme|1/2|teaspoon',[
'Heat the @oil in a pot on medium and soften the @carrot, @celery and @onion for 5 minutes.',
'Add the @broth, @water and @thyme and bring to a boil. Lower to a steady simmer.',
'Add the @chicken and simmer for 5 minutes, then add the @pasta. Continue simmering for its package time, usually 8–10 minutes, until tender and several chicken pieces reach 74°C/165°F.',
'Stir from the bottom, check the vegetables are tender and divide the soup among four bowls.'
]),
r('lemon-cod-potatoes','Lemon cod & smashed potatoes','Gently baked cod pairs with fork-smashed potatoes and green beans.','Atlantic-inspired','dinner',10,25,10,0,0,2,
'cod|12|ounces|340 g, two fillets;potato|2|medium|450 g, 1-inch chunks;greenBeans|2|cups;lemon|2|tablespoons;oil|1|tablespoon;parsley|2|tablespoons|chopped;water|6|cups;salt|1/4|teaspoon',[
'Heat the oven to 400°F/200°C. Place the @potato and @water in a pot, bring to a boil and simmer for 15–18 minutes until tender. Add the @greenBeans for the final 4 minutes; drain.',
'Put the @cod in a small baking dish. Drizzle with half the @oil and half the @lemon, and sprinkle with half the @salt.',
'Bake for 12–18 minutes, depending on thickness, until each fillet reaches 70°C/158°F in its center.',
'Remove the green beans from the pot, then roughly mash the potatoes with the remaining oil, lemon and salt. Serve with the fish, beans and @parsley.'
]),
r('maple-mustard-salmon','Maple-mustard salmon','A thin maple-mustard coating brightens salmon beside roasted broccoli.','Canadian-inspired','dinner',10,20,11,0,0,2,
 'salmon|12|ounces|340 g, two fillets;broccoli|3|cups;mustard|1|tablespoon;maple|2|teaspoons;oil|2|teaspoons;cookedRice|2|cups',[
'Heat the oven to 425°F/220°C. Toss the @broccoli with the @oil on one side of a rimmed sheet pan.',
'Mix the @mustard and @maple in a small bowl. Set the @salmon on the other side and spread with the glaze; wash any utensil that touched raw fish.',
'Roast for 15–20 minutes, turning the broccoli once, until the center of each fillet reaches 70°C/158°F and the broccoli is tender.',
'Heat the @cookedRice to 74°C/165°F according to its package. Serve with the salmon and broccoli.'
]),
r('dill-trout-skillet','Dill trout with warm peas','Pan-cooked trout gets a lemon-dill finish with rice and warm peas.','Canadian-inspired','dinner',10,15,11,0,1,2,
 'trout|12|ounces|340 g, two fillets;peas|1 1/2|cups;cookedRice|2|cups;dill|2|tablespoons|chopped;lemon|1|tablespoon;oil|2|teaspoons;water|1/4|cup',[
'Heat the @oil in a nonstick skillet over medium. Add the @trout skin-side down and cook for 4 minutes.',
'Turn carefully and cook for 3–6 minutes more until both centers reach 70°C/158°F. Move to clean plates.',
'Add the @peas and @water to the skillet. Cover for 3 minutes, then stir in the @dill and @lemon.',
'Heat the @cookedRice to 74°C/165°F according to its package and serve beside the fish and peas.'
]),
r('tomato-shrimp-pasta','Tomato shrimp pasta','Shrimp finish in a quick tomato sauce before being tossed with pasta.','Italian-inspired','dinner,pasta',10,20,9,1,0,2,
 'shrimp|10|ounces|285 g;pasta|6|ounces|170 g;cannedTomato|1 1/2|cups;garlic|2|cloves|minced;oil|1|tablespoon;chili|1/4|teaspoon;parsley|2|tablespoons|chopped;water|8|cups|1.9 L, for boiling',[
'Boil the @water and cook the @pasta according to its package, then drain.',
'Heat the @oil in a wide skillet on medium-low. Stir the @garlic and @chili for 30 seconds, then add the @cannedTomato and simmer for 8 minutes.',
'Add the @shrimp in one layer. Simmer for 4–6 minutes, turning halfway, until several of the thickest shrimp reach 74°C/165°F.',
'Toss in the drained pasta and @parsley. Use clean serving utensils and serve hot.'
]),
r('shrimp-corn-polenta','Shrimp & corn polenta','Sweet corn softens creamy polenta underneath lemony shrimp.','Southern US-inspired','dinner,bowl',10,20,9,0,1,2,
 'shrimp|12|ounces|340 g;polenta|1/2|cup;corn|1|cup;milk|1|cup;water|1 1/2|cups;oil|2|teaspoons;paprika|1/2|teaspoon;lemon|1|tablespoon;salt|1/4|teaspoon',[
'Bring the @milk, @water, @salt and @corn to a simmer. Whisk in the @polenta and cook on low for its package time, stirring until creamy.',
'Heat the @oil in a skillet on medium-high. Add the @shrimp and @paprika.',
'Cook for 4–6 minutes, turning, until the thickest shrimp reach 74°C/165°F. Remove from heat and stir in the @lemon.',
'Divide the hot polenta between bowls and spoon the shrimp and cooked pan juices over it.'
]),
r('salmon-white-bean-skillet','Salmon & white bean skillet','White beans and spinach surround tender salmon in a light tomato base.','Mediterranean-inspired','dinner',10,20,10,0,1,2,
 'salmon|12|ounces|340 g, two fillets;whiteBeans|1 1/2|cups;cannedTomato|1|cup;spinach|2|cups;garlic|2|cloves|minced;oil|2|teaspoons;water|1/4|cup;lemon|1|tablespoon',[
'Heat the @oil in a deep skillet over medium-low. Add the @garlic for 30 seconds, then the @cannedTomato, @whiteBeans and @water. Simmer for 4 minutes.',
'Nestle the @salmon into the beans, cover and simmer gently for 10–14 minutes until each fillet reaches 70°C/158°F.',
'Transfer the fish to clean plates. Fold the @spinach into the beans and cook for 2 minutes until wilted.',
'Stir in the @lemon and spoon the beans beside the salmon.'
]),
r('tuna-pea-pasta','Tuna & pea lemon pasta','Tuna and peas turn a modest portion of pasta into a filling dinner.','Italian-inspired','dinner,pasta',5,15,5,0,0,2,
 'tuna|6|ounces|170 g drained;pasta|6|ounces|170 g;peas|1|cup;lemon|2|tablespoons;oil|1|tablespoon;parsley|2|tablespoons|chopped;water|8|cups|1.9 L, for boiling;pepper|1/8|teaspoon',[
'Bring the @water to a boil and add the @pasta. Cook for the package time, adding the @peas for the final 3 minutes.',
'Reserve 1/4 cup cooking water, then drain the pasta and peas.',
'Return to the pot on low heat with the flaked @tuna, @oil, @lemon and @pepper. Add the reserved water and toss for 2 minutes until hot throughout.',
'Fold in the @parsley and serve immediately.'
]),
r('chicken-apple-salad','Chicken & apple chopped salad','Cold ready-cooked chicken, apple and walnuts make a crunchy yogurt-dressed lunch.','North American','lunch,salad',15,0,7,0,0,2,
 'cookedChicken|8|ounces|225 g, diced;apple|1|medium|diced;celery|2|stalks|thinly sliced;walnuts|1/4|cup|chopped;yogurt|1/3|cup;lemon|1|tablespoon;lettuce|4|cups|chopped',[
'Whisk the @yogurt and @lemon in a large bowl.',
'Fold in the chilled @cookedChicken, @apple and @celery. Use ready-to-eat chicken that has been kept refrigerated.',
'Divide the @lettuce between plates and spoon the dressed mixture over it.',
'Sprinkle with the @walnuts and serve cold promptly, or cover and refrigerate.'
]),
r('turkey-cabbage-rice','Turkey & cabbage rice skillet','Cabbage softens around ground turkey and rice in a ginger-tamari skillet.','East Asian-inspired','dinner,bowl',10,20,6,1,1,2,
 'turkey|12|ounces|340 g;cabbage|3|cups|thinly shredded;cookedRice|2|cups;ginger|2|teaspoons|grated;tamari|1|tablespoon;chili|1/4|teaspoon;oil|2|teaspoons;water|1/4|cup',[
'Heat the @oil in a wide skillet over medium. Add the @turkey and cook for 8–10 minutes, breaking it up, until thick portions reach 74°C/165°F.',
'Add the @cabbage, @ginger and @water. Cover and cook for 4 minutes until the cabbage softens.',
'Uncover and stir in the @cookedRice, @tamari and @chili. Cook for 3–4 minutes, turning the mixture until the rice reaches 74°C/165°F.',
'Divide between two bowls and serve hot.'
]),
r('beef-zucchini-tomato','Beef & zucchini tomato skillet','Ground beef and zucchini make a chunky sauce for warm brown rice.','Mediterranean-inspired','dinner,bowl',10,20,7,0,0,2,
 'beef|10|ounces|285 g;zucchini|1|large|1/2-inch dice;cannedTomato|1 1/2|cups;brownRice|2|cups;garlic|2|cloves|minced;oregano|1/2|teaspoon;oil|1|teaspoon',[
'Heat the @oil in a skillet on medium. Add the @beef and cook for 7–9 minutes, breaking it apart, until thick portions reach 71°C/160°F.',
'Add the @zucchini and cook for 4 minutes. Stir in the @garlic and @oregano for 30 seconds.',
'Add the @cannedTomato and simmer for 5 minutes until the zucchini is tender.',
'Heat the @brownRice according to its package to 74°C/165°F. Divide into bowls and spoon over the beef mixture.'
]),
// Plant-centered dinners, 65–84.
r('red-lentil-tomato-soup','Red lentil & tomato soup','Split lentils soften into a thick soup with tomato and cumin.','West Asian-inspired','lunch,dinner,soup',10,25,3,1,1,4,
 'redLentils|1|cup;cannedTomato|2|cups;broth|4|cups;carrot|2|medium|small dice;onion|1|medium|diced;cumin|1|teaspoon;chili|1/4|teaspoon;oil|1|tablespoon;lemon|1|tablespoon',[
'Heat the @oil in a pot on medium. Soften the @onion and @carrot for 5 minutes.',
'Stir in the @cumin and @chili, then add the @redLentils, @cannedTomato and @broth.',
'Bring to a simmer and cook partly covered for 18–20 minutes, stirring often, until the lentils break down and the carrots are tender.',
'Stir in the @lemon and ladle into four bowls. The soup thickens as it stands.'
]),
r('mushroom-white-bean-stew','Mushroom & white bean stew','Browned mushrooms and creamy beans make a thyme-scented pot supper.','European-inspired','dinner,stew',10,25,5,0,0,2,
 'mushroom|12|ounces|340 g, thickly sliced;whiteBeans|2|cups;broth|1 1/2|cups;onion|1/2|medium|diced;garlic|2|cloves|minced;thyme|1/2|teaspoon;oil|1|tablespoon;parsley|2|tablespoons|chopped',[
'Heat the @oil in a wide pot on medium-high. Add the @mushroom and cook for 8 minutes, stirring occasionally until browned.',
'Add the @onion and cook for 4 minutes. Stir in the @garlic and @thyme for 30 seconds.',
'Add the @whiteBeans and @broth. Simmer for 10 minutes, mashing a scoop of beans against the pot to thicken.',
'Fold in the @parsley and serve in two deep bowls.'
]),
r('sweet-potato-lentil-curry','Sweet potato & lentil curry','Small sweet-potato cubes and red lentils soften in a coconut curry sauce.','Indian-inspired','dinner,curry',10,30,4,1,1,4,
 'sweetPotato|1|large|340 g, 1/2-inch cubes;redLentils|1|cup;coconutMilk|1|cup;broth|3|cups;spinach|3|cups;curry|2|teaspoons;onion|1|medium|diced;oil|1|tablespoon',[
'Heat the @oil in a pot on medium. Cook the @onion for 5 minutes, then stir in the @curry for 20 seconds.',
'Add the @sweetPotato, @redLentils, @coconutMilk and @broth. Bring to a simmer.',
'Cook partly covered on low for 20–25 minutes, stirring often, until the lentils are soft and the sweet potato yields to a fork.',
'Fold in the @spinach for 2 minutes until wilted, then divide among four bowls.'
]),
r('peanut-tofu-noodles','Spicy peanut tofu noodles','Seared tofu and rice noodles get a smooth peanut-tamari coating.','Southeast Asian-inspired','dinner,noodles',10,15,5,2,1,2,
 'tofu|10|ounces|285 g, 3/4-inch cubes;noodles|5|ounces|140 g;peanutButter|2|tablespoons;tamari|1|tablespoon;lime|1|tablespoon;carrot|1|medium|grated;oil|2|teaspoons;chili|3/4|teaspoon;water|6|cups|plus 1/4 cup for sauce',[
'Boil the 6 cups of @water and cook the @noodles for their package time, then drain.',
'Heat the @oil in a nonstick skillet on medium-high. Cook the @tofu for 7–9 minutes, turning until golden.',
'Whisk the @peanutButter, @tamari, @lime, @chili and remaining 1/4 cup water. Add to the tofu with the @carrot and simmer for 1 minute.',
'Fold in the drained noodles with tongs, coating them evenly, and serve hot.'
]),
r('miso-mushroom-noodles','Miso mushroom noodle bowls','Mushrooms and tofu fill a light miso broth with rice noodles.','Japanese-inspired','dinner,soup,noodles',10,15,6,0,1,2,
 'mushroom|8|ounces|225 g, sliced;tofu|8|ounces|225 g, cubes;noodles|4|ounces|115 g;broth|3|cups;water|1|cup;miso|1 1/2|tablespoons;scallion|2|stalks|sliced;oil|1|teaspoon',[
'Heat the @oil in a saucepan on medium-high and cook the @mushroom for 5 minutes.',
'Add the @broth and @water. Bring to a simmer, then add the @tofu and @noodles. Cook for the noodle package time, stirring gently.',
'Scoop a little hot broth into a cup and whisk in the @miso. Remove the pot from the heat and stir the dissolved miso back in.',
'Divide between two deep bowls and top with the @scallion. Serve hot without boiling again.'
]),
r('roasted-cauliflower-chickpeas','Roasted cauliflower & chickpeas','Roasted cauliflower and chickpeas sit over quinoa with a lemon dressing.','Mediterranean-inspired','dinner,bowl',10,30,5,0,1,2,
 'cauliflower|4|cups;chickpeas|1 1/2|cups;quinoa|1/2|cup;water|1|cup;oil|1|tablespoon;paprika|1|teaspoon;lemon|2|tablespoons;parsley|1/4|cup|chopped;salt|1/4|teaspoon',[
'Heat the oven to 425°F/220°C. Toss the @cauliflower and @chickpeas with the @oil, @paprika and @salt on a sheet pan.',
'Roast for 25–30 minutes, turning halfway, until the cauliflower is tender and browned.',
'Meanwhile bring the @quinoa and @water to a boil, cover and cook on low for 15 minutes, then rest off heat for 5 minutes.',
'Divide the quinoa between bowls. Add the roasted mixture and finish with the @lemon and @parsley.'
]),
r('eggplant-chickpea-tomato','Eggplant & chickpea tomato pot','Tender eggplant and chickpeas simmer in a garlic-tomato sauce.','West Asian-inspired','dinner,stew',15,30,5,1,1,2,
 'eggplant|1|medium|about 450 g, 3/4-inch cubes;chickpeas|1 1/2|cups;cannedTomato|2|cups;garlic|3|cloves|minced;cumin|1|teaspoon;chili|1/4|teaspoon;oil|2|tablespoons;water|1/2|cup',[
'Heat the @oil in a wide heavy pot on medium. Add the @eggplant and cook for 8 minutes, turning so several sides brown.',
'Stir in the @garlic, @cumin and @chili for 30 seconds.',
'Add the @cannedTomato, @water and @chickpeas. Cover and simmer on low for 18–20 minutes, stirring occasionally, until the eggplant is soft all the way through.',
'Uncover and simmer for 2 minutes to thicken. Serve in deep bowls.'
]),
r('black-bean-sweet-potato-chili','Black bean & sweet potato chili','Sweet potato balances a tomato chili with black beans and corn.','Tex-Mex-inspired','dinner,soup',10,30,4,1,0,4,
 'blackBeans|3|cups;sweetPotato|1|large|340 g, 1/2-inch cubes;cannedTomato|3|cups;corn|1|cup;broth|1 1/2|cups;onion|1|medium|diced;chiliPowder|2|teaspoons;oil|1|tablespoon',[
'Heat the @oil in a pot on medium and cook the @onion for 5 minutes.',
'Stir in the @chiliPowder, then the @sweetPotato, @cannedTomato and @broth. Cover and simmer for 15 minutes.',
'Add the @blackBeans and @corn. Simmer uncovered for 10 minutes until the sweet potato is tender, stirring from the bottom.',
'Mash a few pieces of sweet potato into the sauce and divide among four bowls.'
]),
r('lemon-pea-risotto','Lemon & pea risotto-style rice','Slowly stirred rice becomes creamy with peas and a lemon finish.','Italian-inspired','dinner,rice',5,30,4,0,1,2,
 'rice|3/4|cup;peas|1|cup;broth|3|cups;onion|1/2|medium|finely diced;oil|1|tablespoon;lemon|1|tablespoon;parsley|2|tablespoons|chopped',[
'Heat the @broth to a simmer in a small saucepan and keep warm.',
'Heat the @oil in another saucepan on medium-low. Cook the @onion for 4 minutes, then stir the @rice for 1 minute.',
'Add the warm broth a half cup at a time, stirring often and allowing each addition to mostly absorb. Continue for 20–25 minutes until the rice is tender; add the @peas with the final broth addition.',
'Remove from heat, stir in the @lemon and @parsley and serve while loose and creamy.'
]),
r('broccoli-cheddar-pasta','Broccoli & cheddar pasta','A simple milk-and-cheese sauce coats pasta and tender broccoli.','North American','dinner,pasta',10,20,5,0,0,2,
 'pasta|6|ounces|170 g;broccoli|2|cups;milk|3/4|cup;cheddar|3/4|cup;flour|1|tablespoon;butter|1|tablespoon;water|8|cups|1.9 L, for boiling;pepper|1/8|teaspoon',[
'Boil the @water and cook the @pasta for its package time, adding the @broccoli for the last 3 minutes. Drain.',
'Melt the @butter in a saucepan on medium-low. Stir in the @flour and cook for 1 minute without browning.',
'Whisk in the @milk gradually and simmer for 3–4 minutes until thickened. Remove from heat and stir in the @cheddar and @pepper until melted.',
'Fold the drained pasta and broccoli into the sauce and serve immediately.'
]),
r('spinach-ricotta-pasta','Spinach & ricotta pasta','Ricotta and a little cooking water make a gentle sauce for spinach pasta.','Italian-inspired','dinner,pasta',5,15,5,0,0,2,
 'pasta|6|ounces|170 g;ricotta|3/4|cup;spinach|3|cups;lemon|1|tablespoon;pepper|1/8|teaspoon;water|8|cups|1.9 L, for boiling',[
'Boil the @water and cook the @pasta according to its package. Reserve 1/2 cup cooking water before draining.',
'Return the pasta to the pot on low. Add the @spinach and 1/4 cup reserved water, stirring for 2 minutes until wilted.',
'Fold in the @ricotta, @lemon and @pepper. Add the remaining reserved water gradually until the sauce coats the pasta.',
'Warm gently for 1 minute without boiling, then serve in two bowls.'
]),
r('tomato-white-bean-pasta','Tomato & white bean pasta','White beans give a garlicky tomato pasta extra body and texture.','Italian-inspired','dinner,pasta',10,20,4,0,0,2,
 'pasta|5|ounces|140 g;whiteBeans|1 1/2|cups;cannedTomato|1 1/2|cups;garlic|2|cloves|minced;oil|1|tablespoon;basil|1/4|cup|torn;water|8|cups|1.9 L, for boiling',[
'Bring the @water to a boil and cook the @pasta for its package time; drain.',
'Warm the @oil in a skillet on medium-low and stir the @garlic for 30 seconds.',
'Add the @cannedTomato and @whiteBeans. Simmer for 10 minutes, mashing a few beans to thicken the sauce.',
'Toss in the drained pasta and @basil, heat for 1 minute and serve.'
]),
r('lentil-tomato-pasta','Lentil tomato pasta','Ready-cooked lentils thicken a vegetable-rich pasta sauce.','Italian-inspired','dinner,pasta',10,20,4,0,0,2,
 'pasta|5|ounces|140 g;lentils|1 1/2|cups;cannedTomato|1 1/2|cups;carrot|1|medium|finely grated;onion|1/2|medium|diced;oil|1|tablespoon;oregano|1|teaspoon;water|8|cups|1.9 L, for boiling',[
'Boil the @water and cook the @pasta for its package time, then drain.',
'Heat the @oil in a skillet on medium and soften the @onion and @carrot for 5 minutes.',
'Add the @lentils, @cannedTomato and @oregano. Simmer for 10 minutes, stirring occasionally, until thick enough to coat a spoon.',
'Toss in the pasta and heat for 1 minute. Divide between two bowls.'
]),
r('ginger-edamame-fried-rice','Ginger edamame fried rice','Edamame and peas add color to a ginger-scented rice skillet.','East Asian-inspired','dinner,rice',5,15,4,0,0,2,
 'cookedRice|2|cups;edamame|1|cup;peas|1/2|cup;carrot|1|medium|small dice;ginger|2|teaspoons|grated;tamari|1|tablespoon;oil|2|teaspoons;water|3|cups',[
'Boil the @water and cook the @edamame for its package time, adding the @peas for the final 3 minutes; drain.',
'Heat the @oil in a wide skillet on medium-high and cook the @carrot for 4 minutes until nearly tender.',
'Add the @ginger for 30 seconds, then the @cookedRice, @tamari and drained vegetables.',
'Stir-fry for 4–5 minutes, breaking up rice clumps, until the rice reaches 74°C/165°F throughout. Serve hot.'
]),
r('crispy-tofu-pepper-rice','Crispy tofu & pepper rice','Pan-browned tofu and soft peppers get a sharp rice-vinegar finish.','East Asian-inspired','dinner,bowl',10,20,5,1,1,2,
 'tofu|12|ounces|340 g, 3/4-inch cubes;bellPepper|2|medium|sliced;cookedRice|2|cups;tamari|1|tablespoon;vinegar|1|tablespoon;chili|1/4|teaspoon;oil|1|tablespoon',[
'Heat the @oil in a large nonstick skillet on medium-high. Add the @tofu in one layer and cook for 8–10 minutes, turning twice.',
'Add the @bellPepper and cook for 5 minutes, stirring gently.',
'Stir in the @tamari, @vinegar and @chili and cook for 1 minute until the liquid coats the tofu.',
'Heat the @cookedRice according to its package to 74°C/165°F throughout and serve with the skillet mixture.'
]),
r('coconut-red-lentil-rice','Coconut red lentils with rice','Creamy split lentils and spinach make a mild topping for warm rice.','South Asian-inspired','dinner,bowl',10,25,4,0,1,2,
 'redLentils|3/4|cup;coconutMilk|1/2|cup;water|2|cups;cookedRice|2|cups;spinach|2|cups;turmeric|1/2|teaspoon;ginger|2|teaspoons|grated;salt|1/4|teaspoon',[
'Combine the @redLentils, @water, @turmeric and @ginger in a saucepan. Bring to a simmer.',
'Cook partly covered on low for 18–20 minutes, stirring often until the lentils are very soft.',
'Stir in the @coconutMilk, @salt and @spinach and simmer for 3 minutes until creamy.',
'Heat the @cookedRice according to its package to 74°C/165°F and spoon the lentils over it.'
]),
r('zucchini-chickpea-couscous','Zucchini & chickpea couscous','Tender zucchini and chickpeas mix into fluffy couscous with parsley.','North African-inspired','lunch,dinner,bowl',10,15,4,0,1,2,
 'couscous|3/4|cup;broth|1|cup;chickpeas|1 1/2|cups;zucchini|1|medium|diced;oil|1|tablespoon;cumin|1/2|teaspoon;lemon|1|tablespoon;parsley|1/4|cup|chopped',[
'Bring the @broth to a boil. Stir in the @couscous, cover and leave off heat for 5 minutes.',
'Heat the @oil in a skillet over medium and cook the @zucchini for 6 minutes until tender.',
'Stir in the @cumin and @chickpeas and heat for 3 minutes, turning gently.',
'Fluff the couscous and fold in the warm mixture, @lemon and @parsley. Divide into two bowls.'
]),
r('roasted-squash-lentils','Roasted squash & lentils','Sweet squash and earthy lentils meet a lemon-olive oil dressing.','Mediterranean-inspired','dinner,bowl',15,30,5,0,1,2,
 'squash|4|cups|peeled, seeded, 3/4-inch cubes;lentils|2|cups;oil|1 1/2|tablespoons;lemon|2|tablespoons;parsley|1/4|cup|chopped;water|2|tablespoons;cumin|1/2|teaspoon;salt|1/4|teaspoon',[
'Heat the oven to 425°F/220°C. Toss the @squash with 1 tablespoon @oil, the @cumin and @salt. Roast on a sheet pan for 25–30 minutes, turning halfway, until tender.',
'Put the @lentils and @water in a covered microwave-safe bowl and heat, stirring halfway, until 74°C/165°F throughout.',
'Whisk the remaining oil with the @lemon and @parsley.',
'Divide the warm lentils and roasted squash between bowls and spoon over the dressing.'
]),
r('tomato-lentil-stuffed-zucchini','Tomato-lentil stuffed zucchini','Baked zucchini boats hold a thick lentil filling under melted mozzarella.','Italian-inspired','dinner',15,30,5,0,1,2,
 'zucchini|2|large;lentils|1 1/2|cups;sauce|1|cup;mozzarella|1/2|cup;oil|1|teaspoon;oregano|1/2|teaspoon',[
'Heat the oven to 400°F/200°C. Halve the @zucchini lengthwise and scoop out the soft centers with a spoon, leaving 1/4-inch walls. Chop the scooped flesh.',
'Brush a baking dish with the @oil. Mix the chopped flesh with the @lentils, @sauce and @oregano, then spoon into the zucchini halves.',
'Cover with foil and bake for 20 minutes. Uncover, scatter over the @mozzarella and bake for 10 minutes more.',
'Check the zucchini is fork-tender and the filling reaches 74°C/165°F. Serve two halves per person.'
]),
r('baked-mushroom-rice','Baked mushroom rice','Rice absorbs mushroom broth in a covered oven dish with thyme.','European-inspired','dinner,rice',10,45,4,0,0,2,
 'rice|3/4|cup;mushroom|12|ounces|340 g, sliced;whiteBeans|1 1/2|cups;broth|1 3/4|cups;onion|1/2|medium|diced;oil|1|tablespoon;thyme|1/2|teaspoon',[
'Heat the oven to 375°F/190°C. Heat the @oil in an oven-safe pot on medium-high and brown the @mushroom and @onion for 8 minutes.',
'Stir in the @rice and @thyme for 1 minute, then add the @broth and @whiteBeans. Bring to a simmer.',
'Cover tightly and bake for 30 minutes until the rice is tender and the liquid absorbed. Keep the lid on while cooking.',
'Rest covered off heat for 5 minutes, then fluff gently and divide between bowls.'
]),
// Soups, salads and lighter choices, 85–100.
r('minestrone-bean-pot','Vegetable & bean minestrone','Small pasta shapes and white beans fill a chunky vegetable soup.','Italian-inspired','lunch,dinner,soup',15,30,4,0,0,4,
 'whiteBeans|3|cups;pasta|3|ounces|85 g, small shapes;carrot|2|medium|diced;celery|2|stalks|diced;zucchini|1|medium|diced;cannedTomato|2|cups;broth|5|cups;oil|1|tablespoon;oregano|1|teaspoon',[
'Heat the @oil in a large pot on medium. Cook the @carrot and @celery for 5 minutes.',
'Add the @cannedTomato, @broth and @oregano. Bring to a simmer and cook for 10 minutes.',
'Add the @pasta, @whiteBeans and @zucchini. Simmer for the pasta package time, usually 8–10 minutes, stirring occasionally.',
'Check the pasta and vegetables are tender. Divide among four bowls and serve hot.'
]),
r('carrot-ginger-lentil-soup','Carrot-ginger lentil soup','Finely chopped carrots and split lentils make a thick ginger-scented soup.','Everyday plant-based','lunch,dinner,soup',10,25,3,0,1,4,
 'carrot|4|medium|small dice;redLentils|1|cup;ginger|1|tablespoon|grated;onion|1|medium|diced;broth|4|cups;coconutMilk|1/2|cup;oil|1|tablespoon',[
'Heat the @oil in a pot over medium and cook the @onion for 4 minutes. Add the @ginger for 30 seconds.',
'Add the @carrot, @redLentils and @broth and bring to a simmer.',
'Cook partly covered for 20 minutes, stirring frequently, until the lentils break down and the carrots are very tender.',
'Stir in the @coconutMilk and heat for 1 minute. Mash lightly with a potato masher for a thicker texture and serve.'
]),
r('potato-corn-chowder','Potato & corn chowder','Tender potato cubes thicken a simple milk-based corn soup.','North American','lunch,dinner,soup',10,25,4,0,0,4,
 'potato|3|medium|675 g, 1/2-inch cubes;corn|2|cups;milk|2|cups;broth|2|cups;onion|1|medium|diced;butter|1|tablespoon;thyme|1/2|teaspoon;pepper|1/4|teaspoon',[
'Melt the @butter in a pot on medium-low. Cook the @onion for 5 minutes.',
'Add the @potato, @broth and @thyme. Cover and simmer for 12–15 minutes until the potatoes are tender.',
'Mash a third of the potatoes against the pot. Stir in the @corn, @milk and @pepper.',
'Heat gently for 5 minutes, stirring and avoiding a hard boil, until steaming throughout. Serve in four bowls.'
]),
r('black-bean-lime-soup','Spicy black bean & lime soup','Mashed black beans give this cumin-scented soup a thick texture.','Latin American-inspired','lunch,dinner,soup',10,20,4,2,1,4,
 'blackBeans|3|cups;broth|2|cups;cannedTomato|1 1/2|cups;onion|1|medium|diced;garlic|2|cloves|minced;cumin|1|teaspoon;chili|1|teaspoon;lime|2|tablespoons;oil|1|tablespoon',[
'Heat the @oil in a pot on medium and cook the @onion for 5 minutes.',
'Stir in the @garlic, @cumin and @chili for 30 seconds. Add the @blackBeans, @broth and @cannedTomato.',
'Simmer for 12–15 minutes, then mash some beans with a potato masher while leaving the rest whole.',
'Stir in the @lime, remove from heat and divide among four bowls.'
]),
r('quinoa-cucumber-salad','Quinoa cucumber salad','Cooled quinoa and chickpeas carry a fresh lemon-parsley dressing.','Mediterranean-inspired','lunch,salad',10,20,5,0,1,2,
 'quinoa|1/2|cup;water|1|cup;chickpeas|1 1/2|cups;cucumber|1/2|medium|diced;tomato|1|medium|diced;parsley|1/3|cup|chopped;lemon|2|tablespoons;oil|1|tablespoon',[
'Bring the @quinoa and @water to a boil. Cover, cook on low for 15 minutes, then rest off heat for 5 minutes.',
'While it cooks, whisk the @lemon and @oil in a large bowl and fold in the @chickpeas, @cucumber, @tomato and @parsley.',
'Fluff the quinoa, spread on a clean plate for 2 minutes to release steam, then fold into the salad.',
'Serve slightly warm immediately, or refrigerate in shallow covered containers promptly for a cold salad later.'
]),
r('orange-lentil-salad','Orange & lentil salad','Orange pieces bring sweetness to a lentil salad with crunchy cabbage.','Mediterranean-inspired','lunch,salad',15,0,4,0,1,2,
 'lentils|2|cups;orange|1|cup;cabbage|1 1/2|cups|finely shredded;parsley|1/4|cup|chopped;lemon|1|tablespoon;oil|1|tablespoon;pepper|1/8|teaspoon',[
'Cut the @orange into bite-size pieces, removing seeds and collecting any juice in a bowl.',
'Whisk the @lemon, @oil and @pepper into the collected juice.',
'Fold in the chilled @lentils, @cabbage, @parsley and orange pieces.',
'Divide between two bowls and serve cold. Refrigerate promptly if making ahead.'
]),
r('warm-potato-bean-salad','Warm potato & green bean salad','Small potatoes and green beans get a mustard dressing while still warm.','French-inspired','lunch,salad,side',10,20,4,0,1,2,
 'potato|2|medium|450 g, 1-inch cubes;greenBeans|2|cups|trimmed;whiteBeans|1|cup;mustard|2|teaspoons;lemon|1|tablespoon;oil|1|tablespoon;dill|1|tablespoon|chopped;water|6|cups',[
'Put the @potato and @water in a pot. Bring to a boil and simmer for 12–15 minutes until tender, adding the @greenBeans for the last 4 minutes.',
'Whisk the @mustard, @lemon, @oil and @dill in a large bowl.',
'Drain the vegetables well and fold into the dressing with the @whiteBeans while warm.',
'Divide between two plates. Serve promptly, or cool in shallow containers in the refrigerator.'
]),
r('roasted-broccoli-quinoa','Roasted broccoli quinoa bowls','Roasted broccoli, chickpeas and tahini make a simple quinoa supper.','Everyday plant-based','dinner,bowl',10,25,5,0,0,2,
 'broccoli|4|cups;chickpeas|1 1/2|cups;quinoa|1/2|cup;water|1|cup|plus 2 tablespoons for dressing;tahini|2|tablespoons;lemon|1|tablespoon;oil|2|teaspoons;salt|1/4|teaspoon',[
'Heat the oven to 425°F/220°C. Toss the @broccoli and @chickpeas with the @oil and @salt on a sheet pan. Roast for 20–25 minutes, turning halfway.',
'Bring the @quinoa and 1 cup @water to a boil. Cover, cook on low for 15 minutes and rest off heat for 5 minutes.',
'Whisk the @tahini, @lemon and remaining 2 tablespoons water until smooth.',
'Divide the quinoa and roasted mixture between bowls and spoon the dressing over them.'
]),
r('cabbage-peanut-slaw-bowl','Cabbage & peanut slaw bowls','Peanut dressing pulls together cabbage, carrots and warm edamame.','Southeast Asian-inspired','lunch,salad,bowl',10,5,5,1,1,2,
 'cabbage|3|cups|finely shredded;carrot|1|medium|grated;edamame|1 1/2|cups;peanutButter|2|tablespoons;lime|2|tablespoons;tamari|2|teaspoons;chili|1/4|teaspoon;water|3|cups|plus 2 tablespoons for dressing',[
'Bring the 3 cups @water to a boil and cook the @edamame for its package time, usually 4–5 minutes; drain.',
'Whisk the @peanutButter, @lime, @tamari, @chili and remaining 2 tablespoons water in a large bowl.',
'Add the @cabbage and @carrot and toss until evenly coated.',
'Fold in the warm edamame and serve in two bowls. Refrigerate promptly if saving for later.'
]),
r('asparagus-pea-frittata','Asparagus & pea frittata','A small oven-finished frittata holds green vegetables and cheddar.','Italian-inspired','breakfast,lunch,dinner',10,20,5,0,0,2,
 'eggs|4|large;asparagus|1|cup|1-inch pieces, woody ends removed;peas|1/2|cup;cheddar|1/3|cup;milk|2|tablespoons;oil|1|teaspoon;pepper|1/8|teaspoon',[
'Heat the oven to 375°F/190°C. Whisk the @eggs, @milk and @pepper in a bowl.',
'Heat the @oil in a small oven-safe skillet on medium-low. Cook the @asparagus and @peas for 4 minutes, stirring.',
'Pour in the egg mixture and sprinkle with @cheddar. Cook without stirring for 2 minutes, then transfer the skillet to the oven.',
'Bake for 10–14 minutes until the center is fully set and reaches 74°C/165°F. Handle the hot skillet with oven mitts, rest for 2 minutes and cut in half.'
]),
r('baked-rice-bean-casserole','Baked rice & bean casserole','Rice and black beans bake beneath a thin cheddar crust.','Tex-Mex-inspired','dinner,casserole',10,30,4,1,0,4,
 'cookedRice|3|cups;blackBeans|3|cups;cannedTomato|2|cups;corn|1|cup;cheddar|1|cup;chiliPowder|1|teaspoon;oil|1|teaspoon',[
'Heat the oven to 400°F/200°C. Grease a 2-quart/2-liter baking dish with the @oil.',
'Mix the @cookedRice, @blackBeans, @cannedTomato, @corn and @chiliPowder in the dish and spread evenly.',
'Cover tightly with foil and bake for 20 minutes. Uncover, scatter over the @cheddar and bake for 10 minutes more.',
'Check the center reaches 74°C/165°F; continue covered if needed. Rest for 3 minutes and divide into four portions.'
]),
r('roasted-carrot-chickpea-pita','Roasted carrot & chickpea pita','Roasted carrots and chickpeas fill pita pockets with a cool yogurt drizzle.','West Asian-inspired','lunch,dinner,sandwich',10,30,5,0,1,2,
 'carrot|3|medium|1/2-inch diagonal slices;chickpeas|1 1/2|cups;pita|2|medium;yogurt|1/3|cup;lemon|1|tablespoon;cumin|1/2|teaspoon;oil|1|tablespoon;salt|1/4|teaspoon',[
'Heat the oven to 425°F/220°C. Toss the @carrot and @chickpeas with the @oil, @cumin and @salt on a sheet pan.',
'Roast for 25–30 minutes, turning halfway, until the carrots are tender. Warm the @pita in the oven for the final 2 minutes.',
'Stir the @yogurt and @lemon together in a small bowl.',
'Halve the pitas, open the pockets and divide the roasted filling among them. Drizzle with the yogurt sauce and serve.'
]),
r('pear-walnut-yogurt','Pear & walnut yogurt bowls','Chopped pear and walnuts add crunch to lightly sweetened yogurt.','Café-style','breakfast,snack',10,0,4,0,0,2,
 'yogurt|1 1/2|cups;pear|1|large;walnuts|1/4|cup|chopped;honey|2|teaspoons;cinnamon|1/4|teaspoon',[
'Wash the @pear, remove its core and cut into small pieces.',
'Divide the @yogurt between two bowls and arrange the pear over it.',
'Sprinkle on the @walnuts and @cinnamon, then drizzle with the @honey.',
'Serve cold promptly or cover and refrigerate. Add the walnuts just before eating if preparing ahead.'
]),
r('cocoa-banana-oats','Cocoa banana oats','Cocoa and mashed banana flavor a warm, unsweetened oat base.','North American','breakfast',5,10,3,0,0,2,
 'oats|1|cup;soyMilk|2|cups;banana|1|large;cocoa|1|tablespoon;peanutButter|1|tablespoon',[
'Whisk the @cocoa into the @soyMilk in a saucepan, then stir in the @oats.',
'Bring to a gentle simmer and cook on low for 7–8 minutes, stirring frequently.',
'Mash half the @banana and stir it into the oats with the @peanutButter.',
'Slice the remaining banana. Divide the porridge between two bowls and add the slices before serving.'
]),
r('roasted-spiced-chickpeas','Roasted spiced chickpeas','Drained chickpeas roast into a warm snack with a smoky coating.','Everyday plant-based','snack,side',10,35,2,1,0,4,
 'chickpeas|3|cups;oil|1|tablespoon;paprika|1|teaspoon;cumin|1/2|teaspoon;chili|1/4|teaspoon;salt|1/4|teaspoon',[
'Heat the oven to 400°F/200°C. Pat the @chickpeas dry with a clean towel and spread on a rimmed sheet pan.',
'Toss with the @oil and @salt. Roast for 25 minutes, shaking the pan halfway.',
'Toss the hot chickpeas with the @paprika, @cumin and @chili and roast for another 5–10 minutes until dry on the outside.',
'Cool briefly and divide into four snack portions. Texture is crispest soon after roasting; refrigerate leftovers promptly rather than treating them as shelf-stable.'
]),
r('warm-corn-bean-salad','Warm corn & pinto bean salad','Corn, beans and diced peppers make a warm lime-dressed side or light meal.','Tex-Mex-inspired','lunch,salad,side',10,10,4,1,0,2,
 'pintoBeans|1 1/2|cups;corn|1 1/2|cups;bellPepper|1|small|diced;oil|2|teaspoons;lime|2|tablespoons;cilantro|1/4|cup|chopped;chiliPowder|1/2|teaspoon',[
'Heat the @oil in a skillet on medium-high and cook the @bellPepper for 4 minutes.',
'Add the @corn and @chiliPowder and cook for 3 minutes, stirring until the corn is hot.',
'Fold in the @pintoBeans and heat gently for 3 minutes, keeping the beans intact.',
'Remove from heat, stir in the @lime and @cilantro and serve as two light meals or four side portions.'
]),
];
