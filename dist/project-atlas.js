import * as THREE from 'three';
import {roundedSolid} from './spatial-craft.js';
import {smooth} from './engineering-motion.js';

// A continuous, overlapping hand; no project is selected at rest.
export const atlasOrder=[0,1,2,3,4,5,6,7];
export function atlasPose(index,opening=1,hovered=-1,parting=0){
 const slot=atlasOrder.indexOf(index),s=slot-3.5,t=Math.max(0,Math.min(1,opening)),active=hovered===index,angle=-s*.11*t;
 const u=smooth(0,.48,parting),side=slot<4?-1:1,rank=slot<4?3-slot:slot-4;
 const from={x:s*(.08+.30*t),y:.98-s*s*.023*t,z:(slot-3.5)*.115,rotation:[0,0,angle]};
 const to={x:side*(4.1+rank*1.35),y:.95,z:-rank*1.9,rotation:[0,-side*.23,side*.02]};
 const pose={x:from.x+(to.x-from.x)*u,y:from.y+(to.y-from.y)*u,z:from.z+(to.z-from.z)*u,rotation:from.rotation.map((r,i)=>r+(to.rotation[i]-r)*u)};
 if(active){pose.x+=side*.15*u;pose.y+=.85;pose.z=1.65*(1-u)+(pose.z+.85)*u;pose.rotation=[-.075,pose.rotation[1]*.65,pose.rotation[2]*.28];}
 return pose;
}
export const atlasBankX=(side,parting=0)=>side*(2.1+4.025*smooth(0,.48,parting));
// A wheel fling may skip several chapters. Keep the physical gap open until
// the damped camera has cleared the folios, even if its new goal is the hero.
export function atlasClearanceParting(requested,cameraZ,atlasZ=-26){return cameraZ>atlasZ-12&&cameraZ<atlasZ+11?Math.max(.48,requested):requested;}
// The separated banks stay usable. Release interaction only as the lens gets
// close enough that pulling a card forward would fill the camera's near view.
export function atlasCanInteract(chapter,progress,cameraZ,atlasZ=-26){return ((chapter==='home'&&progress>.82)||chapter==='passage')&&cameraZ>atlasZ+10;}

export function createProjectAtlas({projects,stories,materials,onLoad=()=>{}}){
 const group=new THREE.Group(),folios=[],banks=[],targets=[],covers=[],pickRoots=[],edges=[],textures=[],ownedMaterials=[],images=[];let disposed=false;
 const bodyGeometry=roundedSolid(2.76,4.55,.075,.09),edgeGeometry=roundedSolid(2.79,4.58,.04,.09),coverGeometry=new THREE.PlaneGeometry(2.57,4.32),pickGeometry=new THREE.PlaneGeometry(2.79,4.58),pickMaterial=new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide});ownedMaterials.push(pickMaterial);
 for(const side of [-1,1]){const bank=new THREE.Group();bank.position.x=atlasBankX(side);group.add(bank);banks.push(bank);
  const base=new THREE.Mesh(roundedSolid(4.2,.42,2.35,.15),materials.dark);base.position.y=.42;bank.add(base);
  const binding=new THREE.Mesh(roundedSolid(3.84,.11,1.8,.05),materials.metal);binding.position.set(0,.69,0);bank.add(binding);
  const inlay=new THREE.Mesh(roundedSolid(3.7,.02,.025,.008),materials.lime);inlay.position.set(0,.57,1.18);bank.add(inlay);
 }
 const footerLine=(c,text,x,y)=>{c.fillStyle='#8ca9ed';c.font='17px sans-serif';c.fillText(text,x,y);};
 const drawTitle=(c,text)=>{c.font='500 58px sans-serif';c.fillStyle='#f0f4ff';let y=161,line='';for(const word of text.split(' ')){const next=line?line+' '+word:word;if(c.measureText(next).width>510&&line){c.fillText(line,48,y);y+=67;line=word;}else line=next;}c.fillText(line,48,y);};
 for(let index=0;index<8;index++){
  const p=projects[index],root=new THREE.Group();root.userData.projectIndex=index;group.add(root);
  const edgeMaterial=new THREE.MeshBasicMaterial({color:0x174aff,toneMapped:false});ownedMaterials.push(edgeMaterial);const edge=new THREE.Mesh(edgeGeometry,edgeMaterial);edge.position.y=2.27;root.add(edge);edges.push(edgeMaterial);
  const body=new THREE.Mesh(bodyGeometry,materials.dark);body.position.set(0,2.27,.035);root.add(body);body.castShadow=true;
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=1076;const c=canvas.getContext('2d'),texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);
  function paint(image){
   c.fillStyle='#060d25';c.fillRect(0,0,640,1076);c.fillStyle='#d4ff35';c.font='38px monospace';c.fillText(String(index+1).padStart(2,'0'),35,72);c.font='18px monospace';c.fillStyle='#91adf2';c.fillText(p.category.toUpperCase(),125,64);drawTitle(c,p.name);
   c.fillStyle='#0a1d55';c.fillRect(48,325,544,480);
   if(image){const scale=Math.min(520/image.width,450/image.height),w=image.width*scale,h=image.height*scale;c.drawImage(image,320-w/2,565-h/2,w,h);}else{
    c.strokeStyle='#3f64d1';c.lineWidth=2;for(let j=0;j<8;j++){c.strokeRect(82+j*60,410,35,300);c.fillStyle=j%3===0?'#d4ff35':'#2856e5';c.fillRect(88+j*60,650-j%3*65,23,50+j%3*65);}
   }
   c.strokeStyle='#3156ae';c.lineWidth=1;c.beginPath();c.moveTo(48,862);c.lineTo(592,862);c.stroke();footerLine(c,p.kind.toUpperCase(),48,908);footerLine(c,p.stack.slice(0,2).join(' / '),48,954);c.fillStyle='#d4ff35';c.font='28px sans-serif';c.fillText('EXPLORE THE BUILD  ↗',48,1026);texture.needsUpdate=true;
  }
  paint();const evidence=stories[p.id].evidence[0];if(evidence){const image=new Image();images.push(image);image.onload=()=>{if(disposed)return;paint(image);onLoad();};image.src=evidence.poster||evidence.src;}
  const material=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});ownedMaterials.push(material);const cover=new THREE.Mesh(coverGeometry,material);cover.position.set(0,2.28,.08);cover.userData.projectIndex=index;root.add(cover);covers.push(cover);
  // Pick the original exposed card, including its border. Lifting the visual
  // cannot move its hit area away from a stationary pointer or steal a neighbour.
  const pickRoot=new THREE.Group(),target=new THREE.Mesh(pickGeometry,pickMaterial);target.position.set(0,2.27,.09);target.userData.projectIndex=index;pickRoot.add(target);group.add(pickRoot);pickRoots.push(pickRoot);targets.push(target);
  const pose=atlasPose(index,1);for(const object of [root,pickRoot]){object.position.set(pose.x,pose.y,pose.z);object.rotation.set(...pose.rotation);}folios.push(root);
 }
 function update(opening,hovered,dt,motion,parting=0){let settling=false;const k=motion?1-Math.exp(-dt*11):1;
  edges.forEach((edge,i)=>edge.color.setHex(i===hovered?0xd4ff35:0x174aff));
  banks.forEach((bank,i)=>{const x=atlasBankX(i===0?-1:1,parting);bank.position.x+=(x-bank.position.x)*k;settling ||= Math.abs(bank.position.x-x)>.001;});
  pickRoots.forEach((root,i)=>{const p=atlasPose(i,opening,-1,parting);root.position.lerp(new THREE.Vector3(p.x,p.y,p.z),k);root.rotation.x+=(p.rotation[0]-root.rotation.x)*k;root.rotation.y+=(p.rotation[1]-root.rotation.y)*k;root.rotation.z+=(p.rotation[2]-root.rotation.z)*k;});
  folios.forEach((folio,i)=>{const p=atlasPose(i,opening,motion?hovered:-1,parting),to=new THREE.Vector3(p.x,p.y,p.z);folio.position.lerp(to,k);folio.rotation.x+=(p.rotation[0]-folio.rotation.x)*k;folio.rotation.y+=(p.rotation[1]-folio.rotation.y)*k;folio.rotation.z+=(p.rotation[2]-folio.rotation.z)*k;settling ||= folio.position.distanceToSquared(to)>.00001||Math.abs(folio.rotation.z-p.rotation[2])>.0005||Math.abs(folio.rotation.x-p.rotation[0])>.0005||Math.abs(folio.rotation.y-p.rotation[1])>.0005;});return settling;
 }
 return {group,targets,covers,update,folios,banks,dispose(){disposed=true;images.forEach(i=>{i.onload=null;});textures.forEach(t=>t.dispose());ownedMaterials.forEach(m=>m.dispose());}};
}
