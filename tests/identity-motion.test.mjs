import test from 'node:test';
import assert from 'node:assert/strict';
import {initIdentity} from '../dist/identity-motion.js';

test('identity motion cancels on motion-off, stops pointer work offscreen and removes listeners',async()=>{
 const keys=['document','matchMedia','IntersectionObserver','requestAnimationFrame','cancelAnimationFrame','addEventListener','removeEventListener','scrollY','innerHeight'],saved=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
 const listeners=new Map(),frames=new Map(),mediaListeners=new Map();let frameId=0,observer,started=0,cancelled=0;
 const style=()=>({setProperty(){},removeProperty(){}}),element=()=>({style:style(),dataset:{},listeners:new Map(),addEventListener(n,f){this.listeners.set(n,f);},removeEventListener(n){this.listeners.delete(n);}});
 const animate=()=>{started++;let reject;return {playState:'running',finished:new Promise((_,r)=>{reject=r;}),cancel(){cancelled++;this.playState='idle';reject(new Error('cancelled'));}};};
 const glyphs=[...Array(13)].map((_,i)=>({...element(),dataset:{row:i<5?'0':'1',column:String(i<5?i:i-5),count:i<5?'5':'8'},children:[{animate},{animate},{animate}]}));
 const title={...element(),querySelectorAll:()=>glyphs,querySelector:()=>({animate}),getBoundingClientRect:()=>({left:0,top:0,width:500,height:250})},replay=element();
 const reduced={matches:false,addEventListener:(n,f)=>mediaListeners.set(n,f),removeEventListener:n=>mediaListeners.delete(n)};
 globalThis.document={querySelector:s=>s==='#hero-title'?title:replay,documentElement:{classList:{contains:()=>false}},fonts:{ready:Promise.resolve()}};
 globalThis.matchMedia=q=>q.includes('reduced')?reduced:{matches:true};
 globalThis.IntersectionObserver=class{constructor(f){this.callback=f;observer=this;}observe(){}disconnect(){this.disconnected=true;}};
 globalThis.requestAnimationFrame=f=>{frames.set(++frameId,f);return frameId;};globalThis.cancelAnimationFrame=id=>frames.delete(id);
 globalThis.addEventListener=(n,f)=>listeners.set(n,f);globalThis.removeEventListener=n=>listeners.delete(n);globalThis.scrollY=0;globalThis.innerHeight=900;
 try{
  initIdentity();await Promise.resolve();await Promise.resolve();
  assert.ok(started>0,'the entrance never begins');
  listeners.get('portfolio-motion')({detail:{enabled:false}});
  assert.equal(cancelled,started,'motion-off leaves entrance animations running');assert.equal(replay.hidden,true);assert.equal(frames.size,0);
  title.listeners.get('pointermove')({pointerType:'mouse',clientX:250,clientY:125});assert.equal(frames.size,0,'motion-off responds to the pointer');
  listeners.get('portfolio-motion')({detail:{enabled:true}});assert.equal(replay.hidden,false);
  title.listeners.get('pointermove')({pointerType:'mouse',clientX:200,clientY:100});assert.equal(frames.size,1);
  for(let i=0;i<300&&frames.size;i++){const [id,f]=frames.entries().next().value;frames.delete(id);f(100+i*16.67);}
  assert.equal(frames.size,0,'a stationary pointer keeps an animation loop running');
  title.listeners.get('pointermove')({pointerType:'mouse',clientX:220,clientY:110});assert.equal(frames.size,1);
  observer.callback([{isIntersecting:false}]);assert.equal(frames.size,0,'offscreen type keeps a pointer loop');
  reduced.matches=true;mediaListeners.get('change')();assert.equal(replay.hidden,true);assert.equal(frames.size,0);
  listeners.get('pagehide')();listeners.delete('pagehide');assert.equal(listeners.size,0);assert.equal(title.listeners.size,0);assert.equal(replay.listeners.size,0);assert.equal(mediaListeners.size,0);assert.equal(observer.disconnected,true);
 }finally{for(const k of keys)if(saved[k]===undefined)delete globalThis[k];else globalThis[k]=saved[k];}
});
