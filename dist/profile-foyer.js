import * as THREE from 'three';
import {TextGeometry} from './vendor/geometries/TextGeometry.js';
import {profileStops} from './profile-layout.js';
import {profile} from './portfolio-data.js';

// Personal installations occupy the entrance wing, ahead of the project hall.
export function createProfileFoyer({scene,box,font,chrome,graphite,red}){
 const foyer=new THREE.Group();foyer.name='Personal foyer';scene.add(foyer);
 const mint=new THREE.MeshBasicMaterial({color:0x9abfb3});
 const warm=new THREE.MeshStandardMaterial({color:0xb77658,metalness:.72,roughness:.3});
 const stone=new THREE.MeshStandardMaterial({color:0x233135,metalness:.4,roughness:.52});
 const type=new THREE.MeshPhysicalMaterial({color:0xe4dbcb,metalness:.35,roughness:.28});
 const roots=[],anchors=[],orbital=[],beacons=[];
 const line=(points,mat=mint)=>new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color:mat.color,transparent:true,opacity:.4}));
 function plaque(text,width=4,height=.32,color='#d4e0d0'){
  const c=document.createElement('canvas');c.width=1200;c.height=128;const x=c.getContext('2d');x.fillStyle='#122025';x.fillRect(0,0,1200,128);x.font='500 36px monospace';x.fillStyle=color;x.textAlign='center';x.textBaseline='middle';x.fillText(text,600,65);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,toneMapped:false}));
 }
 function word(text,size=.6,material=type){const g=new TextGeometry(text,{font,size,depth:.09,curveSegments:6,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:2});g.computeBoundingBox();g.translate(-g.boundingBox.max.x/2,0,0);return new THREE.Mesh(g,material);}
 function ring(radius,material=mint,tube=.012){return new THREE.Mesh(new THREE.TorusGeometry(radius,tube,8,72),material);}
 function label(root,text,x,y,z,width=2.2){const l=plaque(text,width,.27);l.position.set(x,y,z);root.add(l);return l;}
 for(const [i,s] of profileStops.entries()){
  const root=new THREE.Group();root.name=s.label;root.position.set(s.x,0,s.z);root.rotation.y=s.x<0?Math.PI/2:-Math.PI/2;foyer.add(root);roots.push(root);
  root.add(box(7.4,.16,4.4,graphite,0,-3.04,-.2));root.add(box(7.4,.025,.035,red,0,-2.94,1.97));
  root.add(box(7.2,5.6,.14,stone,0,.05,-1.25));root.add(box(.035,5.6,.025,red,-3.55,.05,-1.16));
  label(root,`UMANG / 0${i+1} / ${s.label}`,0,3.2,-1.1,6.8);
  root.add(box(6.3,.18,1.9,stone,0,-2.35,-.1));for(const x of [-2.8,2.8])root.add(box(.12,.75,1.35,chrome,x,-2.73,-.2));
  const anchor=new THREE.Object3D();anchor.position.set(0,.35,.15);root.add(anchor);anchors.push(anchor);
 }
 // Curiosity becomes a connected, three-dimensional map of Umang's interests.
 {
  const root=roots[0],brain=new THREE.Group();root.add(brain);orbital.push(brain);
  const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.64,1),chrome);core.position.set(0,.3,.2);brain.add(core);
  const vertices=[[-2.1,1.15,.25],[2.0,1.05,.1],[0,-1.25,.5]];
  for(const [i,v] of vertices.entries()){
   brain.add(line([[0,.3,.2],v]));const node=new THREE.Mesh(new THREE.IcosahedronGeometry(.23,1),warm);node.position.set(...v);brain.add(node);
   const orbit=ring(.42,i===1?red:mint);orbit.position.copy(node.position);brain.add(orbit);
   label(root,['AI & VISION','SYSTEMS','LANGUAGES'][i],v[0],v[1]-.6,.4,1.9);
  }
  for(let i=0;i<2;i++){const orbit=ring(1.04+i*.18,i?warm:mint);orbit.position.set(0,.3,.2);orbit.rotation.set(.4+i*.8,.35*i,0);root.add(orbit);orbital.push(orbit);}
  label(root,'MUMBAI  →  VELLORE',0,-1.91,.25,4.6);
 }
 // The academic record is physical type, paired with the tools used in the work.
 {
  const root=roots[1],score=word(profile.cgpa,1.35);score.position.set(-.1,.15,.18);root.add(score);
  const denominator=word('/ 10',.27,warm);denominator.position.set(1.9,.2,.22);root.add(denominator);
  label(root,'CURRENT CGPA / VIT VELLORE',0,1.87,.12,5.3);
  label(root,'B.TECH · COMPUTER SCIENCE / AI & ML',0,-.45,.2,5.4);
  const modules=[['PYTHON / C++',-1.92],['TENSORFLOW / OPENCV',0],['REACT / FASTAPI',1.92]];
  for(const [name,x] of modules){const module=box(1.7,.64,.8,stone,x,-1.62,.16);root.add(module);label(root,name,x,-1.55,.58,1.57);const lamp=box(1.32,.018,.025,mint,x,-1.82,.58);root.add(lamp);beacons.push(lamp);root.add(line([[x,-1.28,.16],[x,-.9,.16],[0,-.9,.16],[0,-.55,.16]]));}
 }
 // An actual timeline, rather than invented metrics or achievement badges.
 {
  const root=roots[2];root.add(box(.028,3.5,.035,warm,-2.3,.05,.2));
  const records=[['MAY — JUL 2026','SOFTWARE ENGINEERING INTERN','MAHANT SOLUTIONS',1.12],['JUL 2026','EDGE AI & ROBOTICS','ACM INDIA · IISC BENGALURU',-.72]];
  for(const [date,title,org,y] of records){const node=new THREE.Mesh(new THREE.SphereGeometry(.1,16,12),mint);node.position.set(-2.3,y,.25);root.add(node);const orbit=ring(.2,red);orbit.position.copy(node.position);root.add(orbit);beacons.push(orbit);root.add(line([[-2.3,y,.2],[-1.7,y,.2]]));label(root,date,.45,y+.37,.2,4.6);label(root,title,.45,y-.08,.2,4.6);label(root,org,.45,y-.48,.2,4.6);}
  label(root,'OPEN TO AI & SOFTWARE ENGINEERING INTERNSHIPS',0,-2.05,.2,6.2);
 }
 return {root:foyer,roots,anchors,update({active=-1,time=0,motion=true,portrait=false,narrow=false,visible=true}){
  foyer.visible=visible;
  roots.forEach((root,i)=>{
   // Hide other personal displays in the close-up; room architecture stays shared.
   root.visible=i===active;root.position.y=portrait?2.05:0;root.scale.setScalar(portrait?.66:narrow?.86:1);
  });
  orbital.forEach((o,i)=>{if(i===0)o.rotation.y=motion?Math.sin(time*.18)*.08:0;else o.rotation.z=motion?time*.065*(i%2?1:-1):0;});
  beacons.forEach((o,i)=>o.scale.setScalar(motion?1+Math.sin(time*1.3+i)*.07:1));
 }};
}
