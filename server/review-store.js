import {neon} from '@neondatabase/serverless';
import {createHmac} from 'node:crypto';
export function createDatabaseReviewStore(url=process.env.DATABASE_URL){
 if(!url)return null;
 const sql=neon(url);
 const list=status=>sql`SELECT id,name,comment,rating,created_at AS "createdAt" FROM ezeats_reviews WHERE status=${status} ORDER BY created_at DESC LIMIT 200`;
 return {
  local:false,
  published:()=>list('published'),pending:()=>list('pending'),
  async submit(review,ip='unknown'){
   const bucket=createHmac('sha256',url).update(`${new Date().toISOString().slice(0,10)}:${ip}`).digest('hex');
   await sql`SELECT ezeats_submit_review(${review.submissionId},${review.name},${review.comment},${review.rating},${bucket})`;
  },
  async moderate(id,status,owner){
   const rows=await sql`UPDATE ezeats_reviews SET status=${status},moderated_at=now(),moderated_by=${owner} WHERE id=${id} RETURNING id`;
   if(!rows.length)throw new Error('Review not found');
  }
 };
}
