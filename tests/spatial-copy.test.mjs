import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {copyAnchors,projectCopy,copySizes} from '../dist/spatial-copy.js';
import {spatialShot} from '../dist/spatial-layout.js';
import {screenTransform} from '../dist/studio-reveal-motion.js';

function cameraFor(w,h,chapter,progress){const portrait=w<760,shot=spatialShot({chapter,progress,portrait,compactHero:!portrait&&(w<=1100||w/h<1.3)}),camera=new THREE.PerspectiveCamera(shot.fov,w/h,.1,280);camera.position.set(...shot.position);camera.lookAt(new THREE.Vector3(...shot.target));camera.updateMatrixWorld();return camera;}

test('name and transition copy use fixed coplanar world anchors with designed responsive framing',()=>{
 for(const [w,h] of [[2560,1440],[1440,900],[1280,720],[768,844],[390,844],[320,640]]){
  const anchors=copyAnchors(w,h);assert.deepEqual(anchors,copyAnchors(w,h));
  for(const kind of ['name','caption']){
   const points=anchors[kind],plane=new THREE.Plane().setFromCoplanarPoints(...points.slice(0,3));
   points.forEach(p=>{assert.ok(p.toArray().every(Number.isFinite));assert.ok(Math.abs(plane.distanceToPoint(p))<1e-8);});
   const camera=cameraFor(w,h,'home',kind==='name'?0:1),projected=projectCopy(points,camera,w,h);assert.ok(projected);
   assert.ok(projected.every(p=>p.x>=w*.02&&p.x<=w*.96&&p.y>=h*.1&&p.y<=h*.92),`${kind} crops at ${w}x${h}`);
   if(w>=760)assert.ok(Math.max(...projected.map(p=>p.x))<w*.5,'world lettering crosses into the center');
   const matrix=screenTransform(projected,...copySizes[kind]);assert.ok(matrix?.every(Number.isFinite));
  }
 }
});

test('world lettering has perspective travel and the transition stays left of the camera path',()=>{
 for(const [w,h] of [[1440,900],[1280,720],[390,844]]){
  const anchors=copyAnchors(w,h),copy=anchors.caption.map(p=>p.clone());let firstWidth;
  for(const progress of [.55,.7,.85,1]){
   const projected=projectCopy(anchors.caption,cameraFor(w,h,'home',progress),w,h);assert.ok(projected);
   const width=Math.max(...projected.map(p=>p.x))-Math.min(...projected.map(p=>p.x));if(firstWidth===undefined)firstWidth=width;
   if(progress===1)assert.ok(width>firstWidth*1.3,'the text follows the screen instead of its world position');
   if(w>=760)assert.ok(Math.max(...projected.map(p=>p.x))<w*.5,'transition text covers the center');
  }
  assert.deepEqual(anchors.caption,copy,'projection mutated the fixed world anchor');
  assert.equal(projectCopy(anchors.name,cameraFor(w,h,'passage',1),w,h),null,'name remains in front after the camera passes it');
 }
});
