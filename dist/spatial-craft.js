import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export function roundedSolid(w,h,d,r=.12){return new RoundedBoxGeometry(w,h,d,3,Math.min(r,Math.min(w,h,d)*.46));}

// A turned, continuous profile gives every pedestal real edge radii and reveals.
export function pedestalGeometry(radius=6,height=.6){
 const profile=[[0,0],[radius-.22,0],[radius-.10,.025],[radius-.035,.08],[radius,.15],[radius,height-.14],[radius-.025,height-.065],[radius-.09,height-.015],[radius-.18,height],[0,height]];
 const geometry=new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),128);geometry.normalizeNormals();return geometry;
}

function roundedPath(path,w,h,r){
 const x=-w/2,y=-h/2;path.moveTo(x+r,y);path.lineTo(x+w-r,y);path.quadraticCurveTo(x+w,y,x+w,y+r);path.lineTo(x+w,y+h-r);path.quadraticCurveTo(x+w,y+h,x+w-r,y+h);path.lineTo(x+r,y+h);path.quadraticCurveTo(x,y+h,x,y+h-r);path.lineTo(x,y+r);path.quadraticCurveTo(x,y,x+r,y);return path;
}
export function apertureGeometry(w=5.2,h=4.2,thickness=.22){
 const shape=roundedPath(new THREE.Shape(),w,h,.65),hole=roundedPath(new THREE.Path(),w-.7,h-.7,.4);shape.holes.push(hole);
 const g=new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:true,bevelThickness:.045,bevelSize:.045,bevelSegments:4,curveSegments:16,steps:1});g.translate(0,0,-thickness/2);g.computeBoundingSphere();return g;
}

// Broad studio cards produce continuous highlights rather than a field of dots.
export function studioEnvironment(){
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x03050c);
 const cards=[{p:[-10,7,8],s:[5,16],c:[3.4,3.6,4]},{p:[11,4,4],s:[2.5,18],c:[1.2,1.8,3]},{p:[0,14,0],s:[16,4],c:[2.8,3.1,4]},{p:[-2,5,-12],s:[8,12],c:[.12,.24,.9]}];
 for(const {p,s,c} of cards){const m=new THREE.MeshBasicMaterial({color:new THREE.Color().setRGB(...c),side:THREE.DoubleSide,toneMapped:false}),plane=new THREE.Mesh(new THREE.PlaneGeometry(...s),m);plane.position.set(...p);plane.lookAt(0,3,0);scene.add(plane);}
 return scene;
}

// Stream the active canvas directly. Freeze its pixels into the owned canvas
// before the shared engine changes projects, preserving each previous display.
export function createExhibitSurface(canvas,{width=1440,caption=null}={}){
 const ctx=canvas.getContext('2d'),height=width*760/1200;canvas.width=width;canvas.height=height;
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;let live=false,stream=null;
 const background=()=>{ctx.fillStyle='#03081a';ctx.fillRect(0,0,width,height);};background();
 return {canvas,texture,get live(){return live;},poster(image){if(live)return;background();const scale=width/1200,top=caption?145*scale:20,bottom=caption?680*scale:height-20;
   if(image){const fit=Math.min((width-40*scale)/image.width,(bottom-top)/image.height),w=image.width*fit,h=image.height*fit;ctx.drawImage(image,(width-w)/2,top+(bottom-top-h)/2,w,h);}
   if(caption){ctx.fillStyle='#edf3ff';ctx.font=`500 ${36*scale}px sans-serif`;ctx.fillText(caption.title,40*scale,58*scale);ctx.fillStyle='#a9bce7';ctx.font=`400 ${24*scale}px sans-serif`;ctx.fillText(caption.summary,40*scale,105*scale);ctx.fillStyle='#7198ff';ctx.font=`400 ${22*scale}px sans-serif`;ctx.fillText(caption.scope,40*scale,738*scale);}
   texture.needsUpdate=true;},frame(image){if(!live){live=true;texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;}stream=image;texture.image=image;texture.needsUpdate=true;},freeze(){if(!stream)return;ctx.drawImage(stream,0,0,width,height);stream=null;texture.image=canvas;texture.needsUpdate=true;},dispose(){stream=null;texture.dispose();}};
}

export function createDisplayHousing({metal,dark,lime}){
 const group=new THREE.Group();
 const add=(g,m,z)=>{const mesh=new THREE.Mesh(g,m);mesh.position.z=z;group.add(mesh);return mesh;};
 add(roundedSolid(12.68,8.22,.42),metal,-.26);
 add(roundedSolid(12.48,8.02,.3),dark,-.21);
 const edge=add(roundedSolid(11.95,.028,.08),lime,.05);edge.position.y=-3.96;
 const screen=add(new THREE.PlaneGeometry(12,7.6),new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false}),.005);
 return {group,screen};
}
