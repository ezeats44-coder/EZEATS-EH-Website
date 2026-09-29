import {spawnSync} from 'node:child_process';
import {readdir} from 'node:fs/promises';
// Run fixtures without hosting flags or any inherited app credentials. PGlite
// and injected test identities must never use a production database/Clerk key.
const allowed=['PATH','HOME','TMPDIR','TMP','TEMP','SystemRoot','SYSTEMROOT'];
const env=Object.fromEntries(allowed.filter(k=>process.env[k]).map(k=>[k,process.env[k]]));
env.NODE_ENV='test';
const files=(await readdir('tests')).filter(f=>f.endsWith('.test.js')).sort().map(f=>'tests/'+f);
const run=spawnSync(process.execPath,['--test',...files],{env,stdio:'inherit'});
if(run.error)throw run.error;
process.exit(run.status??1);
