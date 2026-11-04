import * as THREE from 'three';

// One continuous family of solid, twisted bands. The field is a distant
// camera-local installation, so it occupies the background throughout travel.
export function ribbonGeometry({count=18,segments=100}={}){
 const vertices=[],indices=[],lanes=[];
 for(let lane=0;lane<count;lane++){
  const v=(lane/(count-1)-.5)*1.1,offset=vertices.length/3;
  for(let i=0;i<=segments;i++){
   const t=i/segments,x=(t-.5)*2.9,y=v+.72*Math.sin(t*4.9-1)+x*.12+.2,z=.12*Math.cos(t*5+v*.8);
   const angle=.45*Math.sin(t*5.5+v*.7),w=.0135*(.8+.2*Math.cos(v)),h=.004;
   // Eight corners preserve broad faces and narrow bevel-like shoulders.
   for(const [a,b] of [[-1,-.5],[-.78,-1],[.78,-1],[1,-.5],[1,.5],[.78,1],[-.78,1],[-1,.5]]){
    const u=a*w,d=b*h;vertices.push(x,y+u*Math.cos(angle)-d*Math.sin(angle),z+u*Math.sin(angle)+d*Math.cos(angle));lanes.push(lane);
   }
   if(i<segments)for(let j=0;j<8;j++){const a=offset+i*8+j,b=offset+i*8+(j+1)%8;indices.push(a,b,a+8,b,b+8,a+8);}
  }
  for(const i of [0,segments]){const o=offset+i*8;for(let j=1;j<7;j++)if(i===0)indices.push(o,o+j+1,o+j);else indices.push(o,o+j,o+j+1);}
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
 geometry.userData.rest=new Float32Array(vertices);geometry.userData.lanes=lanes;return geometry;
}

// A bounded, local displacement: moving the cursor bends real bands in XYZ.
// The far field and a stationary reduced-motion view retain their original form.
export function bendRibbon(x,y,z,pointer,strength,out=[]){
 const dx=x-pointer.x,dy=y-pointer.y,r2=dx*dx+dy*dy,influence=Math.exp(-r2/.22)*strength;
 const distance=Math.sqrt(r2+.018);
 out[0]=x+dx/distance*.09*influence;out[1]=y+dy/distance*.19*influence;out[2]=z-.24*influence;return out;
}

export function createRibbonField(camera,schedule){
 const root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
 const geometry=ribbonGeometry(),material=new THREE.MeshPhysicalMaterial({color:0x1743d4,metalness:.48,roughness:.4,clearcoat:.2,envMapIntensity:.45,fog:false});
 const group=new THREE.Group(),bands=new THREE.Mesh(geometry,material);group.name='cursor-ribbon-field';bands.layers.set(2);group.add(bands);group.position.z=-35;camera.add(group);camera.layers.enable(2);
 // A few fine lime inlays articulate the solid bands without neon bloom.
 const color=new THREE.Color(),colors=new Float32Array(geometry.attributes.position.count*3);
 for(let i=0;i<geometry.attributes.position.count;i++){color.set(geometry.userData.lanes[i]%8===2&&i%8===4?0x607322:0x0a2678);color.toArray(colors,i*3);}geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));material.vertexColors=true;material.color.set(0xffffff);
 const key=new THREE.DirectionalLight(0xb8ccff,1.25),fill=new THREE.DirectionalLight(0x174aff,.65);key.layers.set(2);fill.layers.set(2);key.position.set(-2,4,3);fill.position.set(3,-1,2);key.target.position.set(0,0,-35);fill.target.position.set(0,0,-35);camera.add(key,key.target,fill,fill.target);
 let tx=0,ty=0,x=0,y=0,strength=0,target=0,timer=0,disposed=false,previousStrength=-1,previousX=0,previousY=0;
 const sample=[],cursor={x:0,y:0};
 const allowed=()=>!disposed&&!document.hidden&&!reduce.matches&&fine.matches&&!root.classList.contains('motion-off');
 function release(){clearTimeout(timer);timer=0;const active=target>0||strength>0;target=0;if(!disposed&&active)schedule();}
 function move(e){
  if(!allowed()||e.pointerType==='touch'||e.target.closest?.('dialog,.header,.footer,#neural-console')||document.querySelector('dialog[open]')||root.classList.contains('menu-open')){release();return;}
  // Match the camera's non-square field; distances use vertical screen units.
  tx=(e.clientX/innerWidth*2-1)*camera.aspect;ty=1-e.clientY/innerHeight*2;target=1;
  clearTimeout(timer);timer=setTimeout(release,1500);schedule();
 }
 const visibility=()=>{if(document.hidden)release();};
 const motion=()=>{if(!allowed())release();schedule();};
 addEventListener('pointermove',move,{passive:true});addEventListener('blur',release);document.addEventListener('pointerleave',release);addEventListener('portfolio-motion',motion);reduce.addEventListener('change',motion);fine.addEventListener('change',motion);document.addEventListener('visibilitychange',visibility);
 return {update(dt,motionEnabled=true){
  const half=35*Math.tan(camera.fov*Math.PI/360);group.scale.set(half,half,half);group.scale.x=half*camera.aspect; // a composed full-frame background, behind the foreground exhibits
  const k=1-Math.exp(-Math.min(dt,.05)*8),next=motionEnabled&&allowed()?target:0;
  x+=(tx-x)*k;y+=(ty-y)*k;if(!motionEnabled||!allowed()){strength=0;target=0;}else strength+=(next-strength)*k;
  if(Math.abs(strength-next)<.0001)strength=next;
  if(strength!==previousStrength||(strength>0&&(x!==previousX||y!==previousY))){
   const positions=geometry.attributes.position,rest=geometry.userData.rest,aspect=camera.aspect;cursor.x=x;cursor.y=y;
   for(let i=0;i<positions.count;i++){
    const p=bendRibbon(rest[i*3]*aspect,rest[i*3+1],rest[i*3+2],cursor,strength,sample);positions.setXYZ(i,p[0]/aspect,p[1],p[2]);
   }
   positions.needsUpdate=true;geometry.computeVertexNormals();previousStrength=strength;previousX=x;previousY=y;
  }
  root.dataset.ribbonField=strength>.001?'responding':'resting';
  return Math.abs(strength-next)>.0001||(strength>.001&&(Math.abs(x-tx)+Math.abs(y-ty)>.001));
 },dispose(){disposed=true;clearTimeout(timer);removeEventListener('pointermove',move);removeEventListener('blur',release);document.removeEventListener('pointerleave',release);removeEventListener('portfolio-motion',motion);reduce.removeEventListener('change',motion);fine.removeEventListener('change',motion);document.removeEventListener('visibilitychange',visibility);camera.remove(group,key,key.target,fill,fill.target);geometry.dispose();material.dispose();delete root.dataset.ribbonField;}};
}
