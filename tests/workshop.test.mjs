import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {workshopStations,workshopShot,workshopTravel,stationMapPoint} from '../dist/workshop-layout.js';
import {projects} from '../dist/portfolio-data.js';
import {createProjectWorlds} from '../dist/project-worlds.js';
import {createWorkshop} from '../dist/workshop-architecture.js';
import {storyAtProgress,storyProgress} from '../dist/story-model.js';
import {readFileSync} from 'node:fs';
import {FontLoader} from '../dist/vendor/loaders/FontLoader.js';
import {createProfileFoyer} from '../dist/profile-foyer.js';
import {createSpatialType} from '../dist/spatial-type.js';
import {profileStops,profileEnd,profileShot,profileAtProgress,profileRail,profileWeight,profilePhaseAtScroll} from '../dist/profile-layout.js';

test('the floor plan, project data, and scroll route address the same eight projects',()=>{
 assert.deepEqual(workshopStations.map(s=>s.id),projects.map(s=>s.id));
 assert.equal(new Set(workshopStations.map(s=>`${s.x}/${s.z}`)).size,8);
 for(let i=0;i<8;i++){
  const map=stationMapPoint(i);assert.ok(map.x>0&&map.x<100&&map.y>0&&map.y<100);
  for(const phase of [0,1,2]){const p=storyAtProgress(storyProgress(i,phase,8),8);assert.equal(p.index,i);assert.ok(Math.abs(p.phase-phase)<1e-10);}
 }
});

test('personal installations precede the project hall and frame correctly across viewport proportions',()=>{
 const original=globalThis.document;globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
 try{
  const scene=new THREE.Scene(),mat=new THREE.MeshStandardMaterial();
  const box=(w,h,d,m,x=0,y=0,z=0)=>{const a=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);a.position.set(x,y,z);return a;};
  const font=new FontLoader().parse(JSON.parse(readFileSync(new URL('../dist/assets/helvetiker_bold.typeface.json',import.meta.url),'utf8')));
  const room=createWorkshop({scene,box,chrome:mat,graphite:mat,red:mat});
  const foyer=createProfileFoyer({scene,box,font,chrome:mat,graphite:mat,red:mat});
  assert.equal(profileStops.length,3);assert.ok(profileStops.every(s=>s.z>-13));
  assert.deepEqual(profileAtProgress(0),{phase:0,index:0});assert.deepEqual(profileAtProgress(1),{phase:profileEnd,index:2});
  for(const [width,height] of [[1920,1080],[1440,900],[1280,720],[1280,600],[820,1400],[390,844],[320,640],[320,900]]){
   const aspect=width/height,portrait=width<=760||height<=620,camera=new THREE.PerspectiveCamera(35,aspect,.1,180);
   for(let i=0;i<3;i++)for(const motion of [true,false]){
    foyer.update({active:i,phase:i,time:2,motion,portrait,aspect,visible:true});
    room.update({time:2,motion,index:-1,showProjects:false});
    assert.equal(room.exhibition.visible,false);
    assert.ok(foyer.roots[i].visible);
    const shot=profileShot(i,{portrait,aspect,phase:i});camera.position.set(...shot.position);camera.lookAt(...shot.target);camera.updateMatrixWorld();scene.updateMatrixWorld(true);
    const center=foyer.anchors[i].getWorldPosition(new THREE.Vector3()).project(camera);
    assert.ok(Math.abs(center.x)<.95&&Math.abs(center.y)<.95,`profile ${i} outside ${width}x${height}`);
    const bounds=new THREE.Box3().setFromObject(foyer.roots[i]);
    for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
     const corner=new THREE.Vector3(x,y,z).project(camera);
     if(portrait){assert.ok(Math.abs(corner.x)<.99&&corner.y>.08&&corner.y<.90,`profile ${i} silhouette clips mobile visual area at ${width}x${height}: ${corner.toArray()}`);}
     else{const horizontal=i===2?-corner.x:corner.x;assert.ok(horizontal>.02&&horizontal<.98&&corner.y>-.80&&corner.y<.75,`profile ${i} silhouette crosses copy/header/footer at ${width}x${height}: ${corner.toArray()}`);}
    }
    foyer.roots[i].traverse(o=>assert.ok(o.matrixWorld.elements.every(Number.isFinite)));
   }
  }
  room.update({time:2,motion:false,showProjects:true});assert.equal(room.exhibition.visible,true);
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  assert.ok(html.indexOf('id="about"')<html.indexOf('id="project-overview"'));
  assert.ok(html.indexOf('id="experience"')<html.indexOf('id="project-overview"'));
  assert.equal((html.match(/data-profile-stop="/g)||[]).length,3);
 }finally{globalThis.document=original;}
});

test('native scene labels track the experience anchors on the left and hide with their installation',()=>{
 const original=globalThis.document;
 const element=()=>({style:{},children:[],hidden:false,setAttribute(){},append(...children){this.children.push(...children);}});
 globalThis.document={createElement:element};
 try{
  const host=element(),type=createSpatialType(host),root=new THREE.Group(),anchor=new THREE.Object3D();root.add(anchor);root.position.set(-3,0,-7.6);root.userData.labelAlpha=1;
  const el=type.add(anchor,{width:4.7,kind:'record',record:{date:'May–Jul 2026',title:'Software Engineering Intern',organization:'Mahant Solutions'}});
  const camera=new THREE.PerspectiveCamera(35,16/9,.1,180);camera.position.set(0,.4,4.2);camera.lookAt(0,.1,-7.6);camera.updateMatrixWorld();root.updateMatrixWorld(true);
  type.render(camera,{width:1920,height:1080});assert.equal(el.hidden,false);
  const x=Number(el.style.transform.match(/translate3d\(([-\d.]+)px/)[1]);assert.ok(x>0&&x<960,'experience label is not on the left');
  assert.ok(parseFloat(el.style.width)>200,'record text has no usable reading width');assert.equal(el.children[1].textContent,'Software Engineering Intern');
  root.userData.labelAlpha=.2;type.render(camera,{width:1920,height:1080});assert.equal(el.hidden,true);
  root.userData.labelAlpha=1;root.visible=false;type.render(camera,{width:1920,height:1080});assert.equal(el.hidden,true);
 }finally{globalThis.document=original;}
});

test('the overview rail stays continuous, forward-facing, and populated throughout each move',()=>{
 for(const portrait of [false,true]){
  let previous=profileRail(0,{portrait});
  for(let p=.001;p<=profileEnd;p+=.001){
   const next=profileRail(p,{portrait}),distance=Math.hypot(...next.position.map((v,i)=>v-previous.position[i]));
   assert.ok(distance<.02,'camera jumps at phase '+p);
   assert.ok(next.position[2]<=previous.position[2]+1e-8,'camera reverses direction');
   const direction=next.target.map((v,i)=>v-next.position[i]);assert.ok(Math.abs(direction[0])<1e-8&&direction[2]<-10,'camera turns away from the forward path');
   const weights=profileStops.map((_,i)=>profileWeight(i,p));assert.ok(weights.every(w=>w>=0&&w<=1));assert.ok(Math.abs(weights.reduce((a,b)=>a+b,0)-1)<1e-8,'installation disappears during a transition');previous=next;
  }
 }
 const anchors=[100,1000,2100];assert.equal(profilePhaseAtScroll(100,anchors),0);assert.equal(profilePhaseAtScroll(1000,anchors),1);assert.equal(profilePhaseAtScroll(2100,anchors),2);
});

const context=new Proxy({}, {get:(_,key)=>['fillRect','fillText','beginPath','moveTo','lineTo','stroke','strokeRect'].includes(key)?()=>{}:undefined,set:()=>true});
test('station screens remain visible and unobstructed in the shared workshop',()=>{
 const original=globalThis.document;globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
 try{
  const scene=new THREE.Scene(),texture=new THREE.Texture({width:1200,height:760}),mat=new THREE.MeshStandardMaterial();
  const box=(w,h,d,m,x=0,y=0,z=0)=>{const a=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);a.position.set(x,y,z);return a;};
  const engine={states:{wnams:{samples:[]},'vit-vault':{outbox:{online:false,items:[]}},realityforge:{x:.5,y:.5,ball:{x:.2,y:.3}},'playable-replay':{control:false},clubsphere:{bookings:{booked:[],waiting:[]}}}};
  createWorkshop({scene,box,chrome:mat,graphite:mat,red:mat});
  const worlds=createProjectWorlds({scene,texture,box,chrome:mat,graphite:mat,red:mat,engine});
  const camera=new THREE.PerspectiveCamera(35,1,.1,180),raycaster=new THREE.Raycaster();
  for(const [width,height] of [[1440,900],[1280,720],[820,900],[390,844],[320,640]]){
   const aspect=width/height,portrait=width<height*.85;camera.aspect=aspect;camera.updateProjectionMatrix();
   for(let i=0;i<8;i++)for(const phase of [0,1,2.6]){
    worlds.update({phase,time:1,delta:.016,motion:false,portrait,index:i,compact:!portrait&&height<700,narrow:!portrait&&aspect<1.25});
    const shot=workshopShot(i,{portrait,phase,aspect});camera.position.set(...shot.position);camera.lookAt(...shot.target);camera.updateMatrixWorld();scene.updateMatrixWorld(true);
    for(const screen of worlds.screens){
     const center=screen.getWorldPosition(new THREE.Vector3()),projected=center.clone().project(camera);
     assert.ok(Math.abs(projected.x)<.95&&Math.abs(projected.y)<.95,`station ${i} screen outside ${width}x${height}: ${projected.toArray()}`);
     raycaster.set(camera.position,center.clone().sub(camera.position).normalize());
     const hits=raycaster.intersectObjects(scene.children,true),screenHit=hits.find(h=>h.object===screen);
     assert.ok(screenHit,`station ${i} screen faces away from camera`);
     const shown=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
     const activeRoot=scene.children[i+1];
     const belongsToActive=o=>{for(let p=o;p;p=p.parent)if(p===activeRoot)return true;return false;};
     // Pins and the frame scanner deliberately sit above their own display.
     const blockers=hits.filter(h=>shown(h.object)&&!belongsToActive(h.object)&&h.distance<screenHit.distance-.02&&h.object.isMesh&&!h.object.material.transparent);
     assert.equal(blockers.length,0,`station ${i} blocked at ${width}x${height}: ${blockers.map(h=>h.object.geometry.type+' at '+h.object.getWorldPosition(new THREE.Vector3()).toArray())}`);
    }
    const activeMap=worlds.screens[0].material.map;
    worlds.update({phase:0,time:1,delta:.016,motion:false,portrait:false,index:-1});
    assert.notEqual(scene.children[i+1].children.find(c=>c.children?.some(s=>s.userData.liveMap))?.children.find(s=>s.userData.liveMap)?.material.map,activeMap);
   }
  }
 }finally{globalThis.document=original;}
});


test('scroll-driven station travel meets the next pose continuously and reverses exactly',()=>{
 for(const options of [{portrait:false,aspect:1.78},{portrait:true,aspect:.46}]){
  for(let index=0;index<7;index++){
   assert.deepEqual(workshopTravel(index,{...options,phase:2.6,motion:false}),workshopShot(index,{...options,phase:2.6}));
   const end=workshopTravel(index,{...options,phase:2.6}),next=workshopTravel(index+1,{...options,phase:0});
   for(const key of ['position','target'])for(let axis=0;axis<3;axis++)assert.ok(Math.abs(end[key][axis]-next[key][axis])<1e-8);
   let previous=workshopTravel(index,{...options,phase:2.15});
   const poses=[];
   for(let step=1;step<=450;step++){
    const pose=workshopTravel(index,{...options,phase:2.15+step*.001});
    assert.ok(Math.hypot(...pose.position.map((v,i)=>v-previous.position[i]))<.18,'travel jumps between scroll positions');
    assert.ok([...pose.position,...pose.target].every(Number.isFinite));poses.push(pose);previous=pose;
   }
   for(let step=450;step>=1;step--)assert.deepEqual(workshopTravel(index,{...options,phase:2.15+step*.001}),poses[step-1]);
  }
  assert.deepEqual(workshopTravel(7,{...options,phase:2.6}),workshopShot(7,{...options,phase:2.6}));
 }
});
