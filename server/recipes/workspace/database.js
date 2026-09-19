import {Pool} from '@neondatabase/serverless';
import {createRecipeStore} from './store.js';
export function neonDatabase(pool){return {
 query:(sql,params)=>pool.query(sql,params),
 async transaction(work){const client=await pool.connect();try{await client.query('BEGIN');await client.query("SET LOCAL statement_timeout='8s'");const result=await work(client);await client.query('COMMIT');return result;}catch(error){try{await client.query('ROLLBACK');}catch{}throw error;}finally{client.release();}}
};}
let store;
export function productionRecipeStore(){
 if(process.env.OWNER_RECIPES_ENABLED!=='true'||!process.env.RECIPE_DATABASE_URL)return null;
 // Dedicated recipe connection; never fall back to the production review database.
 store??=createRecipeStore(neonDatabase(new Pool({connectionString:process.env.RECIPE_DATABASE_URL,max:3,connectionTimeoutMillis:5000,query_timeout:10000})));
 return store;
}
