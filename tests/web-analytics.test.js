import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {publicAnalyticsUrl,publicPageEvent} from '../dist/web-analytics.js';
test('analytics sends only public production page views without query strings or fragments',()=>{
 for(const path of ['/','/about/','/reviews/','/privacy/','/recipe/','/recipes/chickpea-bowl/']){
  const url='https://www.ezeats-eh.com'+path;
  assert.equal(publicPageEvent({type:'pageview',url:url+'?email=private#token'}).url,url);
 }
 for(const path of ['/account/','/settings/','/owner/','/owner/recipes/','/reviews/manage/','/recipes/contribute/','/api/profile'])assert.equal(publicAnalyticsUrl('https://www.ezeats-eh.com'+path),null);
 assert.equal(publicAnalyticsUrl('https://preview.vercel.app/'),null);
 assert.equal(publicAnalyticsUrl('http://localhost:4189/'),null);
 assert.equal(publicAnalyticsUrl('invalid'),null);
 assert.equal(publicPageEvent({type:'event',url:'https://www.ezeats-eh.com/'}),null);
});
test('private pages do not include analytics script',async()=>{
 for(const file of ['account','settings','owner','owner/recipes','reviews/manage','recipes/contribute'])assert.doesNotMatch(await readFile(`dist/${file}/index.html`,'utf8'),/web-analytics\.js/);
});
test('analytics loads once on public production pages and respects privacy signals',async()=>{
 const {runInNewContext}=await import('node:vm');
 const code=(await readFile('dist/web-analytics.js','utf8')).replaceAll('export function','function');
 for(const [href,privacy,expected] of [
  ['https://www.ezeats-eh.com/',{},1],
  ['https://www.ezeats-eh.com/about',{},1],
  ['https://www.ezeats-eh.com/settings/',{},0],
  ['https://preview.vercel.app/',{},0],
  ['https://www.ezeats-eh.com/',{doNotTrack:'1'},0],
  ['https://www.ezeats-eh.com/',{globalPrivacyControl:true},0]
 ]){
  const scripts=[];const window={location:{href}};
  runInNewContext(code,{URL,window,navigator:privacy,document:{createElement:()=>({}),head:{append:s=>scripts.push(s)}}});
  assert.equal(scripts.length,expected);
  if(expected){assert.equal(scripts[0].src,'/_vercel/insights/script.js');assert.equal(window.vaq[0][0],'beforeSend');}
 }
});
