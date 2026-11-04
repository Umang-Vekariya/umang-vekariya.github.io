import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {atlasOrder,atlasPose,atlasBankX,atlasClearanceParting} from '../dist/project-atlas.js';
import {spatialShot,atlasPassageShot} from '../dist/spatial-layout.js';

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

test('four persistent folios part to each side before the camera crosses their plane',()=>{
 for(const portrait of [false,true]){
  const scale=portrait?.88:1,center=portrait?4.5:6;
  let prior=atlasPassageShot(0,{portrait});
  for(let n=0;n<=1000;n++){
   const t=n/1000,shot=atlasPassageShot(t,{portrait}),camera=new THREE.Vector3(...shot.position);
   assert.ok(shot.position[2]<=prior.position[2]);assert.ok(Math.hypot(...shot.position.map((v,i)=>v-prior.position[i]))<.09);
   for(let i=0;i<8;i++){
    const p=atlasPose(i,1,-1,t),matrix=new THREE.Matrix4().compose(new THREE.Vector3(center+p.x*scale,p.y*scale,-26+p.z*scale),new THREE.Quaternion().setFromEuler(new THREE.Euler(...p.rotation)),new THREE.Vector3(scale,scale,scale));
    const local=camera.clone().applyMatrix4(matrix.invert());
    assert.ok(!(Math.abs(local.x)<1.65&&local.y>.1&&local.y<4.9&&Math.abs(local.z)<.65),`camera meets folio ${i} at ${t}`);
    assert.deepEqual(p,atlasPose(i,1,-1,t));
   }
   prior=shot;
  }
  assert.deepEqual(atlasPassageShot(0,{portrait}),spatialShot({chapter:'home',progress:1,portrait}));
  assert.deepEqual(atlasPassageShot(1,{portrait}),spatialShot({chapter:'about',progress:0,portrait}));
 }
 const parted=atlasOrder.map(i=>atlasPose(i,1,-1,.48));assert.equal(parted.filter(p=>p.x<0).length,4);assert.equal(parted.filter(p=>p.x>0).length,4);
 assert.ok(parted.every(p=>Math.abs(p.x)>4));assert.ok(atlasBankX(1,.48)-atlasBankX(-1,.48)-4.2>8);
});

test('rapid forward and reverse scroll retain camera clearance while the card poses settle',()=>{
 for(const portrait of [false,true]){
  const scale=portrait?.88:1,center=portrait?4.5:6,camera=new THREE.Vector3(...atlasPassageShot(0,{portrait}).position);
  const poses=Array.from({length:8},(_,i)=>atlasPose(i,1,-1,0));
  for(const targetProgress of [1,0,1,.2,.9,0])for(let frame=0;frame<120;frame++){
   const dt=1/60,k=1-Math.exp(-dt*11),goal=atlasPassageShot(targetProgress,{portrait});camera.lerp(new THREE.Vector3(...goal.position),1-Math.exp(-dt*10));
   poses.forEach((p,i)=>{const target=atlasPose(i,1,-1,targetProgress);for(const key of ['x','y','z'])p[key]+=(target[key]-p[key])*k;p.rotation=p.rotation.map((r,j)=>r+(target.rotation[j]-r)*k);
    const matrix=new THREE.Matrix4().compose(new THREE.Vector3(center+p.x*scale,p.y*scale,-26+p.z*scale),new THREE.Quaternion().setFromEuler(new THREE.Euler(...p.rotation)),new THREE.Vector3(scale,scale,scale));
    const local=camera.clone().applyMatrix4(matrix.invert());assert.ok(!(Math.abs(local.x)<1.65&&local.y>.1&&local.y<4.9&&Math.abs(local.z)<.65),`rapid ${targetProgress} meets folio ${i}`);
   });
  }
 }
});

test('a jump from behind the atlas to the first hero cannot close cards around the lens',()=>{
 for(const portrait of [false,true])for(const dt of [1/144,1/60,.05]){
  const scale=portrait?.88:1,center=portrait?4.5:6,camera=new THREE.Vector3(...atlasPassageShot(1,{portrait}).position),poses=Array.from({length:8},(_,i)=>atlasPose(i,1,-1,1));
  for(const [goal,requested] of [[spatialShot({chapter:'home',progress:0,portrait}),0],[atlasPassageShot(1,{portrait}),1],[spatialShot({chapter:'home',progress:0,portrait}),0]])for(let frame=0;frame<300;frame++){
   camera.lerp(new THREE.Vector3(...goal.position),1-Math.exp(-dt*10));const parting=atlasClearanceParting(requested,camera.z),k=1-Math.exp(-dt*11);
   poses.forEach((p,i)=>{const target=atlasPose(i,1,-1,parting);for(const key of ['x','y','z'])p[key]+=(target[key]-p[key])*k;p.rotation=p.rotation.map((r,j)=>r+(target.rotation[j]-r)*k);
    const matrix=new THREE.Matrix4().compose(new THREE.Vector3(center+p.x*scale,p.y*scale,-26+p.z*scale),new THREE.Quaternion().setFromEuler(new THREE.Euler(...p.rotation)),new THREE.Vector3(scale,scale,scale)),local=camera.clone().applyMatrix4(matrix.invert());
    assert.ok(!(Math.abs(local.x)<1.65&&local.y>.1&&local.y<4.9&&Math.abs(local.z)<.65),`hero jump meets folio ${i} at dt ${dt}`);
   });
  }
 }
});

test('the atlas covers stay within the desktop and phone overview frame',()=>{
 for(const [w,h] of [[1440,900],[390,844],[320,640]]){const portrait=w<760,{targets}=models(1,-1,portrait),shot=spatialShot({chapter:'home',progress:1,portrait}),camera=new THREE.PerspectiveCamera(shot.fov,w/h,.1,280);camera.position.set(...shot.position);camera.lookAt(new THREE.Vector3(...shot.target));camera.updateMatrixWorld();
 for(const target of targets)for(const x of [-1.29,1.29])for(const y of [-2.16,2.16]){const p=new THREE.Vector3(x,y,0).applyMatrix4(target.matrixWorld).project(camera);assert.ok(Math.abs(p.x)<1&&Math.abs(p.y)<1,`${w}x${h} crops a folio: ${p.toArray()}`);}
 }
});
