import {identity,normalizeContent,requireComplete,publicRecipe,WorkspaceError,text} from './input.js';
const json=x=>JSON.stringify(x);
const authorized=a=>{if(!a?.authorized||!a.userId)throw new WorkspaceError('Authorized owner required.',403);};
// Both Neon and local PostgreSQL implement query(text, parameters) and transaction(callback).
export function createRecipeStore(db){
 async function detail(tx,id){
  const row=(await tx.query('SELECT * FROM recipe_records WHERE id=$1 FOR SHARE',[id])).rows[0];if(!row)throw new WorkspaceError('Recipe not found.',404);
  const revisions=(await tx.query(`SELECT v.version,v.parent_version,v.document,v.created_by,v.created_at,
   (SELECT status FROM recipe_moderation_events e WHERE e.recipe_id=v.recipe_id AND e.version=v.version ORDER BY e.event_id DESC LIMIT 1) AS status
   FROM recipe_revisions v WHERE v.recipe_id=$1 AND (v.version>$2 OR v.version=$3) ORDER BY v.version`,[id,Math.max(0,row.latest_version-20),row.published_version])).rows;
  const page=await history(tx,id);
  return {...row,revisions,...page};
 }
 async function history(tx,id,before=null){const rows=(await tx.query('SELECT * FROM recipe_moderation_events WHERE recipe_id=$1 AND ($2::bigint IS NULL OR event_id<$2) ORDER BY event_id DESC LIMIT 101',[id,before])).rows;return {events:rows.slice(0,100).reverse(),nextBefore:rows.length>100?String(rows[99].event_id):null};}
 async function append(tx,id,version,action,status,actor,notes){await tx.query('INSERT INTO recipe_moderation_events(recipe_id,version,action,status,actor_account_id,private_notes) VALUES($1,$2,$3,$4,$5,$6)',[id,version,action,status,actor.userId,notes]);}
 async function revision(tx,id,version,parent,doc,actor){await tx.query('INSERT INTO recipe_revisions(recipe_id,version,parent_version,document,content_fingerprint,created_by) VALUES($1,$2,$3,$4::jsonb,$5,$6)',[id,version,parent,json(doc),doc.fingerprint,actor.userId]);}
 return {
  async rateLimit(actor){authorized(actor);const r=await db.query(`INSERT INTO recipe_owner_limits(actor,window_start,operations) VALUES($1,now(),1)
   ON CONFLICT(actor) DO UPDATE SET window_start=CASE WHEN recipe_owner_limits.window_start<now()-interval '1 minute' THEN now() ELSE recipe_owner_limits.window_start END,
   operations=CASE WHEN recipe_owner_limits.window_start<now()-interval '1 minute' THEN 1 ELSE recipe_owner_limits.operations+1 END RETURNING operations`,[actor.userId]);if(r.rows[0].operations>60)throw new WorkspaceError('Too many owner operations. Retry in one minute.',429);},
  async get(id,actor){authorized(actor);return db.transaction(tx=>detail(tx,identity(id)));},
  async history(id,before,actor){authorized(actor);identity(id);return history(db,id,before);},
  async revision(id,version,actor){authorized(actor);identity(id);const row=(await db.query('SELECT version,document,created_by,created_at FROM recipe_revisions WHERE recipe_id=$1 AND version=$2',[id,version])).rows[0];if(!row)throw new WorkspaceError('Revision not found.',404);return row;},
  async list(f,actor){authorized(actor);const params=[f.q,f.status,f.author,f.from||null,f.to||null,f.mealType,f.diet,f.limit+1,f.offset];
   const rows=(await db.query(`SELECT r.id,r.origin,r.latest_version,r.latest_status,r.published_version,r.lock_version,r.created_at,r.updated_at,r.removed_at,
    v.document->'content'->>'title' AS title,v.document->'content'->>'author' AS author,v.document->'content'->'mealTypes' AS meal_types,v.document->'content'->'dietTags' AS diet_tags
    FROM recipe_records r JOIN recipe_revisions v ON v.recipe_id=r.id AND v.version=r.latest_version
    WHERE ($1='' OR strpos(lower(v.document->'content'->>'title'),lower($1))>0)
    AND ($2='' OR CASE WHEN r.removed_at IS NOT NULL THEN 'removed' ELSE r.latest_status END=$2)
    AND ($3='' OR strpos(lower(v.document->'content'->>'author'),lower($3))>0)
    AND ($4::date IS NULL OR r.created_at >= $4::date) AND ($5::date IS NULL OR r.created_at < $5::date+interval '1 day')
    AND ($6='' OR (v.document->'content'->'mealTypes') ? $6) AND ($7='' OR (v.document->'content'->'dietTags') ? $7)
    ORDER BY r.updated_at DESC,r.id LIMIT $8 OFFSET $9`,params)).rows;
   return {items:rows.slice(0,f.limit),nextOffset:rows.length>f.limit?f.offset+f.limit:null};
  },
  async mutate(command,actor){authorized(actor);const {action,id,expectedLock}=command;identity(id);
   try{return await db.transaction(async tx=>{
    let row=(await tx.query('SELECT * FROM recipe_records WHERE id=$1 FOR UPDATE',[id])).rows[0];
    if(action==='create'){
     if(row)throw new WorkspaceError('Recipe ID already exists.',409);
     if(id.startsWith('ezeats-user:')!==!!actor.contributor)throw new WorkspaceError('Recipe namespace does not match the author.');
     const doc=normalizeContent(command.content,actor);if(doc.content.id!==id)throw new WorkspaceError('Recipe identity mismatch.');
     await tx.query("INSERT INTO recipe_records(id,origin,provider,submitting_account_id,latest_version,latest_status,lock_version) VALUES($1,$3,'EZEATS',$2,1,'draft',1)",[id,actor.userId,actor.contributor?'user-submitted':'ezeats-owned']);
     await revision(tx,id,1,null,doc,actor);await append(tx,id,1,action,'draft',actor,'');
    }else{
     if(!row)throw new WorkspaceError('Recipe not found.',404);
     if(row.lock_version!==expectedLock)throw new WorkspaceError('Another owner changed this recipe. Reload before saving.',409);
     if(row.removed_at)throw new WorkspaceError('Removed recipes cannot be edited.',409);
     let version=row.latest_version,status=row.latest_status,published=row.published_version;
     if(action==='save'){
      const doc=normalizeContent(command.content,actor);if(doc.content.id!==id)throw new WorkspaceError('Recipe identity cannot change.');
      version++;status=published?'pending':'draft';await revision(tx,id,version,row.latest_version,doc,actor);
     }else{
      const transitions={submit:['draft','changes-requested'],approve:['pending'],publish:['approved'],'approve-and-publish':['pending'],'request-changes':['pending','approved'],reject:['draft','pending','changes-requested','approved'],remove:['draft','pending','approved','published','changes-requested','rejected']};
      if(!transitions[action]?.includes(status))throw new WorkspaceError('This action is not available for the current revision.',409);
      const notes=text(command.notes,4000);
      if(['request-changes','reject','remove'].includes(action)&&!notes)throw new WorkspaceError('Add a private reason for this decision.');
      if(['submit','approve','publish','approve-and-publish'].includes(action)){
       const doc=(await tx.query('SELECT document FROM recipe_revisions WHERE recipe_id=$1 AND version=$2',[id,version])).rows[0].document;requireComplete(doc.content);
      }
      status={submit:'pending',approve:'approved',publish:'published','approve-and-publish':'published','request-changes':'changes-requested',reject:'rejected',remove:status}[action];
      if(['publish','approve-and-publish'].includes(action))published=version;
      if(action==='remove')published=null;
     }
     await tx.query(`UPDATE recipe_records SET latest_version=$2,latest_status=$3,published_version=$4,lock_version=lock_version+1,updated_at=now(),
      removed_at=CASE WHEN $5='remove' THEN now() ELSE removed_at END,removed_by=CASE WHEN $5='remove' THEN $6 ELSE removed_by END WHERE id=$1`,[id,version,status,published,action,actor.userId]);
     await append(tx,id,version,action,action==='remove'?'removed':status,actor,text(command.notes,4000));
    }
    return detail(tx,id);
   });}catch(e){if(e.code==='23505')throw new WorkspaceError('Recipe ID already exists.',409);if(['40001','40P01'].includes(e.code))throw new WorkspaceError('Concurrent change detected. Reload before saving.',409);throw e;}
  },
  // Public projection reads ONLY the approved pointer; contributor endpoint is separately gated.
  async published(id){const r=(await db.query(`SELECT v.document FROM recipe_records r JOIN recipe_revisions v ON v.recipe_id=r.id AND v.version=r.published_version WHERE r.id=$1 AND r.removed_at IS NULL`,[id])).rows[0];return r?publicRecipe(r.document):null;},
  async publishedSearch({q='',limit=20,origin=null}){const rows=(await db.query(`SELECT v.document FROM recipe_records r JOIN recipe_revisions v ON v.recipe_id=r.id AND v.version=r.published_version WHERE r.removed_at IS NULL AND ($3::text IS NULL OR r.origin=$3) AND strpos(lower(v.document->'content'->>'title'),lower($1))>0 ORDER BY r.id LIMIT $2`,[text(q,200),Math.min(100,Math.max(1,limit)),origin])).rows;return rows.map(r=>publicRecipe(r.document));}
 };
}
