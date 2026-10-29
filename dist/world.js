import * as THREE from 'three';
import {createProjectWorlds} from './project-worlds.js';
import {createRibbonSculpture,advanceHover} from './ribbon-sculpture.js';
import {RoomEnvironment} from './vendor/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from './vendor/geometries/RoundedBoxGeometry.js';
import {EffectComposer} from './vendor/postprocessing/EffectComposer.js';
import {RenderPass} from './vendor/postprocessing/RenderPass.js';
import {UnrealBloomPass} from './vendor/postprocessing/UnrealBloomPass.js';
import {OutputPass} from './vendor/postprocessing/OutputPass.js';
import {Reflector} from './vendor/objects/Reflector.js';
import {FontLoader} from './vendor/loaders/FontLoader.js';
import {TextGeometry} from './vendor/geometries/TextGeometry.js';

// One persistent renderer serves the personal introduction and the separate project studio.
// Everything in the scene is original procedural geometry; no remote model is required.
export async function initWorld(demoEngine){
 const hero=document.querySelector('#hero-render'),track=document.querySelector('.journey'),projectTrack=document.querySelector('#work');
 let renderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch{return fallback();}
 const mobile=matchMedia('(max-width:700px)').matches;
 let qualityDpr=Math.min(devicePixelRatio,mobile?1.35:1.6);renderer.setPixelRatio(qualityDpr);
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.94;
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.domElement.setAttribute('aria-hidden','true');hero.append(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#151515');scene.fog=new THREE.FogExp2('#090909',.043);
 const camera=new THREE.PerspectiveCamera(35,1,.1,70);
 const envScene=new RoomEnvironment();
 const pmrem=new THREE.PMREMGenerator(renderer),env=pmrem.fromScene(envScene,.035);
 scene.environment=env.texture;scene.environmentIntensity=.55;envScene.dispose();pmrem.dispose();
 const chrome=new THREE.MeshPhysicalMaterial({color:0xa7a8ad,metalness:1,roughness:.2,clearcoat:.5,clearcoatRoughness:.13});
 const graphite=new THREE.MeshStandardMaterial({color:0x171719,metalness:.8,roughness:.28});
 const redMetal=new THREE.MeshStandardMaterial({color:0x8e0b04,metalness:.8,roughness:.24});
 const red=new THREE.MeshBasicMaterial({color:new THREE.Color(3.2,.012,.003)});
 const white=new THREE.MeshBasicMaterial({color:new THREE.Color(1.8,1.7,1.6)});
 const faint=new THREE.MeshBasicMaterial({color:0x662016,transparent:true,opacity:.5});
 const fill=new THREE.HemisphereLight(0xbfc8df,0x260200,.22);scene.add(fill);
 const key=new THREE.DirectionalLight(0xf1f3ff,2);key.position.set(-3,6,5);scene.add(key);
 const rim=new THREE.DirectionalLight(0xff240b,3);rim.position.set(3,1,-4);scene.add(rim);
 const side=new THREE.PointLight(0xff1a06,12,15,2);side.position.set(-3,-.8,2);scene.add(side);
 const high=new THREE.PointLight(0xe1e8ff,12,14,2);high.position.set(1,4,3);scene.add(high);

 const chamber=new THREE.Group();scene.add(chamber);
 const wallMat=new THREE.MeshStandardMaterial({color:0x0b0b0c,roughness:.36,metalness:.65});
 function box(w,h,d,mat,x=0,y=0,z=0,round=.035){const m=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(round,w/4,h/4,d/4)),mat);m.position.set(x,y,z);return m;}
 // Architectural panels, seams, and long reflected strip lights.
 for(let s of [-1,1]){
  const wall=box(1.1,8,18,wallMat,s*6,1,-5);chamber.add(wall);
  for(let i=0;i<8;i++){
   const panel=box(.1,6.5,.025,i%3===0?red:graphite,s*5.42,.5,-i*1.6);chamber.add(panel);
  }
  const rail=box(.03,.035,22,red,s*4.2,-2.05,-5);chamber.add(rail);
 }
 const rear=box(12,9,.3,wallMat,0,0,-9);chamber.add(rear);
 for(let i=-4;i<=4;i++){
  const seam=box(.018,9,.025,i%2===0?faint:graphite,i*1.3,0,-8.8);chamber.add(seam);
 }
 const portal=new THREE.Group();portal.position.set(0,.2,-5.2);chamber.add(portal);
 for(let s of [-1,1]){portal.add(box(.055,6.7,.08,red,s*3.2,.15,0));}
 portal.add(box(6.45,.055,.08,red,0,3.5,0));
 const floor=new Reflector(new THREE.PlaneGeometry(40,45),{textureWidth:mobile?384:768,textureHeight:mobile?384:768,color:0x292526,clipBias:.003});
 floor.rotation.x=-Math.PI/2;floor.position.set(0,-2.2,-4);scene.add(floor);
 // The transparent dark glaze keeps the reflected sculpture in the background.
 const glaze=new THREE.Mesh(new THREE.PlaneGeometry(40,45),new THREE.MeshBasicMaterial({color:0x070404,transparent:true,opacity:.68,depthWrite:false}));glaze.rotation.x=-Math.PI/2;glaze.position.set(0,-2.193,-4);scene.add(glaze);

 const sculpture=new THREE.Group();sculpture.position.y=.2;scene.add(sculpture);
 const folded=createRibbonSculpture(),assembly=folded.assembly;sculpture.add(assembly);
 assembly.rotation.set(.12,-.48,-.2);

 // The identity is physical geometry in the same scene: it is lit, occluded,
 // reflected, and moved by the same camera as the sculpture.
 const font=await new FontLoader().loadAsync('./assets/helvetiker_bold.typeface.json');
 const identity=new THREE.Group();scene.add(identity);
 const nameMaterial=new THREE.MeshPhysicalMaterial({color:0xe1ddd1,metalness:.38,roughness:.27,clearcoat:.3,transparent:true});
 const nameSide=new THREE.MeshStandardMaterial({color:0x4b4540,metalness:.9,roughness:.22,transparent:true});
 const nameGeo=new TextGeometry('UMANG',{font,size:1.45,depth:.16,curveSegments:12,bevelEnabled:true,bevelThickness:.014,bevelSize:.012,bevelSegments:3});
 nameGeo.computeBoundingBox();const nameWidth=nameGeo.boundingBox.max.x-nameGeo.boundingBox.min.x;nameGeo.translate(-nameWidth/2,0,0);
 const nameMesh=new THREE.Mesh(nameGeo,[nameMaterial,nameSide]);identity.add(nameMesh);
 const surnameGeo=new TextGeometry('V E K A R I Y A',{font,size:.12,depth:.025,curveSegments:6,bevelEnabled:false});
 surnameGeo.computeBoundingBox();surnameGeo.translate(-surnameGeo.boundingBox.max.x/2,0,0);
 const surname=new THREE.Mesh(surnameGeo,nameMaterial);surname.position.set(0,-.28,.03);identity.add(surname);
 identity.position.set(0,-1.65,.5);identity.rotation.y=-.08;
 // Project scenes share the same renderer and the live demonstration texture.
 const demoTexture=new THREE.CanvasTexture(demoEngine.canvas);demoTexture.colorSpace=THREE.SRGBColorSpace;demoTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();
 const projectWorlds=createProjectWorlds({scene,texture:demoTexture,box,chrome,graphite,red,engine:demoEngine});
 const raycaster=new THREE.Raycaster(),pointerNDC=new THREE.Vector2();
 // Restrained depth, rather than a star-field overlay.
 const points=[];for(let i=0;i<90;i++){const seed=Math.sin(i*127.1+31.7)*43758.54;const f=seed-Math.floor(seed);points.push((f-.5)*16,Math.sin(i*31.4)*4,Math.cos(i*17.2)*8-3);}
 const dust=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(points,3)),new THREE.PointsMaterial({size:.012,color:0xa35241,transparent:true,opacity:.35}));scene.add(dust);
 const renderTarget=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,samples:mobile?2:4});
 const composer=new EffectComposer(renderer,renderTarget);composer.addPass(new RenderPass(scene,camera));
 const bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.23,.4,1.6);composer.addPass(bloom);composer.addPass(new OutputPass());
 let lastTextureRevision=-1,lastRenderKey='',qualityFrames=0,slowFrames=0;
 let visible=true,motion=!document.documentElement.classList.contains('motion-off'),pointer={x:0,y:0},elapsed=0,previous=0,lastFrame=0,w=0,h=0;
 let mode=document.documentElement.dataset.sceneMode||'intro',phase=Number((mode==='project'?projectTrack:track).dataset.phase||0),projectIndex=Number(projectTrack.dataset.project||0),turn=0,dragX=0,dragging=false,lastX=0;
 const look=new THREE.Vector3(),desired=new THREE.Vector3();
 const hoverSpring={value:0,velocity:0},hoverSphere=new THREE.Sphere(),hoverPoint=new THREE.Vector3();let hoverTarget=0,pulseUntil=0,hoverX=0,hoverY=0,touchStartY=0;
 const trigger=document.querySelector('#sculpture-trigger');
 if(trigger){trigger.disabled=!motion;trigger.textContent=matchMedia('(hover:hover)').matches?'Hover to energize ↗':'Tap to energize ↗';trigger.addEventListener('click',()=>{if(motion){const now=performance.now();pulseUntil=pulseUntil>now?0:now+5000;}});}
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};

 function resize(){const r=hero.getBoundingClientRect();if(w===Math.round(r.width)&&h===Math.round(r.height))return;w=Math.round(r.width);h=Math.round(r.height);if(!w||!h)return;renderer.setSize(w,h,false);composer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
 addEventListener('portfolio-progress',e=>{mode=e.detail.mode;phase=e.detail.phase;motion=e.detail.motion;projectIndex=e.detail.index||0;if(mode!=='intro'){hoverTarget=0;pulseUntil=0;hoverSpring.value=hoverSpring.velocity=0;hero.dataset.hoverEnergy='0';}});
 addEventListener('portfolio-project',()=>{turn=1;});
 addEventListener('portfolio-motion',e=>{motion=e.detail.enabled;if(trigger)trigger.disabled=!motion;if(!motion){hoverTarget=0;pulseUntil=0;hoverSpring.value=hoverSpring.velocity=0;}});
 function hitBoard(e,type){if(mode!=='project')return false;pointerNDC.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);raycaster.setFromCamera(pointerNDC,camera);const hit=raycaster.intersectObjects(projectWorlds.screens)[0];if(hit?.uv){demoEngine.pointer(hit.uv.x,hit.uv.y,type);return true;}return false;}
 function hitSculpture(e){
  if(mode!=='intro'||!motion||e.target?.closest?.('a,button,input,select,textarea,dialog,.header,.mobile-menu'))return false;
  pointerNDC.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);raycaster.setFromCamera(pointerNDC,camera);
  hoverSphere.center.copy(sculpture.position);hoverSphere.radius=(2.35+hoverSpring.value*.25)*sculpture.scale.x;
  if(!raycaster.ray.intersectSphere(hoverSphere,hoverPoint))return false;
  sculpture.worldToLocal(hoverPoint);hoverX=clamp(hoverPoint.x/1.8,-1,1);hoverY=clamp(hoverPoint.y/1.8,-1,1);return true;
 }
 function releaseHover(){hoverTarget=0;dragging=false;}
 document.addEventListener('pointermove',e=>{pointer.x=(e.clientX/innerWidth-.5)*2;pointer.y=(e.clientY/innerHeight-.5)*2;
  if(mode==='project'){if(dragging||demoEngine.projectId==='playable-replay')hitBoard(e,'move');return;}
  if(e.pointerType==='touch'&&Math.abs(e.clientY-touchStartY)>12)pulseUntil=0;
  hoverTarget=e.pointerType!=='touch'&&hitSculpture(e)?1:0;
  if(dragging){dragX+=(e.clientX-lastX)*.004;lastX=e.clientX;}
 },{passive:true});
 document.addEventListener('pointerdown',e=>{if(e.button!==0||!hitSculpture(e))return;if(e.pointerType==='touch'){touchStartY=e.clientY;const now=performance.now();pulseUntil=pulseUntil>now?0:now+5000;}else{hoverTarget=1;dragging=true;lastX=e.clientX;hero.setPointerCapture(e.pointerId);}});
 hero.addEventListener('pointerdown',e=>{if(mode!=='project'||e.button!==0)return;dragging=true;lastX=e.clientX;hitBoard(e,'down');hero.setPointerCapture(e.pointerId);});
 document.addEventListener('pointerup',()=>{dragging=false;});document.addEventListener('pointercancel',releaseHover);
 document.addEventListener('pointerout',e=>{if(!e.relatedTarget)releaseHover();});addEventListener('blur',releaseHover);
 addEventListener('scroll',()=>{hoverTarget=0;},{passive:true});
 document.addEventListener('visibilitychange',()=>{visible=!document.hidden;});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback();visible=false;});
 function frame(now){
  requestAnimationFrame(frame);if(!visible||now-lastFrame<(mobile?33:16))return;
  if(document.querySelector('dialog[open]'))return;
  if(mode==='none'){hero.style.visibility='hidden';return;}hero.style.visibility='visible';
  const interval=now-lastFrame,delta=Math.min((now-previous)/1000,.05);previous=now;lastFrame=now;if(motion)elapsed+=delta;
  if(motion&&interval<250){qualityFrames++;if(interval>50)slowFrames++;if(qualityFrames>=90){if(slowFrames>25&&qualityDpr>.85){qualityDpr=Math.max(.85,qualityDpr*.8);renderer.setPixelRatio(qualityDpr);composer.setPixelRatio(qualityDpr);w=0;hero.dataset.renderScale=qualityDpr.toFixed(2);}qualityFrames=0;slowFrames=0;}}
  resize();if(!w||!h)return;
  advanceHover(hoverSpring,mode==='intro'&&(hoverTarget||now<pulseUntil)?1:0,delta,motion);const energy=hoverSpring.value;
  hero.dataset.hoverEnergy=energy.toFixed(3);hero.dataset.hoverSource=hoverTarget?'pointer':now<pulseUntil?'tap':'none';track.dataset.hoverField=energy>.1?(dragging?'dragging':'active'):'resting';if(trigger)trigger.setAttribute('aria-pressed',String(energy>.4));
  const portrait=w<h*.85,p=motion?phase:Math.round(phase),intro=smooth(.15,1,p),direction=smooth(1.1,2.3,p);
  const renderKey=[mode,p,w,h,projectIndex,mode==='project'?demoEngine.revision:0,dragX,motion,energy.toFixed(3)].join('/');if(!motion&&renderKey===lastRenderKey)return;lastRenderKey=renderKey;
  projectWorlds.setVisible(mode==='project');identity.visible=mode==='intro';sculpture.visible=mode==='intro';
  if(mode==='intro'){
   const push=Math.sin(clamp(p/1.7)*Math.PI)*1.5;
   desired.set(Math.sin(p*.8)*.35+(motion?pointer.x*.09:0),.25+Math.sin(p*.8)*.25,(portrait?18.2:10.5)-push-energy*(portrait?.10:.25));
   look.set(0,portrait?-.05:-.15,-.3);
   sculpture.position.set(portrait?0:intro*2.15,.42+intro*.15,-intro*.8-direction*.25);sculpture.scale.setScalar(1-intro*.24-direction*.1);
   assembly.rotation.set(.12+intro*.35+energy*hoverY*.14,-.48+p*.75+dragX+(motion?Math.sin(elapsed*.15)*.05:0)+energy*hoverX*.19,-.12+intro*.2-energy*hoverX*.06);
   folded.update({time:elapsed,phase:p,motion,energy,pointerX:hoverX,pointerY:hoverY,compact:portrait});
   const fade=1-smooth(.35,1,p);identity.visible=fade>.001;identity.position.set(intro*2.4,-1.65+intro*.55,.5-intro*4.5);identity.rotation.y=-.08-intro*.4;identity.scale.setScalar(portrait?.59:1);nameMaterial.opacity=fade;nameSide.opacity=fade;
   floor.visible=!portrait&&p<1.1;glaze.visible=floor.visible;chamber.position.z=-p*.38;
  }else{
   const shots=[[-.10,.55,.1],[.12,.24,0],[.10,.32,.35],[.18,.20,.15],[-.08,.55,.1],[.1,.24,.25],[-.06,.30,.3],[.13,.34,.25]][projectIndex];
   desired.set(shots[0]+Math.sin(p*.5)*.10,portrait?.2:shots[1],portrait?16.2:Math.max(10.8,15.5/(w/h))+shots[2]-p*.18);look.set(0,portrait?.15:-.05,0);
   turn=Math.max(0,turn-delta*1.6);projectWorlds.update({phase:p,time:elapsed,delta,motion,portrait,turn,index:projectIndex,compact:!portrait&&h<700});
   if(lastTextureRevision!==demoEngine.revision){projectWorlds.refresh();lastTextureRevision=demoEngine.revision;}

   floor.visible=false;glaze.visible=false;chamber.position.z=-1.2-p*.25-projectIndex*.12;
  }
  if(motion)camera.position.lerp(desired,.12);else camera.position.copy(desired);camera.lookAt(look);
  rim.intensity=mode==='project'?1.7:3;side.intensity=mode==='project'?5:12;dust.rotation.y=elapsed*.004;
  hero.dataset.scenePhase=p.toFixed(3);hero.dataset.sceneMode=mode;hero.dataset.sceneWorld=mode==='project'?projectWorlds.names[projectIndex]:'Identity';hero.dataset.activeStudy=mode==='project'?String(projectIndex):'-1';
  bloom.strength=mode==='intro'?.08+energy*.12:.23;
  composer.render(delta);
  if(!document.documentElement.classList.contains('world-ready'))document.documentElement.classList.add('world-ready');
 }
 camera.position.set(0,.25,mobile?18.2:10.5);resize();requestAnimationFrame(frame);
 function fallback(){document.documentElement.classList.add('world-fallback');document.querySelector('.scene-name')?.classList.add('static-name');}
 return {setPhase:value=>phase=value};
}
