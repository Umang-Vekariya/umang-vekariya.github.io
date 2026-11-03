import * as THREE from 'three';
import {roundedSolid,pedestalGeometry,apertureGeometry,studioEnvironment,createExhibitSurface,createDisplayHousing} from './spatial-craft.js';
import {createFormGeometry} from './engineering-form.js';
import {spatialShot,stationShot,stations,galleryCenter} from './spatial-layout.js';
import {projectStories} from './project-stories.js';
import {projects} from './portfolio-data.js';
const C={black:0x050714,blue:0x174aff,lime:0xd4ff35};
export function initSpatialWorld(engine){
 const host=document.querySelector('#spatial-world'),hit=document.querySelector('#world-display-hit');
 let renderer;try{renderer=new THREE.WebGLRenderer({alpha:false,antialias:true,powerPreference:'high-performance'});}catch{document.documentElement.classList.add('spatial-fallback');return null;}
 host.append(renderer.domElement);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;renderer.shadowMap.enabled=innerWidth>760;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene();scene.background=new THREE.Color(C.black);scene.fog=new THREE.FogExp2(0x050a21,.014);
 const camera=new THREE.PerspectiveCamera(36,innerWidth/innerHeight,.1,280),pmrem=new THREE.PMREMGenerator(renderer),room=studioEnvironment(),env=pmrem.fromScene(room,.12);scene.environment=env.texture;room.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});pmrem.dispose();
 const blue=new THREE.MeshPhysicalMaterial({color:0x103ecb,metalness:.65,roughness:.3,envMapIntensity:.7,clearcoat:.4}),dark=new THREE.MeshPhysicalMaterial({color:0x070d1e,metalness:.45,roughness:.4,envMapIntensity:.3,clearcoat:.2}),metal=new THREE.MeshPhysicalMaterial({color:0x8797b5,metalness:.95,roughness:.28,envMapIntensity:.85}),lime=new THREE.MeshBasicMaterial({color:C.lime,toneMapped:false}),lightBlue=new THREE.MeshBasicMaterial({color:0x1753ff,toneMapped:false}),subtle=new THREE.MeshBasicMaterial({color:0x071337,toneMapped:false});
 const ambient=new THREE.HemisphereLight(0x345ae3,0x01020b,.8);scene.add(ambient);
 const key=new THREE.DirectionalLight(0x9db8ff,1.6);key.position.set(-10,28,12);key.castShadow=innerWidth>760;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=key.shadow.camera.bottom=-35;key.shadow.camera.right=key.shadow.camera.top=35;key.shadow.camera.far=100;key.shadow.bias=-.001;scene.add(key);
 const cobalt=new THREE.DirectionalLight(C.blue,2.8);cobalt.position.set(12,9,-18);scene.add(cobalt);const edge=new THREE.DirectionalLight(0xa9dc32,.22);edge.position.set(-8,5,-8);scene.add(edge);
 function mesh(g,m,x=0,y=0,z=0,parent=scene){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function box(w,h,d,m,x,y,z,parent=scene){return mesh(roundedSolid(w,h,d),m,x,y,z,parent);}
 function line(points,color=0x2448a1,parent=scene){const o=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color}));parent.add(o);return o;}
 const ground=mesh(new THREE.PlaneGeometry(240,240),new THREE.MeshBasicMaterial({color:0x030818,toneMapped:false}),0,-.08,-57);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;
 // Continuous curved terraces remain in the world at every camera position.
 for(let i=0;i<3;i++){const radius=46+i*4,profile=[[radius,0],[radius,.12+i*.08],[radius+2,.12+i*.08],[radius+2,0]].map(p=>new THREE.Vector2(...p));mesh(new THREE.LatheGeometry(profile,192),dark,0,-.05,galleryCenter[2]);}
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const shadowCtx=shadowCanvas.getContext('2d'),gradient=shadowCtx.createRadialGradient(64,64,8,64,64,64);gradient.addColorStop(0,'#00000099');gradient.addColorStop(.65,'#00000055');gradient.addColorStop(1,'#00000000');shadowCtx.fillStyle=gradient;shadowCtx.fillRect(0,0,128,128);const shadowTexture=new THREE.CanvasTexture(shadowCanvas),shadowMaterial=new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,toneMapped:false});
 function contactShadow(radius,x,z,parent=scene){const o=mesh(new THREE.PlaneGeometry(radius*2.6,radius*2.6),shadowMaterial,x,.012,z,parent);o.rotation.x=-Math.PI/2;o.castShadow=o.receiveShadow=false;return o;}
 function pedestal(radius,x,z,parent=scene){contactShadow(radius,x,z,parent);const o=mesh(pedestalGeometry(radius,.52),dark,x,0,z,parent);const inlay=mesh(new THREE.TorusGeometry(radius-.13,.023,8,160),lightBlue,x,.52,z,parent);inlay.rotation.x=-Math.PI/2;return o;}
 // A single cobalt machined ribbon, with smooth seams and broad reflected light.
 const portal=new THREE.Group();portal.position.set(4.5,5.2,0);portal.rotation.set(.25,-.4,-.18);scene.add(portal);const formGeometry=createFormGeometry(),formMaterial=new THREE.MeshPhysicalMaterial({color:0x2856e5,metalness:.82,roughness:.23,clearcoat:.45,vertexColors:false,envMapIntensity:1.6});const form=mesh(formGeometry,formMaterial,0,0,0,portal);form.scale.setScalar(2.2);
 pedestal(6.1,4.5,0);const heroRim=mesh(new THREE.TorusGeometry(5.88,.018,8,192),lime,4.5,.535,0);heroRim.rotation.x=-Math.PI/2;
 const lamp=new THREE.PointLight(0x164aff,24,28,2);lamp.position.set(7,5,2);scene.add(lamp);
 // A grounded array of machined apertures connects the overview to the gallery.
 const personal=new THREE.Group();personal.position.set(6,0,-26);scene.add(personal);pedestal(4.7,0,0,personal);
 for(let i=0;i<5;i++){const x=(i-2)*.22,z=-(i-2)*.52,aperture=mesh(apertureGeometry(5.3,4.6,.18),i===2?blue:dark,x,3.05,z,personal);aperture.rotation.y=(i-2)*.085;for(const side of [-2,2])box(.12,.42,.18,metal,x+side,.73,z,personal);}
 const accentAperture=mesh(apertureGeometry(4.88,4.18,.018),lightBlue,0,3.05,.055,personal);accentAperture.scale.setScalar(1.02);
 const floorRoute=[];for(let i=0;i<=100;i++){const t=i/100;floorRoute.push([Math.sin(t*Math.PI*2)*5,.035,-3-t*74]);}line(floorRoute,0x2553ed);
 const route=[];for(let i=0;i<=180;i++){const a=i/180*Math.PI*2;route.push([Math.cos(a)*20,.06,galleryCenter[2]+Math.sin(a)*17]);}line(route,0x234bd1);
 const surfaces=[],screens=[],roots=[];const loader=new THREE.TextureLoader();
 for(let i=0;i<8;i++){
  const s=stations[i],root=new THREE.Group();root.position.set(s.x,0,s.z);root.rotation.y=s.yaw;scene.add(root);roots.push(root);
  pedestal(9.3,1,0,root);
  const {group:screenGroup,screen}=createDisplayHousing({metal,dark,lime});screenGroup.position.set(3,5.5,0);root.add(screenGroup);
  screen.userData.index=i;screens.push(screen);const surface=createExhibitSurface(document.createElement('canvas'),{width:innerWidth<=760?1200:innerWidth>1280?1800:1440});surfaces.push(surface);surface.texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());screen.material.map=surface.texture;
  box(.18,1.36,.5,dark,-1.3,1.12,0,root);box(.18,1.36,.5,dark,7.3,1.12,0,root);box(10.4,.14,1.1,metal,3,.63,0,root);
  const source=projectStories[projects[i].id].evidence[0];if(source){loader.load(source.poster||source.src,t=>{surface.poster(t.image);t.dispose();schedule();});}else{const c=document.createElement('canvas');c.width=1200;c.height=760;const ctx=c.getContext('2d');ctx.fillStyle='#060a1f';ctx.fillRect(0,0,1200,760);ctx.fillStyle='#d5ff36';ctx.font='52px sans-serif';ctx.fillText('DEEPFAKE DETECTION',65,110);ctx.font='24px sans-serif';ctx.fillStyle='#91aaff';ctx.fillText('Frame-level prediction → video-level decision',65,165);for(let j=0;j<8;j++){ctx.strokeStyle='#214cff';ctx.strokeRect(65+j*137,235,110,300);ctx.fillStyle='#274eff';ctx.fillRect(85+j*137,455-j%3*65,70,65+j%3*65);}ctx.fillStyle='#b5c4df';ctx.fillText('Illustrative frame scores · Open to inspect the actual pipeline',65,650);surface.poster(c);}
  // Distinct, data-related artifacts beside each actual display.
  const artifact=new THREE.Group();artifact.position.set(-5,0,1);root.add(artifact);mesh(pedestalGeometry(2.65,.45),dark,0,.52,0,artifact);
  if(i===0){for(let j=0;j<5;j++){const pole=mesh(new THREE.CylinderGeometry(.05,.05,1+j*.25,24),metal,(j%3-1)*1.2,1.1+j*.125,Math.floor(j/3)*1.4,artifact);const ring=mesh(new THREE.TorusGeometry(.38+j*.13,.018,5,48),lime,pole.position.x,2+j*.25,pole.position.z,artifact);ring.rotation.x=Math.PI/2;}}
  if(i===1){for(let j=0;j<4;j++){const pane=box(1.1,2.2,.06,j===2?lime:blue,j*.7-1,2+j*.22,-j*.4,artifact);pane.rotation.y=-.25;box(.10,.25+j*.22,.16,metal,j*.7-1,1.02+j*.11,-j*.4,artifact);}}
  if(i===2){for(let j=0;j<4;j++){box(3.5,.22,2.8,blue,0,1.1+j*.25,0,artifact);box(2.75,.018,.035,j===3?lime:lightBlue,0,1.1+j*.25,1.41,artifact);}}
  if(i===3){for(let j=0;j<3;j++){const p=box(2.2,2.2,.10,j===2?lime:blue,(j-1)*1.5,2.1,-j*.55,artifact);p.rotation.y=.3*(j-1);}line([[-1.5,2.2,.05],[0,2.2,-.55],[1.5,2.2,-1.05]],0xd4ff35,artifact);}
  if(i===4){for(const x of [-1.6,1.6])for(const z of [-1.05,1.05])box(.12,.5,.12,metal,x,1.16,z,artifact);box(4,.18,2.8,blue,0,1.35,0,artifact);const ball=mesh(new THREE.SphereGeometry(.23,24,16),lime,.8,1.7,.3,artifact);ball.name='responsive-marble';}
  if(i===5){box(4.05,2.2,.16,dark,0,1.9,-.3,artifact);for(let j=0;j<12;j++)box(.8,.35,.35,j%4===0?lime:blue,(j%4-1.5)*.95,1.6+Math.floor(j/4)*.55,0,artifact);box(1.8,.15,.4,metal,0,1.16,0,artifact);}
  if(i===6){for(let j=0;j<3;j++){const g=mesh(new THREE.TorusGeometry(.65,.07,8,48),j===1?lime:blue,(j-1)*1.4,2,0,artifact);g.rotation.y=.2;box(.10,.42,.14,metal,(j-1)*1.4,1.17,0,artifact);}line([[-2,1.9,0],[0,1.9,0],[2,1.9,0]],0x345cff,artifact);}
  if(i===7){for(let j=0;j<9;j++)mesh(new THREE.CylinderGeometry(.36,.36,.3,24),j===4?lime:blue,(j%3-1)*1.1,1.1,Math.floor(j/3)*1.1,artifact);}
  const branch=[];for(let j=0;j<=15;j++){const t=j/15;branch.push([0,.035,7+t*8]);}line(branch,0x3359ff,root);
 }
 let frame=0,visible=true,disposed=false,activeIndex=-1,currentChapter='home',latest={chapter:'home',progress:0,index:0,phase:0},flight=null,pointer={x:0,y:0},aim={x:0,y:0},last=0,motion=!document.documentElement.classList.contains('motion-off'),unfold=false;
 const raycaster=new THREE.Raycaster();
 let desiredFov=36;
 const desiredPosition=new THREE.Vector3(),desiredQuaternion=new THREE.Quaternion(),lookCamera=new THREE.PerspectiveCamera(),projected=new THREE.Vector3();
 function goal(){return spatialShot({...latest,portrait:innerWidth<760,galleryPortrait:innerWidth<=1280||innerWidth/innerHeight<1.55,compactHero:innerWidth>=760&&(innerWidth<=1100||innerWidth/innerHeight<1.3)});}
 function setGoal(shot){desiredPosition.set(...shot.position);lookCamera.position.copy(desiredPosition);lookCamera.lookAt(new THREE.Vector3(...shot.target));desiredQuaternion.copy(lookCamera.quaternion);desiredFov=shot.fov;}
 const initial=goal();setGoal(initial);camera.position.copy(desiredPosition);camera.quaternion.copy(desiredQuaternion);camera.fov=desiredFov;camera.updateProjectionMatrix();
 function schedule(){if(!frame&&!disposed&&visible&&!document.hidden)frame=requestAnimationFrame(render);}
 function bounds(){if(activeIndex<0)return null;const obj=screens[activeIndex];scene.updateMatrixWorld(true);camera.updateMatrixWorld();const pts=[[-6,-3.8],[6,-3.8],[-6,3.8],[6,3.8]].map(([x,y])=>{projected.set(x,y,0).applyMatrix4(obj.matrixWorld).project(camera);return {x:(projected.x*.5+.5)*innerWidth,y:(.5-projected.y*.5)*innerHeight,z:projected.z};});if(pts.some(p=>p.z>1))return null;const left=Math.min(...pts.map(p=>p.x)),top=Math.min(...pts.map(p=>p.y)),right=Math.max(...pts.map(p=>p.x)),bottom=Math.max(...pts.map(p=>p.y));return {left,top,right,bottom,width:right-left,height:bottom-top};}
 function render(now){frame=0;if(document.querySelector('dialog[open]')&&!flight)return;const dt=Math.min(.05,(now-last)/1000||.016);last=now;let settling=false;
  if(flight){const p=Math.min(1,(now-flight.start)/flight.duration),t=p*p*(3-2*p);camera.position.lerpVectors(flight.fromPosition,flight.toPosition,t);camera.quaternion.slerpQuaternions(flight.fromQuaternion,flight.toQuaternion,t);camera.fov=flight.fromFov+(flight.toFov-flight.fromFov)*t;camera.updateProjectionMatrix();if(p===1){const done=flight.done;flight=null;done?.(bounds());}else settling=true;}
  else{setGoal(goal());if(!motion){camera.position.copy(desiredPosition);camera.quaternion.copy(desiredQuaternion);camera.fov=desiredFov;}else{const k=1-Math.exp(-dt*10);camera.position.lerp(desiredPosition,k);camera.quaternion.slerp(desiredQuaternion,k);camera.fov+=(desiredFov-camera.fov)*k;settling=camera.position.distanceToSquared(desiredPosition)>.00001||camera.quaternion.angleTo(desiredQuaternion)>.0002||Math.abs(camera.fov-desiredFov)>.001;}camera.updateProjectionMatrix();}
  const k=1-Math.exp(-dt*8);aim.x+=(pointer.x-aim.x)*k;aim.y+=(pointer.y-aim.y)*k;portal.rotation.set(.25+aim.y*.05,-.4+aim.x*.08,-.18);const morph=Math.max(latest.chapter==='home'?Math.min(1,latest.progress*1.8):1,unfold?1:0);form.morphTargetInfluences[0]+=((motion?morph:0)-form.morphTargetInfluences[0])*Math.min(1,dt*7);settling ||= Math.abs(form.morphTargetInfluences[0]-morph)>.002&&motion;
  // Exhibits and overview sculpture stay present. The camera reveals them naturally.
  renderer.render(scene,camera);host.dataset.ready='true';host.dataset.chapter=currentChapter;host.dataset.index=String(activeIndex);host.dataset.live=String(Boolean(latest.live));host.dataset.flight=flight?'moving':'settled';host.dataset.exhibits=String(roots.filter(r=>r.visible).length);host.dataset.overview=personal.visible?'present':'hidden';
  if(currentChapter==='gallery'&&!document.querySelector('dialog[open]')){const r=bounds();if(r){hit.hidden=false;hit.style.cssText=`left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;`;hit.setAttribute('aria-label','Open '+projects[activeIndex].name+' from the 3D display');}else hit.hidden=true;}else hit.hidden=true;
  if(settling||Math.abs(aim.x-pointer.x)+Math.abs(aim.y-pointer.y)>.002)schedule();
 }
 function update(state,{direct=false}={}){if(flight&&!direct&&(state.chapter!==latest.chapter||state.index!==latest.index||Math.abs(state.phase-latest.phase)>.001)){flight.done?.({cancelled:true});flight=null;}const previous=currentChapter;latest=state;currentChapter=state.chapter;const index=state.chapter==='gallery'?state.index:-1;activeIndex=index;
  if(direct&&motion){const target=goal();setGoal(target);flight?.done?.({cancelled:true});flight={start:performance.now(),duration:1100,fromPosition:camera.position.clone(),fromQuaternion:camera.quaternion.clone(),toPosition:desiredPosition.clone(),toQuaternion:desiredQuaternion.clone(),fromFov:camera.fov,toFov:desiredFov};}
  if(['lab','index','none'].includes(state.chapter)){visible=false;cancelAnimationFrame(frame);frame=0;hit.hidden=true;}else{visible=true;schedule();}
 }
 function focus(){if(activeIndex<0||!motion)return Promise.resolve(bounds());return new Promise(resolve=>{const shot=stationShot(activeIndex,{portrait:innerWidth<=1280||innerWidth/innerHeight<1.55,focus:true});setGoal(shot);flight?.done?.({cancelled:true});flight={start:performance.now(),duration:800,fromPosition:camera.position.clone(),fromQuaternion:camera.quaternion.clone(),toPosition:desiredPosition.clone(),toQuaternion:desiredQuaternion.clone(),fromFov:camera.fov,toFov:desiredFov,done:resolve};schedule();});}
 const unsubscribe=engine.subscribeFrames(canvas=>{if(activeIndex>=0&&latest.live&&engine.projectId===projects[activeIndex].id){surfaces[activeIndex].frame(canvas);if(!document.querySelector('dialog[open]'))schedule();}});
 const resize=()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();schedule();};addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});
 addEventListener('pointermove',e=>{if(currentChapter!=='home'||!motion)return;pointer.x=e.clientX/innerWidth*2-1;pointer.y=e.clientY/innerHeight*2-1;schedule();},{passive:true});
 const control=document.querySelector('#form-toggle');control.disabled=false;control.addEventListener('click',()=>{unfold=!unfold;control.setAttribute('aria-pressed',String(unfold));schedule();});
 addEventListener('portfolio-motion',e=>{motion=e.detail.enabled;if(!motion){flight?.done?.({cancelled:true});flight=null;}schedule();});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();disposed=true;cancelAnimationFrame(frame);document.documentElement.classList.add('spatial-fallback');hit.hidden=true;});
 addEventListener('pagehide',()=>{disposed=true;flight?.done?.({cancelled:true});unsubscribe();cancelAnimationFrame(frame);scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});surfaces.forEach(s=>s.dispose());shadowTexture.dispose();env.dispose();renderer.dispose();},{once:true});schedule();return {update,focus,pointer(x,y,type){if(activeIndex<0)return;raycaster.setFromCamera(new THREE.Vector2(x/innerWidth*2-1,1-y/innerHeight*2),camera);const intersection=raycaster.intersectObject(screens[activeIndex],false)[0];if(intersection?.uv)engine.pointer(intersection.uv.x,intersection.uv.y,type);},release(){flight?.done?.({cancelled:true});flight=null;schedule();},bounds};
}
