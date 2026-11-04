import * as THREE from 'three';
import {identityShapes,extrudedLettering,textGeometry,letterPose} from './lettering-geometry.js';
import {createNarrativeTypesetter,narrativeFontKey,worldPlaneMatrix,readingSurface} from './narrative-lettering.js';
import {copyAnchors,copyOpacity} from './spatial-copy.js';
import {screenTransform} from './studio-reveal-motion.js';
import {projects} from './portfolio-data.js';
import {demoContent} from './demo-content.js';

function planeMatrix(points,width){
 const right=points[1].clone().sub(points[0]),scale=right.length()/width;right.normalize();
 const up=points[0].clone().sub(points[3]);up.addScaledVector(right,-up.dot(right)).normalize();
 const normal=new THREE.Vector3().crossVectors(right,up).normalize();
 return new THREE.Matrix4().makeBasis(right,up,normal).scale(new THREE.Vector3(scale,scale,scale)).setPosition(points[0]);
}

function headingGlyphs(element,origin,typesetter,metrics){
 const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT),glyphs=[];let node;
 while((node=walker.nextNode())){
  const hidden=node.parentElement.closest('[aria-hidden=true]');
  if(node.parentElement.closest('b')||(hidden&&element.contains(hidden))||!node.textContent.trim())continue;
  const style=getComputedStyle(node.parentElement),size=parseFloat(style.fontSize),fontKey=narrativeFontKey(style.fontFamily,style.fontWeight,style.fontStyle),font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  if(!metrics.has(font)){const context=document.createElement('canvas').getContext('2d');context.font=font;metrics.set(font,context.measureText('Hg').fontBoundingBoxAscent||typesetter.ascender(fontKey,size));}
  const range=document.createRange(),accent=Boolean(node.parentElement.closest('em,.cgpa'));
  for(let i=0;i<node.textContent.length;i++){
   const character=node.textContent[i];if(!character.trim())continue;
   range.setStart(node,i);range.setEnd(node,i+1);const r=range.getBoundingClientRect();if(!r.width||!r.height)continue;
   glyphs.push({character,fontKey,size,x:r.left-origin.left,baseline:r.top-origin.top+metrics.get(font),accent});
  }
 }
 return glyphs;
}

export function createWorldLettering(scene,schedule){
 const root=document.documentElement,title=document.querySelector('#hero-title'),replay=document.querySelector('#identity-replay');
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)'),motionAllowed=()=>!root.classList.contains('motion-off')&&!reducedMotion.matches;
 const face=new THREE.MeshPhysicalMaterial({color:0xdce7ff,metalness:.56,roughness:.25,clearcoat:.35,envMapIntensity:1.25,emissive:0x38518c,emissiveIntensity:.13,fog:false});
 const edge=new THREE.MeshPhysicalMaterial({color:0x1648ed,metalness:.72,roughness:.25,clearcoat:.45,envMapIntensity:1.5,fog:false});
 const accent=new THREE.MeshPhysicalMaterial({color:0xd4ff35,metalness:.28,roughness:.32,envMapIntensity:.8,emissive:0x799900,emissiveIntensity:.2,fog:false});
 const nameFace=face.clone(),nameEdge=edge.clone(),captionFace=face.clone(),captionEdge=edge.clone(),captionAccent=accent.clone();
 // Narrative depth should read as cobalt, without the bright environmental
 // reflections that suit the large hero sculpture and its metal wordmark.
 edge.metalness=.3;edge.roughness=.4;edge.clearcoat=.1;edge.envMapIntensity=.3;edge.emissive.set(0x0825a8);edge.emissiveIntensity=.16;
 captionEdge.copy(edge);
 for(const m of [nameFace,nameEdge,captionFace,captionEdge,captionAccent])m.transparent=true;
 const nameRoot=new THREE.Group(),nameMotion=new THREE.Group(),captionRoot=new THREE.Group(),letters=[];
 nameRoot.matrixAutoUpdate=false;captionRoot.matrixAutoUpdate=false;nameMotion.position.set(360,-160,0);nameRoot.add(nameMotion);scene.add(nameRoot,captionRoot);
 let advance=0;
 identityShapes().forEach((shape,i)=>{
  const geometry=extrudedLettering(shape,{depth:23,bevel:1.7,svg:true});geometry.scale(1.1,1.1,1.1);
  const mesh=new THREE.Mesh(geometry,[nameFace,nameEdge]);mesh.layers.set(1);mesh.position.set(13+advance*1.1-360,107,0);mesh.userData.rest=mesh.position.clone();nameMotion.add(mesh);letters.push(mesh);advance+=[110,120,111,116,116][i]+7;
 });
 for(const [i,letter] of [...'VEKARIYA'].entries()){
  const geometry=textGeometry(letter,{depth:14,bevel:1.2});geometry.scale(.34,.34,.34);geometry.computeBoundingBox();
  const mesh=new THREE.Mesh(geometry,[nameFace,nameEdge]);mesh.layers.set(1);mesh.position.set(17+i*88-geometry.boundingBox.min.x-360,-113,0);mesh.userData.rest=mesh.position.clone();nameMotion.add(mesh);letters.push(mesh);
 }
 const surfaceConfigs=[
  ['.hero-top',null],['.hero-bottom>div',null],
  ['#about>.chapter-rule',null],['.about-layout','#about-title'],
  ['#education>.chapter-rule',null],['.education-heading','#education-title,.cgpa'],['.education-bottom','.experience-item h3'],
  ['#work>.chapter-rule',null],['.arrival-copy','#work-title'],['#gallery-map',null],
  ['.gallery-copy','#gallery-title,#gallery-step-title'],['.gallery-floor-label',null],
  ['#lab>.chapter-rule',null],['.studio-heading','#studio-heading'],
  ['#contact>.chapter-rule',null],['.contact-kicker',null],['#contact-title','#contact-title'],['.contact-bottom',null],
  ['.footer',null]
 ];
 const panels=[],metrics=new Map();let typesetter=null,dirty=true,disposed=false,start=performance.now(),warmTask=0,pointer={x:0,y:0,h:0},aim={x:0,y:0,h:0};
 for(const [selector,headings] of surfaceConfigs){
  const element=document.querySelector(selector);if(!element)continue;
  const slot=document.createElement('div');slot.className=element.className+' world-surface-slot';element.before(slot);slot.append(element);
  const style=element.getAttribute('style');element.classList.add('scene-type-surface');
  const group=new THREE.Group();group.matrixAutoUpdate=false;scene.add(group);panels.push({element,slot,style,group,headings,headingNodes:[],dirty:true,signature:null});
 }
 root.classList.add('world-lettering-ready','mesh-identity-ready');
 function replaceRelief(group,records,materials){
  for(const child of [...group.children]){child.geometry.dispose();group.remove(child);}
  const geometry=typesetter?.compose(records);if(geometry){const mesh=new THREE.Mesh(geometry,materials);mesh.layers.set(1);group.add(mesh);}
 }
 function measure(){
  for(const p of panels){
   if(!p.dirty)continue;p.dirty=false;
   if(root.dataset.deskScreen==='true'&&p.element.closest('#contact'))continue;
   p.element.style.transform='';const r=p.slot.getBoundingClientRect();
   if(!r.width)continue;
   const headings=p.headings?(p.element.matches(p.headings)?[p.element]:[...p.element.querySelectorAll(p.headings)]):[];
   p.headingNodes.forEach(h=>h.classList.remove('mesh-heading'));p.headingNodes=headings;
   const records=[];for(const heading of headings){heading.classList.add('mesh-heading');if(typesetter)records.push(...headingGlyphs(heading,r,typesetter,metrics));}
   const signature=JSON.stringify(records);if(signature!==p.signature){p.signature=signature;replaceRelief(p.group,records,[face,edge,accent]);}
  }
  if(!dirty)return;dirty=false;
  const caption=document.querySelector('.world-caption'),prior=caption.style.transform;caption.style.transform='';const r=caption.getBoundingClientRect(),records=[];
  if(typesetter)for(const heading of caption.querySelectorAll(':scope>span,:scope>em'))records.push(...headingGlyphs(heading,r,typesetter,metrics));
  replaceRelief(captionRoot,records,[captionFace,captionEdge,captionAccent]);caption.style.transform=prior;
  const anchors=copyAnchors(innerWidth,innerHeight);nameRoot.matrix.copy(planeMatrix(anchors.name,720));nameMotion.scale.setScalar(innerWidth<760?.94:1);captionRoot.matrix.copy(worldPlaneMatrix(anchors.caption,720,360,screenTransform));
 }
 const mark=()=>{if(disposed)return;dirty=true;panels.forEach(p=>p.dirty=true);schedule();};
 function warmGallery(){
  if(warmTask)cancelIdleCallback(warmTask);warmTask=0;
  if(!typesetter||!globalThis.requestIdleCallback)return;
  const pending=[],seen=new Set();
  for(const [selector,text] of [['#gallery-title',projects.map(p=>p.name).join('')],['#gallery-step-title',demoContent.flatMap(d=>d.steps.map(s=>s[1])).join('')]]){
   const style=getComputedStyle(document.querySelector(selector)),fontKey=narrativeFontKey(style.fontFamily,style.fontWeight,style.fontStyle),size=parseFloat(style.fontSize);
   for(const character of text){const key=fontKey+'/'+size+'/'+character;if(!character.trim()||seen.has(key))continue;seen.add(key);pending.push({character,fontKey,size});}
  }
  // Prepare one cached outline per idle slice; never build a whole project on a click.
  const next=deadline=>{warmTask=0;if(disposed)return;if(deadline.timeRemaining()>5){const r=pending.shift();if(r)typesetter.glyph(r.character,r);}if(pending.length)warmTask=requestIdleCallback(next);};
  warmTask=requestIdleCallback(next);
 }
 const observer=new ResizeObserver(entries=>{if(disposed)return;for(const entry of entries){const p=panels.find(p=>p.element===entry.target);if(p)p.dirty=true;}schedule();});panels.forEach(p=>observer.observe(p.element));
 const observedText=['#gallery-title','#gallery-step-title','#experience-list'].map(s=>document.querySelector(s)).filter(Boolean),textCache=new Map(observedText.map(e=>[e,e.textContent]));
 const contentObserver=new MutationObserver(()=>{let changed=false;for(const e of observedText)if(textCache.get(e)!==e.textContent){textCache.set(e,e.textContent);for(const p of panels)if(p.element.contains(e))p.dirty=true;changed=true;}if(changed)schedule();});for(const e of observedText)contentObserver.observe(e,{subtree:true,childList:true,characterData:true});
 document.fonts.ready.then(()=>{metrics.clear();mark();});
 fetch(new URL('./assets/fonts/narrative-outlines.json',import.meta.url)).then(r=>{if(!r.ok)throw new Error('Font outlines unavailable');return r.json();}).then(data=>{if(disposed)return;typesetter=createNarrativeTypesetter(data);title.dataset.relief='ready';mark();warmGallery();}).catch(()=>{if(!disposed)title.dataset.typeFallback='native';});
 const pointerMove=e=>{if(e.pointerType==='touch'||!motionAllowed())return;const r=title.getBoundingClientRect();pointer={x:THREE.MathUtils.clamp((e.clientX-r.left)/r.width-.5,-.5,.5),y:THREE.MathUtils.clamp((e.clientY-r.top)/r.height-.5,-.5,.5),h:1};schedule();};
 const pointerLeave=()=>{pointer={x:0,y:0,h:0};if(motionAllowed())schedule();};
 const replayName=()=>{if(!motionAllowed())return;start=performance.now();schedule();};title.addEventListener('pointermove',pointerMove);title.addEventListener('pointerleave',pointerLeave);replay.addEventListener('click',replayName);addEventListener('blur',pointerLeave);
 const temp=new THREE.Vector3();
 function update(camera,state,now,dt,motion){
  if(disposed)return false;
  if(dirty||panels.some(p=>p.dirty))measure();
  const k=1-Math.exp(-Math.min(.05,dt)*12);for(const key of ['x','y','h'])aim[key]=motion?aim[key]+(pointer[key]-aim[key])*k:0;
  const nameOpacity=copyOpacity('name',state),captionOpacity=copyOpacity('caption',state);for(const material of [nameFace,nameEdge]){material.opacity=nameOpacity;material.depthWrite=nameOpacity>.01;}for(const material of [captionFace,captionEdge,captionAccent]){material.opacity=captionOpacity;material.depthWrite=captionOpacity>.01;}
  nameRoot.visible=nameOpacity>.002;captionRoot.visible=captionOpacity>.002;
  let moving=false;
  for(const [i,mesh] of letters.entries()){
   const pose=letterPose(i,now-start,{motion,x:aim.x,y:aim.y,hover:aim.h});mesh.position.copy(mesh.userData.rest).add(temp.set(pose.x,pose.y,pose.z));mesh.rotation.set(pose.rx,pose.ry,pose.rz);moving||=pose.moving&&nameOpacity>0;
  }
  nameMotion.rotation.set(aim.y*.045,-.17+aim.x*.12,0);
  for(const p of panels){
   if(root.dataset.deskScreen==='true'&&p.element.closest('#contact')){p.group.visible=false;p.element.style.transform='';continue;}p.group.visible=true;
   const r=p.slot.getBoundingClientRect();if(!r.width||!r.height||r.bottom<-innerHeight||r.top>innerHeight*2){p.group.position.set(0,0,0);p.group.matrix.makeTranslation(0,-10000,0);continue;}
   const interactive=Boolean(p.element.querySelector('button,input,select')||p.element.matches('a,.chapter-rule,.footer,.hero-top'));
   const frame=readingSurface({...r.toJSON(),viewportWidth:innerWidth,viewportHeight:innerHeight},camera,{interactive});
   // Both representations share this exact planar quadrilateral. Native prose supplies
   // selection, focus and control hit testing; the scene supplies sculpted type.
   p.group.matrix.copy(worldPlaneMatrix(frame.points,r.width,r.height,screenTransform));
   const transform=screenTransform(frame.screenPoints.map(q=>({x:q.x-r.left,y:q.y-r.top})),r.width,r.height);
   p.element.style.transform=transform?`matrix3d(${transform.join(',')})`:'';
  }
  title.dataset.sculpted='true';title.dataset.typeFrame=String(Math.round(now));title.dataset.animating=String(moving);return moving||(nameOpacity>0&&Math.abs(aim.x-pointer.x)+Math.abs(aim.y-pointer.y)+Math.abs(aim.h-pointer.h)>.002&&motion);
 }
 return {update,resize(){mark();warmGallery();},dispose(){
  if(disposed)return;disposed=true;if(warmTask)cancelIdleCallback(warmTask);observer.disconnect();contentObserver.disconnect();title.removeEventListener('pointermove',pointerMove);title.removeEventListener('pointerleave',pointerLeave);replay.removeEventListener('click',replayName);removeEventListener('blur',pointerLeave);
  root.classList.remove('world-lettering-ready','mesh-identity-ready');delete title.dataset.sculpted;delete title.dataset.typeFrame;delete title.dataset.typeFallback;delete title.dataset.relief;typesetter?.dispose();
  for(const p of panels){p.headingNodes.forEach(h=>h.classList.remove('mesh-heading'));p.element.classList.remove('scene-type-surface');if(p.style===null)p.element.removeAttribute('style');else p.element.setAttribute('style',p.style);p.slot.replaceWith(p.element);}
 }};
}
