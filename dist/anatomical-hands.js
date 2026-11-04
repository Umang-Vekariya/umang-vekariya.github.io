import * as THREE from 'three';
import {sculptedHands} from './assets/hands/sculpted-hands.js';

export function handGeometry(side){
 const model=sculptedHands[side];if(!model)throw new Error('Unknown hand side');
 const raw=atob(model.data),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
 const view=new DataView(bytes.buffer),position=new Float32Array(model.vertices*3),normal=new Float32Array(model.vertices*3),uv=new Float32Array(model.vertices*2),color=new Float32Array(model.vertices*3);let offset=0;
 for(let i=0;i<model.vertices;i++){
  for(let axis=0;axis<3;axis++){position[i*3+axis]=model.min[axis]+view.getUint16(offset,true)/65535*(model.max[axis]-model.min[axis]);offset+=2;}
  let x=view.getInt8(offset++)/127,y=view.getInt8(offset++)/127,z=1-Math.abs(x)-Math.abs(y);if(z<0){const prior=x;x=(1-Math.abs(y))*Math.sign(prior||1);y=(1-Math.abs(prior))*Math.sign(y||1);}const length=Math.hypot(x,y,z);normal.set([x/length,y/length,z/length],i*3);
  const px=position[i*3],pz=position[i*3+2];uv.set([(px+1.02)/2.04,(pz+1.43)/3.12],i*2);
  let warmth=0;for(const nail of model.nails){const dx=px-nail.center[0],dz=pz-nail.center[2]+.22;warmth=Math.max(warmth,Math.exp(-dx*dx/.018-dz*dz/.016));}
  color.set([1,.98-.035*warmth,.96-.045*warmth],i*3);
 }
 const index=new Uint16Array(model.indices);for(let i=0;i<index.length;i++){index[i]=view.getUint16(offset,true);offset+=2;}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(position,3));geometry.setAttribute('normal',new THREE.BufferAttribute(normal,3));geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));geometry.setAttribute('color',new THREE.BufferAttribute(color,3));geometry.setIndex(new THREE.BufferAttribute(index,1));geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}

export function createHandMaterials(){
 const size=256,data=new Uint8Array(size*size*4);let seed=31841;
 for(let i=0;i<size*size;i++){seed=(1664525*seed+1013904223)>>>0;const value=218+(seed>>>27);data.set([value,value,value,255],i*4);}
 const pores=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);pores.wrapS=pores.wrapT=THREE.RepeatWrapping;pores.repeat.set(5,8);pores.magFilter=THREE.LinearFilter;pores.minFilter=THREE.LinearMipmapLinearFilter;pores.generateMipmaps=true;pores.needsUpdate=true;
 const skin=new THREE.MeshPhysicalMaterial({color:0xb4876c,roughness:.77,metalness:0,specularIntensity:.2,vertexColors:true,roughnessMap:pores,bumpMap:pores,bumpScale:.002});
 const sleeve=new THREE.MeshStandardMaterial({color:0x09111c,roughness:.98,metalness:0}),cuff=new THREE.MeshStandardMaterial({color:0x070c14,roughness:1,metalness:0});
 return {skin,sleeve,cuff,dispose(){pores.dispose();}};
}
export function createAnatomicalHand(side,materials){
 const model=sculptedHands[side],group=new THREE.Group();group.name=side==='right'?'right-hand-gripping-mouse':'left-hand-on-keyboard';group.userData.handedness=side;group.userData.landmarks=model.landmarks;
 const surface=new THREE.Mesh(handGeometry(side),materials.skin);surface.name='continuous-hand-surface';surface.userData.deskBatch=true;group.add(surface);

 return group;
}
export function createSleeve(elbow,wrist,materials){
 const group=new THREE.Group(),end=new THREE.Vector3(...wrist),start=new THREE.Vector3(...elbow),curve=new THREE.CatmullRomCurve3([start,start.clone().lerp(end,.52).add(new THREE.Vector3(0,.07,0)),end]);
 function loft(from,to,cuff=false){
  const rings=cuff?12:28,sides=40,positions=[],uv=[],indices=[];
  for(let i=0;i<=rings;i++){const t=from+(to-from)*i/rings,center=curve.getPoint(t),tangent=curve.getTangent(t),x=new THREE.Vector3().crossVectors(tangent,new THREE.Vector3(0,1,0)).normalize(),y=new THREE.Vector3().crossVectors(tangent,x).normalize();
   for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2,fold=(cuff?.0035*Math.cos(j/sides*Math.PI*32):.009*Math.sin(t*29+a*3)*Math.pow(Math.sin(Math.PI*t),2)),radius=.425-(.425-.245)*Math.pow(t,.68)+fold+(cuff?.009:0),p=center.clone().addScaledVector(x,Math.cos(a)*radius).addScaledVector(y,Math.sin(a)*radius*.82);positions.push(...p);uv.push(j/sides,t);}
  }
  for(let i=0;i<rings;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+1,c=a+sides+1,d=c+1;indices.push(a,b,c,b,d,c);}
  // The cuff is closed behind the wrist, avoiding exposed tube rims or gaps.
  if(cuff){const c=positions.length/3;positions.push(...end);uv.push(.5,1);for(let j=0;j<sides;j++)indices.push(c,rings*(sides+1)+j,rings*(sides+1)+j+1);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
 }
 group.add(new THREE.Mesh(loft(0,.91),materials.sleeve),new THREE.Mesh(loft(.88,1,true),materials.cuff));return group;
}
