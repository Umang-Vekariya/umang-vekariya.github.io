import * as THREE from 'three';

export const WAVE_RATE=1500,WAVE_DAMPING=1.8,WAVE_STEP=1/120;
// CPU reference for verifying the finite-difference solver used by the GPU.
export function waveCell(height,velocity,laplacian,dt=WAVE_STEP){
 const v=(velocity+laplacian*WAVE_RATE*dt)*Math.exp(-WAVE_DAMPING*dt);
 return [(height+v*dt)*Math.exp(-.38*dt),v];
}
export function createContourGeometry(){return new THREE.PlaneGeometry(2.6,2.6,220,150);}

const terrainGLSL=`
uniform float uAspect,uFlow,uAge,uAnalytic,uTouch,uHasWave;
uniform vec2 uPointer;
uniform sampler2D uWave;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y)*2.-1.;}
float terrain(vec2 p){
 p*=vec2(uAspect,1.)*1.38;
 vec2 warp=vec2(noise(p*.63+vec2(uFlow*.045,3.1)),noise(p*.63+vec2(8.3,-uFlow*.035)));
 p+=warp*.72;
 return noise(p*.83)*.72+noise(p*1.67+3.7)*.23+noise(p*3.1-5.1)*.05;
}
vec4 cubic(float f){float f2=f*f,f3=f2*f;return vec4(1.-3.*f+3.*f2-f3,4.-6.*f2+3.*f3,1.+3.*f+3.*f2-3.*f3,f3)/6.;}
float smoothWave(vec2 uv){
 vec2 pixel=uv*128.-.5,base=floor(pixel),f=fract(pixel);vec4 wx=cubic(f.x),wy=cubic(f.y);
 vec2 gx=vec2(wx.x+wx.y,wx.z+wx.w),gy=vec2(wy.x+wy.y,wy.z+wy.w);
 vec2 sx=vec2(-1.+wx.y/gx.x,1.+wx.w/gx.y),sy=vec2(-1.+wy.y/gy.x,1.+wy.w/gy.y);
 vec2 x=(base.xx+sx+.5)/128.,y=(base.yy+sy+.5)/128.;
 return gy.x*(gx.x*texture2D(uWave,vec2(x.x,y.x)).r+gx.y*texture2D(uWave,vec2(x.y,y.x)).r)+gy.y*(gx.x*texture2D(uWave,vec2(x.x,y.y)).r+gx.y*texture2D(uWave,vec2(x.y,y.y)).r);
}
float pressure(vec2 uv){
 if(uHasWave<.5&&uAnalytic<.5&&uTouch<.0001)return 0.;
 float wave=uHasWave>.5?smoothWave(uv):0.;
 vec2 d=(uv-uPointer)*vec2(uAspect,1.);float r=length(d);
 float fallback=0.;if(uAnalytic>.5)fallback=-cos(r*28.-uAge*5.)*exp(-pow(r-uAge*.12,2.)/.012)*exp(-uAge*1.15)*.16;
 return wave+fallback*uAnalytic-uTouch*.22*exp(-r*r/.045);
}
`;
const surfaceVertex=terrainGLSL+`
varying vec2 vField,vUV;varying vec3 vView;varying float vTerrain;
void main(){
 vField=position.xy;vUV=uv;
 float h=terrain(position.xy),wave=pressure(uv);vTerrain=h;
 vec3 p=vec3(position.xy,h*.24+wave*.36);
 vec4 view=modelViewMatrix*vec4(p,1.);vView=view.xyz;gl_Position=projectionMatrix*view;
}`;
const surfaceFragment=terrainGLSL+`
varying vec2 vField,vUV;varying vec3 vView;varying float vTerrain;
uniform vec3 uLine,uSurface;
void main(){
 float h=vTerrain+pressure(vUV)*2.8;
 float level=h*4.1;
 float d=abs(fract(level)-.5),aa=max(fwidth(level)*.68,.0008);
 float contour=1.-smoothstep(aa,aa*2.15,d);
 vec3 n=normalize(cross(dFdx(vView),dFdy(vView)));
 float light=.55+.45*abs(dot(n,normalize(vec3(-.4,.6,1.))));
 float margin=1.-smoothstep(.87,1.3,max(abs(vField.x),abs(vField.y)));
 // Quiet hairlines on a real relief surface, never a cursor spotlight.
 vec3 color=mix(uSurface,uLine,contour)*light;
 float alpha=(.035+contour*.29)*margin;
 gl_FragColor=vec4(color,alpha);
 #include <colorspace_fragment>
}`;
const simulationFragment=`
uniform sampler2D uPrevious;uniform vec2 uTexel,uPointer,uFrom;uniform float uDt,uImpulse,uAspect;
varying vec2 vUv;
void main(){
 vec2 state=texture2D(uPrevious,vUv).rg;
 float lap=texture2D(uPrevious,vUv+vec2(uTexel.x,0)).r+texture2D(uPrevious,vUv-vec2(uTexel.x,0)).r+texture2D(uPrevious,vUv+vec2(0,uTexel.y)).r+texture2D(uPrevious,vUv-vec2(0,uTexel.y)).r-4.*state.x;
 vec2 a=uFrom*vec2(uAspect,1.),b=uPointer*vec2(uAspect,1.),p=vUv*vec2(uAspect,1.),ab=b-a;
 float t=clamp(dot(p-a,ab)/max(dot(ab,ab),.00001),0.,1.);
 float distanceToStroke=length(p-a-ab*t);
 float velocity=(state.y+lap*${WAVE_RATE.toFixed(1)}*uDt)*exp(-${WAVE_DAMPING.toFixed(1)}*uDt);
 velocity-=uImpulse*exp(-distanceToStroke*distanceToStroke/.0015);
 velocity=clamp(velocity,-12.,12.);
 float height=clamp((state.x+velocity*uDt)*exp(-.38*uDt),-.65,.65);
 gl_FragColor=vec4(height,velocity,0,1);
}`;

export function createContourSurface(renderer,camera,schedule,canInteract=()=>true){
 const root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
 const empty=new THREE.DataTexture(new Uint8Array(16),2,2,THREE.RGBAFormat);empty.needsUpdate=true;
 const uniforms={uAspect:{value:camera.aspect},uFlow:{value:0},uAge:{value:8},uAnalytic:{value:0},uTouch:{value:0},uHasWave:{value:0},uPointer:{value:new THREE.Vector2(.5,.5)},uWave:{value:empty},uLine:{value:new THREE.Color(0x5875a4)},uSurface:{value:new THREE.Color(0x1a2b49)}};
 const geometry=createContourGeometry(),material=new THREE.ShaderMaterial({uniforms,vertexShader:surfaceVertex,fragmentShader:surfaceFragment,transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
 material.forceSinglePass=true;const mesh=new THREE.Mesh(geometry,material);mesh.name='living-topography';mesh.position.z=-150;mesh.frustumCulled=false;camera.add(mesh);
 let targets=null,simulation=null,simulationScene=null,quad=null,read=0,active=false,pending=0,age=8,accumulator=0,disposed=false,reset=false,px=.5,py=.5,fromX=.5,fromY=.5,aimX=0,aimY=0;
 const simCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
 const gpu=renderer.extensions.has('EXT_color_buffer_float');
 if(gpu){
  targets=[0,1].map(()=>new THREE.WebGLRenderTarget(128,128,{type:THREE.HalfFloatType,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:false,stencilBuffer:false}));
  simulation=new THREE.ShaderMaterial({uniforms:{uPrevious:{value:targets[0].texture},uTexel:{value:new THREE.Vector2(1/128,1/128)},uPointer:{value:new THREE.Vector2(.5,.5)},uFrom:{value:new THREE.Vector2(.5,.5)},uDt:{value:WAVE_STEP},uImpulse:{value:0},uAspect:{value:camera.aspect}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0,1);}',fragmentShader:simulationFragment,depthTest:false,depthWrite:false,blending:THREE.NoBlending});
  quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),simulation);simulationScene=new THREE.Scene();simulationScene.add(quad);
 }
 function clear(){
  if(!targets)return;const previous=renderer.getRenderTarget(),color=renderer.getClearColor(new THREE.Color()),alpha=renderer.getClearAlpha();
  renderer.setClearColor(0,0);for(const t of targets){renderer.setRenderTarget(t);renderer.clear();}renderer.setRenderTarget(previous);renderer.setClearColor(color,alpha);uniforms.uWave.value=targets[read].texture;
 }
 clear();root.dataset.contourMode=gpu?'gpu-wave':'analytic';
 const allowed=()=>!disposed&&!document.hidden&&!reduce.matches&&fine.matches&&!root.classList.contains('motion-off')&&canInteract();
 function stop(){if(!active&&pending===0&&uniforms.uTouch.value===0)return;active=false;pending=0;age=8;reset=true;schedule();}
 function release(){pending=0;if(active){age=Math.max(age,.8);schedule();}}
 function move(e){
  if(!allowed()||e.pointerType==='touch'){stop();return;}
  if(e.target.closest?.('dialog,.header,.footer,#neural-console,#world-display-hit,#gallery-controls')||document.querySelector('dialog[open]')||root.classList.contains('menu-open')){release();return;}
  const x=(e.clientX/innerWidth*2-1)/2.6+.5,y=(1-e.clientY/innerHeight*2)/2.6+.5;
  if(!active){fromX=x;fromY=y;}else{fromX=px;fromY=py;}
  pending=Math.min(5.2,2.8+Math.hypot((x-px)*camera.aspect,y-py)*25);px=x;py=y;age=0;active=true;
  uniforms.uPointer.value.set(px,py);schedule();
 }
 const preference=()=>{if(!allowed())stop();schedule();},visibility=()=>{if(document.hidden)stop();};
 addEventListener('pointermove',move,{passive:true});addEventListener('blur',release);document.addEventListener('pointerleave',release);document.addEventListener('visibilitychange',visibility);addEventListener('portfolio-motion',preference);reduce.addEventListener('change',preference);fine.addEventListener('change',preference);
 return {update(dt,motion=true){
  const half=150*Math.tan(camera.fov*Math.PI/360);mesh.scale.set(half*camera.aspect,half,half);uniforms.uAspect.value=camera.aspect;
  if(!motion||!allowed()){if(active)stop();}
  if(reset){clear();reset=false;uniforms.uAnalytic.value=0;uniforms.uTouch.value=0;uniforms.uHasWave.value=0;}
  const k=1-Math.exp(-Math.min(dt,.05)*5),x=active?(px-.5)*.09:0,y=active?(py-.5)*.07:0;
  const touch=active&&age<.7?1:0;uniforms.uTouch.value+=(touch-uniforms.uTouch.value)*(1-Math.exp(-Math.min(dt,.05)*8));
  aimX+=(x-aimX)*k;aimY+=(y-aimY)*k;mesh.rotation.set(-aimY,aimX,0);
  if(active){
   uniforms.uHasWave.value=gpu?1:0;age+=dt;uniforms.uFlow.value+=dt;uniforms.uAge.value=age;uniforms.uAnalytic.value=gpu?0:1;
   if(gpu){
    accumulator=Math.min(.05,accumulator+dt);const previous=renderer.getRenderTarget();let steps=0;
    while(accumulator>=WAVE_STEP&&steps++<6){
     const u=simulation.uniforms;u.uPrevious.value=targets[read].texture;u.uPointer.value.set(px,py);u.uFrom.value.set(fromX,fromY);u.uImpulse.value=pending;u.uAspect.value=camera.aspect;
     const write=1-read;renderer.setRenderTarget(targets[write]);renderer.render(simulationScene,simCamera);read=write;accumulator-=WAVE_STEP;pending=0;
    }
    renderer.setRenderTarget(previous);uniforms.uWave.value=targets[read].texture;
   }
   if(age>6){active=false;clear();uniforms.uAnalytic.value=0;uniforms.uHasWave.value=0;}
  }
  root.dataset.contourSurface=active?'flowing':'resting';
  return active||uniforms.uTouch.value>.0001||Math.abs(aimX-x)+Math.abs(aimY-y)>.0001;
 },dispose(){
  if(disposed)return;disposed=true;removeEventListener('pointermove',move);removeEventListener('blur',release);document.removeEventListener('pointerleave',release);document.removeEventListener('visibilitychange',visibility);removeEventListener('portfolio-motion',preference);reduce.removeEventListener('change',preference);fine.removeEventListener('change',preference);camera.remove(mesh);geometry.dispose();material.dispose();empty.dispose();targets?.forEach(t=>t.dispose());quad?.geometry.dispose();simulation?.dispose();delete root.dataset.contourSurface;delete root.dataset.contourMode;
 }};
}
