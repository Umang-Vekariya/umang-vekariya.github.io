import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {finaleDisplay,finaleShot,screenTransform} from '../dist/studio-reveal-motion.js';

test('the real studio starts on exactly its native rectangle, including a tall tool scrolled to its end',()=>{
 for(const [viewportWidth,viewportHeight,width,height] of [[2560,1440,1240,1010],[1440,900,1240,1010],[1280,720,1152,1200],[768,1024,672,1400],[390,844,342,704],[320,640,272,500]]){
 const screen={viewportWidth,viewportHeight,width,height,left:(viewportWidth-width)/2,top:viewportWidth<760?108:Math.min(108,viewportHeight-height-32)},m=finaleDisplay(screen),camera=new THREE.PerspectiveCamera(38,viewportWidth/viewportHeight,.1,280);let prior;
 for(let i=0;i<=400;i++){const shot=finaleShot(i/400,screen);assert.deepEqual(shot,finaleShot(i/400,screen));assert.ok([...shot.position,...shot.target,shot.fov].every(Number.isFinite));if(prior)assert.ok(Math.hypot(...shot.position.map((v,j)=>v-prior.position[j]))<.7,'camera jump');prior=shot;
 camera.fov=shot.fov;camera.position.set(...shot.position);camera.lookAt(new THREE.Vector3(...shot.target));camera.updateProjectionMatrix();camera.updateMatrixWorld();
 const points=[[-.5,.5],[.5,.5],[.5,-.5],[-.5,-.5]].map(([x,y])=>{const p=new THREE.Vector3(m.center[0]+x*m.width,m.center[1]+y*m.height,m.center[2]).project(camera);return {x:(p.x*.5+.5)*viewportWidth,y:(.5-p.y*.5)*viewportHeight};}),matrix=screenTransform(points,width,height);assert.ok(matrix.every(Number.isFinite));
 for(const [j,[x,y]] of [[0,[0,0]],[1,[width,0]],[2,[width,height]],[3,[0,height]]]){const d=matrix[3]*x+matrix[7]*y+1,u=(matrix[0]*x+matrix[4]*y+matrix[12])/d,v=(matrix[1]*x+matrix[5]*y+matrix[13])/d;assert.ok(Math.hypot(u-points[j].x,v-points[j].y)<1e-5);}
 if(i===0){assert.ok(Math.abs(points[0].x-screen.left)<1e-6);assert.ok(Math.abs(points[0].y-screen.top)<1e-6);assert.ok(Math.abs(points[2].x-screen.left-width)<1e-6);assert.ok(Math.abs(points[2].y-screen.top-height)<1e-6);}
 }
 }
});

test('the phone studio clears the contact lettering with a continuous reversible upward exit',()=>{
 const screen={viewportWidth:390,viewportHeight:844,width:342,height:704,left:24,top:108},display=finaleDisplay(screen);let lastBottom=Infinity;
 for(let i=0;i<=100;i++){
  const shot=finaleShot(1,screen,i/100),camera=new THREE.PerspectiveCamera(shot.fov,390/844,.1,280);camera.position.set(...shot.position);camera.lookAt(new THREE.Vector3(...shot.target));camera.updateMatrixWorld();
  const bottom=new THREE.Vector3(...display.center).add(new THREE.Vector3(0,-display.height/2,0)).project(camera).y;
  assert.ok(Number.isFinite(bottom));const pixels=(.5-bottom*.5)*844;assert.ok(pixels<=lastBottom+.0001,'the monitor moves down across contact text');lastBottom=pixels;
  assert.deepEqual(shot,finaleShot(1,screen,i/100));
 }
 assert.ok(lastBottom<844*.35,'the screen still covers the contact heading');
});

test('using a studio control cannot collapse the real tool; wheel input resumes the reveal, and motion-off restores it',async()=>{
 const {initStudioFinale}=await import('../dist/studio-finale.js');
 const names=['document','innerWidth','innerHeight','scrollY','ResizeObserver','requestAnimationFrame','cancelAnimationFrame','addEventListener','removeEventListener'],saved=Object.fromEntries(names.map(n=>[n,globalThis[n]])),events=new Map();let track,resizeCallback,consoleHeight=1000;
 function element(){const listeners=new Map(),classes=new Set();return {style:{setProperty(){}},dataset:{},classList:{add:n=>classes.add(n),remove:n=>classes.delete(n),contains:n=>classes.has(n)},clientWidth:1240,append(...els){els.forEach(e=>e.parentElement=this);},before(el){track=el;},setAttribute(){},addEventListener(n,f){listeners.set(n,f);},removeEventListener(n){listeners.delete(n);},fire(n,e={}){listeners.get(n)?.(e);},contains(el){return el===this;},getBoundingClientRect(){return {left:100,top:2000-globalThis.scrollY};}};}
 const consoleEl=element(),root=element(),footer=element(),insight=element();Object.defineProperty(consoleEl,'offsetHeight',{get:()=>consoleHeight});footer.getBoundingClientRect=()=>({top:6000-globalThis.scrollY});
 globalThis.document={documentElement:root,querySelector:s=>({'#neural-console':consoleEl,'.footer':footer,'#studio-insight':insight}[s]),createElement:element,addEventListener(){},removeEventListener(){}};globalThis.innerWidth=1440;globalThis.innerHeight=900;globalThis.scrollY=0;globalThis.ResizeObserver=class{constructor(fn){resizeCallback=fn;}observe(){}disconnect(){}};globalThis.requestAnimationFrame=fn=>{fn();return 1;};globalThis.cancelAnimationFrame=()=>{};globalThis.addEventListener=(n,f)=>events.set(n,f);globalThis.removeEventListener=n=>events.delete(n);
 try{const finale=initStudioFinale();globalThis.scrollY=2200;assert.equal(finale.update().active,true);assert.ok(consoleEl.classList.contains('studio-in-space'));consoleEl.fire('focusin');consoleHeight=800;resizeCallback();assert.equal(finale.update().active,false,'a focused tool was pulled into space');assert.ok(!consoleEl.inert);events.get('wheel')({type:'wheel'});assert.equal(finale.update().active,true);assert.ok(consoleEl.inert);finale.update({motion:false});assert.ok(!consoleEl.inert);assert.ok(!consoleEl.classList.contains('studio-in-space'));assert.equal(root.dataset.finale,'false');assert.equal(consoleEl.parentElement.parentElement,track,'the original live node was replaced');assert.equal(parseFloat(track.style.height),800);events.get('pagehide')();}
 finally{for(const n of names){if(saved[n]===undefined)delete globalThis[n];else globalThis[n]=saved[n];}}
});
