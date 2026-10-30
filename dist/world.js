import * as THREE from 'three';
import {createWorkshop} from './workshop-architecture.js';
import {workshopShot} from './workshop-layout.js';
import {profileRail,profileStops,profileWeight,smoother} from './profile-layout.js';
import {createProfileFoyer} from './profile-foyer.js';
import {createSpatialType} from './spatial-type.js';
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
 const scene=new THREE.Scene();scene.background=new THREE.Color('#0c1216');scene.fog=new THREE.FogExp2('#0c1216',.017);
 const camera=new THREE.PerspectiveCamera(35,1,.1,180);
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

 function box(w,h,d,mat,x=0,y=0,z=0,round=.035){const m=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(round,w/4,h/4,d/4)),mat);m.position.set(x,y,z);return m;}
 const workshop=createWorkshop({scene,box,chrome,graphite,red});
 const floor=new Reflector(new THREE.PlaneGeometry(18,14),{textureWidth:mobile?256:512,textureHeight:mobile?256:512,color:0x303638,clipBias:.003});
 floor.rotation.x=-Math.PI/2;floor.position.set(0,-3.12,1);scene.add(floor);
 const glaze=new THREE.Mesh(new THREE.PlaneGeometry(18,14),new THREE.MeshBasicMaterial({color:0x0b1012,transparent:true,opacity:.72,depthWrite:false}));glaze.rotation.x=-Math.PI/2;glaze.position.set(0,-3.113,1);scene.add(glaze);

 const sculpture=new THREE.Group();sculpture.position.y=.2;scene.add(sculpture);
 const folded=createRibbonSculpture(),assembly=folded.assembly;sculpture.add(assembly);
 assembly.rotation.set(.12,-.48,-.2);
 const sculptureFades=[];const seenMaterials=new Set();assembly.traverse(o=>{if(!o.material)return;for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(!m.transparent&&!seenMaterials.has(m)){seenMaterials.add(m);m.transparent=true;sculptureFades.push(m);}});

 // The identity is physical geometry in the same scene: it is lit, occluded,
 // reflected, and moved by the same camera as the sculpture.
 const font=await new FontLoader().loadAsync('./assets/helvetiker_bold.typeface.json');
 const spatialType=createSpatialType(hero);
 const profileFoyer=createProfileFoyer({scene,box,font,chrome,graphite,red,spatialType});
 // A single soft key follows the overview instead of flooding every wall and the floor.
 const profileLight=new THREE.SpotLight(0xffe6ce,0,18,.62,1,2);
 const profileLightTarget=new THREE.Object3D();scene.add(profileLight,profileLightTarget);profileLight.target=profileLightTarget;
 const profileFocus=new THREE.Vector3(),profileAnchor=new THREE.Vector3();
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
 let mode=document.documentElement.dataset.sceneMode||'intro',phase=Number((mode==='project'?projectTrack:mode==='gateway'?document.querySelector('#project-overview'):mode==='profile'?document.querySelector('#about'):track).dataset.phase||0),projectIndex=Number(projectTrack.dataset.project||0),turn=0,dragX=0,dragging=false,lastX=0;
 const look=new THREE.Vector3(),desired=new THREE.Vector3(),lookCurrent=new THREE.Vector3(0,-.15,-.3);
 let moving=false,flight=null,lastLocation='intro',frameClock=0,previewStation=-1;
 let profileEntry=smoother(1,0,document.querySelector('#about').getBoundingClientRect().top/innerHeight),gatewayEntry=smoother(1,0,document.querySelector('#project-overview').getBoundingClientRect().top/innerHeight);
 addEventListener('portfolio-station-preview',e=>{previewStation=e.detail.index;});
 const fromPosition=new THREE.Vector3(),fromLook=new THREE.Vector3();
 const hoverSpring={value:0,velocity:0},hoverSphere=new THREE.Sphere(),hoverPoint=new THREE.Vector3();let hoverTarget=0,pulseUntil=0,hoverX=0,hoverY=0,touchStartY=0;
 const trigger=document.querySelector('#sculpture-trigger');
 if(trigger){trigger.disabled=!motion;trigger.textContent=matchMedia('(hover:hover)').matches?'Hover to energize ↗':'Tap to energize ↗';trigger.addEventListener('click',()=>{if(motion){const now=performance.now();pulseUntil=pulseUntil>now?0:now+5000;}});}
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};

 function resize(){const r=hero.getBoundingClientRect();if(w===Math.round(r.width)&&h===Math.round(r.height))return;w=Math.round(r.width);h=Math.round(r.height);if(!w||!h)return;renderer.setSize(w,h,false);composer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
 addEventListener('portfolio-progress',e=>{mode=e.detail.mode;phase=e.detail.phase;motion=e.detail.motion;projectIndex=e.detail.index||0;profileEntry=e.detail.profileEntry??profileEntry;gatewayEntry=e.detail.gatewayEntry??gatewayEntry;if(mode!=='intro'){hoverTarget=0;pulseUntil=0;hoverSpring.value=hoverSpring.velocity=0;hero.dataset.hoverEnergy='0';}});
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
  const showProjects=mode==='gateway'||mode==='project'||(mode==='profile'&&gatewayEntry>.1),profileIndex=Math.min(2,Math.max(0,Math.round(p)));
  projectWorlds.setVisible(showProjects);identity.visible=mode==='intro';sculpture.visible=true;
  const profileOptions={portrait:w<=760||h<=620,aspect:w/h};
  profileFoyer.update({phase:mode==='intro'?0:mode==='gateway'?2.65:p,entry:smoother(.3,.8,profileEntry),exit:gatewayEntry,time:elapsed,motion,...profileOptions,visible:profileEntry>.001&&gatewayEntry<.999});
  const gateway=mode==='gateway';
  projectWorlds.update({phase:mode==='project'?p:0,time:elapsed,delta,motion,portrait,turn:0,index:mode==='project'?projectIndex:-1,compact:!portrait&&h<700,narrow:!portrait&&w/h<1.25});
  if(lastTextureRevision!==demoEngine.revision){projectWorlds.refresh();lastTextureRevision=demoEngine.revision;}
  if(mode==='intro'){
   desired.set(Math.sin(p*.8)*.35-direction*1.8+(motion?pointer.x*.1:0),.25+direction*.85,(portrait?18.2:11.6)-direction*1.9-energy*.15);
   look.set(0,portrait?-.05:-.15,-.3-direction*3.3);
   sculpture.position.set(portrait?0:intro*2.15,.42+intro*.15,-intro*.8-direction*.25);sculpture.scale.setScalar(1-intro*.24-direction*.1);
   assembly.rotation.set(.12+intro*.35+energy*hoverY*.14,-.48+p*.75+dragX+(motion?Math.sin(elapsed*.15)*.05:0)+energy*hoverX*.19,-.12+intro*.2-energy*hoverX*.06);
   folded.update({time:elapsed,phase:p,motion,energy,pointerX:hoverX,pointerY:hoverY,compact:portrait});
   const fade=1-smooth(.35,1,p);identity.visible=fade>.001;identity.position.set(intro*2.4,-1.65+intro*.55,.5-intro*4.5);identity.rotation.y=-.08-intro*.4;identity.scale.setScalar(portrait?.59:1);nameMaterial.opacity=fade;nameSide.opacity=fade;
  }else if(mode==='profile'){
   const shot=profileRail(p,profileOptions);desired.set(...shot.position);look.set(...shot.target);
   sculpture.position.set(2.15,.57,-1.05);sculpture.scale.setScalar(.65);folded.update({time:elapsed,phase:2.6,motion,energy:0,pointerX:0,pointerY:0,compact:portrait});
  }else if(gateway){
   const g=smooth(0,1,p);desired.set(portrait?10:14+g*2,portrait?12:10+g*3,portrait?15:15-g*4);look.set(portrait?-2:0,-1,-22-g*5);
   sculpture.position.set(2.15,.57,-1.05);sculpture.scale.setScalar(.65);folded.update({time:elapsed,phase:2.6,motion,energy:0,pointerX:0,pointerY:0,compact:portrait});
  }else{
   const shot=workshopShot(projectIndex,{portrait,phase:p,aspect:w/h});desired.set(...shot.position);look.set(...shot.target);
   if(portrait)look.y-=.4;
   sculpture.position.set(2.15,.57,-1.05);sculpture.scale.setScalar(.65);
  }
  // Section boundaries share the same poses; scrolling controls the whole move.
  const firstProfile=profileRail(0,profileOptions),lastProfile=profileRail(2.65,profileOptions);
  if(mode==='intro'&&profileEntry>0){desired.lerp(new THREE.Vector3(...firstProfile.position),profileEntry);look.lerp(new THREE.Vector3(...firstProfile.target),profileEntry);}
  if(mode==='profile'&&profileEntry<1){const endPosition=new THREE.Vector3(Math.sin(2.6*.8)*.35-1.8,1.1,(portrait?18.2:11.6)-1.9),endLook=new THREE.Vector3(0,portrait?-.05:-.15,-3.6);desired.lerpVectors(endPosition,desired,profileEntry);look.lerpVectors(endLook,look,profileEntry);}
  if(mode==='profile'&&gatewayEntry>0){desired.lerp(new THREE.Vector3(portrait?10:14,portrait?12:10,15),gatewayEntry);look.lerp(new THREE.Vector3(portrait?-2:0,-1,-22),gatewayEntry);}
  if(mode==='gateway'&&gatewayEntry<1){desired.lerpVectors(new THREE.Vector3(...lastProfile.position),desired,gatewayEntry);look.lerpVectors(new THREE.Vector3(...lastProfile.target),look,gatewayEntry);}
  const sculptureAlpha=1-smoother(.05,.7,profileEntry);sculpture.visible=sculptureAlpha>.001;sculptureFades.forEach(m=>{m.opacity=sculptureAlpha;m.depthWrite=sculptureAlpha>.98;});
  floor.visible=mode==='intro'&&!portrait&&p<1.1;glaze.visible=floor.visible;
  const location=mode==='project'?'project-'+projectIndex:mode==='profile'?'profile-'+profileIndex:mode;
  if(location!==lastLocation){
   if(motion&&frameClock&&mode==='project'){fromPosition.copy(camera.position);fromLook.copy(lookCurrent);flight={start:now,duration:mode==='project'?1700:mode==='profile'?1400:1500};}
   else flight=null;
   lastLocation=location;
  }
  moving=!!flight;
  if(!motion||!frameClock){flight=null;moving=false;camera.position.copy(desired);lookCurrent.copy(look);}
  else if(flight){
   const f=clamp((now-flight.start)/flight.duration),e=f*f*(3-2*f);
   camera.position.lerpVectors(fromPosition,desired,e);camera.position.y+=Math.sin(f*Math.PI)*(mode==='project'?1.9:.5);lookCurrent.lerpVectors(fromLook,look,e);
   if(f>=1)flight=null;
  }else{const follow=1-Math.exp(-delta*7);camera.position.lerp(desired,follow);lookCurrent.lerp(look,follow);}
  camera.lookAt(lookCurrent);frameClock=now;
  document.documentElement.toggleAttribute('data-camera-traveling',moving&&mode==='project');
  workshop.update({time:elapsed,motion,delta,showProjects,identityWeight:sculptureAlpha,index:mode==='project'?projectIndex:previewStation});
  turn=Math.max(0,turn-delta*1.6);
  const introLight=1-smoother(.05,.7,profileEntry),focusPhase=mode==='intro'?0:mode==='gateway'?2.65:p;
  key.intensity=1.1+.9*introLight;rim.intensity=.85+2.15*introLight;side.intensity=3+9*introLight;high.intensity=6+6*introLight;
  scene.environmentIntensity=.32+.23*introLight;
  profileFocus.set(0,0,0);profileFoyer.anchors.forEach((anchor,i)=>{anchor.getWorldPosition(profileAnchor);profileFocus.addScaledVector(profileAnchor,profileWeight(i,focusPhase));});
  profileLightTarget.position.copy(profileFocus);profileLight.position.copy(profileFocus).add(profileAnchor.set(-1.4,4,5));
  profileLight.intensity=45*smoother(.3,.8,profileEntry)*(1-gatewayEntry);profileLight.visible=profileFoyer.root.visible;
  dust.material.opacity=.14+.21*introLight;dust.rotation.y=elapsed*.004;
  hero.dataset.scenePhase=p.toFixed(3);hero.dataset.sceneMode=mode;hero.dataset.sceneWorld=mode==='project'?projectWorlds.names[projectIndex]:mode==='gateway'?'Workshop overview':mode==='profile'?profileStops[profileIndex].label:'Identity';hero.dataset.activeStudy=mode==='project'?String(projectIndex):'-1';
  bloom.strength=mode==='intro'?.1+energy*.12:.12;
  composer.render(delta);
  spatialType.render(camera,{width:w,height:h,visible:profileEntry>.001&&gatewayEntry<.999});
  if(!document.documentElement.classList.contains('world-ready'))document.documentElement.classList.add('world-ready');
 }
 camera.position.set(0,.25,mobile?18.2:10.5);resize();requestAnimationFrame(frame);
 function fallback(){document.documentElement.classList.add('world-fallback');document.querySelector('.scene-name')?.classList.add('static-name');}
 return {setPhase:value=>phase=value};
}
