// Matches the ingredients and meal names in our curated catalog; no restaurant assumptions.
const favorites={
 'Pasta':/pasta|spaghetti|penne/,'Pizza':/pizza/,'Tacos':/taco/,'Burgers':/burger/,'Rice bowls':/rice/,'Noodles':/noodle/,'Salads':/salad/,'Soups & stews':/soup|stew|chili|curry/,'Sandwiches & wraps':/sandwich|wrap|grilled cheese/,'Seafood':/salmon|tuna|shrimp|fish/,'Chicken':/chicken/,'Beef':/beef/,'Tofu':/tofu/,'Beans & lentils':/beans|lentil|chickpea/,'Eggs':/\begg/,'Potatoes':/potato/
};
const dislikes={'Mushrooms':/mushroom/,'Avocado':/avocado/,'Olives':/\bolives?\b/,'Onions':/onion/,'Tomatoes':/tomato/,'Cilantro':/cilantro|coriander/,'Eggplant':/eggplant|aubergine/,'Broccoli':/broccoli/,'Peppers':/bell pepper|poblano|jalapeño|jalapeno/,'Cheese':/cheese|mozzarella|feta|parmesan|cheddar/,'Eggs':/\beggs?\b/,'Fish':/fish|salmon|tuna/,'Shellfish':/shrimp|prawn|crab|lobster|clam|mussel|oyster|scallop/,'Tofu':/tofu/,'Beans':/\bbeans?\b/,'Lentils':/lentil/};
export function foodPreferenceMatch(meal,profile){
 const text=(meal.name+' '+meal.ingredients.join(' ')).toLowerCase();
 return {excluded:(profile.foodDislikes||[]).some(key=>dislikes[key]?.test(text)),bonus:Math.min(3,(profile.foodLikes||[]).filter(key=>favorites[key]?.test(text)).length)};
}
