import {validateRecipe} from '../model.js';
// Deliberately not registered in api/recipes.js or the Staying In picker.
export function publishedDatabaseProvider(store){return {namespace:'ezeats-owner',normalize:validateRecipe,getById:id=>store.published(id),search:query=>store.publishedSearch(query)};}
