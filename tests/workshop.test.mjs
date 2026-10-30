import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {workshopStations,workshopShot,stationMapPoint} from '../dist/workshop-layout.js';
import {projects} from '../dist/portfolio-data.js';
import {createProjectWorlds} from '../dist/project-worlds.js';
import {createWorkshop} from '../dist/workshop-architecture.js';
import {storyAtProgress,storyProgress} from '../dist/story-model.js';
import {readFileSync} from 'node:fs';
import {FontLoader} from '../dist/vendor/loaders/FontLoader.js';
import {createProfileFoyer} from '../dist/profile-foyer.js';
import {profileStops,profileEnd,profileShot,profileAtProgress} from '../dist/profile-layout.js';

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
  assert.equal(profileStops.length,3);assert.ok(profileStops.every(s=>s.z>0));
  assert.deepEqual(profileAtProgress(0),{phase:0,index:0});assert.deepEqual(profileAtProgress(1),{phase:profileEnd,index:2});
  for(const [width,height] of [[1440,900],[1280,720],[820,900],[390,844],[320,640]]){
   const aspect=width/height,portrait=width<height*.85,camera=new THREE.PerspectiveCamera(35,aspect,.1,180);
   for(let i=0;i<3;i++)for(const motion of [true,false]){
    foyer.update({active:i,time:2,motion,portrait,narrow:!portrait&&aspect<1.25,visible:true});
    room.update({time:2,motion,index:-1,showProjects:false});
    assert.equal(room.exhibition.visible,false);assert.equal(room.gate.visible,true);
    assert.equal(foyer.roots.filter(r=>r.visible).length,1);
    const shot=profileShot(i,{portrait,aspect,phase:i});camera.position.set(...shot.position);camera.lookAt(...shot.target);camera.updateMatrixWorld();scene.updateMatrixWorld(true);
    const center=foyer.anchors[i].getWorldPosition(new THREE.Vector3()).project(camera);
    assert.ok(Math.abs(center.x)<.95&&Math.abs(center.y)<.95,`profile ${i} outside ${width}x${height}`);
    foyer.roots[i].traverse(o=>assert.ok(o.matrixWorld.elements.every(Number.isFinite)));
   }
  }
  room.update({time:2,motion:false,showProjects:true});assert.equal(room.exhibition.visible,true);assert.equal(room.gate.visible,false);
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  assert.ok(html.indexOf('id="about"')<html.indexOf('id="project-overview"'));
  assert.ok(html.indexOf('id="experience"')<html.indexOf('id="project-overview"'));
  assert.equal((html.match(/data-profile-stop="/g)||[]).length,3);
 }finally{globalThis.document=original;}
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
