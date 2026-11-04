import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {identityShapes,extrudedLettering,textGeometry,flowTextLines,surfaceFrame,letterPose} from '../dist/lettering-geometry.js';
import {copyOpacity} from '../dist/spatial-copy.js';

test('the uncut identity has solid outward-facing caps, bevels, depth and its real A counter',()=>{
 const shapes=identityShapes();assert.equal(shapes.length,5);assert.equal(shapes[2].holes.length,1);
 for(const shape of shapes){
  const geometry=extrudedLettering(shape,{svg:true,depth:23,bevel:1.7}),p=geometry.attributes.position,n=geometry.attributes.normal;
  assert.ok(geometry.boundingBox.max.z-geometry.boundingBox.min.z>26);
  assert.ok([...p.array,...n.array].every(Number.isFinite));
  let front=0,back=0;const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),cross=new THREE.Vector3();
  for(let i=0;i<p.count;i+=3){
   a.fromBufferAttribute(p,i);b.fromBufferAttribute(p,i+1);c.fromBufferAttribute(p,i+2);cross.crossVectors(b.sub(a),c.sub(a));
   const normal=new THREE.Vector3().fromBufferAttribute(n,i);assert.ok(cross.dot(normal)>-1e-5,'reflected glyph faces point inward');
   if(normal.z>.999&&Math.abs(a.z-geometry.boundingBox.max.z)<.001)front++;if(normal.z<-.999&&Math.abs(a.z-geometry.boundingBox.min.z)<.001)back++;
  }
  assert.ok(front>0&&back>0,'a cap is missing');assert.deepEqual(new Set(geometry.groups.map(g=>g.materialIndex)),new Set([0,1]));geometry.dispose();
 }
 const word=textGeometry('Let’s build what’s next.');assert.ok(word.boundingBox.max.x>word.boundingBox.min.x);word.dispose();
});

test('heading layout groups whole words using absolute line coordinates and preserves emphasis gaps',()=>{
 const origin={left:140,top:313},samples=[];
 for(const [row,text] of ['Always','asking '].entries())for(const [i,char] of [...text].entries())samples.push({text:char,left:140+i*20,right:160+i*20,top:400+row*100,width:20,height:80});
 const lines=flowTextLines(samples,origin);
 assert.equal(lines.length,2);assert.deepEqual(lines.map(l=>l.text),['Always','asking']);
 assert.equal(lines[0].top,87);assert.equal(lines[1].width,120,'the trailing blank was stretched into the word');
 assert.equal(lines[1].left+lines[1].width,120);assert.equal(lines[1].accent,false);
});

test('shared prose planes and sculpted letters project together with finite responsive transforms',()=>{
 for(const [width,height] of [[2560,1440],[1440,900],[1280,720],[390,844],[320,640]]){
  const camera=new THREE.PerspectiveCamera(40,width/height,.1,280);camera.position.set(8,9,-22);camera.lookAt(2,4,-40);camera.updateMatrixWorld();camera.updateProjectionMatrix();
  const rect={left:width*.06,top:height*.2,width:width*.8,height:height*.5,viewportWidth:width,viewportHeight:height},frame=surfaceFrame(rect,camera);
  assert.ok(frame.matrix.elements.every(Number.isFinite));assert.ok(frame.pixel>0);
  const plane=new THREE.Plane().setFromCoplanarPoints(...frame.points.slice(0,3));frame.points.forEach(p=>assert.ok(Math.abs(plane.distanceToPoint(p))<1e-7));
  const projected=frame.points.map(p=>p.clone().project(camera));assert.ok(projected.every(p=>p.toArray().every(Number.isFinite)));
  assert.ok(Math.max(...projected.map(p=>p.x))<1&&Math.min(...projected.map(p=>p.x))>-1);
 }
});

test('the name entrance settles, hover is local, and motion-off is a complete stationary pose',()=>{
 for(let i=0;i<13;i++){
  const rest=letterPose(i,5000);assert.equal(rest.moving,false);assert.ok([rest.x,rest.y,rest.z,rest.rx,rest.ry,rest.rz].every(v=>Math.abs(v)<1e-9));
  const off=letterPose(i,0,{motion:false});assert.deepEqual(off,rest);
 }
 assert.ok(letterPose(2,5000,{x:0,hover:1}).z>letterPose(0,5000,{x:0,hover:1}).z);
 assert.equal(copyOpacity('name',{chapter:'lab',progress:0}),0);assert.equal(copyOpacity('caption',{chapter:'gallery',progress:0}),0);
});
