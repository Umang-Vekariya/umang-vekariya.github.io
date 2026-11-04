import * as THREE from 'three';
import {screenTransform} from './studio-reveal-motion.js';
import {spatialShot} from './spatial-layout.js';
import {smooth,atlasPassagePhase} from './engineering-motion.js';

export const copySizes={name:[720,620],caption:[720,360]};
export function copyOpacity(kind,state){return kind==='name'?(state.chapter==='home'?1-smooth(.16,.53,state.progress):0):state.chapter==='home'?smooth(.64,.88,state.progress):state.chapter==='passage'?1-smooth(.03,.24,atlasPassagePhase(state.progress)):0;}

function referenceCamera(shot,width,height){
 const camera=new THREE.PerspectiveCamera(shot.fov,width/height,.1,280);
 camera.position.set(...shot.position);camera.lookAt(new THREE.Vector3(...shot.target));camera.updateMatrixWorld();return camera;
}

// Compose once at a reference shot, then keep these coplanar world points fixed.
// They are not billboards and are never repositioned to follow the live camera.
export function copyAnchors(width,height){
 const portrait=width<760,compactHero=!portrait&&(width<=1100||width/height<1.3),anchors={};
 for(const kind of ['name','caption']){
  const [sw,sh]=copySizes[kind],isName=kind==='name';
  const shot=spatialShot({chapter:'home',progress:isName?0:1,portrait,compactHero});
  const camera=referenceCamera(shot,width,height),z=isName?0:-24;
  const copyWidth=Math.min(width*(portrait?.87:isName?.43:.34),height*(isName?.61:.32)*sw/sh);
  const rect={left:width*(portrait?.065:.055),top:height*(portrait?(isName?.15:.17):(isName?.24:.34)),width:copyWidth,height:copyWidth*sh/sw};
  const center=new THREE.Vector3(0,0,z),normal=new THREE.Vector3(Math.sin(.16),0,Math.cos(.16)),ray=new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2((rect.left+rect.width/2)/width*2-1,1-(rect.top+rect.height/2)/height*2),camera);
  ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,0,1),-z),center);
  const plane=new THREE.Plane().setFromNormalAndCoplanarPoint(normal,center),slant=portrait?.015:.035;
  anchors[kind]=[[0,0],[1,slant],[1,1-slant],[0,1]].map(([x,y])=>{
   ray.setFromCamera(new THREE.Vector2((rect.left+x*rect.width)/width*2-1,1-(rect.top+y*rect.height)/height*2),camera);
   return ray.ray.intersectPlane(plane,new THREE.Vector3());
  });
 }
 return anchors;
}

export function projectCopy(points,camera,width,height){
 camera.updateMatrixWorld();
 if(points.some(p=>p.clone().applyMatrix4(camera.matrixWorldInverse).z>-.3))return null;
 const projected=points.map(p=>{const q=p.clone().project(camera);return {x:(q.x*.5+.5)*width,y:(.5-q.y*.5)*height};});
 if(projected.every(p=>p.x<0)||projected.every(p=>p.x>width)||projected.every(p=>p.y<0)||projected.every(p=>p.y>height))return null;
 return projected;
}

export function createSpatialCopy(){
 const root=document.documentElement,layer=document.createElement('div'),name=document.createElement('div'),caption=document.querySelector('.passage-caption'),records=[];
 layer.id='spatial-copy-layer';name.className='spatial-copy world-name';caption.classList.add('spatial-copy','world-caption');
 const captionClass=caption.className.replace(' spatial-copy','').replace(' world-caption','');
 function move(element,parent){const marker=document.createComment('world copy source'),style=element.getAttribute('style');element.before(marker);records.push({element,marker,style});parent.append(element);}
 layer.append(name);document.querySelector('main').prepend(layer);
 move(document.querySelector('.hero-small'),name);move(document.querySelector('.identity-composition'),name);move(caption,layer);move(document.querySelector('#atlas-intro small'),caption);
 let anchors=copyAnchors(innerWidth,innerHeight),disposed=false;
 root.classList.add('spatial-copy-ready');
 function update(camera,state){
  if(disposed)return;
  for(const kind of ['name','caption']){
   const element=kind==='name'?name:caption,points=projectCopy(anchors[kind],camera,innerWidth,innerHeight);
   let opacity=copyOpacity(kind,state);
   if(!points)opacity=0;
   const matrix=points&&screenTransform(points,...copySizes[kind]);
   element.style.visibility=matrix&&opacity>.002?'visible':'hidden';element.style.opacity=String(opacity);element.inert=opacity<.1||!matrix;
   if(matrix)element.style.transform=`matrix3d(${matrix.join(',')})`;
  }
 }
 return {update,resize(){anchors=copyAnchors(innerWidth,innerHeight);},captionBounds(){return caption.getBoundingClientRect();},dispose(){
  if(disposed)return;disposed=true;root.classList.remove('spatial-copy-ready');
  for(const {element,marker,style} of records){marker.replaceWith(element);if(style===null)element.removeAttribute('style');else element.setAttribute('style',style);element.inert=false;}
  caption.className=captionClass;layer.remove();
 }};
}
