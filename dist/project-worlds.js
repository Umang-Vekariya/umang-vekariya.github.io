import * as THREE from 'three';
import {projectStories} from './project-stories.js';
import {workshopStations} from './workshop-layout.js';
// Original scene geometry surrounds the live, truthfully labeled project displays.
export const worldNames=['Signal field','Frame observatory','Resilience stack','Compiler workbench','Responsive desk','Reconstruction arcade','Decision gates','Campus constellation'];
export function createProjectWorlds({scene,texture,box,chrome,graphite,red,engine}){
 const worlds=[],panels=[],extraTextures=[];
 const copper=new THREE.MeshStandardMaterial({color:0x9a4431,metalness:.72,roughness:.35});
 const shell=new THREE.MeshStandardMaterial({color:0x171d20,metalness:.72,roughness:.34});
 const ivory=new THREE.MeshStandardMaterial({color:0xc5bfae,metalness:.2,roughness:.65});
 const mint=new THREE.MeshBasicMaterial({color:0x8fbda8});
 const glass=new THREE.MeshPhysicalMaterial({color:0x40565a,metalness:.15,roughness:.25,transparent:true,opacity:.2,depthWrite:false});
 const darkGlow=new THREE.MeshBasicMaterial({color:0x33423d});
 function line(points,color=0xbc5d42,opacity=.65){return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(v=>new THREE.Vector3(...v))),new THREE.LineBasicMaterial({color,transparent:true,opacity}));}
 function ring(radius,mat=red,tube=.014){return new THREE.Mesh(new THREE.TorusGeometry(radius,tube,8,64),mat);}
 function ball(radius,mat){return new THREE.Mesh(new THREE.SphereGeometry(radius,16,12),mat);}
 function cylinder(radius,height,mat){return new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,20),mat);}
 function label(text,width=3.6,height=.3,color='#e7d6bb'){
  const c=document.createElement('canvas');c.width=1024;c.height=96;const x=c.getContext('2d');x.fillStyle='#141719';x.fillRect(0,0,1024,96);x.fillStyle=color;x.font='500 38px monospace';x.textAlign='center';x.textBaseline='middle';x.fillText(text,512,49);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));
 }
 function create(index,phoneScale=.67){const root=new THREE.Group();root.visible=false;scene.add(root);const w={root,index,phoneScale,screens:[],pose:()=>{},tick:()=>{}};worlds.push(w);return w;}
 function panel(w,{frame=true,width=5,height=3.1667,map=texture}={}){
  const g=new THREE.Group();w.root.add(g);
  if(frame){g.add(box(width+.15,height+.15,.12,shell,0,0,-.09));g.add(box(width-.2,.014,.03,copper,0,-height/2-.04,.015));}
  const m=new THREE.MeshBasicMaterial({map,toneMapped:false,transparent:true});const screen=new THREE.Mesh(new THREE.PlaneGeometry(width,height),m);g.add(screen);w.screens.push(screen);panels.push(screen);return g;
 }
 // 01: an inclined survey surface, raised sample pins and propagating signal rings.
 {
  const w=create(0,.68),p=panel(w,{frame:false});p.rotation.x=-.36;
  p.add(box(5.5,3.48,.14,shell,0,0,-.11));
  const grid=new THREE.GridHelper(5.6,16,0x934c39,0x283f40);grid.rotation.x=Math.PI/2;grid.position.z=-.2;p.add(grid);
  const pins=[],rings=[];
  for(let i=0;i<7;i++){const stem=cylinder(.027,.3,copper);stem.rotation.x=Math.PI/2;const cap=ball(.06,ivory),r=ring(.23,mint,.008);p.add(stem,cap,r);pins.push({stem,cap});rings.push(r);}
  w.tick=({p:phase,time,motion})=>{const s=engine.states.wnams.samples;for(let i=0;i<7;i++){const sample=s[i],pin=pins[i];pin.stem.visible=pin.cap.visible=rings[i].visible=!!sample;if(!sample)continue;const x=((390+sample.x*770)/1200-.5)*5,y=(.5-(155+sample.y*510)/760)*3.1667;pin.stem.position.set(x,y,.17);pin.cap.position.set(x,y,.34);rings[i].position.set(x,y,.025);const size=phase>.4?1+(motion?(time*.3+i*.14)%1:0):.65;rings[i].scale.setScalar(size);}}
  w.pose=({p:phase,time,motion})=>{p.rotation.x=-.36+Math.min(phase,2)*.035;p.rotation.z=motion?Math.sin(time*.12)*.012:0;};
 }
 // 02: film perforations, offset frame sheets and a machined optical assembly.
 {
  const w=create(1,.65),p=panel(w,{frame:false});
  for(let i=2;i>=0;i--){const sheet=box(5.2,3.5,.075,i===0?shell:graphite,.09*i,.12*i,-.15-i*.23);sheet.rotation.z=i*.025;w.root.add(sheet);}
  for(const side of [-1,1])for(let i=0;i<9;i++)w.root.add(box(.12,.2,.055,i%3===0?copper:chrome,side*2.72,-1.6+i*.4,.02));
  const lens=new THREE.Group();lens.position.z=-.6;w.root.add(lens);for(let i=0;i<4;i++){const r=ring(2.05+i*.13,i%2?copper:chrome,.026);r.position.z=-i*.09;lens.add(r);}
  const scanner=box(.015,3.0,.02,red,-2.4,0,.03);p.add(scanner);
  w.tick=({p:phase,time,motion})=>{scanner.position.x=phase<1.7?(motion?Math.sin(time*.6)*2.35:0):2.35;scanner.visible=phase>.3&&phase<1.8;};
  w.pose=({p:phase})=>{p.rotation.y=-.035+phase*.018;lens.rotation.z=phase*.1;};
 }
 // 03: a cloud display suspended above local gateway and durable-storage layers.
 {
  const w=create(2,.60),p=panel(w,{frame:false});p.position.set(.1,.6,0);p.scale.setScalar(.91);
  p.add(box(5.18,3.32,.09,glass,0,0,-.07));
  const slabs=[];for(let i=0;i<4;i++){const slab=box(3.6,.23,1.05,i%2?chrome:shell,0,-1.32-i*.34,.05);w.root.add(slab);slabs.push(slab);for(let n=0;n<4;n++)w.root.add(box(.055,.04,.04,n?darkGlow:mint,-1.52+n*.14,-1.32-i*.34,.6));}
  const gateway=box(.6,1.1,.75,copper,2.37,-1.69,-.1);w.root.add(gateway);
  w.root.add(line([[-1.8,-1.3,.15],[-2.35,-1.3,.15],[-2.35,.55,.15],[-2.15,.55,.15]]));w.root.add(line([[1.7,-1.8,.6],[2.37,-1.8,.6],[2.37,-1,.6]]));
  const packet=ball(.065,mint);w.root.add(packet);
  w.tick=({p:phase,time,motion})=>{const online=engine.states['vit-vault'].outbox.online;packet.visible=engine.states['vit-vault'].outbox.items.length>0;packet.position.set(-2.35,-1.2+(motion?(time*.3)%1:0)*1.7,.17);gateway.material=online?chrome:copper;slabs.forEach((s,i)=>s.position.z=.05+Math.sin(phase*Math.PI/2)*i*.035);};
 }
 // 04: source and compiler-result panes connected through a typed execution core.
 {
  const w=create(3,.65);
  const left=texture.clone(),right=texture.clone();left.repeat.set(.45,.69);left.offset.set(.035,.12);right.repeat.set(.46,.69);right.offset.set(.50,.12);extraTextures.push(left,right);
  const a=panel(w,{width:2.32,height:2.95,map:left}),b=panel(w,{width:2.32,height:2.95,map:right});a.position.set(-1.42,.15,.1);b.position.set(1.42,.15,.1);a.rotation.y=.1;b.rotation.y=-.1;
  const chip=box(.65,.65,.19,chrome,0,-1.85,.45,.08);chip.rotation.z=Math.PI/4;w.root.add(chip);const core=box(.43,.43,.05,shell,0,-1.85,.57);core.rotation.z=Math.PI/4;w.root.add(core);
  w.root.add(line([[-1.42,-1.35,.1],[-1.42,-1.85,.1],[-.4,-1.85,.45]],0x7ba895));w.root.add(line([[.4,-1.85,.45],[1.42,-1.85,.1],[1.42,-1.35,.1]],0x7ba895));
  const name=label('POLYGLOT / ONE SEMANTIC MODEL',4.4,.27,'#afd0bc');name.position.set(0,1.94,.08);w.root.add(name);
  for(let i=0;i<12;i++){const bit=box(.04,.04,.04,i%3?mint:copper,(i%4-1.5)*.09,-1.7-Math.floor(i/4)*.09,.6);w.root.add(bit);}
  w.pose=({p:phase})=>{a.rotation.y=.1-phase*.025;b.rotation.y=-.1+phase*.025;a.position.z=.1+phase*.06;b.position.z=.1-phase*.035;};
 }
 // 05: the desk geometry follows the same synthetic obstacle and marble state as the display.
 {
  const w=create(4,.66),p=panel(w,{frame:false});p.rotation.x=-.35;
  p.add(box(5.5,3.43,.19,shell,0,0,-.13));p.add(box(5.2,.07,.035,copper,0,-1.68,.035));
  const book=box(.65,.46,.24,copper,0,0,.17);p.add(book);const pages=box(.60,.41,.1,ivory,0,0,.24);book.add(pages);
  const marble=ball(.075,ivory);p.add(marble);
  const mug=cylinder(.16,.27,chrome);mug.rotation.x=Math.PI/2;mug.position.set(-1.78,-.72,.2);p.add(mug);const handle=ring(.13,chrome,.035);handle.position.set(-1.58,-.72,.2);handle.rotation.y=Math.PI/2;p.add(handle);
  const calibration=[];for(const x of [-2.45,2.45])for(const y of [-1.5,1.5]){const r=ring(.07,mint,.012);r.position.set(x,y,.035);p.add(r);calibration.push(r);}
  w.tick=({p:phase})=>{const s=engine.states.realityforge;book.visible=phase>.3;book.position.x=((55+s.x*1090)/1200-.5)*5;book.position.y=(.5-(160+s.y*510)/760)*3.1667;marble.visible=phase>.9;marble.position.set(((55+s.ball.x*1090)/1200-.5)*5,(.5-(160+s.ball.y*510)/760)*3.1667,.15);};
  w.pose=({p:phase})=>{p.rotation.x=-.35+phase*.025;};
 }
 // 06: a complete arcade cabinet, with the original reconstruction on its screen.
 {
  const w=create(5,.51),p=panel(w,{frame:false});p.position.y=.40;
  w.root.add(box(5.42,3.58,.5,shell,0,.4,-.28));
  for(const x of [-2.77,2.77]){w.root.add(box(.21,4.75,.9,graphite,x,-.04,-.32));w.root.add(box(.025,4.7,.035,red,x,-.04,.16));}
  const marquee=box(5.54,.57,.62,copper,0,2.55,-.2);w.root.add(marquee);const name=label('PLAYABLE REPLAY',4.9,.32);name.position.set(0,2.55,.13);w.root.add(name);
  const controls=box(5.35,.30,1.15,shell,0,-1.58,.45);controls.rotation.x=-.08;w.root.add(controls);w.root.add(box(4.5,1.15,1.25,graphite,0,-2.28,-.12));w.root.add(box(4.7,.10,1.4,copper,0,-2.91,-.1));
  const stick=cylinder(.043,.4,chrome);stick.position.set(-1.5,-1.22,.7);w.root.add(stick);const grip=ball(.15,copper);grip.position.set(-1.5,-1.0,.7);w.root.add(grip);
  const buttons=[];for(let i=0;i<3;i++){const b=cylinder(.12,.075,i===0?copper:mint);b.position.set(.72+i*.48,-1.36,.75);w.root.add(b);buttons.push(b);}
  w.tick=({time,motion})=>{const active=engine.states['playable-replay'].control;grip.rotation.z=active&&motion?Math.sin(time*2)*.1:0;buttons[0].position.y=active?-1.39:-1.36;};
 }
 // 07: the request, model check and permission receipt become a spatial graph.
 {
  const w=create(6,.63),p=panel(w,{frame:false});p.scale.setScalar(.94);p.position.y=.12;p.add(box(5.16,3.29,.065,glass,0,0,-.07));
  const nodes=[[-2.52,1.91,-.2],[0,-1.98,.3],[2.55,1.75,-.2]],spheres=[];
  for(const [i,v] of nodes.entries()){const s=ball(.14,chrome);s.position.set(...v);w.root.add(s);spheres.push(s);const orbit=ring(.27,i===1?copper:mint,.014);orbit.position.copy(s.position);w.root.add(orbit);}
  w.root.add(line([nodes[0],[-2.9,.9,-.2],[-2.9,-1.95,-.2],nodes[1]],0xb56f4a));w.root.add(line([nodes[1],[2.92,-1.95,-.2],[2.92,.8,-.2],nodes[2]],0x829c88));
  const labels=[['INTENT',-2.2,2.25],['CHECK',0,-2.36],['RECEIPT',2.2,2.1]];labels.forEach(([txt,x,y])=>{const l=label(txt,1.1,.18);l.position.set(x,y,.1);w.root.add(l);});
  w.tick=({p:phase})=>spheres.forEach((s,i)=>{s.material=i===Math.min(2,Math.round(phase))?mint:chrome;});
 }
 // 08: nine table modules and visible seat states surround the booking transaction.
 {
  const w=create(7,.61),p=panel(w,{frame:false});p.position.y=.5;p.scale.setScalar(.92);p.add(box(5.15,3.3,.07,glass,0,0,-.08));
  for(let i=0;i<9;i++){const x=(i%3-1)*1.45,y=-1.36-Math.floor(i/3)*.36,z=-.1-Math.floor(i/3)*.1;w.root.add(box(1.1,.20,.36,i%3?graphite:shell,x,y,z));w.root.add(box(.8,.018,.025,copper,x,y,.095-Math.floor(i/3)*.1));if(i%3<2)w.root.add(line([[x+.55,y,z],[x+.90,y,z]],0x8c6550));}
  const seats=[];for(let i=0;i<2;i++){const seat=ball(.13,chrome);seat.position.set(-1.25+i*2.5,-1.18,.6);w.root.add(seat);seats.push(seat);}
  const waiting=[];for(let i=0;i<5;i++){const token=ball(.07,copper);token.position.set(2.67,-.8-i*.26,.25);w.root.add(token);waiting.push(token);}
  w.tick=()=>{const q=engine.states.clubsphere.bookings;seats.forEach((s,i)=>s.material=i<q.booked.length?mint:chrome);waiting.forEach((s,i)=>s.visible=i<q.waiting.length);};
 }
 // Screens retain their live texture, including the compiler's cropped pair.
 const posters=workshopStations.map((station,index)=>{
  const c=document.createElement('canvas');c.width=1200;c.height=760;const x=c.getContext('2d');
  x.fillStyle='#101b20';x.fillRect(0,0,1200,760);x.strokeStyle='#25393d';x.lineWidth=1;
  for(let i=0;i<1200;i+=60){x.beginPath();x.moveTo(i,0);x.lineTo(i,760);x.stroke();}
  for(let i=0;i<760;i+=60){x.beginPath();x.moveTo(0,i);x.lineTo(1200,i);x.stroke();}
  x.fillStyle='#d18362';x.font='24px monospace';x.fillText('UMANG / WORKSHOP / '+String(index+1).padStart(2,'0'),65,78);
  x.fillStyle='#e7e2d3';x.font='500 60px sans-serif';x.fillText(station.name,65,168);
  x.fillStyle='#8eb2af';x.font='21px monospace';x.fillText(station.area,65,218);
  const stages=['OBSERVE','BUILD','EXPLORE'];
  stages.forEach((t,i)=>{const px=100+i*360;x.strokeStyle=i===index%3?'#e28560':'#536b6a';x.strokeRect(px,340,280,150);x.fillStyle='#c5d7cf';x.font='25px monospace';x.fillText(t,px+32,422);if(i<2){x.beginPath();x.moveTo(px+280,415);x.lineTo(px+350,415);x.stroke();}});
  x.fillStyle='#7d9896';x.font='22px monospace';x.fillText('APPROACH TO OPEN THE INTERACTIVE STUDY',65,672);
  const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;
  const evidence=projectStories[station.id]?.evidence?.[0];if(evidence&&typeof Image!=='undefined'){const img=new Image();img.onload=()=>{x.fillStyle='#101b20';x.fillRect(35,250,1130,440);const scale=Math.min(1080/img.width,430/img.height),w=img.width*scale,h=img.height*scale;x.drawImage(img,(1200-w)/2,260+(430-h)/2,w,h);map.needsUpdate=true;};img.src=evidence.poster||evidence.src;}
  return map;
 });
 worlds.forEach((w,i)=>{
  const s=workshopStations[i];w.root.position.set(s.x,0,s.z);w.root.scale.setScalar(i===5?.76:1);w.root.visible=true;
  w.screens.forEach(screen=>{screen.userData.liveMap=screen.material.map;screen.material.map=posters[i];screen.material.opacity=1;});
 });
 let active=-1,enabled=true;
 function select(index){if(active===index)return;active=index;worlds.forEach((w,i)=>w.screens.forEach(s=>{s.material.map=i===index?s.userData.liveMap:posters[i];s.material.needsUpdate=true;}));}
 return {names:worldNames,select,get screens(){return worlds[active]?.screens||[];},refresh(){texture.needsUpdate=true;extraTextures.forEach(t=>t.needsUpdate=true);},update({phase,time,delta,motion,portrait,index,compact=false,narrow=false}){
  select(index);worlds.forEach((w,i)=>{
   const s=workshopStations[i],primary=i===index,chosen=primary||(phase>2.05&&i===index+1);
   w.root.visible=enabled&&(index<0||Math.abs(i-index)<=1);w.root.position.set(s.x,chosen&&portrait?(i===5?2.0:2.10):0,s.z);
   w.root.scale.setScalar(chosen&&portrait?w.phoneScale:((compact||narrow)&&chosen?(i===5?.63:.86):(i===5?.76:1)));
   const facing=s.x<0?Math.PI/2:-Math.PI/2;
   w.root.rotation.set(0,facing+(chosen?-.045+(motion?Math.sin(phase*.8)*.02:0):0),0);
   if(chosen){w.pose({p:primary?phase:0,time,motion,delta});w.tick({p:primary?phase:0,time,motion,delta});}
  });
 },setVisible(value){enabled=value;worlds.forEach(w=>w.root.visible=value);}};
}
