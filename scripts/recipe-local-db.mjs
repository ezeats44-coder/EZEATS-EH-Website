import {PGlite} from '@electric-sql/pglite';
import {readFile,mkdir} from 'node:fs/promises';
import {createRecipeStore} from '../server/recipes/workspace/store.js';
export async function openLocalRecipeDatabase(directory){
 if(process.env.VERCEL)throw new Error('Local recipe adapter cannot run on Vercel.');
 if(directory)await mkdir(directory,{recursive:true});
 const db=new PGlite(directory);
 try{const exists=(await db.query("SELECT to_regclass('recipe_records') AS name")).rows[0].name;
 if(!exists)await db.transaction(async tx=>{await tx.exec(await readFile(new URL('../server/recipes/workspace/schema.sql',import.meta.url),'utf8'));});
 return {db,store:createRecipeStore(db)};}catch(e){await db.close();throw e;}
}
