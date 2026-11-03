import * as THREE from 'three';
import {ribbonPoint} from './ribbon-sculpture.js';
// The point field exists only during the aperture passage: a sampled ribbon
// reconstructs into an annulus around the camera path, rather than ambient stars.
export function createAperture(scene){
 const root=new THREE.Group();scene.add(root);const count=900,source=[],target=[],seeds=[];
 for(let i=0;i<count;i++){const t=i/count*Math.PI*2,p=ribbonPoint(t,Math.sin(i*2.4)*.26,Math.cos(i*1.7)*.07);source.push(p.x,p.y+.4,p.z);const angle=i*.61803398875*Math.PI*2,r=2.15+(i%11)/11*.65;target.push(Math.cos(angle)*r,Math.sin(angle)*r,-4.5-(i%7)*.32);seeds.push((i%31)/31);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(source,3));geometry.setAttribute('aTarget',new THREE.Float32BufferAttribute(target,3));geometry.setAttribute('aSeed',new THREE.Float32BufferAttribute(seeds,1));
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uProgress:{value:0},uAlpha:{value:0},uDpr:{value:1}},vertexShader:`attribute vec3 aTarget;attribute float aSeed;uniform float uProgress;uniform float uDpr;varying float vSeed;void main(){vSeed=aSeed;float t=smoothstep(aSeed*.17,.83+aSeed*.17,uProgress);vec3 p=mix(position,aTarget,t);p.xy+=vec2(sin(aSeed*34.0),cos(aSeed*21.0))*sin(t*3.14159)*.35;vec4 view=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*view;gl_PointSize=clamp((1.5+aSeed)*uDpr*20.0/max(1.0,-view.z),1.0,5.0);}`,fragmentShader:`uniform float uAlpha;varying float vSeed;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;vec3 c=mix(vec3(.45,.68,.65),vec3(.95,.48,.28),vSeed);gl_FragColor=vec4(c,(1.0-smoothstep(.12,.5,d))*uAlpha);}`});
 root.add(new THREE.Points(geometry,material));
 const rings=[];for(let i=0;i<4;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(2.4+i*.12,.012,5,96,Math.PI*1.7),new THREE.MeshBasicMaterial({color:i%2?0x9bbfb0:0xc47b59,transparent:true,opacity:0,depthWrite:false}));r.position.z=-4.6-i*.7;r.rotation.z=i*.5;root.add(r);rings.push(r);}
 return {root,update({phase=0,motion=true,dpr=1}){const p=Math.max(0,Math.min(1,(phase-.4)/1.6)),alpha=motion?Math.sin(p*Math.PI)*.85:0;root.visible=alpha>.001;material.uniforms.uProgress.value=p;material.uniforms.uAlpha.value=alpha;material.uniforms.uDpr.value=dpr;rings.forEach((r,i)=>{r.material.opacity=alpha*.45;r.rotation.z=i*.5+p*(i%2?.25:-.25);});},dispose(){geometry.dispose();material.dispose();rings.forEach(r=>{r.geometry.dispose();r.material.dispose();});root.removeFromParent();}};
}
export function createPersonalArchitecture(scene){
 const root=new THREE.Group();root.position.z=-18;scene.add(root);
 const mat=new THREE.MeshStandardMaterial({color:0x162126,metalness:.6,roughness:.35}),line=new THREE.MeshBasicMaterial({color:0x40605d});
 for(const [i,z] of [-1.2,-4.4,-7.6].entries()){
  const arch=new THREE.Mesh(new THREE.TorusGeometry(5.8,.055,6,96,Math.PI*1.6),mat);arch.position.set(i===2?-3:3,0,z-2.1);arch.rotation.z=i===2?.2:Math.PI*.2;root.add(arch);
  const glow=new THREE.Mesh(new THREE.TorusGeometry(5.85,.01,5,96,Math.PI*.55),line);glow.position.copy(arch.position);glow.rotation.z=i*.9;root.add(glow);
 }
 return {root};
}
export function createIdentityStage(scene){
 const root=new THREE.Group();scene.add(root);const stone=new THREE.MeshStandardMaterial({color:0x182024,metalness:.65,roughness:.4}),chrome=new THREE.MeshStandardMaterial({color:0x566b70,metalness:.85,roughness:.3}),lit=new THREE.MeshBasicMaterial({color:0x9c6046});
 const base=new THREE.Mesh(new THREE.CylinderGeometry(2.7,3.05,.18,64),stone);base.position.y=-2.75;root.add(base);
 const edge=new THREE.Mesh(new THREE.TorusGeometry(2.72,.012,5,96),lit);edge.rotation.x=-Math.PI/2;edge.position.y=-2.65;root.add(edge);
 for(let i=0;i<3;i++){const arch=new THREE.Mesh(new THREE.TorusGeometry(5.9+i*.45,.045,6,128,Math.PI*1.35),chrome);arch.position.set(0,.3,-5-i*3.5);arch.rotation.set(.04,-.08+i*.08,Math.PI*.13+i*.3);root.add(arch);const cut=new THREE.Mesh(new THREE.TorusGeometry(5.93+i*.45,.013,5,96,Math.PI*.48),lit);cut.position.copy(arch.position);cut.rotation.z=i*.8;root.add(cut);}
 return {root};
}
