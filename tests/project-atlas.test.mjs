import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {atlasOrder,atlasPose,atlasBankX,atlasClearanceParting,createProjectAtlas,atlasCanInteract} from '../dist/project-atlas.js';
import {atlasPassagePhase} from '../dist/engineering-motion.js';
import {projects} from '../dist/portfolio-data.js';
import {spatialShot,atlasPassageShot} from '../dist/spatial-layout.js';

function models(opening=1,hovered=-1,portrait=false,parting=0){const root=new THREE.Group(),targets=[];root.position.set(portrait?4.5:6,0,-26);root.scale.setScalar(portrait?.88:1);for(let i=0;i<8;i++){const p=atlasPose(i,opening,hovered,parting),leaf=new THREE.Group();leaf.position.set(p.x,p.y,p.z);leaf.rotation.set(...p.rotation);root.add(leaf);const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2.57,4.32),new THREE.MeshBasicMaterial());mesh.position.set(0,2.28,.115);mesh.userData.index=i;leaf.add(mesh);targets.push(mesh);}root.updateMatrixWorld(true);return {root,targets};}

test('the unselected hand has continuous layering and only the pointed card lifts',()=>{
 const resting=atlasOrder.map(i=>atlasPose(i));
 for(let slot=0;slot<8;slot++){
  const i=atlasOrder[slot],neutral=resting[slot],raised=atlasPose(i,1,i);
  assert.deepEqual(neutral,atlasPose(i,1,-1));assert.ok(raised.y-neutral.y>.8);assert.ok(raised.z-neutral.z>1.2);
  if(slot)assert.ok(Math.abs(neutral.z-resting[slot-1].z-.115)<1e-8,'a project breaks the equal depth progression');
  for(let other=0;other<8;other++)if(other!==i)assert.deepEqual(atlasPose(other,1,i),atlasPose(other));
 }
 assert.equal(atlasPassagePhase(.1),0,'minor scrolling starts the split before hover can be used');
});

test('hovering moves the real card while its original full-border hit region stays stable',()=>{
 const original=globalThis.document,context=new Proxy({}, {get:(_,key)=>key==='measureText'?text=>({width:text.length*12}):()=>{},set:()=>true});
 globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
 const materials={blue:new THREE.MeshBasicMaterial(),dark:new THREE.MeshBasicMaterial(),metal:new THREE.MeshBasicMaterial(),lime:new THREE.MeshBasicMaterial()};let atlas;
 try{
  atlas=createProjectAtlas({projects,stories:Object.fromEntries(projects.map(p=>[p.id,{evidence:[]}])),materials});atlas.group.updateMatrixWorld(true);
  const before=atlas.targets.map(t=>t.matrixWorld.clone());atlas.update(1,3,1,true,0);atlas.group.updateMatrixWorld(true);
  assert.ok(atlas.folios[3].position.y>atlasPose(3).y+.8);
  atlas.targets.forEach((target,i)=>assert.deepEqual(target.matrixWorld.elements,before[i].elements,'hover moved an exposed-edge hit region'));
  const camera=new THREE.Vector3(...spatialShot({chapter:'home',progress:1}).position),ray=new THREE.Raycaster(),target=atlas.targets[3],point=new THREE.Vector3(-1.37,2.1,0).applyMatrix4(target.matrixWorld);ray.set(camera,point.sub(camera).normalize());
  assert.ok(ray.intersectObject(target).length,'the card border is a dead zone');
  atlas.update(1,-1,1,true,0);assert.ok(Math.abs(atlas.folios[3].position.y-atlasPose(3).y)<.001);
 }finally{atlas?.dispose();atlas?.group.traverse(o=>o.geometry?.dispose());Object.values(materials).forEach(m=>m.dispose());if(original===undefined)delete globalThis.document;else globalThis.document=original;}
});

test('the separated banks retain hover, including back cards, without narrowing the camera passage',()=>{
 for(const portrait of [false,true]){
  for(const raw of [.35,.45,.55]){const shot=atlasPassageShot(raw,{portrait});assert.equal(atlasCanInteract('passage',raw,shot.position[2]),true,'separated cards stop responding early');}
  assert.equal(atlasCanInteract('passage',.9,atlasPassageShot(.9,{portrait}).position[2]),false,'a card can be pulled into the approaching lens');
 }
 for(let index=0;index<8;index++){
  const neutral=atlasPose(index,1,-1,1),active=atlasPose(index,1,index,1);
  assert.ok(active.y>neutral.y+.8);assert.ok(active.z>neutral.z+.8);
  assert.ok(Math.abs(active.x)>Math.abs(neutral.x),'the selected card moves into the cleared passage');
 }
 for(const raw of [.35,.45,.55]){
  const {targets}=models(1,-1,false,atlasPassagePhase(raw)),camera=new THREE.Vector3(...atlasPassageShot(raw).position),ray=new THREE.Raycaster(),picked=new Set();
  for(const target of targets)for(let x=0;x<=12;x++)for(let y=0;y<=16;y++){
   const point=new THREE.Vector3(-1.27+x/12*2.54,-2.14+y/16*4.28,0).applyMatrix4(target.matrixWorld);ray.set(camera,point.sub(camera).normalize());const hit=ray.intersectObjects(targets,false)[0];if(hit)picked.add(hit.object.userData.index);
  }
  assert.equal(picked.size,8,`a separated card cannot be pointed at in passage ${raw}`);
 }
});

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
    const p=atlasPose(i,1,-1,atlasPassagePhase(t)),matrix=new THREE.Matrix4().compose(new THREE.Vector3(center+p.x*scale,p.y*scale,-26+p.z*scale),new THREE.Quaternion().setFromEuler(new THREE.Euler(...p.rotation)),new THREE.Vector3(scale,scale,scale));
    const local=camera.clone().applyMatrix4(matrix.invert());
    assert.ok(!(Math.abs(local.x)<1.65&&local.y>.1&&local.y<4.9&&Math.abs(local.z)<.65),`camera meets folio ${i} at ${t}`);
    assert.deepEqual(p,atlasPose(i,1,-1,atlasPassagePhase(t)));
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
   poses.forEach((p,i)=>{const target=atlasPose(i,1,-1,atlasPassagePhase(targetProgress));for(const key of ['x','y','z'])p[key]+=(target[key]-p[key])*k;p.rotation=p.rotation.map((r,j)=>r+(target.rotation[j]-r)*k);
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
