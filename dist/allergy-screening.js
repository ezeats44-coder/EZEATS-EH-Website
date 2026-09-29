// The curated catalog currently screens the original nine categories only.
// Additional priority allergens are selectable but fail closed until their
// ingredient evidence has been reviewed; never infer absence from missing tags.
export const allergyOptions=['Milk','Eggs','Fish','Shellfish','Peanuts','Tree nuts','Wheat','Soy','Sesame','Mustard','Sulphites','Triticale'];
export const screenedAllergens=new Set(allergyOptions.slice(0,9));
export const hasUnsupportedAllergy=values=>values.some(value=>!screenedAllergens.has(value));
