import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createContourGeometry,waveCell,WAVE_STEP,WAVE_RATE} from '../dist/contour-surface.js';

test('the topographic membrane has a dense finite indexed surface and covers the viewport with perspective margin',()=>{
 const g=createContourGeometry();assert.ok(g.attributes.position.count>30000);assert.ok(g.index);assert.ok(g.attributes.normal.array.every(Number.isFinite));
 for(const [w,h,fov] of [[1440,900,36],[1280,720,40],[390,844,50],[320,640,50]]){
  const camera=new THREE.PerspectiveCamera(fov,w/h,.1,280),half=150*Math.tan(fov*Math.PI/360);
  for(const [x,y] of [[-1.3,-1.3],[1.3,1.3]]){
   const p=new THREE.Vector3(x*half*w/h,y*half,-150).project(camera);assert.ok(Math.abs(p.x)>1.29&&Math.abs(p.y)>1.29);assert.ok(p.z<1);
  }
 }
 g.dispose();
});

test('the wave solver preserves still water and uses a stable fixed step',()=>{
 assert.deepEqual(waveCell(0,0,0),[0,0]);assert.ok(Math.sqrt(WAVE_RATE)*WAVE_STEP<Math.SQRT1_2);
 const [height,velocity]=waveCell(.1,0,-.05);assert.ok(height<.1);assert.ok(velocity<0);
});

test('a localized disturbance propagates into nearby cells then dissipates without becoming unstable',()=>{
 const n=40;let height=new Float64Array(n*n),velocity=new Float64Array(n*n),nextH=new Float64Array(n*n),nextV=new Float64Array(n*n);const center=20*n+20;
 height[center]=.1;let maximum=.1,neighbourMoved=false,energyEarly=0;
 for(let frame=0;frame<720;frame++){
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
   const i=y*n+x,lap=height[y*n+Math.max(0,x-1)]+height[y*n+Math.min(n-1,x+1)]+height[Math.max(0,y-1)*n+x]+height[Math.min(n-1,y+1)*n+x]-4*height[i];
   [nextH[i],nextV[i]]=waveCell(height[i],velocity[i],lap);assert.ok(Number.isFinite(nextH[i])&&Number.isFinite(nextV[i]));maximum=Math.max(maximum,Math.abs(nextH[i]));
  }
  [height,nextH]=[nextH,height];[velocity,nextV]=[nextV,velocity];
  if(Math.abs(height[center+2])>.0001)neighbourMoved=true;
  if(frame===60)energyEarly=height.reduce((sum,v,i)=>sum+v*v+velocity[i]*velocity[i]/WAVE_RATE,0);
 }
 const energyLate=height.reduce((sum,v,i)=>sum+v*v+velocity[i]*velocity[i]/WAVE_RATE,0);
 assert.ok(neighbourMoved,'the disturbance never left its input cell');assert.ok(maximum<=.101);assert.ok(energyLate<energyEarly*.01,'the field keeps significant residual motion');
});
