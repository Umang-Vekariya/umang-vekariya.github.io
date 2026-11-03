import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {titleFrame,elementFlight} from '../dist/engineering-motion.js';
import {createFormGeometry} from '../dist/engineering-form.js';
import {projects} from '../dist/portfolio-data.js';
import {projectStories} from '../dist/project-stories.js';
import {demoContent} from '../dist/demo-content.js';
import {readFile,stat} from 'node:fs/promises';
import {Outbox,BookingQueue,aggregateFrames,interpolateRSSI} from '../dist/demo-models.js';

test('the opening is reversible, monotonic and has a stable reduced-motion frame',()=>{
 for(const [portrait,tablet] of [[false,false],[true,false],[false,true]]){let prior=titleFrame(0,{portrait,tablet});for(let i=1;i<=2000;i++){const p=i/2000,next=titleFrame(p,{portrait,tablet});assert.ok(next.camera.every(Number.isFinite));assert.ok(next.camera[2]<=prior.camera[2]);assert.ok(Math.abs(next.camera[2]-prior.camera[2])<.02);assert.ok(next.camera[2]>next.target[2]+1);assert.deepEqual(next,titleFrame(p,{portrait,tablet}));assert.deepEqual(titleFrame(p,{portrait,tablet,motion:false}),titleFrame(0,{portrait,tablet,motion:false}));prior=next;}assert.equal(prior.wash,1);assert.equal(prior.typeOpacity,0);assert.equal(prior.caption,0);assert.ok(prior.camera[2]<0);}
});

test('the sculpture is finite, indexed, and keeps its passage open at all morph states',()=>{
 const g=createFormGeometry();assert.equal(g.attributes.position.count,g.morphAttributes.position[0].count);assert.equal(g.attributes.normal.count,g.morphAttributes.normal[0].count);const v=new THREE.Vector3(),a=g.attributes.position,b=g.morphAttributes.position[0];let minimum=Infinity;
 for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i);assert.ok(v.toArray().every(Number.isFinite));assert.ok(Number.isFinite(g.attributes.normal.getX(i)));for(const alpha of [0,.25,.5,.75,1]){const x=a.getX(i)*(1-alpha)+b.getX(i)*alpha,y=a.getY(i)*(1-alpha)+b.getY(i)*alpha;minimum=Math.min(minimum,Math.hypot(x,y));}}
 for(let j=0;j<=20;j++)for(const state of [a,b]){const first=new THREE.Vector3().fromBufferAttribute(state,j),last=new THREE.Vector3().fromBufferAttribute(state,240*21+j);assert.ok(first.distanceTo(last)<1e-5,'the morph opens a seam');}
 assert.ok(minimum>1,'geometry intrudes on the camera passage');for(const i of g.index.array)assert.ok(i>=0&&i<a.count);g.dispose();
});

test('image flights fit viewport and card bounds without nonuniform pixel scaling',()=>{
 for(const to of [{left:0,top:70,width:1440,height:540},{left:0,top:60,width:390,height:287}]){const from={left:24,top:200,width:342,height:293},frame=elementFlight(from,to);assert.equal(frame.width,to.width+'px');assert.equal(frame.height,to.height+'px');assert.equal(frame.left,to.left+'px');assert.ok(!('transform' in frame));assert.deepEqual(elementFlight(to,from),{left:'24px',top:'200px',width:'342px',height:'293px'});}
});

test('all eight projects retain real evidence, three demo stages, case pages and runnable apps',async()=>{
 assert.equal(projects.length,8);assert.deepEqual(projects.map(p=>p.id),demoContent.map(p=>p.id));for(const p of projects){const config=demoContent.find(d=>d.id===p.id),story=projectStories[p.id];assert.equal(config.steps.length,3);assert.ok(story.problem&&story.contribution&&story.scope);await stat(new URL('../dist/projects/'+p.id+'/index.html',import.meta.url));for(const e of story.evidence){await stat(new URL('../dist/'+e.src,import.meta.url));if(e.poster)await stat(new URL('../dist/'+e.poster,import.meta.url));}if(config.app||p.id==='polyglot')await stat(new URL('../dist/'+(config.app||'apps/polyglot/')+'index.html',import.meta.url));}
 const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');assert.ok(html.indexOf('id="about"')<html.indexOf('id="work"'));assert.ok(html.indexOf('id="education"')<html.indexOf('id="work"'));assert.ok(html.includes('id="quick-dialog"'));assert.ok(html.includes('id="command-dialog"'));assert.ok(!html.includes('world.bundle.js'));
});

test('preserved interactive models calculate coverage, aggregation, offline deduplication and FIFO promotion',()=>{
 assert.equal(interpolateRSSI([{x:0,y:0,rssi:-40},{x:1,y:0,rssi:-80}],0,0),-40);assert.equal(interpolateRSSI([{x:0,y:0,rssi:-40},{x:1,y:0,rssi:-80}],.5,0),-60);
 const result=aggregateFrames([.1,.2,.3,.4,.5,.6,.7,.8]);assert.ok(Math.abs(result.probability-.7)<1e-9);assert.equal(Boolean(result.label),true);
 const outbox=new Outbox();assert.equal(outbox.submit('same').duplicate,false);assert.equal(outbox.submit('same').duplicate,true);assert.equal(outbox.items.length,1);assert.equal(outbox.items[0].state,'queued');outbox.connect(true);assert.equal(outbox.items[0].state,'verified');
 const q=new BookingQueue(2);q.join('Ada');q.join('Kai');q.join('Noor');q.join('Mira');assert.deepEqual(q.waiting,['Noor','Mira']);assert.equal(q.cancel('Ada'),'Noor');assert.deepEqual(q.booked,['Kai','Noor']);assert.deepEqual(q.waiting,['Mira']);
});

test('demo rendering stops outside a project and reduced motion draws on demand',async()=>{
 const {createDemoEngine}=await import('../dist/project-demos.js');
 const saved={document:globalThis.document,requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame};
 const frames=new Map(),listeners=new Map();let next=0,paint=0;
 const context=new Proxy({}, {get:(_,k)=>k==='measureText'?()=>({width:80}):()=>{paint++;},set:()=>true});
 const canvas=()=>({width:0,height:0,setAttribute(){},addEventListener(){},getContext:()=>context});
 const flat={append(){}},display={open:false,addEventListener(){}},status={textContent:''},button={addEventListener(){}};
 globalThis.document={hidden:false,createElement:canvas,querySelector:s=>({'#demo-flat':flat,'#display-dialog':display,'#demo-status':status,'#expanded-act':button}[s]||null),addEventListener:(n,fn)=>listeners.set(n,fn),removeEventListener:n=>listeners.delete(n)};
 globalThis.requestAnimationFrame=fn=>{frames.set(++next,fn);return next;};globalThis.cancelAnimationFrame=id=>frames.delete(id);
 try{
  const engine=createDemoEngine();assert.equal(frames.size,0,'idle page has a demo loop');engine.setProgress(0,true,true);assert.equal(frames.size,1);let [id,fn]=frames.entries().next().value;frames.delete(id);fn(100);assert.ok(paint>0);assert.equal(frames.size,1);
  engine.setProgress(0,false,true);assert.equal(frames.size,0);engine.setProgress(2,true,false);assert.equal(frames.size,1);[id,fn]=frames.entries().next().value;frames.delete(id);fn(200);assert.equal(frames.size,0,'reduced motion continues a render loop');
  engine.pointer(.7,.4,'down');assert.equal(frames.size,1,'a real interaction did not request a new frame');engine.dispose();assert.equal(frames.size,0);assert.equal(listeners.size,0);
 }finally{Object.assign(globalThis,saved);}
});
