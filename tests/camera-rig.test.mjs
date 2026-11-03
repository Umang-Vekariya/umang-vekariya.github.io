import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {CameraRig,openingPose,overviewPose,galleryPose,motionTokens} from '../dist/camera-rig.js';
import {workshopShot} from '../dist/workshop-layout.js';
const sizes=[[1920,1080],[1440,900],[1280,720],[768,1024],[390,844],[320,640]];
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const finite=pose=>[...pose.position,...pose.target,pose.roll||0].every(Number.isFinite);
test('the aperture arrives at the overview pose and every scroll rail is reversible',()=>{
 for(const [w,h] of sizes){const options={portrait:w<h*.85,aspect:w/h};
  const last=openingPose(2.6,options),first=overviewPose(0,options);assert.ok(distance(last.position,first.position)<1e-8);assert.ok(distance(last.target,first.target)<1e-8);
  let previous=openingPose(0,options);const trace=[];
  for(let step=1;step<=2600;step++){const phase=step*.001,pose=openingPose(phase,options);assert.ok(finite(pose));assert.ok(distance(previous.position,pose.position)<.065,'opening discontinuity');assert.ok(distance(pose.position,pose.target)>3,'camera crosses its look target');trace.push(pose);previous=pose;}
  for(let step=2600;step>0;step--)assert.deepEqual(openingPose(step*.001,options),trace[step-1]);
 }
});
test('all seven spatial transits end at exactly the next installation without camera flips',()=>{
 for(const [w,h] of sizes){const options={portrait:w<h*.85,aspect:w/h};
  for(let index=0;index<7;index++){
   let previous=galleryPose(index,{...options,phase:2.05});
   for(let step=1;step<=550;step++){const pose=galleryPose(index,{...options,phase:2.05+step*.001});assert.ok(finite(pose));assert.ok(distance(previous.position,pose.position)<.2,'gallery discontinuity');assert.ok(distance(pose.position,pose.target)>2,'camera target collapses');assert.ok(Math.abs(pose.roll)<=motionTokens.bank+.0001);previous=pose;}
   const end=galleryPose(index,{...options,phase:2.6}),next=galleryPose(index+1,{...options,phase:0});assert.ok(distance(end.position,next.position)<1e-8);assert.ok(distance(end.target,next.target)<1e-8);
   const staticPose=galleryPose(index,{...options,phase:2.6,motion:false}),base=workshopShot(index,{...options,phase:2.05});if(options.portrait)base.target[1]-=.4;assert.deepEqual(staticPose.position,base.position);assert.deepEqual(staticPose.target,base.target);assert.equal(staticPose.roll,0);
  }
 }
});
test('one camera rig owns interrupted navigation, exact focus completion and return',()=>{
 const camera=new THREE.PerspectiveCamera(35,1.6,.1,180),rig=new CameraRig(camera),a=galleryPose(0,{phase:0}),b=galleryPose(7,{phase:0});rig.update(a,.016);rig.navigate();
 for(let i=0;i<30;i++){rig.update(b,1/60);assert.ok(finite(rig.pose));}
 const before=[...rig.pose.position];rig.interrupt();rig.update(a,1/60);assert.ok(distance(before,rig.pose.position)<3,'interruption teleports camera');
 let completed=0;const close={position:[-4,1,-13],target:[-7,0,-13],roll:0};rig.focusOn(close,()=>{completed++;assert.ok(distance(camera.position.toArray(),close.position)<1e-8);});
 for(let i=0;i<90;i++)rig.update(b,1/60);assert.equal(completed,1);assert.equal(rig.traveling,false);assert.ok(distance(rig.pose.position,close.position)<1e-8);
 rig.release();for(let i=0;i<90;i++)rig.update(a,1/60);assert.ok(distance(rig.pose.position,a.position)<1e-8);
 rig.navigate();rig.update(b,.016,{motion:false});assert.deepEqual(rig.pose.position,b.position);assert.equal(rig.traveling,false);assert.equal(rig.pose.roll,0);assert.deepEqual(camera.up.toArray(),[0,1,0]);
});


test('rapid reversals keep camera orientation bounded instead of crossing the look target',()=>{
 const camera=new THREE.PerspectiveCamera(35,1.6,.1,180),rig=new CameraRig(camera);rig.update(galleryPose(0,{phase:0}),.016);
 let previous=camera.quaternion.clone();
 for(const index of [7,0,4,2,6,1])for(let frame=0;frame<12;frame++){rig.update(galleryPose(index,{phase:0}),1/60);assert.ok(finite(rig.pose));assert.ok(Math.abs(previous.dot(camera.quaternion))>.9,'orientation snaps during reversal');assert.ok(distance(rig.pose.position,rig.pose.target)>2);previous.copy(camera.quaternion);}
});
