import * as THREE from 'three';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import fontData from './assets/helvetiker_bold.typeface.json' with {type:'json'};

const font=new FontLoader().parse(fontData);
const polygon=points=>{const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;};

// Original, continuous outlines. No clipping masks, seams or diagonal cuts.
export function identityShapes(){
 const u=new THREE.Shape();u.moveTo(8,8);u.lineTo(30,8);u.lineTo(30,77);u.quadraticCurveTo(30,103,53,103);u.quadraticCurveTo(76,103,76,77);u.lineTo(76,8);u.lineTo(98,8);u.lineTo(98,78);u.quadraticCurveTo(98,124,53,124);u.quadraticCurveTo(8,124,8,78);u.closePath();
 const m=polygon([[6,124],[6,8],[29,8],[60,65],[91,8],[114,8],[114,124],[92,124],[92,49],[60,101],[28,49],[28,124]]);
 const a=polygon([[0,124],[43,8],[68,8],[111,124],[86,124],[77,98],[32,98],[23,124]]),hole=new THREE.Path();hole.moveTo(39,77);hole.lineTo(70,77);hole.lineTo(55,34);hole.closePath();a.holes.push(hole);
 const n=polygon([[8,124],[8,8],[30,8],[85,86],[85,8],[108,8],[108,124],[85,124],[31,47],[31,124]]);
 const g=new THREE.Shape();g.moveTo(105,34);g.lineTo(86,47);g.bezierCurveTo(79,33,69,28,55,28);g.bezierCurveTo(33,28,24,45,24,66);g.bezierCurveTo(24,87,34,105,56,105);g.bezierCurveTo(69,105,80,100,87,90);g.lineTo(87,79);g.lineTo(59,79);g.lineTo(59,59);g.lineTo(110,59);g.lineTo(110,98);g.bezierCurveTo(97,116,81,126,55,126);g.bezierCurveTo(18,126,0,101,0,66);g.bezierCurveTo(0,31,19,5,55,5);g.bezierCurveTo(79,5,94,15,105,34);g.closePath();
 return [u,m,a,n,g];
}

export function extrudedLettering(shapes,{depth=14,bevel=1.35,curves=10,svg=false}={}){
 const geometry=new THREE.ExtrudeGeometry(shapes,{depth,steps:1,curveSegments:curves,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3});
 if(svg){
  geometry.scale(1,-1,1);
  // Reflecting the SVG's downward Y axis reverses triangle handedness. Keep
  // outward faces (including the solid front caps) facing out after reflection.
  for(const attribute of Object.values(geometry.attributes)){
   const a=attribute.array,n=attribute.itemSize;
   for(let i=0;i<attribute.count;i+=3)for(let c=0;c<n;c++){const p=(i+1)*n+c,q=(i+2)*n+c,t=a[p];a[p]=a[q];a[q]=t;}
   attribute.needsUpdate=true;
  }
 }
 geometry.computeBoundingBox();return geometry;
}

export function textGeometry(text,{depth=8,bevel=.8}={}){
 const normalized=text.replace(/[‘’]/g,"'").replace(/[–—]/g,'-').replace(/↗|↘|→/g,'');
 return extrudedLettering(font.generateShapes(normalized,100),{depth,bevel});
}

export function flowTextLines(samples,origin,accent=false){
 const lines=[];let line=null;
 for(const {text,left,top,right,width,height} of samples){
  if(!width||!height)continue;
  if(!line||Math.abs(line.top+origin.top+line.height/2-(top+height/2))>height*.35){line={text:'',left:left-origin.left,top:top-origin.top,width:0,height,accent};lines.push(line);}
  line.text+=text;line.width=right-origin.left-line.left;line.height=Math.max(line.height,height);
  if(text.trim()){line.inkLeft??=left-origin.left;line.inkRight=right-origin.left;}
 }
 return lines.filter(l=>l.text.trim()&&l.width>0).map(({inkLeft,inkRight,...l})=>({...l,text:l.text.trim(),left:inkLeft,width:inkRight-inkLeft}));
}

// A real rigid plane shared by the WebGL letters and sharp native body text.
export function surfaceFrame(rect,camera,{depth=14,yaw=-.07,pitch=.015}={}){
 // Focal scale in pixels; viewport dimensions are supplied by the caller.
 const pixel=2*depth*Math.tan(camera.fov*Math.PI/360)/rect.viewportHeight;
 const center=new THREE.Vector3((rect.left+rect.width/2-rect.viewportWidth/2)*pixel,(rect.viewportHeight/2-rect.top-rect.height/2)*pixel,-depth).applyQuaternion(camera.quaternion).add(camera.position);
 const quaternion=camera.quaternion.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch,yaw,0)));
 const matrix=new THREE.Matrix4().compose(center,quaternion,new THREE.Vector3(pixel,pixel,pixel));
 const points=[[0,0],[rect.width,0],[rect.width,rect.height],[0,rect.height]].map(([x,y])=>new THREE.Vector3(x-rect.width/2,rect.height/2-y,0).applyMatrix4(matrix));
 return {matrix,points,pixel};
}

export function letterPose(index,elapsed,{motion=true,x=0,y=0,hover=0}={}){
 const t=motion?THREE.MathUtils.clamp((elapsed-index*65)/1250,0,1):1,e=1-Math.pow(1-t,4),column=index<5?(index+.5)/5-.5:((index-5)+.5)/8-.5;
 const influence=Math.max(0,1-Math.abs(column-x)*2.4)*hover;
 return {x:(index<5?index-2:column*4)*5*(1-e),y:-58*(1-e)+influence*6,z:70*(1-e)+influence*13,rx:-.55*(1-e)-y*influence*.10,ry:-.72*(1-e)+(column-x)*influence*.20,rz:.08*(1-e),moving:t<1};
}
