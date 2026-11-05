import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {stations,spatialShot,stationShot,galleryCenter} from '../dist/spatial-layout.js';
import {projects} from '../dist/portfolio-data.js';

test('all eight exhibits share one courtyard and face its open center',()=>{
 assert.equal(stations.length,projects.length);assert.equal(new Set(stations.map(s=>s.x.toFixed(2)+'/'+s.z.toFixed(2))).size,8);
 for(const s of stations){const normal=new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(0,1,0),s.yaw);const inward=new THREE.Vector3(-s.x,0,galleryCenter[2]-s.z).normalize();assert.ok(normal.dot(inward)>.99);}
});

test('every display and its beveled housing remain framed on desktop, tablet and phones',()=>{
 for(const [w,h] of [[2560,1440],[1920,1080],[1440,844],[1100,800],[768,844],[390,844],[320,640]]){
 const portrait=w<=1280||w/h<1.55,camera=new THREE.PerspectiveCamera(36,w/h,.1,280);
 for(let i=0;i<8;i++){const shot=stationShot(i,{portrait}),s=stations[i],root=new THREE.Object3D();root.position.set(s.x,0,s.z);root.rotation.y=s.yaw;root.updateMatrixWorld();camera.fov=shot.fov;camera.updateProjectionMatrix();camera.position.set(...shot.position);camera.lookAt(new THREE.Vector3(...shot.target));camera.updateMatrixWorld();
 for(const x of [-3.34,9.34])for(const y of [1.39,9.61]){const p=new THREE.Vector3(x,y,0).applyMatrix4(root.matrixWorld).project(camera);assert.ok(p.x>-.99&&p.x<.99,`${i} horizontally clips at ${w}x${h}: ${p.toArray()}`);assert.ok(p.y>-.95&&p.y<.85,`${i} vertically clips at ${w}x${h}`);}
 }
 }
});

test('curved gallery travel meets the next shot exactly and reverses without camera or look-target jumps',()=>{
 for(const portrait of [true,false])for(let i=0;i<7;i++){
  let prior=spatialShot({chapter:'gallery',index:i,phase:.58,portrait});
  for(let n=1;n<=420;n++){const phase=.58+n/1000,next=spatialShot({chapter:'gallery',index:i,phase,portrait});assert.ok(Math.hypot(...next.position.map((v,j)=>v-prior.position[j]))<.15);assert.ok(next.position.every(Number.isFinite));assert.ok(Math.hypot(...next.target.map((v,j)=>v-next.position[j]))>10);assert.deepEqual(next,spatialShot({chapter:'gallery',index:i,phase,portrait}));prior=next;}
  const end=spatialShot({chapter:'gallery',index:i,phase:1,portrait}),next=stationShot(i+1,{portrait});assert.ok(Math.hypot(...end.position.map((v,j)=>v-next.position[j]))<1e-8);assert.ok(Math.hypot(...end.target.map((v,j)=>v-next.target[j]))<1e-8);
 }
});

test('the overview journey joins its chapters and the first exhibit continuously',()=>{
 for(const portrait of [false,true]){
  const chapters=['home','passage','about','education','arrival'];
  for(let i=0;i<chapters.length-1;i++)assert.deepEqual(spatialShot({chapter:chapters[i],progress:1,portrait}),spatialShot({chapter:chapters[i+1],progress:0,portrait}));
  assert.deepEqual(spatialShot({chapter:'arrival',progress:1,portrait}),spatialShot({chapter:'gallery',index:0,phase:0,portrait}));
  assert.deepEqual(spatialShot({chapter:'gallery',index:0,phase:.18,portrait}),stationShot(0,{portrait}));
  for(const chapter of chapters)for(let n=0;n<=100;n++){const shot=spatialShot({chapter,progress:n/100,portrait});assert.ok([...shot.position,...shot.target,shot.fov].every(Number.isFinite));assert.ok(shot.fov>=30&&shot.fov<=60);}
 }
});


test('gallery entry arrives facing the first display and has no compressed first-project camera burst',()=>{
 for(const portrait of [false,true]){
  let previous=spatialShot({chapter:'arrival',progress:.62,portrait});
  for(let n=621;n<=1000;n++){const next=spatialShot({chapter:'arrival',progress:n/1000,portrait});const a=new THREE.Vector3(...previous.target).sub(new THREE.Vector3(...previous.position)).normalize(),b=new THREE.Vector3(...next.target).sub(new THREE.Vector3(...next.position)).normalize();assert.ok(a.dot(b)>.999);assert.ok(Math.hypot(...next.position.map((v,i)=>v-previous.position[i]))<.3);previous=next;}
  for(let n=0;n<=62;n++)assert.deepEqual(spatialShot({chapter:'gallery',index:0,phase:n/100,portrait}),stationShot(0,{portrait}));
 }
});
