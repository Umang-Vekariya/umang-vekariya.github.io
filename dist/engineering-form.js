import * as THREE from 'three';
import {RoomEnvironment} from './vendor/environments/RoomEnvironment.js';
import {titleFrame} from './engineering-motion.js?v=3';

// A continuous folded band, machined as one form. The second state opens its
// negative space into a planar aperture; there are no orbiting decorations.
export function createFormGeometry(segments=240,sides=20){
 const position=[],opened=[],indices=[],color=[];
 for(let i=0;i<=segments;i++){
  const t=i/segments*Math.PI*2,r=1.66+.24*Math.cos(3*t),c=Math.cos(t),s=Math.sin(t),twist=t*2+.38;
  for(let j=0;j<=sides;j++){
   const a=j/sides*Math.PI*2,u=Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),.28)*(.37+.07*Math.sin(t*3)),v=Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),.5)*.065;
   const radial=u*Math.cos(twist)-v*Math.sin(twist),depth=u*Math.sin(twist)+v*Math.cos(twist);
   position.push((r+radial)*c,(r+radial)*s,.42*Math.sin(t*3)+depth);
   opened.push((1.75+u)*c,(1.75+u)*s,v);
   const bronze=Math.sin(a)<-.65;color.push(bronze?.57:.86,bronze?.44:.89,bronze?.32:.83);
   if(i<segments&&j<sides){const n=i*(sides+1)+j;indices.push(n,n+sides+1,n+1,n+1,n+sides+1,n+sides+2);}
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(position,3));g.setAttribute('color',new THREE.Float32BufferAttribute(color,3));g.setIndex(indices);g.computeVertexNormals();
 const target=g.clone();target.setAttribute('position',new THREE.Float32BufferAttribute(opened,3));target.computeVertexNormals();g.morphAttributes.position=[target.attributes.position];g.morphAttributes.normal=[target.attributes.normal];g.computeBoundingSphere();return g;
}
export function initForm(){
 const host=document.querySelector('#hero-art'),section=document.querySelector('.hero-sequence'),button=document.querySelector('#form-toggle');
 let renderer,environment,geometry,material,frame=0,visible=true,motion=!document.documentElement.classList.contains('motion-off'),progress=0,unfold=false,pointer={x:0,y:0},current={x:0,y:0},last=0,disposed=false;
 if(new URL(location.href).searchParams.get('graphics')==='off')return;
 try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:innerWidth>760,powerPreference:'low-power'});}catch{host.dataset.fallback='true';return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<760?1.5:1.75));renderer.setClearColor(0x171b19,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;host.append(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.05,80),pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();
 geometry=createFormGeometry();material=new THREE.MeshPhysicalMaterial({metalness:1,roughness:.27,clearcoat:.35,clearcoatRoughness:.24,vertexColors:true,side:THREE.DoubleSide,envMapIntensity:1.6});
 const mesh=new THREE.Mesh(geometry,material);scene.add(mesh);
 const key=new THREE.DirectionalLight(0xfff3d9,5);key.position.set(-3,5,5);scene.add(key);const rim=new THREE.DirectionalLight(0xd4e4dc,3);rim.position.set(4,0,-2);scene.add(rim);
 function resize(){const r=host.getBoundingClientRect();renderer.setSize(host.clientWidth,host.clientHeight,false);camera.aspect=host.clientWidth/Math.max(1,host.clientHeight);camera.updateProjectionMatrix();schedule();}
 function schedule(){if(!disposed&&!frame&&visible&&!document.hidden)frame=requestAnimationFrame(render);}
 function render(now){frame=0;const dt=Math.min(.05,(now-last)/1000||.016);last=now;const pose=titleFrame(progress,{portrait:innerWidth<760,tablet:innerWidth>=760&&innerWidth<1000,motion});camera.position.set(...pose.camera);camera.lookAt(...pose.target);
  const k=1-Math.exp(-dt*9);current.x+=(pointer.x-current.x)*k;current.y+=(pointer.y-current.y)*k;
  mesh.rotation.set(pose.rotation[0]+(motion?current.y*.10:0),pose.rotation[1]+(motion?current.x*.13:0),pose.rotation[2]);
  const destination=Math.max(pose.morph,unfold?1:0),previous=mesh.morphTargetInfluences[0];mesh.morphTargetInfluences[0]=motion?previous+(destination-previous)*Math.min(1,dt*7):destination;
  renderer.render(scene,camera);host.dataset.ready='true';host.dataset.framing=innerWidth<760?'phone':innerWidth<1000?'tablet':'desktop';host.dataset.cameraZ=camera.position.z.toFixed(3);if(Math.abs(current.x-pointer.x)+Math.abs(current.y-pointer.y)>.001||Math.abs(destination-mesh.morphTargetInfluences[0])>.001)schedule();
 }
 function scroll(){progress=Math.max(0,Math.min(1,-section.getBoundingClientRect().top/Math.max(1,section.offsetHeight-innerHeight)));schedule();}
 const observer=new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible)schedule();else{cancelAnimationFrame(frame);frame=0;}},{threshold:0});observer.observe(section);
 const ro=new ResizeObserver(resize);ro.observe(host);
 const move=e=>{if(e.pointerType!=='mouse'||!motion)return;const r=host.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width*2-1;pointer.y=(e.clientY-r.top)/r.height*2-1;schedule();};
 const leave=()=>{pointer.x=pointer.y=0;schedule();};host.addEventListener('pointermove',move);host.addEventListener('pointerleave',leave);
 const toggle=()=>{unfold=!unfold;button.setAttribute('aria-pressed',String(unfold));button.innerHTML=unfold?'Fold the form <span>↶</span>':'Unfold the form <span>↗</span>';schedule();};button.disabled=false;button.addEventListener('click',toggle);
 const motionChange=e=>{motion=e.detail.enabled;pointer.x=pointer.y=0;schedule();};addEventListener('portfolio-motion',motionChange);addEventListener('scroll',scroll,{passive:true});const visibility=()=>schedule();document.addEventListener('visibilitychange',visibility);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);frame=0;disposed=true;host.dataset.ready='false';button.disabled=true;});
 addEventListener('pagehide',()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();ro.disconnect();geometry.dispose();material.dispose();environment.dispose();renderer.dispose();},{once:true});scroll();resize();
}
