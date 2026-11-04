import * as THREE from 'three';
import {MarchingCubes} from 'three/addons/objects/MarchingCubes.js';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {writeFile,mkdir} from 'node:fs/promises';

// Original anatomical volumes, sculpted offline so no isosurface work runs
// during scrolling. Canonical right-hand coordinates: dorsal +Y, fingers -Z.
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;
const smoothUnion=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;};
const bounds={min:[-1.02,-.57,-1.43],max:[1.02,.49,1.80]};
function ellipsoid(p,c,r){const x=(p[0]-c[0])/r[0],y=(p[1]-c[1])/r[1],z=(p[2]-c[2])/r[2],k0=Math.hypot(x,y,z),k1=Math.hypot(x/r[0],y/r[1],z/r[2]);return k1?(k0*(k0-1))/k1:-Math.min(...r);}
function capsule(p,bone){const [a,b,r0,r1,flatten]=bone,px=p[0]-a[0],py=(p[1]-a[1])/flatten,pz=p[2]-a[2],x=b[0]-a[0],y=(b[1]-a[1])/flatten,z=b[2]-a[2],t=clamp((px*x+py*y+pz*z)/(x*x+y*y+z*z));return Math.hypot(px-x*t,py-y*t,pz-z*t)-mix(r0,r1,t);}
function pose(side){
 const right=side==='right',mirror=right?1:-1;
 const fingers=right?[
  {name:'index',points:[[-.245,.035,-.30],[-.26,.065,-.68],[-.25,-.015,-.95],[-.23,-.105,-1.13]],r:.112},
  {name:'middle',points:[[-.015,.055,-.34],[-.01,.075,-.73],[.005,-.025,-1.02],[.025,-.125,-1.19]],r:.118},
  {name:'ring',points:[[.22,.025,-.30],[.25,.01,-.65],[.30,-.12,-.87],[.34,-.235,-.95]],r:.105},
  {name:'little',points:[[.41,-.005,-.20],[.46,-.045,-.49],[.51,-.17,-.66],[.52,-.285,-.73]],r:.088}
 ]:[
  {name:'index',points:[[-.245,.025,-.30],[-.285,.065,-.65],[-.31,-.03,-.91],[-.32,-.125,-1.02]],r:.108},
  {name:'middle',points:[[-.015,.045,-.34],[-.025,.07,-.76],[-.04,-.025,-1.03],[-.045,-.13,-1.15]],r:.114},
  {name:'ring',points:[[.22,.02,-.30],[.245,.045,-.69],[.255,-.035,-.94],[.255,-.13,-1.045]],r:.102},
  {name:'little',points:[[.405,-.005,-.20],[.46,.015,-.48],[.51,-.08,-.70],[.53,-.155,-.79]],r:.084}
 ];
 const thumb={name:'thumb',points:right?[[-.245,-.055,.24],[-.49,-.11,.04],[-.61,-.20,-.27],[-.59,-.27,-.48]]:[[-.245,-.055,.24],[-.49,-.12,.15],[-.65,-.18,.26],[-.73,-.215,.43]],r:.15};
 const bones=[],nails=[],landmarks={palm:[0,0,0],wrist:[0,-.035,1.25],thumb:null,index:null,little:null};
 for(const digit of [...fingers,thumb]){
  const curve=new THREE.CatmullRomCurve3(digit.points.map(p=>new THREE.Vector3(...p))),points=curve.getPoints(12),radius=t=>digit.r*(1-.38*t)*(1+.025*Math.exp(-Math.pow((t-.4)/.1,2)));
  for(let i=0;i<12;i++)bones.push([points[i].toArray(),points[i+1].toArray(),radius(i/12),radius((i+1)/12),digit.name==='thumb'?.91:.84]);
  const t=.89,center=curve.getPoint(t),tangent=curve.getTangent(t),r=radius(t),normal=new THREE.Vector3(0,1,0).addScaledVector(tangent,-tangent.y).normalize();center.addScaledVector(normal,r*.82+.003);
  const reflect=p=>[p[0]*mirror,p[1],p[2]];
  nails.push({digit:digit.name,center:reflect(center.toArray()),tangent:reflect(tangent.toArray()),normal:reflect(normal.toArray()),width:digit.name==='thumb'?.17:r*1.44,length:digit.name==='thumb'?.20:.19});
  if(digit.name in landmarks)landmarks[digit.name]=reflect(digit.points.at(-1));
 }
 return {side,mirror,fingers,thumb,bones,nails,landmarks};
}
function field(p,model){
 // Rounded metacarpal block, narrowed through the wrist, not a spherical palm.
 const [x,y,z]=p,width=.275-.055*clamp((z+.05)/.55),qx=Math.abs(x)-width,qy=Math.abs(y+.018-.028*Math.exp(-x*x/.14-(z-.04)*(z-.04)/.3))-.055,qz=Math.abs(z-.035)-.325;
 let d=Math.hypot(Math.max(qx,0),Math.max(qy,0),Math.max(qz,0))+Math.min(Math.max(qx,qy,qz),0)-.115;
 d=smoothUnion(d,ellipsoid(p,[-.23,-.055,.18],[.225,.16,.32]),.10);
 d=smoothUnion(d,capsule(p,[[0,-.035,.29],[0,-.055,1.43],.225,.193,.72]),.15);
 for(const bone of model.bones)d=smoothUnion(d,capsule(p,bone),.035);
 return d;
}
function sculpt(side){
 const model=pose(side),resolution=88,material=new THREE.MeshBasicMaterial(),mc=new MarchingCubes(resolution,material,false,false,60000);mc.isolation=0;
 for(let z=0;z<resolution;z++)for(let y=0;y<resolution;y++)for(let x=0;x<resolution;x++){
  const p=[mix(bounds.min[0],bounds.max[0],x/resolution)*model.mirror,mix(bounds.min[1],bounds.max[1],y/resolution),mix(bounds.min[2],bounds.max[2],z/resolution)];mc.field[z*resolution*resolution+y*resolution+x]=-field(p,model);
 }
 mc.update();let raw=new THREE.BufferGeometry();const positions=new Float32Array(mc.positionArray.subarray(0,mc.count*3));
 for(let i=0;i<positions.length;i+=3){for(let axis=0;axis<3;axis++)positions[i+axis]=mix(bounds.min[axis],bounds.max[axis],(positions[i+axis]+1)*.5);
  const px=positions[i]*model.mirror,py=positions[i+1],pz=positions[i+2];let groove=0;
  for(const f of model.fingers)for(const joint of [f.points[1],f.points[2]]){const dx=(px-joint[0])/.115,dz=(pz-joint[2])/.024;if(py>joint[1]+.025)groove+=.002*Math.exp(-dx*dx-dz*dz);}
  if(py>.025)for(const z of [.78,.88])groove+=.0015*Math.exp(-Math.pow((pz-z)/.014,2))*Math.exp(-px*px/.03);
  let tendon=0;if(py>.10&&pz>-.30&&pz<.65){const t=(.65-pz)/.95;for(const f of model.fingers){const center=mix(f.points[0][0]*.27,f.points[0][0],t);tendon+=.0035*Math.exp(-Math.pow((px-center)/.036,2))*Math.pow(Math.sin(Math.PI*t),2);}}
  positions[i+1]+=tendon-groove;
 }
 raw.setAttribute('position',new THREE.BufferAttribute(positions,3));const indexed=mergeVertices(raw,1e-5);raw.dispose();const clean=[];for(let i=0;i<indexed.index.count;i+=3){const a=indexed.index.getX(i),b=indexed.index.getX(i+1),c=indexed.index.getX(i+2);if(a!==b&&b!==c&&c!==a)clean.push(a,b,c);}indexed.setIndex(clean);indexed.computeVertexNormals();indexed.computeBoundingBox();
 const min=indexed.boundingBox.min.toArray(),max=indexed.boundingBox.max.toArray(),n=indexed.attributes.position.count,indices=indexed.index.array;if(n>65535)throw new Error('Hand exceeds compact index range');
 const bytes=Buffer.alloc(n*8+indices.length*2);let offset=0;
 for(let i=0;i<n;i++){for(let axis=0;axis<3;axis++){bytes.writeUInt16LE(Math.round(clamp((indexed.attributes.position.array[i*3+axis]-min[axis])/(max[axis]-min[axis]))*65535),offset);offset+=2;}
  let nx=indexed.attributes.normal.getX(i),ny=indexed.attributes.normal.getY(i),nz=indexed.attributes.normal.getZ(i),l=Math.abs(nx)+Math.abs(ny)+Math.abs(nz);nx/=l;ny/=l;nz/=l;if(nz<0){const oldX=nx;nx=(1-Math.abs(ny))*Math.sign(oldX||1);ny=(1-Math.abs(oldX))*Math.sign(ny||1);}bytes.writeInt8(Math.round(nx*127),offset++);bytes.writeInt8(Math.round(ny*127),offset++);
 }
 for(const index of indices){bytes.writeUInt16LE(index,offset);offset+=2;}
 const result={vertices:n,indices:indices.length,min,max,nails:model.nails,landmarks:model.landmarks,data:bytes.toString('base64')};
 console.log(`${side}: ${n} welded vertices, ${indices.length/3} triangles, ${bytes.length} bytes`);indexed.dispose();mc.geometry.dispose();material.dispose();return result;
}
const models={left:sculpt('left'),right:sculpt('right')};await mkdir(new URL('../dist/assets/hands/',import.meta.url),{recursive:true});await writeFile(new URL('../dist/assets/hands/sculpted-hands.js',import.meta.url),'// Original generated hand meshes. Regenerate with node scripts/sculpt-hands.mjs.\nexport const sculptedHands='+JSON.stringify(models)+';\n');
