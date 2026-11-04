import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import fonts from '../dist/assets/fonts/narrative-outlines.json' with {type:'json'};
import {createNarrativeTypesetter,narrativeFontKey,worldPlaneMatrix,readingSurface} from '../dist/narrative-lettering.js';
import {copyAnchors} from '../dist/spatial-copy.js';
import {screenTransform} from '../dist/studio-reveal-motion.js';

test('narrative outlines match the native font families, weights and real counters',()=>{
 assert.equal(narrativeFontKey('UV Manrope','500','normal'),'manrope500');
 assert.equal(narrativeFontKey('UV Manrope','600','normal'),'manrope600');
 assert.equal(narrativeFontKey('UV Instrument Serif','400','italic'),'serifItalic');
 assert.equal(narrativeFontKey('UV Instrument Serif','400','normal'),'serifRegular');
 const typesetter=createNarrativeTypesetter(fonts);
 for(const key of Object.keys(fonts)){
  const font=new FontLoader().parse(fonts[key]),shapes=font.generateShapes('O',100);assert.equal(shapes[0].holes.length,1,`${key} loses its counter`);
  for(const character of ['A','g','y','O','’']){
   const g=typesetter.glyph(character,{fontKey:key,size:80});assert.ok(g);assert.ok(g.attributes.position.array.every(Number.isFinite));
   assert.ok(g.boundingBox.max.z<0,'depth crosses in front of the readable face');assert.ok(g.boundingBox.min.z< -4,'relief is flat');
  }
 }
 assert.equal(typesetter.glyph('🧠'),null,'an unsupported outline must leave the native glyph alone');typesetter.dispose();
});

test('composition preserves native character positions, whitespace and baselines without fitting words',()=>{
 const typesetter=createNarrativeTypesetter(fonts),records=[{character:'A',fontKey:'manrope500',size:80,x:10,baseline:100},{character:'y',fontKey:'serifItalic',size:96,x:200,baseline:105,accent:true}];
 const g=typesetter.compose(records),expected=new THREE.Box3();
 for(const r of records){const b=typesetter.glyph(r.character,r).boundingBox.clone().translate(new THREE.Vector3(r.x,-r.baseline,0));expected.union(b);}
 assert.ok(g.boundingBox.min.distanceTo(expected.min)<1e-4);assert.ok(g.boundingBox.max.distanceTo(expected.max)<1e-4);
 assert.deepEqual(g.groups.map(g=>g.materialIndex),[0,1,2]);
 assert.equal(g.groups.reduce((n,g)=>n+g.count,0),g.attributes.position.count);
 assert.ok(g.attributes.normal.array.every(Number.isFinite));g.dispose();typesetter.dispose();
});

test('reading surfaces and interactive controls stay stable through arbitrary camera travel',()=>{
 for(const [w,h] of [[1440,900],[1280,720],[390,844],[320,640]])for(const interactive of [false,true]){
  const rect={left:w*.06,top:h*.23,width:w*.8,height:h*.5,viewportWidth:w,viewportHeight:h};let reference;
  for(const [position,target,fov] of [[[0,5,26],[4,8,0],50],[[-9,5,-49],[-2,3.5,-59],36],[[8,14,-100],[-23,5,-120],58],[[14,11,125],[0,5,90],40]]){
   const camera=new THREE.PerspectiveCamera(fov,w/h,.1,280);camera.position.set(...position);camera.lookAt(new THREE.Vector3(...target));camera.updateMatrixWorld();
   const frame=readingSurface(rect,camera,{interactive}),pixels=frame.points.map(p=>{const q=p.clone().project(camera);return new THREE.Vector2((q.x*.5+.5)*w,(.5-q.y*.5)*h);});
   if(reference)pixels.forEach((p,i)=>assert.ok(p.distanceTo(reference[i])<1e-7,'camera motion moves the reading surface'));else reference=pixels;
   if(interactive){assert.ok(pixels[0].distanceTo(new THREE.Vector2(rect.left,rect.top))<1e-7);assert.ok(pixels[2].distanceTo(new THREE.Vector2(rect.left+rect.width,rect.top+rect.height))<1e-7);}
  }
 }
});

test('the transition relief follows all four native world-plane corners exactly',()=>{
 for(const [w,h] of [[2560,1440],[1440,900],[1280,720],[390,844],[320,640]]){
  const points=copyAnchors(w,h).caption,matrix=worldPlaneMatrix(points,720,360,screenTransform);
  for(const [i,[x,y]] of [[0,[0,0]],[1,[720,0]],[2,[720,-360]],[3,[0,-360]]])assert.ok(new THREE.Vector3(x,y,0).applyMatrix4(matrix).distanceTo(points[i])<1e-7,'native face and relief use different planes');
 }
});
