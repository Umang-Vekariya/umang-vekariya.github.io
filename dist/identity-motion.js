// Native type stays readable without this controller. Only an active pointer
// schedules frames; the entrance is owned by the Web Animations timeline.
export function initIdentity(){
 const title=document.querySelector('#hero-title'),replay=document.querySelector('#identity-replay');
 if(!title||!replay)return;
 const glyphs=[...title.querySelectorAll('.identity-glyph')],root=document.documentElement;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer:fine)');
 let enabled=!reduce.matches,animations=[],frame=0,last=0,inside=false,visible=true,disposed=false,rect=null;
 let targetX=0,targetY=0,x=0,y=0,strength=0,targetStrength=0;
 const cancel=()=>{for(const a of animations)a.cancel();animations=[];title.dataset.animating='false';};
 function enter(){
  cancel();if(!enabled||disposed||!visible||root.classList.contains('mesh-identity-ready'))return;
  title.dataset.animating='true';
  glyphs.forEach((glyph,i)=>{
   const row=Number(glyph.dataset.row),column=Number(glyph.dataset.column),delay=row*210+column*66;
   const faces=[...glyph.children];
   for(let layer=0;layer<faces.length;layer++){
    const echo=layer<2,depth=2-layer;
    animations.push(faces[layer].animate([
     {transform:`translate3d(${(column-2)*7}px,${115+depth*14}%,${80+depth*24}px) rotateX(-78deg) rotateZ(${row?-9:9}deg)`,opacity:0,offset:0},
     {opacity:echo?.65:1,offset:.22},
     {transform:echo?`translate3d(${depth*10}px,${-depth*8}px,0) rotateX(0deg) rotateZ(0deg)`:'translate3d(0,-3%,0) rotateX(0deg) rotateZ(0deg)',opacity:echo?.55:1,offset:.72},
     {transform:'translate3d(0,0,0) rotateX(0deg) rotateZ(0deg)',opacity:echo?0:1,offset:1}
    ],{duration:1400+depth*95,delay:delay+depth*65,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));
   }
   const outline=glyph.querySelector?.('.letter-outline');
   if(outline)animations.push(outline.animate([{strokeDashoffset:1,opacity:1},{strokeDashoffset:0,opacity:.9,offset:.7},{strokeDashoffset:0,opacity:0}],{duration:1400,delay:column*66,easing:'cubic-bezier(.22,1,.36,1)'}));
  });
  const light=title.querySelector('.identity-light');
  animations.push(light.animate([{transform:'translateX(-130%) skewX(-22deg)',opacity:0},{opacity:.85,offset:.25},{transform:'translateX(230%) skewX(-22deg)',opacity:0}],{duration:1350,delay:580,easing:'cubic-bezier(.22,1,.36,1)'}));
  Promise.allSettled(animations.map(a=>a.finished)).then(()=>{if(!disposed&&!animations.some(a=>a.playState==='running'))title.dataset.animating='false';});
 }
 function reset(){inside=false;targetStrength=0;targetX=0;targetY=0;if(!enabled||!visible){cancelAnimationFrame(frame);frame=0;x=0;y=0;strength=0;glyphs.forEach(g=>{g.style.transform='';g.style.removeProperty('--echo');});title.style.removeProperty('--identity-light');return;}if(frame)return;last=0;frame=requestAnimationFrame(tick);}
 function tick(now){
  frame=0;if(disposed)return;
  const dt=last?Math.min(.05,(now-last)/1000):1/60,a=1-Math.exp(-dt*12);last=now;
  x+=(targetX-x)*a;y+=(targetY-y)*a;strength+=(targetStrength-strength)*a;
  title.style.setProperty('--light-x',`${(x+.5)*100}%`);
  title.style.setProperty('--light-y',`${(y+.5)*100}%`);
  glyphs.forEach(g=>{
   const gx=(Number(g.dataset.column)+.5)/Number(g.dataset.count)-.5;
   const influence=Math.max(0,1-Math.abs(gx-x)*2.8)*strength;
   g.style.transform=`perspective(700px) translate3d(${(gx-x)*influence*5}px,${-influence*10}px,0) rotateX(${-y*influence*12}deg) rotateY(${(gx-x)*influence*13}deg)`;
   g.style.setProperty('--echo',String(influence*.6));
  });
  title.style.setProperty('--identity-light',String(strength));
  if(Math.abs(x-targetX)+Math.abs(y-targetY)+Math.abs(strength-targetStrength)>.001)frame=requestAnimationFrame(tick);
  else if(!inside){glyphs.forEach(g=>{g.style.transform='';g.style.removeProperty('--echo');});title.style.removeProperty('--identity-light');}
 }
 function move(e){
  if(!enabled||!fine.matches||!visible||e.pointerType==='touch'||root.classList.contains('mesh-identity-ready'))return;
  rect=title.getBoundingClientRect();inside=true;targetStrength=1;
  targetX=Math.max(-.5,Math.min(.5,(e.clientX-rect.left)/rect.width-.5));
  targetY=Math.max(-.5,Math.min(.5,(e.clientY-rect.top)/rect.height-.5));
  if(!frame){last=0;frame=requestAnimationFrame(tick);}
 }
 function motion(e){enabled=e.detail.enabled&&!reduce.matches;replay.hidden=!enabled;if(!enabled){cancel();reset();}}
 function reduced(){enabled=!reduce.matches&&!root.classList.contains('motion-off');replay.hidden=!enabled;if(!enabled){cancel();reset();}}
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cancel();reset();}},{threshold:.15});observer.observe(title);
 title.addEventListener('pointermove',move);title.addEventListener('pointerleave',reset);replay.addEventListener('click',enter);
 addEventListener('portfolio-motion',motion);reduce.addEventListener('change',reduced);
 addEventListener('blur',reset);const resize=()=>{rect=null;reset();};addEventListener('resize',resize);
 replay.hidden=!enabled;
 // Fonts may be remote; a slow font request must not hold up the introduction.
 Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,650))]).then(()=>{if(scrollY<innerHeight*.25)enter();});
 addEventListener('pagehide',()=>{disposed=true;cancel();cancelAnimationFrame(frame);observer.disconnect();title.removeEventListener('pointermove',move);title.removeEventListener('pointerleave',reset);replay.removeEventListener('click',enter);removeEventListener('portfolio-motion',motion);reduce.removeEventListener('change',reduced);removeEventListener('blur',reset);removeEventListener('resize',resize);},{once:true});
}
