import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve,dirname,extname} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=resolve('dist');let files=[],refs=0;const issues=[];
async function walk(dir){for(const item of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,item.name);if(item.isDirectory())await walk(path);else files.push(path);}}
await walk(root);
for(const path of files){
 if(extname(path)==='.js'&&!path.includes('/apps/')&&!path.includes('/vendor/')){
  const result=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});if(result.status!==0)issues.push(result.stderr);
 }
 if(extname(path)!=='.html')continue;
 const text=await readFile(path,'utf8');
 const ids=[...text.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 if(new Set(ids).size!==ids.length)issues.push('Duplicate HTML id in '+path);
 for(const m of text.matchAll(/\b(?:src|href)="([^"#]+)"/g)){
  if(/^(?:[a-z][\w+.-]*:|\/\/)/i.test(m[1]))continue;
  const value=m[1].split(/[?#]/)[0];if(!value)continue;
  let target=resolve(value.startsWith('/')?root:dirname(path),value.replace(/^\//,''));
  try{if((await stat(target)).isDirectory())target=resolve(target,'index.html');await stat(target);refs++;}catch{issues.push(`${path}: missing ${m[1]}`);}
 }
}
if(issues.length){console.error(issues.join('\n'));process.exitCode=1;}else console.log(`${files.length} files checked; ${refs} local HTML references resolve; JavaScript syntax passed.`);
