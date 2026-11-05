import test from 'node:test';
import assert from 'node:assert/strict';
import {createDeferredScene} from '../dist/deferred-scene.js';
import {buildWorld} from '../scripts/build-world.mjs';

test('finale resource loads once, stays detached until prepared, and disposes exactly once',async()=>{
 let resolve,loads=0,mounts=0,ready=0,disposed=0;
 const scene=createDeferredScene({load:()=>{loads++;return new Promise(r=>{resolve=r;});},defer:task=>task(),mount:()=>{mounts++;return {dispose(){disposed++;}};},onReady:()=>ready++});
 assert.equal(scene.state,'idle');assert.equal(loads,0);const first=scene.preload();assert.equal(scene.preload(),first);assert.equal(mounts,0);assert.equal(scene.ready,false);await Promise.resolve();resolve({});await first;
 assert.equal(loads,1);assert.equal(mounts,1);assert.equal(ready,1);assert.equal(scene.ready,true);scene.dispose();scene.dispose();assert.equal(disposed,1);assert.equal(scene.ready,false);
});

test('late/failed finale downloads leave native content available and never mount after disposal',async()=>{
 let finish,construct=0,errors=0;
 const scene=createDeferredScene({load:()=>new Promise(r=>{finish=r;}),defer:task=>task(),mount:()=>{construct++;},onReady:()=>assert.fail('late readiness notification')});
 const pending=scene.preload();await Promise.resolve();scene.dispose();finish({});await pending;assert.equal(construct,0);assert.equal(scene.state,'disposed');
 const failed=createDeferredScene({load:()=>Promise.reject(new Error('offline')),mount:()=>assert.fail('failed download mounted'),onError:()=>errors++});await failed.preload();await failed.preload();assert.equal(errors,1);assert.equal(failed.ready,false);assert.equal(failed.state,'failed');failed.dispose();
 const broken=createDeferredScene({load:()=>({}),mount:()=>{throw new Error('construction failed');},defer:task=>Promise.resolve().then(task),onError:()=>errors++});await broken.preload();assert.equal(broken.state,'failed');assert.equal(errors,2);
});

test('the production opening graph excludes sculpted hands and shares Three.js with the deferred desk',async()=>{
 const {metafile}=await buildWorld({write:false}),outputs=metafile.outputs,entry=Object.keys(outputs).find(p=>p.endsWith('/spatial-world.bundle.js')),visited=new Set();
 function walk(path){if(visited.has(path))return;visited.add(path);for(const i of outputs[path].imports)if(i.kind!=='dynamic-import')walk(i.path);}
 walk(entry);const initialInputs=new Set([...visited].flatMap(p=>Object.keys(outputs[p].inputs)));
 assert.ok(![...initialInputs].some(p=>p.includes('sculpted-hands')||p.endsWith('/gaming-desk.js')),'the opening still contains finale geometry');
 const desk=Object.keys(outputs).find(p=>outputs[p].entryPoint==='dist/gaming-desk.js');assert.ok(desk);assert.ok(Object.keys(outputs[desk].inputs).some(p=>p.includes('sculpted-hands')));
 assert.ok(outputs[desk].imports.some(i=>visited.has(i.path)),'the desk duplicates the initial Three.js runtime');
 assert.ok([...visited].reduce((n,p)=>n+outputs[p].bytes,0)<850000,'opening assets exceed the intended split budget');
});
