import {recipeDatabase} from './recipes/workspace/database.js';
// Use the existing shared counters; category namespaces keep profile traffic
// separate from contributor quotas. No answers, tokens or history are stored here.
export function createProfileOperations(getDatabase=recipeDatabase){return async(userId,method,work)=>{
 const db=getDatabase();if(!db)throw new Error('Profile coordination unavailable');
 const result=await db.query(`INSERT INTO recipe_contributor_limits(actor,category,window_start,operations) VALUES($1,'profile-api',now(),1)
 ON CONFLICT(actor,category) DO UPDATE SET window_start=CASE WHEN recipe_contributor_limits.window_start<now()-interval '1 minute' THEN now() ELSE recipe_contributor_limits.window_start END,
 operations=CASE WHEN recipe_contributor_limits.window_start<now()-interval '1 minute' THEN 1 ELSE recipe_contributor_limits.operations+1 END RETURNING operations`,[userId]);
 if(result.rows[0].operations>60){const e=new Error('Too many profile requests. Please try again in a minute.');e.status=429;throw e;}
 if(method==='GET')return work();
 // A transaction-scoped lock coordinates all instances, including history clear
 // versus save. Read the current Clerk metadata only after acquiring the lock.
 return db.transaction(async tx=>{
  await tx.query("SET LOCAL lock_timeout='3s'");
  await tx.query('SELECT pg_advisory_xact_lock(hashtext($1),hashtext($2))',['ezeats-profile',userId]);
  return work();
 });
};}
export const profileOperation=createProfileOperations();
