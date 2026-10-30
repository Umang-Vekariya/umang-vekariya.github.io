import * as THREE from 'three';

// Small scene labels use native text instead of a stretched canvas texture.
// Their position and fade still come from the same camera and 3D installation.
export function createSpatialType(host){
 const layer=document.createElement('div');layer.className='profile-label-layer';layer.setAttribute('aria-hidden','true');host.append(layer);
 const labels=[],position=new THREE.Vector3(),scale=new THREE.Vector3();
 function add(anchor,{text='',width=4,kind='caption',record=null}={}){
  const el=document.createElement('div');el.className='profile-spatial-label profile-spatial-label--'+kind;el.hidden=true;
  if(record){for(const [key,value] of Object.entries(record)){const span=document.createElement('span');span.className='spatial-'+key;span.textContent=value;el.append(span);}}
  else el.textContent=text;
  layer.append(el);labels.push({anchor,el,width});return el;
 }
 function render(camera,{width,height,visible=true}){
  layer.hidden=!visible;if(!visible)return;
  for(const label of labels){
   const {anchor,el}=label;let shown=true,alpha=1;
   for(let p=anchor;p;p=p.parent){if(!p.visible)shown=false;if(p.userData.labelAlpha!==undefined)alpha*=p.userData.labelAlpha;}
   anchor.getWorldPosition(position);const distance=position.distanceTo(camera.position);position.project(camera);
   shown=shown&&alpha>.55&&position.z>-1&&position.z<1&&Math.abs(position.x)<1.15&&Math.abs(position.y)<1.15;
   el.hidden=!shown;if(!shown)continue;
   anchor.getWorldScale(scale);const pixels=height/(2*Math.tan(camera.fov*Math.PI/360)*Math.max(.1,distance));
   el.style.width=Math.max(90,label.width*scale.x*pixels)+'px';
   el.style.opacity=String(Math.min(1,(alpha-.55)/.3));
   el.style.transform=`translate3d(${(position.x*.5+.5)*width}px,${(-position.y*.5+.5)*height}px,0) translate(-50%,-50%)`;
  }
 }
 return {layer,labels,add,render};
}
