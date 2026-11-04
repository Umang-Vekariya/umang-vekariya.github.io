import * as THREE from 'three';
import {roundedSolid,createDisplayHousing} from './spatial-craft.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export const DESK={left:-4.7,right:4.7,screenY:10.9,z:90,width:8.8,height:5.5,top:6.45,mouse:[4.45,6.88,95.25]};

// A persistent, seated-eye workstation. Keycaps are instanced and opaque
// details are batched by material in the existing world renderer.
export function createGamingDesk(){
 const group=new THREE.Group();group.name='first-person-gaming-desk';group.position.z=DESK.z;
 const textures=[];
 const graphite=new THREE.MeshPhysicalMaterial({color:0x090e19,roughness:.46,metalness:.35,clearcoat:.18});
 const anodized=new THREE.MeshStandardMaterial({color:0x1b263c,roughness:.3,metalness:.82});
 const fabric=new THREE.MeshStandardMaterial({color:0x08101b,roughness:.94,metalness:0});
 const skin=new THREE.MeshPhysicalMaterial({color:0xa87855,roughness:.67,metalness:0,specularIntensity:.3,clearcoat:0});
 const nail=new THREE.MeshStandardMaterial({color:0xb58c78,roughness:.4});
 const blue=new THREE.MeshBasicMaterial({color:0x1d4dff,toneMapped:false}),lime=new THREE.MeshBasicMaterial({color:0xd4ff35,toneMapped:false});
 const black=new THREE.MeshStandardMaterial({color:0x02050b,roughness:.8}),pad=new THREE.MeshStandardMaterial({color:0x070f20,roughness:1});
 const add=(geometry,material,position,parent=group)=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(...position);parent.add(mesh);return mesh;};
 const box=(w,h,d,material,x,y,z,parent=group,r=.08)=>add(roundedSolid(w,h,d,r),material,[x,y,z],parent);
 const tube=(points,r,material,parent=group)=>add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),48,r,8,false),material,[0,0,0],parent);
 const ellipsoid=(size,position,material=skin,parent=group)=>{const m=add(new THREE.SphereGeometry(1,24,16),material,position,parent);m.scale.set(...size);return m;};
 const segment=(a,b,r1,r2,material,parent=group)=>{const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),m=add(new THREE.CylinderGeometry(r2,r1,start.distanceTo(end),20,1,true),material,start.clone().add(end).multiplyScalar(.5).toArray(),parent);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.sub(start).normalize());return m;};
 // Satin desk, recessed edge light, large stitched desk mat and cable raceway.
 box(23,.38,12.2,graphite,0,6.2,4.1);box(22.6,.035,.035,blue,0,6.18,10.21);
 for(const x of [-9.8,9.8]){box(.35,6,.6,anodized,x,3,6);box(2,.2,5,graphite,x,.2,6);}
 box(12.5,.045,4.8,pad,-.1,6.48,5.55);box(12.15,.012,.015,blue,-.1,6.51,7.88);
 box(19,.4,.55,black,0,5.7,-.9);
 // Dual matching 16:10 monitors, angled gently toward the seated viewer.
 const monitors=[];
 for(const [x,yaw] of [[DESK.left,.12],[DESK.right,-.12]]){
  const h=createDisplayHousing({metal:anodized,dark:graphite,lime:blue});h.group.name=x<0?'left-studio-monitor':'right-contact-monitor';h.group.scale.set(DESK.width/12,DESK.height/7.6,1);h.group.position.set(x,DESK.screenY,0);h.group.rotation.y=yaw;group.add(h.group);h.screen.material.color.set(0x03081a);monitors.push(h);
  box(.27,1.65,.3,anodized,x,7.3,-.22);box(3.1,.12,1.7,graphite,x,6.59,.1);box(1.1,.025,.025,lime,x,6.66,.87);
  tube([[x,8.2,-.4],[x+.3,7,-.65],[x+.4,6,-.8],[0,5.8,-.8]],.035,black);
 }
 // Mechanical keyboard. Each keycap has its own bevel; legends use one atlas.
 const keyboard=new THREE.Group();keyboard.name='mechanical-keyboard';keyboard.position.set(-1.6,6.63,5.2);keyboard.rotation.x=.06;group.add(keyboard);
 box(6.45,.25,2.65,anodized,0,0,0,keyboard);box(6.23,.06,2.45,black,0,.14,0,keyboard);box(6.1,.025,.035,blue,0,-.035,1.31,keyboard);
 const rows=[['Esc','1','2','3','4','5','6','7','8','9','0','−','=','⌫'],['Tab','Q','W','E','R','T','Y','U','I','O','P','[',']','\\'],['Caps','A','S','D','F','G','H','J','K','L',';','\'','Enter'],['Shift','Z','X','C','V','B','N','M',',','.','/','↑','Del'],['Ctrl','Fn','Alt','SPACE','Alt','←','↓','→']];
 const keys=[];rows.forEach((row,r)=>{const units=row.map(k=>k==='SPACE'?5.9:k==='Enter'||k==='Shift'?1.65:k==='Caps'?1.4:k==='Tab'?1.3:1),total=units.reduce((a,b)=>a+b,0);let cursor=-total*.205;row.forEach((label,j)=>{const w=units[j]*.41-.035;keys.push({label,w,x:cursor+units[j]*.205,z:-.93+r*.46,color:label==='Esc'||label==='Enter'?0xbad634:r===0?0x223152:0x101c32});cursor+=units[j]*.41;});});
 const keyGeo=roundedSolid(1,.13,.38,3),keyMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.38,metalness:.16}),keyMesh=new THREE.InstancedMesh(keyGeo,keyMat,keys.length),matrix=new THREE.Matrix4();
 keys.forEach((key,i)=>{matrix.makeScale(key.w,1,1).setPosition(key.x,.25,key.z);keyMesh.setMatrixAt(i,matrix);keyMesh.setColorAt(i,new THREE.Color(key.color));});keyboard.add(keyMesh);
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=640;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,1536,640);ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='500 24px sans-serif';
  for(const k of keys){ctx.fillStyle=k.label==='Esc'||k.label==='Enter'?'#151d12':'#b1bdd5';ctx.fillText(k.label==='SPACE'?'U V':k.label,(k.x/6.4+.5)*1536,(k.z/2.65+.5)*640);}
  const texture=new THREE.CanvasTexture(canvas);textures.push(texture);texture.colorSpace=THREE.SRGBColorSpace;const legends=add(new THREE.PlaneGeometry(6.4,2.65),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false}),[0,.321,0],keyboard);legends.rotation.x=-Math.PI/2;
 }
 tube([[-1.6,6.6,3.8],[-2.4,6.55,2.4],[-3,6.5,.4],[-3,6.2,-.6]],.033,black);
 // Sculpted mouse, split buttons, wheel and a braided lead.
 const mouse=new THREE.Group();mouse.name='mouse-under-right-hand';mouse.position.set(DESK.mouse[0],DESK.mouse[1],DESK.mouse[2]-DESK.z);group.add(mouse);
 ellipsoid([.53,.22,.88],[0,0,0],graphite,mouse);ellipsoid([.49,.06,.85],[0,-.15,0],blue,mouse);
 for(const x of [-.24,.24]){const button=ellipsoid([.235,.055,.43],[x,.15,-.35],graphite,mouse);button.rotation.x=-.13;}
 const wheel=add(new THREE.CylinderGeometry(.10,.10,.13,24),anodized,[0,.21,-.4],mouse);wheel.rotation.z=Math.PI/2;
 for(let i=0;i<10;i++){const a=i*Math.PI/5;box(.14,.018,.018,black,0,.21+Math.sin(a)*.102,-.4+Math.cos(a)*.102,mouse,.008);}
 tube([[4.45,6.75,4.38],[4.65,6.55,3.3],[5.9,6.5,2],[6.8,6.45,.2]],.027,black);
 // First-person arms: sleeves enter from below frame; fingers curl onto the mouse.
 function hand(position,right){
  const hand=new THREE.Group();hand.name=right?'right-hand-gripping-mouse':'left-hand-on-keyboard';hand.position.set(...position);group.add(hand);
  const palmGeometry=new THREE.SphereGeometry(1,32,24),positions=palmGeometry.attributes.position;for(let i=0;i<positions.count;i++){const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i),width=.43*(.91-.16*z);positions.setXYZ(i,x*width-(x<0?.14*Math.exp(-z*z*5):0),y*.22,z*.62);}palmGeometry.computeVertexNormals();add(palmGeometry,skin,[0,0,0],hand);ellipsoid([.30,.22,.38],[0,-.015,.50],skin,hand);
  const fingers=right?[[-.26,-.7,-1.06],[-.01,-.76,-1.1],[.22,-.63,-.97],[.4,-.48,-.77]]:[[-.28,-.7,-1.02],[-.02,-.79,-1.16],[.23,-.7,-1.06],[.42,-.48,-.79]];
  fingers.forEach(([x,bend,end],i)=>{const a=[x,.08,-.34],b=[x,.12,bend],c=[x,-.09,end];segment(a,b,.105-i*.008,.10-i*.008,skin,hand);ellipsoid([.11-i*.008,.105,.12],b,skin,hand);segment(b,c,.10-i*.008,.085-i*.007,skin,hand);ellipsoid([.098-i*.007,.095,.12],c,skin,hand);const n=ellipsoid([.062,.015,.095],[x,-.025,end+.05],nail,hand);n.rotation.x=-.45;});
  segment([-.32,-.03,.12],[-.59,-.09,-.13],.15,.13,skin,hand);segment([-.59,-.09,-.13],[-.56,-.18,-.42],.13,.105,skin,hand);ellipsoid([.105,.09,.13],[-.56,-.18,-.42],skin,hand);
  return hand;
 }
 const rightHand=hand([4.48,7.13,5.9],true);rightHand.rotation.y=-.04;
 const leftHand=hand([-2.6,7.14,5.9],false);leftHand.rotation.y=-.18;
 for(const [a,b] of [[[4.5,7.1,6.35],[4.8,6.45,10.8]],[[-2.7,7.1,6.35],[-4.6,6.45,10.8]]]){segment(a,b,.28,.48,fabric);const mid=new THREE.Vector3(...a).lerp(new THREE.Vector3(...b),.17).toArray();segment(a,mid,.27,.32,skin);segment(mid,new THREE.Vector3(...a).lerp(new THREE.Vector3(...b),.25).toArray(),.34,.35,graphite);}
 // Quiet studio speakers and an exposed tempered-glass PC with three cobalt fans.
 for(const x of [-10.25,10.25]){box(1.25,2.4,1.35,graphite,x,7.72,-.15);for(const [y,r] of [[7.55,.38],[8.32,.16]]){const cone=add(new THREE.ConeGeometry(r,.11,32),black,[x,y,.55]);cone.rotation.x=Math.PI/2;const ring=add(new THREE.TorusGeometry(r,.022,6,40),anodized,[x,y,.62]);}box(.08,.025,.025,lime,x,6.69,.57);}
 const tower=new THREE.Group();tower.name='gaming-pc';tower.position.set(11.6,6.45,1.1);tower.rotation.y=-.15;group.add(tower);
 box(2.65,5.1,3.9,graphite,0,2.6,0,tower);box(2.35,4.8,.04,anodized,0,2.6,1.98,tower);box(.035,4.7,.04,blue,-1.12,2.6,2.01,tower);
 for(let i=0;i<3;i++){const y=1.1+i*1.45;add(new THREE.TorusGeometry(.53,.035,8,48),blue,[0,y,2.04],tower);const hub=add(new THREE.CylinderGeometry(.16,.16,.08,24),anodized,[0,y,2.07],tower);hub.rotation.x=Math.PI/2;for(let j=0;j<7;j++){const a=j*Math.PI*2/7,blade=box(.18,.4,.025,graphite,Math.cos(a)*.3,y+Math.sin(a)*.3,2.065,tower,.06);blade.rotation.z=a+.6;}}
 const glass=new THREE.MeshPhysicalMaterial({color:0x3150a3,roughness:.12,metalness:.15,transparent:true,opacity:.16,depthWrite:false});box(.02,4.65,3.5,glass,-1.34,2.6,0,tower);box(.13,.03,.13,lime,.8,5.19,1.2,tower);
 // Dark room architecture, acoustic panels and reflected cobalt wall lighting.
 box(33,20,.35,black,0,10,-4.4);box(.35,20,25,black,-16.5,10,7.8);box(.35,20,25,black,16.5,10,7.8);
 for(let i=0;i<13;i++){const p=box(1.65,9,.24,i%3===0?graphite:fabric,(i-6)*2.1,11,-4.1);p.rotation.z=i%2?.05:-.05;}
 for(const x of [-12.3,12.3])box(.055,11,.04,blue,x,11,-3.89);
 box(20,.045,.04,blue,0,16.6,-3.86);box(3.2,.035,.04,lime,6.8,16.6,-3.84);
 const floor=add(new THREE.PlaneGeometry(36,32),graphite,[0,0,6]);floor.rotation.x=-Math.PI/2;
 const key=new THREE.PointLight(0x9ab8ff,95,32,2);key.position.set(-7,15,7);group.add(key);const fill=new THREE.PointLight(0x164aff,125,30,2);fill.position.set(10,10,-2);group.add(fill);const rim=new THREE.PointLight(0xc8e3ff,40,20,2);rim.position.set(1,12,10);group.add(rim);
 function batch(parent){
  group.updateMatrixWorld(true);const inverse=parent.matrixWorld.clone().invert(),buckets=new Map(),sources=[];
  parent.traverse(object=>{if(!object.isMesh||object.isInstancedMesh||object.userData.deskBatch||object.material.transparent||monitors.some(m=>m.screen===object))return;const list=buckets.get(object.material)||[];list.push(object);buckets.set(object.material,list);});
  for(const [material,meshes] of buckets){if(meshes.length<2)continue;const pieces=meshes.map(mesh=>{let g=mesh.geometry.clone();if(g.index){const flat=g.toNonIndexed();g.dispose();g=flat;}g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,mesh.matrixWorld));return g;}),geometry=mergeGeometries(pieces);pieces.forEach(g=>g.dispose());if(!geometry)continue;const combined=new THREE.Mesh(geometry,material);combined.userData.deskBatch=true;parent.add(combined);sources.push(...meshes);}
  sources.forEach(mesh=>{mesh.removeFromParent();mesh.geometry.dispose();});
 }
 for(const assembly of [keyboard,mouse,rightHand,leftHand])batch(assembly);batch(group);
 return {group,leftScreen:monitors[0].screen,rightScreen:monitors[1].screen,keyboard,mouse,rightHand,dispose(){textures.forEach(texture=>texture.dispose());}};
}
