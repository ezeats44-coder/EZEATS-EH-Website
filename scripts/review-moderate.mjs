import {createLocalReviewStore} from './review-store.mjs';
import path from 'node:path';
const store=createLocalReviewStore(path.resolve('.local-data/reviews.json'));
const [action='list',id]=process.argv.slice(2);
if(action==='list')console.log(JSON.stringify(await store.pending(),null,2));
else if(['publish','reject'].includes(action)&&id){await store.moderate(id,action==='publish'?'published':'rejected');console.log('Local review updated.');}
else throw new Error('Usage: node scripts/review-moderate.mjs [list|publish ID|reject ID]');
