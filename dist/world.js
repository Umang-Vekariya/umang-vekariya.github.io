import * as THREE from 'three';
import {createWorkshop} from './workshop-architecture.js';
import {CameraRig,openingPose,overviewPose,galleryPose,gatewayPose,blendPose,ease} from './camera-rig.js';
import {createAperture,createPersonalArchitecture,createIdentityStage} from './lab-effects.js';
import {ShaderPass} from './vendor/postprocessing/ShaderPass.js';
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
 let focusRequest=null;
 const hero=document.querySelector('#hero-render'),track=document.querySelector('.journey'),projectTrack=document.querySelector('#work');
 if(new URL(location.href).searchParams.get('graphics')==='off')return fallback();
 let renderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch{return fallback();}
 const mobile=matchMedia('(max-width:700px)').matches;
 let qualityDpr=Math.min(devicePixelRatio,mobile?1.1:1.4);renderer.setPixelRatio(qualityDpr);
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.94;
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.domElement.setAttribute('aria-hidden','true');hero.append(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#0c1216');scene.fog=new THREE.FogExp2('#0c1216',.017);
 const camera=new THREE.PerspectiveCamera(35,1,.1,180);const rig=new CameraRig(camera);document.documentElement.dataset.cameraRig='ready';
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
 const profileFoyer=createProfileFoyer({scene,box,font,chrome,graphite,red,spatialType});profileFoyer.root.position.z=-18;
 const personalArchitecture=createPersonalArchitecture(scene),aperture=createAperture(scene),identityStage=createIdentityStage(scene);
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
 const renderTarget=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,samples:mobile?0:2});
 const composer=new EffectComposer(renderer,renderTarget);composer.addPass(new RenderPass(scene,camera));
 const bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.23,.4,1.6);composer.addPass(bloom);
 const passage=new ShaderPass({uniforms:{tDiffuse:{value:null},uMotion:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform sampler2D tDiffuse;uniform float uMotion;varying vec2 vUv;void main(){vec2 d=vUv-.5;vec2 shift=d*dot(d,d)*uMotion*.004;vec4 base=texture2D(tDiffuse,vUv);base.r=texture2D(tDiffuse,clamp(vUv+shift,0.0,1.0)).r;base.b=texture2D(tDiffuse,clamp(vUv-shift,0.0,1.0)).b;gl_FragColor=base;}'});composer.addPass(passage);composer.addPass(new OutputPass());
 let lastTextureRevision=-1,lastRenderKey='',qualityFrames=0,slowFrames=0;
 let frameHandle=0,disposed=false;
 let visible=true,motion=!document.documentElement.classList.contains('motion-off'),pointer={x:0,y:0},elapsed=0,previous=0,lastFrame=0,w=0,h=0;
 let mode=document.documentElement.dataset.sceneMode||'intro',phase=Number((mode==='project'?projectTrack:mode==='gateway'?document.querySelector('#project-overview'):mode==='profile'?document.querySelector('#about'):track).dataset.phase||0),projectIndex=Number(projectTrack.dataset.project||0),turn=0,dragX=0,dragging=false,lastX=0;
 let previewStation=-1,projectEntry=Number(projectTrack.style.getPropertyValue('--project-entry'))||0;
 let profileEntry=smoother(1,0,document.querySelector('#about').getBoundingClientRect().top/innerHeight),gatewayEntry=smoother(1,0,document.querySelector('#project-overview').getBoundingClientRect().top/innerHeight);
 addEventListener('portfolio-station-preview',e=>{previewStation=e.detail.index;});
 const hoverSpring={value:0,velocity:0},hoverSphere=new THREE.Sphere(),hoverPoint=new THREE.Vector3();let hoverTarget=0,pulseUntil=0,hoverX=0,hoverY=0,touchStartY=0;
 const trigger=document.querySelector('#sculpture-trigger');
 if(trigger){trigger.disabled=!motion;trigger.textContent=matchMedia('(hover:hover)').matches?'Hover to energize ↗':'Tap to energize ↗';trigger.addEventListener('click',()=>{if(motion){const now=performance.now();pulseUntil=pulseUntil>now?0:now+5000;}});}
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};

 function resize(){const r=hero.getBoundingClientRect();if(w===Math.round(r.width)&&h===Math.round(r.height))return;w=Math.round(r.width);h=Math.round(r.height);if(!w||!h)return;renderer.setSize(w,h,false);composer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
 addEventListener('portfolio-progress',e=>{mode=e.detail.mode;phase=e.detail.phase;motion=e.detail.motion;projectIndex=e.detail.index||0;profileEntry=e.detail.profileEntry??profileEntry;gatewayEntry=e.detail.gatewayEntry??gatewayEntry;projectEntry=e.detail.projectEntry??projectEntry;if(mode!=='intro'){hoverTarget=0;pulseUntil=0;hoverSpring.value=hoverSpring.velocity=0;hero.dataset.hoverEnergy='0';}});
 function interruptNavigation(){if(focusRequest){const cancel=focusRequest;focusRequest=null;rig.release();cancel({cancelled:true});}else rig.interrupt();}
 addEventListener('portfolio-project',e=>{turn=1;if(e.detail.navigate){interruptNavigation();if(motion)rig.navigate();}});
 for(const event of ['wheel','touchstart'])addEventListener(event,interruptNavigation,{passive:true});
 addEventListener('keydown',e=>{if(['PageDown','PageUp','Home','End','ArrowDown','ArrowUp'].includes(e.key)&&!e.target.closest('input,select,textarea,dialog,#lab'))interruptNavigation();});
 addEventListener('portfolio-focus-display',e=>{
  if(mode!=='project'||!projectWorlds.screens.length){e.detail.resolve(null);return;}
  const screens=projectWorlds.screens,box3=new THREE.Box3();screens.forEach(screen=>box3.union(new THREE.Box3().setFromObject(screen)));
  const center=box3.getCenter(new THREE.Vector3()),screen=screens[0],normal=new THREE.Vector3(0,0,1).transformDirection(screen.matrixWorld),size=new THREE.Vector3();
  // Use screen-local width/height rather than the enclosing rotated AABB.
  screen.getWorldScale(size);const width=screen.geometry.parameters.width*size.x,height=screen.geometry.parameters.height*size.y,distance=Math.max(height,width/camera.aspect)/(2*Math.tan(camera.fov*Math.PI/360))*1.08;
  const pose={position:center.clone().addScaledVector(normal,distance).toArray(),target:center.toArray(),roll:0};focusRequest=e.detail.resolve;
  rig.focusOn(pose,()=>{camera.updateMatrixWorld();const points=[];for(const sc of screens){const {width,height}=sc.geometry.parameters;for(const x of [-width/2,width/2])for(const y of [-height/2,height/2])points.push(sc.localToWorld(new THREE.Vector3(x,y,0)).project(camera));}const xs=points.map(p=>(p.x*.5+.5)*innerWidth),ys=points.map(p=>(-p.y*.5+.5)*innerHeight);const rect={left:Math.max(0,Math.min(...xs)),right:Math.min(innerWidth,Math.max(...xs)),top:Math.max(0,Math.min(...ys)),bottom:Math.min(innerHeight,Math.max(...ys))};const done=focusRequest;focusRequest=null;done?.(rect);});
 });
 addEventListener('portfolio-cancel-display',interruptNavigation);
 addEventListener('portfolio-release-display',()=>{if(focusRequest){focusRequest(null);focusRequest=null;}rig.release();});
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
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback();visible=false;cancelAnimationFrame(frameHandle);spatialType.layer.hidden=true;});
 function frame(now){
  if(disposed)return;frameHandle=requestAnimationFrame(frame);if(!visible||now-lastFrame<(mobile?33:16))return;
  if(document.querySelector('dialog[open]'))return;
  if(mode==='none'){hero.style.visibility='hidden';return;}hero.style.visibility='visible';
  const interval=now-lastFrame,delta=Math.min((now-previous)/1000,.05);previous=now;lastFrame=now;if(motion)elapsed+=delta;
  if(motion&&interval<250){qualityFrames++;if(interval>27)slowFrames++;if(qualityFrames>=90){if(slowFrames>45&&qualityDpr>.85){qualityDpr=Math.max(.85,qualityDpr*.8);renderer.setPixelRatio(qualityDpr);composer.setPixelRatio(qualityDpr);w=0;hero.dataset.renderScale=qualityDpr.toFixed(2);}qualityFrames=0;slowFrames=0;}}
  resize();if(!w||!h)return;
  advanceHover(hoverSpring,mode==='intro'&&(hoverTarget||now<pulseUntil)?1:0,delta,motion);const energy=hoverSpring.value;
  hero.dataset.hoverEnergy=energy.toFixed(3);hero.dataset.hoverSource=hoverTarget?'pointer':now<pulseUntil?'tap':'none';track.dataset.hoverField=energy>.1?(dragging?'dragging':'active'):'resting';if(trigger)trigger.setAttribute('aria-pressed',String(energy>.4));
  const portrait=w<h*.85,p=motion?phase:Math.round(phase),options={portrait,aspect:w/h,motion},profileOptions={portrait:w<=760||h<=620,aspect:w/h,motion};
  const renderKey=[mode,p,w,h,projectIndex,mode==='project'?demoEngine.revision:0,dragX,motion,energy.toFixed(3),!!rig.focus].join('/');if(!motion&&renderKey===lastRenderKey)return;lastRenderKey=renderKey;
  const showProjects=mode==='gateway'||mode==='project'||(mode==='profile'&&gatewayEntry>.02),profileIndex=Math.min(2,Math.max(0,Math.round(p)));
  workshop.root.visible=showProjects;projectWorlds.setVisible(showProjects);
  profileFoyer.update({phase:mode==='intro'?0:mode==='gateway'?2.65:p,entry:mode==='intro'?profileEntry:1,exit:gatewayEntry,time:elapsed,motion,...profileOptions,visible:profileEntry>.001&&gatewayEntry<.999});
  personalArchitecture.root.visible=profileFoyer.root.visible;
  projectWorlds.update({phase:mode==='project'?p:0,time:elapsed,delta,motion,portrait,turn:0,index:mode==='project'?projectIndex:-1,compact:!portrait&&h<700,narrow:!portrait&&w/h<1.25});
  if(lastTextureRevision!==demoEngine.revision){projectWorlds.refresh();lastTextureRevision=demoEngine.revision;}
  let pose;
  if(mode==='intro'){
   pose=openingPose(p,options);
   sculpture.position.set(0,.42,0);sculpture.scale.setScalar(1+ease((p-.35)/1.2)*.35);
   assembly.rotation.set(.12+energy*hoverY*.14,-.48+dragX+ease(p/2.6)*.48+(motion?Math.sin(elapsed*.15)*.025:0)+energy*hoverX*.14,-.12-energy*hoverX*.04);
   folded.update({time:elapsed,phase:p,motion,energy,pointerX:hoverX,pointerY:hoverY,compact:portrait});
   const fade=1-ease((p-.18)/.65);identity.visible=fade>.001;identity.position.set(0,-1.65,.5-ease(p/1.2)*1.4);identity.rotation.y=-.08;identity.scale.setScalar(portrait?.59:1);nameMaterial.opacity=fade;nameSide.opacity=fade;
  }else if(mode==='profile'){
   pose=overviewPose(p,profileOptions);identity.visible=false;
   if(gatewayEntry>0)pose=blendPose(overviewPose(2.65,profileOptions),gatewayPose(0,options),gatewayEntry);
  }else if(mode==='gateway'){
   pose=gatewayPose(p,options);identity.visible=false;
   if(gatewayEntry<1)pose=blendPose(overviewPose(2.65,profileOptions),pose,gatewayEntry);
   if(projectEntry>0)pose=blendPose(gatewayPose(1,options),galleryPose(0,{...options,phase:0}),projectEntry);
  }else if(mode==='contact'){
   pose={position:[0,.25,portrait?17:11.6],target:[0,-.1,0],roll:0};identity.visible=false;sculpture.position.set(portrait?0:2.7,portrait?2.6:.3,0);sculpture.scale.setScalar(portrait?.65:.8);assembly.rotation.set(.1,elapsed*.045,-.12);folded.update({time:elapsed,phase:1,motion,energy:0,compact:portrait});
  }else{
   pose=galleryPose(projectIndex,{...options,phase:p});identity.visible=false;
   if(projectEntry<1&&projectIndex===0)pose=blendPose(gatewayPose(1,options),pose,projectEntry);
  }
  const sculptureAlpha=mode==='intro'?1-ease((p-.68)/1.05):mode==='contact'?ease(p):0;
  sculpture.visible=sculptureAlpha>.001;sculptureFades.forEach(m=>{m.opacity=sculptureAlpha;m.depthWrite=sculptureAlpha>.98;});
  aperture.root.position.set(mode==='contact'?(portrait?0:2.7):0,mode==='contact'?(portrait?2.6:.3):0,0);aperture.update({phase:mode==='intro'?p:mode==='contact'?2-ease(p)*1.6:2.6,motion,dpr:qualityDpr});identityStage.root.visible=mode==='intro'&&p<1.6;
  floor.visible=mode==='intro'&&!portrait&&p<.55;glaze.visible=floor.visible;
  rig.update(pose,delta,{motion,pointer:[pointer.x,pointer.y],interactive:mode==='intro'&&p<.4});
  const transit=mode==='project'&&projectIndex<7?ease((p-2.05)/.55):0;
  document.documentElement.toggleAttribute('data-camera-traveling',rig.traveling||transit>.01&&transit<.99);
  document.documentElement.style.setProperty('--camera-transit',String(rig.traveling?.5:Math.sin(transit*Math.PI)));
  workshop.update({time:elapsed,motion,showProjects,phase:p,index:mode==='project'?projectIndex:previewStation});
  const introLight=mode==='intro'||mode==='contact'?1:0,focusPhase=mode==='intro'?0:mode==='gateway'?2.65:p;
  key.intensity=1.5+.7*introLight;rim.intensity=.9+1.9*introLight;side.intensity=3+8*introLight;high.intensity=7+5*introLight;scene.environmentIntensity=.4+.15*introLight;
  profileFocus.set(0,0,0);profileFoyer.anchors.forEach((anchor,i)=>{anchor.getWorldPosition(profileAnchor);profileFocus.addScaledVector(profileAnchor,profileWeight(i,focusPhase));});
  profileLightTarget.position.copy(profileFocus);profileLight.position.copy(profileFocus).add(profileAnchor.set(-1.4,4,5));profileLight.intensity=55*(mode==='intro'?profileEntry:1)*(1-gatewayEntry);profileLight.visible=profileFoyer.root.visible;
  hero.dataset.scenePhase=p.toFixed(3);hero.dataset.sceneMode=mode;hero.dataset.sceneWorld=mode==='project'?projectWorlds.names[projectIndex]:mode==='gateway'?'Living Lab overview':mode==='profile'?profileStops[profileIndex].label:mode==='contact'?'Convergence':'Identity';hero.dataset.activeStudy=mode==='project'?String(projectIndex):'-1';
  hero.dataset.cameraPosition=camera.position.toArray().map(n=>n.toFixed(3)).join(',');hero.dataset.cameraRoll=(rig.pose.roll||0).toFixed(4);
  bloom.enabled=!portrait&&qualityDpr>=1.1;bloom.strength=mode==='intro'?.11+energy*.1:.11;passage.uniforms.uMotion.value=motion&&qualityDpr>=1?(rig.traveling?.65:Math.max(rig.speed,Math.sin(transit*Math.PI)))*(portrait?.35:1):0;
  composer.render(delta);spatialType.render(camera,{width:w,height:h,visible:profileFoyer.root.visible});
  if(!document.documentElement.classList.contains('world-ready'))document.documentElement.classList.add('world-ready');
 }
 camera.position.set(0,.25,mobile?18.2:10.5);resize();frameHandle=requestAnimationFrame(frame);
 function fallback(){if(focusRequest){focusRequest(null);focusRequest=null;}document.documentElement.removeAttribute('data-camera-rig');document.documentElement.classList.add('world-fallback');document.querySelector('.scene-name')?.classList.add('static-name');}
 function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frameHandle);const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);for(const m of object.material?(Array.isArray(object.material)?object.material:[object.material]):[]){materials.add(m);for(const value of Object.values(m))if(value?.isTexture)textures.add(value);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());env.dispose();floor.dispose?.();composer.dispose();renderer.dispose();spatialType.layer.remove();renderer.domElement.remove();delete document.documentElement.dataset.cameraRig;}
 addEventListener('pagehide',event=>{if(!event.persisted)dispose();},{once:true});
 return {setPhase:value=>phase=value,dispose};
}
