import * as THREE from 'three';
import {RoundedBoxGeometry} from './vendor/geometries/RoundedBoxGeometry.js';

// A closed, three-half-twist ribbon. Its section is a rounded rectangle,
// parallel to the local curve frame, with the end joined to the opposite edge.
function frameAt(t,radius){
 const r=radius+.13*Math.cos(3*t),dr=-.39*Math.sin(3*t),c=Math.cos(t),s=Math.sin(t);
 const center=new THREE.Vector3(r*c,r*s,.18*Math.sin(3*t));
 const tangent=new THREE.Vector3(dr*c-r*s,dr*s+r*c,.54*Math.cos(3*t)).normalize();
 const radial=new THREE.Vector3(c,s,0);radial.addScaledVector(tangent,-radial.dot(tangent)).normalize();
 const binormal=new THREE.Vector3().crossVectors(radial,tangent).normalize(),angle=1.5*t;
 return {center,width:radial.clone().multiplyScalar(Math.cos(angle)).addScaledVector(binormal,Math.sin(angle)),normal:radial.clone().multiplyScalar(-Math.sin(angle)).addScaledVector(binormal,Math.cos(angle))};
}
export function ribbonPoint(t,u,v,radius=1.48){const f=frameAt(t,radius);return f.center.addScaledVector(f.width,u).addScaledVector(f.normal,v);}

// A damped spring keeps fast pointer entries and exits continuous.
export function advanceHover(state,target,delta,motion=true){
 if(!motion){state.value=0;state.velocity=0;return state;}
 const dt=Math.max(0,Math.min(.06,delta)),steps=Math.max(1,Math.ceil(dt/.016)),h=dt/steps;
 target=Math.max(0,Math.min(1,target));
 for(let i=0;i<steps;i++){state.velocity+=((target-state.value)*120-state.velocity*15)*h;state.value=Math.max(0,Math.min(1.08,state.value+state.velocity*h));}
 if(Math.abs(state.value-target)<.001&&Math.abs(state.velocity)<.01){state.value=target;state.velocity=0;}
 return state;
}

export function createRibbonGeometry({radius=1.48,width=.58,thickness=.16,segments=256,cornerSegments=4}={}){
 const bevel=Math.min(.038,thickness*.32),section=[];
 // Clockwise samples with equal counts per corner preserve half-turn symmetry.
 for(const [cx,cy,start] of [[width/2-bevel,thickness/2-bevel,0],[-width/2+bevel,thickness/2-bevel,Math.PI/2],[-width/2+bevel,-thickness/2+bevel,Math.PI],[width/2-bevel,-thickness/2+bevel,Math.PI*1.5]]){
  for(let i=0;i<=cornerSegments;i++){const a=start+i/cornerSegments*Math.PI/2;section.push([cx+Math.cos(a)*bevel,cy+Math.sin(a)*bevel]);}
 }
 const count=section.length,positions=[],uvs=[],indices=[];
 for(let i=0;i<segments;i++){const t=i/segments*Math.PI*2;for(let j=0;j<count;j++){const [u,v]=section[j],p=ribbonPoint(t,u,v,radius);positions.push(p.x,p.y,p.z);uvs.push(i/segments,j/count);}}
 for(let i=0;i<segments;i++)for(let j=0;j<count;j++){
  const a=i*count+j,b=i*count+(j+1)%count,next=(i+1)%segments,shift=i===segments-1?count/2:0,c=next*count+(j+shift)%count,d=next*count+(j+1+shift)%count;
  indices.push(a,c,b,b,c,d);
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingBox();
 return geometry;
}

function brushedTexture(){
 const w=256,h=64,data=new Uint8Array(w*h*4);let seed=417;
 for(let y=0;y<h;y++){seed=(seed*1664525+1013904223)>>>0;const line=(seed/4294967296-.5)*14;for(let x=0;x<w;x++){seed=(seed*1664525+1013904223)>>>0;const value=Math.round(229+line+(seed/4294967296-.5)*7),i=(y*w+x)*4;data[i]=data[i+1]=data[i+2]=value;data[i+3]=255;}}
 const texture=new THREE.DataTexture(data,w,h,THREE.RGBAFormat);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(5,1);texture.needsUpdate=true;return texture;
}

export function createRibbonSculpture(){
 const assembly=new THREE.Group();assembly.name='Folded titanium ribbon';
 const grain=brushedTexture();
 const titanium=new THREE.MeshPhysicalMaterial({color:0x9298a1,metalness:1,roughness:.36,roughnessMap:grain,anisotropy:.12,clearcoat:.15,clearcoatRoughness:.3,envMapIntensity:.8});
 const darkMetal=new THREE.MeshPhysicalMaterial({color:0x271a19,metalness:.88,roughness:.25,clearcoat:.3});
 const copper=new THREE.MeshStandardMaterial({color:0x8d2c1d,metalness:.86,roughness:.28});
 const red=new THREE.MeshBasicMaterial({color:new THREE.Color(2.1,.035,.012)});
 const ribbon=new THREE.Mesh(createRibbonGeometry(),titanium);ribbon.name='Continuous rounded ribbon';assembly.add(ribbon);
 const inner=new THREE.Mesh(createRibbonGeometry({radius:1.08,width:.105,thickness:.055,segments:192,cornerSegments:3}),copper);inner.rotation.y=.65;inner.name='Inner copper ribbon';assembly.add(inner);
 class EdgeCurve extends THREE.Curve{getPoint(u,target=new THREE.Vector3()){return target.copy(ribbonPoint(u*Math.PI*4,.58/2-.037,.16/2+.001));}}
 const inlay=new THREE.Mesh(new THREE.TubeGeometry(new EdgeCurve(),512,.007,5,true),red);inlay.name='Recessed scarlet edge inlay';assembly.add(inlay);

 // A quiet central gimbal gives the original core a machined construction.
 const core=new THREE.Group();core.name='Suspended core';assembly.add(core);
 const center=new THREE.Mesh(new THREE.IcosahedronGeometry(.29,1),new THREE.MeshPhysicalMaterial({color:0x231715,metalness:1,roughness:.3,clearcoat:.03,envMapIntensity:.6}));core.add(center);
 const facets=new THREE.LineSegments(new THREE.EdgesGeometry(center.geometry,26),new THREE.LineBasicMaterial({color:0x754635,transparent:true,opacity:.45}));core.add(facets);
 const gimbals=[];
 for(let i=0;i<2;i++){
  const group=new THREE.Group(),radius=.47+i*.15;group.rotation.set(i?.65:.9,i?1.15:.1,.12*i);core.add(group);
  const arc=new THREE.Mesh(new THREE.TorusGeometry(radius,.012-i*.004,6,96,Math.PI*1.68),i?darkMetal:copper);group.add(arc);
  for(const t of [0,Math.PI*1.68]){const cap=new THREE.Mesh(new THREE.SphereGeometry(.018,8,6),red);cap.position.set(Math.cos(t)*radius,Math.sin(t)*radius,0);group.add(cap);}
  gimbals.push(group);
 }
 const satellites=18,plates=new THREE.InstancedMesh(new RoundedBoxGeometry(.19,.28,.13,3,.033),titanium,satellites),slots=new THREE.InstancedMesh(new THREE.BoxGeometry(.092,.012,.004),darkMetal,satellites);
 plates.name='Brushed orbital segments';slots.name='Segment face grooves';assembly.add(plates,slots);plates.instanceMatrix.setUsage(THREE.DynamicDrawUsage);slots.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
 const field=new THREE.Group();field.name='Magnetic hover field';assembly.add(field);
 const fieldMaterial=new THREE.LineBasicMaterial({color:0xdc6142,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
 for(let j=0;j<2;j++){const points=[];for(let i=0;i<144;i++){const a=i/144*Math.PI*2;points.push(new THREE.Vector3(Math.cos(a)*2.29,Math.sin(a)*2.29,.1*Math.sin(a*2)));}const line=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points),fieldMaterial);line.rotation.set(.55+j*.75,j*.45,j*.3);field.add(line);}
 const transform=new THREE.Object3D(),groove=new THREE.Vector3();let lastTime=0,orbitAngle=0,energizedTime=0;
 function update({time=0,phase=0,motion=true,energy=0,pointerX=0,pointerY=0,compact=false}={}){
  energy=motion?Math.max(0,Math.min(1,energy)):0;pointerX=Math.max(-1,Math.min(1,pointerX));pointerY=Math.max(-1,Math.min(1,pointerY));
  const dt=Math.max(0,Math.min(.06,time-lastTime));lastTime=time;if(motion){orbitAngle+=dt*(.027+energy*.85);energizedTime+=dt*energy;}
  const intro=Math.max(0,Math.min(1,(phase-.15)/.85)),direction=Math.max(0,Math.min(1,(phase-1.1)/1.2)),expand=(1+intro*.20+direction*.22)*(1+energy*(compact?.04:.22)),t=motion?time:0;
  ribbon.scale.setScalar(1+energy*.035);inlay.scale.copy(ribbon.scale);inner.scale.setScalar(1+energy*.12);inner.rotation.y=.65+energy*.23;
  red.color.setRGB(2.1+energy*3.9,.035+energy*.055,.012+energy*.016);titanium.roughness=.36-energy*.035;
  field.visible=energy>.005;fieldMaterial.opacity=energy*.30;field.rotation.set(energy*pointerY*.17,energizedTime*.15,energy*pointerX*.14);field.scale.setScalar(1+energy*.035);
  for(let i=0;i<satellites;i++){
   const angle=i/satellites*Math.PI*2+(motion?orbitAngle:0),r=(2.12+.08*Math.sin(i*2.7))*expand,z=.27*Math.sin(i*1.7+t*.12)+energy*(.48*Math.sin(angle*2+energizedTime*.7)-Math.max(0,-Math.sin(angle))*.55);
   transform.position.set(Math.cos(angle)*r+pointerX*energy*.14,Math.sin(angle)*r+pointerY*energy*.14,z);transform.rotation.set(.28*Math.sin(i*1.3+t*.09)+energy*.3,.32*Math.cos(i*.9)+energy*pointerX*.35,angle-.14+energy*.18);transform.scale.setScalar((i%3===0?1:.72)*(1+energy*.07));transform.updateMatrix();plates.setMatrixAt(i,transform.matrix);
   groove.set(0,0,.068*transform.scale.x).applyEuler(transform.rotation);transform.position.add(groove);transform.updateMatrix();slots.setMatrixAt(i,transform.matrix);
  }
  plates.instanceMatrix.needsUpdate=true;slots.instanceMatrix.needsUpdate=true;plates.computeBoundingSphere();slots.computeBoundingSphere();
  center.rotation.set(.15+t*.055+energy*pointerY*.22,.3+t*.075+energy*pointerX*.22,.12);facets.rotation.copy(center.rotation);gimbals[0].rotation.z=.15+Math.sin(t*.17)*.16+energizedTime*.55;gimbals[1].rotation.z=-.2+t*.035-energizedTime*.65;
 }
 update();return {assembly,update,ribbon,satellites:plates,inlay};
}
