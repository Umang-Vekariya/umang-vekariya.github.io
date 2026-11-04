import * as THREE from 'three';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';

// Native layout owns advances, kerning, whitespace, wrapping and baselines.
// This cache supplies only the matching outline and its shallow physical depth.
export function createNarrativeTypesetter(data){
 const fonts=Object.fromEntries(Object.entries(data).map(([key,value])=>[key,new FontLoader().parse(value)])),cache=new Map();
 function glyph(character,{fontKey='manrope500',size=80}={}){
  const font=fonts[fontKey];if(!font||!character.trim()||!font.data.glyphs[character])return null;
  const key=fontKey+'/'+size+'/'+character;if(cache.has(key))return cache.get(key);
  const depth=THREE.MathUtils.clamp(size*.065,1.1,7.5),bevel=THREE.MathUtils.clamp(size*.0025,.065,.25);
  const geometry=new THREE.ExtrudeGeometry(font.generateShapes(character,size),{depth,steps:1,curveSegments:12,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:2});
  // The crisp native face sits at Z=0. All real bevels and side walls recede
  // behind it, so they cannot cover adjacent words or their controls.
  geometry.translate(0,0,-depth-bevel-.05);geometry.computeBoundingBox();cache.set(key,geometry);return geometry;
 }
 function compose(records){
  const buckets=Array.from({length:3},()=>({position:[],normal:[],uv:[]}));
  for(const r of records){
   const source=glyph(r.character,r);if(!source)continue;
   for(const group of source.groups){
    const material=group.materialIndex===1?1:r.accent?2:0,bucket=buckets[material];
    for(const [name,attribute] of Object.entries(source.attributes)){
     if(!bucket[name])continue;const n=attribute.itemSize;
     for(let i=group.start;i<group.start+group.count;i++)for(let c=0;c<n;c++){
      let value=attribute.array[i*n+c];if(name==='position'){if(c===0)value+=r.x;else if(c===1)value-=r.baseline;}bucket[name].push(value);
     }
    }
   }
  }
  const geometry=new THREE.BufferGeometry();let start=0;
  buckets.forEach((b,i)=>{const count=b.position.length/3;if(count){geometry.addGroup(start,count,i);start+=count;}});
  if(!start)return null;
  for(const [name,size] of [['position',3],['normal',3],['uv',2]])geometry.setAttribute(name,new THREE.Float32BufferAttribute(buckets.flatMap(b=>b[name]),size));
  geometry.computeBoundingBox();return geometry;
 }
 return {glyph,compose,ascender(fontKey,size){return (data[fontKey]?.ascender||1000)*size/1000;},dispose(){cache.forEach(g=>g.dispose());cache.clear();}};
}

export function narrativeFontKey(family,weight,style){return family.includes('Instrument')?(style==='italic'?'serifItalic':'serifRegular'):Number(weight)>=550?'manrope600':'manrope500';}

export function readingSurface(rect,camera,{interactive=false,depth=14}={}){
 const trim=interactive?0:Math.min(8,rect.height*.008),screenPoints=[{x:rect.left,y:rect.top},{x:rect.left+rect.width,y:rect.top+trim},{x:rect.left+rect.width,y:rect.top+rect.height-trim},{x:rect.left,y:rect.top+rect.height}];
 const pixel=2*depth*Math.tan(camera.fov*Math.PI/360)/rect.viewportHeight;
 const points=screenPoints.map(p=>new THREE.Vector3((p.x-rect.viewportWidth/2)*pixel,(rect.viewportHeight/2-p.y)*pixel,-depth).applyQuaternion(camera.quaternion).add(camera.position));
 return {points,screenPoints};
}

// Map source pixels onto a coplanar world quadrilateral without replacing its
// projective shape with a different rectangular approximation.
export function worldPlaneMatrix(points,width,height,homography){
 const right=points[1].clone().sub(points[0]).normalize(),up=points[0].clone().sub(points[3]);up.addScaledVector(right,-up.dot(right)).normalize();
 const normal=new THREE.Vector3().crossVectors(right,up).normalize(),pixel=points[1].distanceTo(points[0])/width;
 const local=points.map(p=>{const d=p.clone().sub(points[0]);return {x:d.dot(right),y:d.dot(up)};}),h=homography(local,width,height);
 if(!h)return null;h[10]=pixel;
 const basis=new THREE.Matrix4().makeBasis(right,up,normal).setPosition(points[0]);
 return basis.multiply(new THREE.Matrix4().fromArray(h)).multiply(new THREE.Matrix4().makeScale(1,-1,1));
}
