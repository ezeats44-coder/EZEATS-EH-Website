import {ownedRecipes,recipeById} from './owned/catalog.js';
import {validateRecipe} from './model.js';
// Only normalized, original EZEATS records. No hosted provider lookup or database required.
export const localProvider={namespace:'ezeats',
 normalize(raw){return structuredClone(validateRecipe(raw));},
 async search({q='',limit=12}){return ownedRecipes.filter(r=>(r.title+' '+r.description).toLowerCase().includes(q.toLowerCase())).slice(0,limit).map(r=>this.normalize(r));},
 async getById(id){const recipe=recipeById.get(id);return recipe?this.normalize(recipe):null;}
};
