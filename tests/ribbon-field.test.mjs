import test from 'node:test';
import assert from 'node:assert/strict';
import {ribbonGeometry,bendRibbon} from '../dist/ribbon-field.js';

test('the background is finite solid ribbon geometry with actual width and thickness',()=>{
 const g=ribbonGeometry(),p=g.attributes.position;
 assert.equal(p.count,18*101*8);assert.ok(g.index.count>80000);
 assert.ok(p.array.every(Number.isFinite));assert.ok(g.attributes.normal.array.every(Number.isFinite));
 for(let lane=0;lane<18;lane++){
  const index=lane*101*8,a=index*3,b=(index+4)*3;
  assert.ok(Math.hypot(p.array[a+1]-p.array[b+1],p.array[a+2]-p.array[b+2])>.01);
 }
 g.dispose();
});

test('cursor interaction deforms nearby ribbon geometry in depth, retains the far field and returns exactly to rest',()=>{
 const pointer={x:.2,y:-.3},near=[.24,-.25,.01],far=[-1.4,1.3,-.08];
 assert.deepEqual(bendRibbon(...near,pointer,0),near);
 const deformed=bendRibbon(...near,pointer,1);assert.ok(deformed[2]-near[2]<-.2);assert.ok(deformed[0]>near[0]);assert.ok(deformed[1]>near[1]);
 assert.ok(Math.hypot(...bendRibbon(...far,pointer,1).map((v,i)=>v-far[i]))<1e-7);
 for(let i=0;i<=100;i++){
  const s=i/100,a=bendRibbon(...near,pointer,s);assert.ok(a.every(Number.isFinite));assert.ok(Math.hypot(...a.map((v,j)=>v-near[j]))<.4);
 }
});
