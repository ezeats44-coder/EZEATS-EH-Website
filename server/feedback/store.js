import {randomUUID,createHash} from 'node:crypto';
import {WorkspaceError,keys} from '../recipes/workspace/input.js';
export const categories=['Suggestion','Bug or problem','Question','Concern','Other'];
export const statuses=['New','Reviewing','Planned','Resolved','Closed'];
const fail=(message,status=400)=>{throw new WorkspaceError(message,status);};
const uuid=value=>{if(typeof value!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value))fail('Invalid identifier.');return value;};
function plain(value,max){if(typeof value!=='string'||!value.trim()||value.length>max||/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))fail(`Use plain text between 1 and ${max} characters.`);return value.trim();}
function projection(r,a){return {id:r.id,subject:r.subject,category:r.category,status:r.status,archived:r.archived,version:r.version,sequence:r.sequence,createdAt:r.created_at,updatedAt:r.updated_at,unread:a.owner?r.owner_unread:r.user_unread};}
const select=`SELECT c.*, EXISTS(SELECT 1 FROM feedback_messages m WHERE m.conversation_id=c.id AND m.sender_type='user' AND m.sequence>c.owner_read) AS owner_unread, EXISTS(SELECT 1 FROM feedback_messages m WHERE m.conversation_id=c.id AND m.sender_type='owner' AND m.sequence>c.user_read) AS user_unread FROM feedback_conversations c`;
export function createFeedbackStore(db){
 const identity=a=>{if(!a?.userId)fail('Sign in to continue.',401);};
 async function record(tx,id,a,lock=false){uuid(id);const r=(await tx.query(`${select} WHERE c.id=$1${lock?' FOR UPDATE OF c':''}`,[id])).rows[0];if(!r||(!a.owner&&r.account_id!==a.userId))fail('Conversation not found.',404);return r;}
 async function limit(a){identity(a);await db.transaction(async tx=>{const r=(await tx.query(`INSERT INTO feedback_limits VALUES($1,date_trunc('minute',now()),1) ON CONFLICT(account_id,window_start) DO UPDATE SET attempts=feedback_limits.attempts+1 RETURNING attempts`,[a.userId])).rows[0];if(r.attempts>60)fail('Too many requests. Try again in a minute.',429);});}
 return {limit,
 async list(q,a){identity(a);keys(q,['offset','category','status','search','archived']);const offset=Number(q.offset||0);if(!Number.isInteger(offset)||offset<0||offset>10000)fail('Invalid page.');if(q.category&&!categories.includes(q.category)||q.status&&!statuses.includes(q.status)||q.archived&&!['true','false'].includes(q.archived))fail('Invalid filter.');if(q.search&&q.search.length>120)fail('Search too long.');const rows=(await db.query(`${select} WHERE ($1::text IS NULL OR c.account_id=$1) AND ($2::text IS NULL OR c.category=$2) AND ($3::text IS NULL OR c.status=$3) AND ($4::text IS NULL OR position(lower($4) in lower(c.subject))>0) AND ($5::boolean IS NULL OR c.archived=$5) ORDER BY c.updated_at DESC,c.id LIMIT 21 OFFSET $6`,[a.owner?null:a.userId,q.category||null,q.status||null,q.search||null,q.archived===undefined?null:q.archived==='true',offset])).rows;return {items:rows.slice(0,20).map(r=>projection(r,a)),nextOffset:rows.length>20?offset+20:null};},
 async get(id,a,before){identity(a);const r=await record(db,id,a);if(before!==undefined&&(!/^\d+$/.test(String(before))||Number(before)<1||Number(before)>2147483647))fail('Invalid message page.');const rows=(await db.query('SELECT id,sequence,sender_type,body,created_at FROM feedback_messages WHERE conversation_id=$1 AND sequence<$2 ORDER BY sequence DESC LIMIT 51',[id,before?Number(before):2147483647])).rows;return {conversation:projection(r,a),messages:rows.slice(0,50).reverse().map(m=>({id:m.id,sequence:m.sequence,sender:m.sender_type==='owner'?'EZEATS Team':'You',senderType:m.sender_type,text:m.body,createdAt:m.created_at})),before:rows.length>50?rows[49].sequence:null};},
 async mutate(b,a){identity(a);keys(b,['action','id','requestId','category','subject','message','version','status','sequence']);const allowed={create:['action','requestId','category','subject','message'],reply:['action','id','requestId','message'],read:['action','id','sequence'],status:['action','id','version','status'],archive:['action','id','version']};if(!allowed[b.action])fail('Invalid action.');keys(b,allowed[b.action]);if(['status','archive'].includes(b.action)&&!a.owner)fail('Owner access required.',403);
 if(b.action==='create'){if(!categories.includes(b.category))fail('Invalid category.');plain(b.subject,120);}if(['create','reply'].includes(b.action)){uuid(b.requestId);plain(b.message,4000);}
 const digest=createHash('sha256').update(JSON.stringify(b)).digest('hex');
 return db.transaction(async tx=>{
 // Serializes idempotent retries across conversations for the same verified actor.
 await tx.query('SELECT pg_advisory_xact_lock(hashtext($1))',[a.userId]);
 if(b.requestId){const prior=(await tx.query('SELECT digest,conversation_id FROM feedback_requests WHERE account_id=$1 AND request_id=$2',[a.userId,b.requestId])).rows[0];if(prior){if(prior.digest!==digest)fail('Retry identifier already used for different content.',409);await record(tx,prior.conversation_id,a);return {id:prior.conversation_id,duplicate:true};}}
 let id=b.id,r;
 if(b.action==='create'){id=randomUUID();await tx.query('INSERT INTO feedback_conversations(id,account_id,category,subject) VALUES($1,$2,$3,$4)',[id,a.userId,b.category,plain(b.subject,120)]);}
 r=await record(tx,id,a,true);
 if(['create','reply'].includes(b.action)){
 if(r.status==='Closed'||r.archived)fail('This conversation is closed. You can still read it.',409);
 const sender=b.action==='create'?'user':a.owner?'owner':'user';
 await tx.query('INSERT INTO feedback_messages(id,conversation_id,sequence,sender_type,sender_id,body) VALUES($1,$2,$3,$4,$5,$6)',[randomUUID(),id,r.sequence+1,sender,a.userId,plain(b.message,4000)]);
 await tx.query(`UPDATE feedback_conversations SET sequence=sequence+1,version=version+1,updated_at=now(),${sender==='user'?'last_user_message_at':'last_owner_message_at'}=now() WHERE id=$1`,[id]);
 await tx.query('INSERT INTO feedback_requests(account_id,request_id,digest,conversation_id) VALUES($1,$2,$3,$4)',[a.userId,b.requestId,digest,id]);
 }else if(b.action==='read'){
 if(!Number.isInteger(b.sequence)||b.sequence<0||b.sequence>r.sequence)fail('Invalid read position.');await tx.query(`UPDATE feedback_conversations SET ${a.owner?'owner_read':'user_read'}=GREATEST(${a.owner?'owner_read':'user_read'},$2) WHERE id=$1`,[id,b.sequence]);
 }else{
 if(b.version!==r.version)fail('Conversation changed. Refresh before trying again.',409);if(b.action==='status'&&!statuses.includes(b.status))fail('Invalid status.');
 await tx.query(`UPDATE feedback_conversations SET ${b.action==='archive'?'archived=true':"status=$2"},version=version+1,updated_at=now() WHERE id=$1`,b.action==='archive'?[id]:[id,b.status]);
 await tx.query('INSERT INTO feedback_events VALUES($1,$2,$3,$4,now())',[randomUUID(),id,a.userId,b.action==='archive'?'archive':b.status]);}
 return {id,duplicate:false};
 });}
 };
}
