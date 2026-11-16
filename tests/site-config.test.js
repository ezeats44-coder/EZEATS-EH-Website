import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {SITE_URL,PRODUCTION_ORIGINS} from '../dist/site-config.js';
import {reviewOrigins} from '../server/review-origins.js';
import {publicAnalyticsUrl} from '../dist/web-analytics.js';
import profile from '../api/profile.js';
test('domain transition preserves exact old and new origins without accepting lookalikes',async()=>{
 assert.equal(SITE_URL,'https://www.ezeatseh.com');
 for(const origin of ['https://www.ezeatseh.com','https://ezeatseh.com','https://www.ezeats-eh.com','https://ezeats-eh.com','https://ezeats.vercel.app']){
  assert.ok(PRODUCTION_ORIGINS.includes(origin));assert.ok(reviewOrigins().includes(origin));
  assert.equal(publicAnalyticsUrl(origin+'/'),origin+'/');
  assert.equal(publicAnalyticsUrl(origin+'/feedback/'),null);
 }
 for(const origin of ['https://www.ezeatseh.com.evil.example','http://www.ezeatseh.com']){
  assert.ok(!reviewOrigins().includes(origin));
  const res={setHeader(){},status(n){this.code=n;return this;},json(){return this;}};
  await profile({method:'GET',headers:{origin}},res);assert.equal(res.code,403);
 }
});
test('all 100 recipe pages and public metadata use the centralized canonical origin',async()=>{
 const recipes=(await readdir('dist/recipes',{withFileTypes:true})).filter(d=>d.isDirectory() && d.name!=='contribute');
 assert.equal(recipes.length,100);
 for(const {name} of recipes){
  const html=await readFile(`dist/recipes/${name}/index.html`,'utf8');
  assert.ok(html.includes(`${SITE_URL}/recipes/${name}/`));
  assert.ok(!html.includes('ezeats-eh.com'));
 }
 for(const file of ['dist/index.html','dist/about/index.html','dist/reviews/index.html','dist/sitemap.xml','dist/robots.txt']){
  const text=await readFile(file,'utf8');assert.ok(text.includes(SITE_URL));assert.ok(!text.includes('ezeats-eh.com'));
 }
 const privacy=await readFile('dist/privacy/index.html','utf8');
 assert.ok(privacy.includes(`rel="canonical" href="${SITE_URL}/privacy/"`));
});
