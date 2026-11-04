import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {atlasOrder,atlasPose} from '../dist/project-atlas.js';
import {spatialShot} from '../dist/spatial-layout.js';

function models(opening=1,hovered=-1,portrait=false){const root=new THREE.Group(),targets=[];root.position.set(portrait?4.5:6,0,-26);root.scale.setScalar(portrait?.88:1);for(let i=0;i<8;i++){const p=atlasPose(i,opening,hovered),leaf=new THREE.Group();leaf.position.set(p.x,p.y,p.z);leaf.rotation.set(...p.rotation);root.add(leaf);const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2.57,4.32),new THREE.MeshBasicMaterial());mesh.position.set(0,2.28,.115);mesh.userData.index=i;leaf.add(mesh);targets.push(mesh);}root.updateMatrixWorld(true);return {root,targets};}

test('all eight real projects have a distinct stable atlas position and remain pickable through the fan',()=>{
 assert.deepEqual([...atlasOrder].sort(),[0,1,2,3,4,5,6,7]);
 for(const portrait of [false,true])for(const opening of [.85,1]){
 const {targets}=models(opening,-1,portrait),shot=spatialShot({chapter:'home',progress:1,portrait}),camera=new THREE.Vector3(...shot.position),ray=new THREE.Raycaster(),picked=new Set();
 for(const target of targets)for(let x=0;x<=14;x++)for(let y=0;y<=20;y++){const point=new THREE.Vector3(-1.27+x/14*2.54,-2.14+y/20*4.28,0).applyMatrix4(target.matrixWorld);ray.set(camera,point.sub(camera).normalize());const first=ray.intersectObjects(targets,false)[0];if(first)picked.add(first.object.userData.index);}
 assert.equal(picked.size,8,`unreachable folios: ${[0,1,2,3,4,5,6,7].filter(i=>!picked.has(i))}`);
 }
 for(let hover=-1;hover<8;hover++)for(let i=0;i<8;i++){const a=atlasPose(i,1,hover);assert.ok([a.x,a.y,a.z,...a.rotation].every(Number.isFinite));assert.deepEqual(a,atlasPose(i,1,hover));}
});

test('the atlas covers stay within the desktop and phone overview frame',()=>{
 for(const [w,h] of [[1440,900],[390,844],[320,640]]){const portrait=w<760,{targets}=models(1,-1,portrait),shot=spatialShot({chapter:'home',progress:1,portrait}),camera=new THREE.PerspectiveCamera(shot.fov,w/h,.1,280);camera.position.set(...shot.position);camera.lookAt(new THREE.Vector3(...shot.target));camera.updateMatrixWorld();
 for(const target of targets)for(const x of [-1.29,1.29])for(const y of [-2.16,2.16]){const p=new THREE.Vector3(x,y,0).applyMatrix4(target.matrixWorld).project(camera);assert.ok(Math.abs(p.x)<1&&Math.abs(p.y)<1,`${w}x${h} crops a folio: ${p.toArray()}`);}
 }
});
