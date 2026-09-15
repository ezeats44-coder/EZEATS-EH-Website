// Shared by the settings form and the authenticated API. No personal answers in tokens.
export const sections = [
 {title:'Your food, your way',intro:'Start with what tastes good. Every question is optional.',fields:[
  {key:'spice',label:'How spicy do you like your food?',options:['Not spicy','Mild','Spicy']},
  {key:'taste',label:'Sweet or savory?',options:['Sweet','Savory / salty','Both']},
  {key:'diet',label:'Do you follow a specific diet?',options:['No specific diet','Pescatarian','Vegetarian','Vegan']},
  {key:'restrictions',label:'Other dietary preferences',multiple:true,options:['Gluten-free','Dairy-free']},
  {key:'avoid',label:'Any foods you prefer to avoid?',text:true,max:200,help:'Dislikes, separated by commas (for example: mushrooms, olives). Put allergies in the next question.'},
  {key:'allergies',label:'Do you have any food allergies?',multiple:true,options:['Milk','Eggs','Fish','Shellfish','Peanuts','Tree nuts','Wheat','Soy','Sesame'],help:'Select any that apply. We screen listed ingredients, but cannot verify brands or cross-contact. Always check ingredients and preparation.'},
  {key:'otherAllergies',label:'Other allergies or allergy details',text:true,max:300,help:'If you enter an allergy we cannot screen, we will pause meal suggestions instead of guessing.'},
  {key:'cuisines',label:'Which cuisines do you enjoy?',multiple:true,options:['Italian','Mexican','Mediterranean','Indian','Japanese','Thai','Korean','American']},
  {key:'adventure',label:'Do you like trying something new?',options:['Keep it familiar','Try something new','Either works']}
 ]},
 {title:'Make it fit your day',intro:'These are your usual preferences. You can change your meal choices any time.',fields:[
  {key:'budget',label:'Usual budget per serving at home',options:['Up to $5','Up to $10','Up to $20'],help:'US dollars. Grocery costs are estimates, not restaurant prices.'},
  {key:'diningBudget',label:'Usual budget when eating out',options:['Budget friendly','Mid-range','Treating myself']},
  {key:'time',label:'How much cooking time usually works?',options:['15 minutes','30 minutes','60 minutes']},
  {key:'schedule',label:'Are you an early bird or a night owl?',options:['Early bird','Night owl','Somewhere in between']},
  {key:'meal',label:'Which meal is your favorite?',options:['Breakfast','Lunch','Dinner','No preference']},
  {key:'dining',label:'Do you usually prefer eating out or staying in?',options:['Eating out','Staying in','Either works'],help:'Saved for your dining profile. The current picker suggests meals to make at home; restaurant discovery is not available yet.'},
  {key:'companions',label:'Who are you usually eating with?',options:['Solo','Partner / date','Friends','Family','It varies']},
  {key:'kids',label:'Will kids usually be joining you?',options:['Yes','No','Sometimes']},
  {key:'atmosphere',label:'Which atmosphere do you prefer?',options:['Vintage / cozy','Modern','Casual','No preference']},
  {key:'healthy',label:'How important are healthy options to you?',options:['Very important','Sometimes','Not a priority'],help:'Saved as a preference, not a nutrition or medical assessment.'},
  {key:'style',label:'What style of food do you enjoy?',options:['Gourmet','Casual dining','Fast food','A mix']}
 ]},
 {title:'A little about you',intro:'Optional personal details. These do not change meal rankings or limit access. Leave anything blank or choose “Prefer not to say.”',fields:[
  {key:'name',label:'What should we call you?',text:true,max:60},
  {key:'age',label:'Age range',options:['14–17','18–24','25–34','35–44','45–54','55–64','65+','Prefer not to say'],help:'EZEATS accounts are for people age 14 and older. Sharing your age range here is optional.'},
  {key:'gender',label:'Gender',options:['Woman','Man','Nonbinary','Self-described','Prefer not to say']},
  {key:'genderDescription',label:'Describe your gender, if you like',text:true,max:60},
  {key:'relationship',label:'Relationship status',options:['Single','Dating / partnered','Married','Another description','Prefer not to say']},
  {key:'student',label:'Are you currently a student?',options:['Yes','No','Prefer not to say']},
  {key:'pregnancy',label:'Are you currently pregnant?',options:['Yes','No','Not applicable','Prefer not to say'],help:'Optional sensitive information. This is not used to assess food safety or provide pregnancy-specific recommendations.'}
 ]}
];
export const fields = sections.flatMap(s => s.fields);
export function validateProfile(value) {
 if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid profile.');
 const result = {};
 for (const key of Object.keys(value)) if (!fields.some(f => f.key === key)) throw new Error('Unknown profile field.');
 for (const f of fields) {
  const v=value[f.key];
  if (v===undefined || v==='') continue;
  if (f.multiple) {
   if (!Array.isArray(v)||v.length>f.options.length||v.some(x=>!f.options.includes(x))) throw new Error(`Choose supported answers for ${f.label}`);
   result[f.key]=[...new Set(v)];
  } else if (f.text) {
   if(typeof v!=='string'||v.length>f.max) throw new Error(`Check ${f.label}`);
   result[f.key]=v.trim();
  } else {
   if (!f.options.includes(v)) throw new Error(`Choose a supported answer for ${f.label}`);
   result[f.key]=v;
  }
 }
 return result;
}
export function mealDefaults(profile) {
 const p=validateProfile(profile),result={};
 if(p.spice) result.heat=['Not spicy','Mild','Spicy'].indexOf(p.spice);
 if(p.budget) result.budget={'Up to $5':5,'Up to $10':10,'Up to $20':20}[p.budget];
 if(p.time) result.time=parseInt(p.time,10);
 if(p.adventure) result.adventure={'Keep it familiar':'familiar','Try something new':'adventurous','Either works':'any'}[p.adventure];
 result.diets=[...(p.restrictions||[]).map(x=>x.toLowerCase()),...(['Pescatarian','Vegetarian','Vegan'].includes(p.diet)?[p.diet.toLowerCase()]:[])];
 return result;
}
