import {readdir,readFile,access} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
let count=0;
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory()){await walk(file);continue;}if(/\.(js|mjs)$/.test(file)){const run=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(run.status)throw new Error(run.stderr);count++;}if(file.endsWith('.html')){const html=await readFile(file,'utf8');for(const match of html.matchAll(/(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/g)){const url=match[1];if(/^(?:https?:|mailto:|tel:|data:)/.test(url))continue;const target=url.startsWith('/')?path.join('dist',url):path.join(path.dirname(file),url);await access(url.endsWith('/')?path.join(target,'index.html'):target);}}}}
for(const dir of ['api','dist','server','scripts','tests'])await walk(dir);
console.log(`${count} JavaScript files passed syntax checks; local HTML links and assets exist.`);
