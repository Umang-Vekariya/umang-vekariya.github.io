import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {pedestalGeometry,apertureGeometry,roundedSolid,createExhibitSurface,createDisplayHousing} from '../dist/spatial-craft.js';
import {createFormGeometry} from '../dist/engineering-form.js';

test('machined surfaces have finite unit normals and preserve their actual dimensions',()=>{
 for(const g of [pedestalGeometry(6,.52),apertureGeometry(),roundedSolid(12.68,8.22,.42)]){
  g.computeBoundingBox();assert.ok(g.boundingBox.max.x>0);for(const attr of [g.attributes.position,g.attributes.normal])for(const v of attr.array)assert.ok(Number.isFinite(v));
  for(let i=0;i<g.attributes.normal.count;i++){const n=new THREE.Vector3().fromBufferAttribute(g.attributes.normal,i);assert.ok(n.length()<1.001);}
  g.dispose();
 }
});

test('the bezel cannot cover or intercept the actual project display',()=>{
 const material=new THREE.MeshBasicMaterial(),{group,screen}=createDisplayHousing({metal:material,dark:material,lime:material});group.updateMatrixWorld(true);
 for(const x of [-5.8,0,5.8])for(const y of [-3.6,0,3.6]){const ray=new THREE.Raycaster(new THREE.Vector3(x,y,10),new THREE.Vector3(0,0,-1));assert.equal(ray.intersectObjects(group.children)[0]?.object,screen);}
 group.traverse(o=>o.geometry?.dispose());material.dispose();screen.material.dispose();
});

test('both sculpture states keep continuous normals at the closed machining seams',()=>{
 const segments=320,sides=64,g=createFormGeometry(segments,sides);
 for(const n of [g.attributes.normal,g.morphAttributes.normal[0]]){
  const distance=(i,j)=>new THREE.Vector3().fromBufferAttribute(n,i).distanceTo(new THREE.Vector3().fromBufferAttribute(n,j));
  for(let j=0;j<=sides;j++)assert.ok(distance(j,segments*(sides+1)+j)<1e-6);
  for(let i=0;i<=segments;i++)assert.ok(distance(i*(sides+1),i*(sides+1)+sides)<1e-6);
 }g.dispose();
});

test('each exhibit retains its own live frame when the shared demo moves on, including a late poster load',()=>{
 const canvas=()=>{const c={pixels:null},ctx={fillStyle:'',fillRect(){c.pixels='background';},drawImage(image){c.pixels=image.id;}};c.getContext=()=>ctx;return c;};
 const a=createExhibitSurface(canvas()),b=createExhibitSurface(canvas());a.poster({id:'poster A',width:100,height:200});b.poster({id:'poster B',width:200,height:100});
 const shared={id:'live A'};a.frame(shared);shared.id='live B';b.frame(shared);a.poster({id:'late A',width:100,height:100});
 assert.equal(a.canvas.pixels,'live A');assert.equal(b.canvas.pixels,'live B');assert.notEqual(a.texture,b.texture);assert.equal(a.live,true);a.dispose();b.dispose();
});
