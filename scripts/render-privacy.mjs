import fs from 'node:fs';
import path from 'node:path';
const root=process.argv[2]||'.';
const markdown=fs.readFileSync('docs/privacy-policy-draft.md','utf8').split('\n---\n')[0]
 .replace(/\*\*Draft for review[^\n]+/, 'Effective September 15, 2026. Account features described below are currently being tested and are not yet available on the public meal picker. These sections apply when you use those features.');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const inline=s=>escape(s).replace(/\[([^\]]+)\]\((https:\/\/[^)]+)\)/g,'<a href="$2">$1</a>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
const content=markdown.trim().split(/\n\n+/).map(p=>p.startsWith('# ')?`<h1>${inline(p.slice(2))}</h1>`:p.startsWith('## ')?`<h2>${inline(p.slice(3))}</h2>`:`<p>${inline(p)}</p>`).join('\n');
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Privacy Policy — EZEATS EH</title><meta name="description" content="How EZEATS EH handles account information, food preferences, and guest use."><link rel="canonical" href="https://ezeats-eh.com/privacy/"><link rel="icon" href="/assets/ezeats-eh-logo.png"><link rel="stylesheet" href="/styles.css"><style>.privacy-page{max-width:840px;margin:40px auto;padding:0 24px 64px}.privacy-page h1{font-size:clamp(32px,6vw,52px);margin-bottom:24px}.privacy-page h2{font-size:24px;margin:36px 0 14px}.privacy-page p{line-height:1.8;margin:16px 0;overflow-wrap:anywhere}.privacy-page a{color:#ad351c;text-decoration:underline}</style></head><body><header class="site-header"><a class="brand brand-logo" href="/" aria-label="EZEATS home"><img src="/assets/ezeats-eh-logo.png" width="2172" height="724" alt="EZEATS EH"></a><nav class="site-nav" aria-label="Main navigation"><a class="text-button" href="/">Meal picker</a><a class="text-button" href="/about/">About</a></nav></header><main class="privacy-page">${content}</main></body></html>`;
fs.mkdirSync(path.join(root,'dist/privacy'),{recursive:true});
fs.writeFileSync(path.join(root,'dist/privacy/index.html'),html);
for(const file of ['dist/index.html','dist/about/index.html']){
 const dest=path.join(root,file),s=fs.readFileSync(dest,'utf8');
 if(!s.includes('href="/privacy/"'))fs.writeFileSync(dest,s.replace('<footer class="page-footer">','<footer class="page-footer"><a href="/privacy/">Privacy</a>'));
}
if(html.includes('Owner review notes')||html.includes('Draft for review'))throw new Error('Draft notes leaked into policy');
console.log('Privacy page rendered and linked.');
