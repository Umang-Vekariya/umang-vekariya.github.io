import * as THREE from 'three';
import {workshopStations} from './workshop-layout.js';
export const stationAccents=[0xd58a63,0x9eb9c3,0xb5c6a3,0xd4ad79,0x98c1ad,0xe39670,0xb7afcc,0x9bb9b0];
// Open exhibition islands share a light-path network; no repeated room walls.
export function createWorkshop({scene,box,chrome,graphite,red}){
 const room=new THREE.Group();room.name='Living Lab / connected islands';scene.add(room);
 const exhibition=new THREE.Group();exhibition.name='Project gallery';room.add(exhibition);
 const stone=new THREE.MeshStandardMaterial({color:0x182125,metalness:.5,roughness:.48});
 const light=new THREE.MeshBasicMaterial({color:0x9dafaa});
 const islands=[],workLights=[],arches=[];
 for(const [i,s] of workshopStations.entries()){
  const bay=new THREE.Group();bay.position.set(s.x,0,s.z);bay.rotation.y=s.x<0?Math.PI/2:-Math.PI/2;exhibition.add(bay);islands.push(bay);
  const accent=new THREE.MeshBasicMaterial({color:stationAccents[i]});
  const base=new THREE.Mesh(new THREE.CylinderGeometry(4.2,4.6,.28,48),stone);base.position.set(0,-3.23,-.25);bay.add(base);
  const perimeter=new THREE.Mesh(new THREE.TorusGeometry(4.2,.016,5,96),accent);perimeter.rotation.x=-Math.PI/2;perimeter.position.set(0,-3.07,-.25);bay.add(perimeter);
  if(i!==5){bay.add(box(6.1,.12,1.4,graphite,0,-2.42,-.22));for(const x of [-2.5,2.5])bay.add(box(.08,.60,.9,chrome,x,-2.78,-.22));}
  const shape=new THREE.Group();shape.position.set(0,.05,-1.65);bay.add(shape);arches.push(shape);
  if(i%3===0){for(let n=0;n<2;n++){const ring=new THREE.Mesh(new THREE.TorusGeometry(3.5+n*.3,.035,6,96,Math.PI*1.7),n?stone:chrome);ring.rotation.z=-Math.PI*.35+n*.12;ring.position.z=-n*.35;shape.add(ring);}const arc=new THREE.Mesh(new THREE.TorusGeometry(3.55,.018,5,96,Math.PI*.8),accent);arc.rotation.z=.4;shape.add(arc);}
  else if(i%3===1){for(const side of [-1,1]){const column=box(.1,5.7,.12,chrome,side*3.35,.15,0);column.rotation.z=side*-.12;shape.add(column);shape.add(box(.018,4.3,.025,accent,side*3.4,.1,.08));}shape.add(box(6.5,.08,.15,stone,0,3.0,0));}
  else {for(let n=0;n<3;n++){const frame=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([[-3.3,-2.65,0],[3.3,-2.65,0],[3.3,2.8,0],[-3.3,2.8,0]].map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color:n?0x334447:stationAccents[i],transparent:true,opacity:n?.35:.65}));frame.position.z=-n*.48;frame.rotation.z=(n-1)*.025;shape.add(frame);}}
  const pool=new THREE.PointLight(stationAccents[i],9,13,2);pool.position.set(s.x+(s.x<0?2.6:-2.6),3.4,s.z);exhibition.add(pool);workLights.push(pool);
 }
 const route=[new THREE.Vector3(0,-3.12,-4),...workshopStations.map(s=>new THREE.Vector3(s.x,-3.12,s.z))];
 const curve=new THREE.CatmullRomCurve3(route,false,'centripetal');
 const path=new THREE.Mesh(new THREE.TubeGeometry(curve,180,.018,5,false),new THREE.MeshBasicMaterial({color:0x8a5842}));exhibition.add(path);
 const nodes=new THREE.InstancedMesh(new THREE.SphereGeometry(.045,6,5),light,80),matrix=new THREE.Matrix4();for(let i=0;i<80;i++){matrix.makeTranslation(...curve.getPoint(i/79).toArray());nodes.setMatrixAt(i,matrix);}exhibition.add(nodes);
 const hub=new THREE.Mesh(new THREE.TorusGeometry(11.8,.04,6,128),new THREE.MeshBasicMaterial({color:0x284347}));hub.rotation.x=Math.PI/2;hub.position.set(0,-3.5,-31);exhibition.add(hub);
 return {root:room,exhibition,update({time=0,motion=true,index=-1,showProjects=true,phase=0}){
  exhibition.visible=showProjects;
  islands.forEach((island,i)=>{island.visible=index<0||Math.abs(i-index)<=1;});
  workLights.forEach((l,i)=>{const t=Math.max(0,Math.min(1,(phase-2.05)/.55));l.intensity=index<0?4:i===index?16-12*t:i===index+1?4+12*t:2;l.visible=index<0||Math.abs(i-index)<=1;});
  arches.forEach((a,i)=>{a.rotation.z=motion&&i===index?Math.sin(time*.12)*.012:0;});
 }};
}
