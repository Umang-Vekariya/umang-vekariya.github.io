import * as THREE from 'three';
import {workshopStations} from './workshop-layout.js';

export function createWorkshop({scene,box,chrome,graphite,red}){
 const room=new THREE.Group();scene.add(room);
 const exhibition=new THREE.Group();exhibition.name='Project hall';room.add(exhibition);
 const concrete=new THREE.MeshStandardMaterial({color:0x23292b,roughness:.8,metalness:.18});
 const floorMat=new THREE.MeshStandardMaterial({color:0x15191b,roughness:.36,metalness:.55});
 const copper=new THREE.MeshStandardMaterial({color:0x754334,roughness:.36,metalness:.82});
 const ivory=new THREE.MeshBasicMaterial({color:0xa7b5b1});
 const cool=new THREE.MeshBasicMaterial({color:new THREE.Color(.35,.65,.62)});
 const dim=new THREE.MeshBasicMaterial({color:0x263a3b});
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,88),floorMat);floor.rotation.x=-Math.PI/2;floor.position.set(0,-3.15,-25);room.add(floor);
 const grid=new THREE.GridHelper(88,88,0x384446,0x202b2e);grid.position.set(0,-3.14,-25);room.add(grid);
 room.add(box(32,.2,80,graphite,0,-3.3,-26));
 // A continuous architectural rhythm establishes scale and perspective.
 for(let z=21;z>=-57;z-=6){
  for(const s of [-1,1]){
   room.add(box(.25,11,.38,concrete,s*14,2.2,z));
   room.add(box(.035,7,.045,z%12===9?red:dim,s*13.85,.5,z+.24));
  }
  room.add(box(28,.22,.35,concrete,0,7.65,z));
  room.add(box(8,.035,.07,cool,0,7.49,z));
 }
 for(const x of [-14.5,14.5])room.add(box(.2,11,90,graphite,x,2.2,-15));
 room.add(box(29,11,.2,graphite,0,2.2,-59));
 for(const x of [-2.1,2.1]){
  room.add(box(.025,.02,67,red,x,-3.115,-23));
  for(let z=5;z>=-55;z-=3)room.add(box(.07,.025,.38,cool,x,-3.10,z));
 }
 function sign(text,{width=4,height=.5,color='#d8ddce',background='#10191a',size=38}={}){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;const ctx=canvas.getContext('2d');
  ctx.fillStyle=background;ctx.fillRect(0,0,1024,128);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`500 ${size}px monospace`;ctx.fillText(text,512,65);
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));
 }
 const entrance=sign('UMANG / THE PERSON BEHIND THE WORK',{width:8.6,height:1.05,size:38});entrance.position.set(0,5.3,-4);room.add(entrance);
 const gate=new THREE.Group();gate.name='Personal foyer threshold';gate.position.z=-7;room.add(gate);
 const doors=[];
 for(const side of [-1,1]){const door=new THREE.Group();door.position.x=side*7;door.add(box(14,9,.22,graphite,0,1.3,0));door.add(box(.03,7,.03,red,-side*6.7,1,.14));gate.add(door);doors.push(door);}
 const gateLabel=sign('GET TO KNOW THE PERSON. THEN EXPLORE THE WORK.',{width:10,height:.55,size:30});gateLabel.position.set(0,3.1,.16);gate.add(gateLabel);
 let gateOpen=0;
 const end=sign('KEEP ASKING WHY.',{width:9,height:1.1,size:48});end.position.set(0,3,-58.8);room.add(end);
 const plinth=new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.65,.35,72),graphite);plinth.position.set(0,-2.65,0);room.add(plinth);
 const halo=new THREE.Mesh(new THREE.TorusGeometry(2.52,.018,8,96),red);halo.rotation.x=-Math.PI/2;halo.position.set(0,-2.46,0);room.add(halo);
 const stationLights=[],signals=[];
 for(const [i,s] of workshopStations.entries()){
  const bay=new THREE.Group();bay.position.set(s.x,0,s.z);bay.rotation.y=s.x<0?Math.PI/2:-Math.PI/2;exhibition.add(bay);
  const stage=box(7.5,.16,5,graphite,0,-3.04,-.1);bay.add(stage);
  bay.add(box(7.5,.025,.04,red,0,-2.94,2.39));
  // Floating desks and machine housings give the displays a place in the room.
  if(i!==5){bay.add(box(6.4,.14,2.1,concrete,0,-2.38,-.3));for(const x of [-2.8,2.8])bay.add(box(.12,.7,1.5,chrome,x,-2.75,-.4));}
  bay.add(box(7.4,5.6,.14,concrete,0,-.1,-1.5));
  bay.add(box(.04,5.5,.05,red,-3.67,-.1,-1.38));
  const header=sign(`${String(i+1).padStart(2,'0')} / ${s.area}`,{width:6.7,height:.48,size:34});header.position.set(0,3.12,-1.3);bay.add(header);
  const plaque=sign(s.name.toUpperCase(),{width:4.5,height:.38,color:'#f0aa82',size:36});plaque.position.set(0,-2.6,2.44);bay.add(plaque);
  for(let j=0;j<5;j++){
   bay.add(box(.3,.7,.55,j%2?graphite:copper,3.15,-2.0+j*.75,-1.01));
   const signal=box(.05,.04,.02,cool,3.15,-1.86+j*.75,-.72);bay.add(signal);signals.push(signal);
  }
  const strip=box(6.7,.02,.04,dim,0,2.74,-1.3);bay.add(strip);stationLights.push(strip);
  // All light is intentional: a warm work light and a cool guide strip.
  const pool=new THREE.PointLight(0xf09068,7,10,2);pool.position.set(s.x+(s.x<0?2:-2),3.5,s.z);exhibition.add(pool);
 }
 // Service pipes and cable trays connect the bays instead of floating in space.
 for(const x of [-11.5,11.5]){
  for(let i=0;i<3;i++)room.add(box(.07,.07,60,i===0?copper:chrome,x+i*.15,5.9,-25));
  for(let z=-10;z>=-52;z-=12)room.add(box(2,.065,.065,copper,x/2+Math.sign(x)*2.1,5.9,z));
 }
 const cursor=new THREE.Mesh(new THREE.SphereGeometry(.065,10,8),ivory);room.add(cursor);
 return {root:room,exhibition,gate,update({time,motion,index=-1,showProjects=true,delta=.016}){
  exhibition.visible=showProjects;
  gateOpen=motion?THREE.MathUtils.damp(gateOpen,showProjects?1:0,4,delta):Number(showProjects);
  doors.forEach((door,i)=>door.position.x=(i?1:-1)*(7+gateOpen*14.2));
  gateLabel.visible=gateOpen<.5;gate.visible=gateOpen<.995;
  stationLights.forEach((l,i)=>l.material=i===index?red:dim);
  cursor.visible=motion;cursor.position.set(2.1,-3.03,7-(time*3%64));
  for(let i=0;i<signals.length;i++)signals[i].visible=!motion||(Math.floor(time*.7)+i)%8!==0;
 }};
}
