/**
 * @typedef {Object} RecipeProvider
 * @property {string} namespace Stable provider namespace.
 * @property {(query: {q:string,limit:number}, options?:{signal:AbortSignal})=>Promise<Array<Object>>} search
 * @property {(id:string, options?:{signal:AbortSignal})=>Promise<Object|null>} getById
 * @property {(raw:unknown)=>Object} normalize Must return validated Recipe v1 only.
 * Providers never receive user identity or profile metadata. The catalog owns restrictions.
 */
export function assertProvider(p){if(!p||!p.namespace||['search','getById','normalize'].some(k=>typeof p[k]!=='function'))throw new Error('Invalid RecipeProvider');return p;}
