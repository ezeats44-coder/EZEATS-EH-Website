import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
// One local server process; replace this adapter with transactional shared storage before launch.
export function createLocalReviewStore(file){
 let queue=Promise.resolve();
 const read=async()=>{try{return JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code==='ENOENT')return [];throw e;}};
 const change=fn=>{const task=queue.then(async()=>{const rows=await read();const result=fn(rows);await mkdir(path.dirname(file),{recursive:true});const temp=file+'.tmp';await writeFile(temp,JSON.stringify(rows,null,2),{mode:0o600});await rename(temp,file);return result;});queue=task.catch(()=>{});return task;};
 return {
  async published(){await queue;return (await read()).filter(r=>r.status==='published').map(({id,name,comment,rating,createdAt})=>({id,name,comment,rating,createdAt})).reverse();},
  submit(review){return change(rows=>{if(rows.some(r=>r.submissionId===review.submissionId))return;if(rows.length>=2000)throw new Error('Local review storage is full.');rows.push({...review,id:randomUUID(),createdAt:new Date().toISOString(),status:'pending'});});},
  async pending(){await queue;return (await read()).filter(r=>r.status==='pending');},
  moderate(id,status){if(!['published','rejected'].includes(status))throw new Error('Invalid status');return change(rows=>{const r=rows.find(r=>r.id===id);if(!r)throw new Error('Review not found');r.status=status;});}
 };
}
