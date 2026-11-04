// Two soft light footprints give the empty world a response without another
// WebGL pass. Only pointer movement schedules frames; stillness fades to black.
export function initVoidField(){
 const root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
 const field=document.createElement('div');field.id='void-field';field.setAttribute('aria-hidden','true');field.innerHTML='<i></i><b></b>';document.body.append(field);
 const [near,far]=field.children;let frame=0,timer=0,last=0,disposed=false,seeded=false,x=0,y=0,tx=0,ty=0,fx=0,fy=0;
 const enabled=()=>!disposed&&!reduce.matches&&fine.matches&&!document.hidden&&!root.classList.contains('motion-off');
 function stop(){clearTimeout(timer);timer=0;cancelAnimationFrame(frame);frame=0;last=0;seeded=false;field.dataset.active='false';field.style.opacity='0';}
 function tick(now){
  frame=0;if(!enabled()){stop();return;}
  const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;
  const fast=1-Math.exp(-dt*14),slow=1-Math.exp(-dt*6);
  x+=(tx-x)*fast;y+=(ty-y)*fast;fx+=(tx-fx)*slow;fy+=(ty-fy)*slow;
  near.style.transform=`translate3d(${x}px,${y}px,0)`;far.style.transform=`translate3d(${fx}px,${fy}px,0)`;
  if(Math.abs(x-tx)+Math.abs(y-ty)+Math.abs(fx-tx)+Math.abs(fy-ty)>.5)frame=requestAnimationFrame(tick);
  else last=0;
 }
 function move(e){
  if(!enabled()||e.pointerType==='touch'||document.querySelector('dialog[open]')||root.classList.contains('menu-open')){stop();return;}
  // Real tools keep their own feedback. Native text remains the visual priority.
  if(e.target.closest?.('#neural-console,.header,.footer')){stop();return;}
  tx=e.clientX;ty=e.clientY;if(!seeded){x=fx=tx;y=fy=ty;seeded=true;}
  field.style.opacity=e.target.closest?.('p,h1,h2,h3,a,button,input,select,textarea')?'.2':'1';field.dataset.active='true';
  clearTimeout(timer);timer=setTimeout(()=>{field.dataset.active='false';field.style.opacity='0';timer=0;},360);
  if(!frame)frame=requestAnimationFrame(tick);
 }
 const motion=e=>{if(!e.detail.enabled)stop();},visibility=()=>{if(document.hidden)stop();};
 addEventListener('pointermove',move,{passive:true});addEventListener('blur',stop);addEventListener('scroll',stop,{passive:true});addEventListener('portfolio-motion',motion);
 document.addEventListener('pointerleave',stop);document.addEventListener('visibilitychange',visibility);reduce.addEventListener('change',stop);fine.addEventListener('change',stop);
 addEventListener('pagehide',()=>{stop();disposed=true;field.remove();removeEventListener('pointermove',move);removeEventListener('blur',stop);removeEventListener('scroll',stop);removeEventListener('portfolio-motion',motion);document.removeEventListener('pointerleave',stop);document.removeEventListener('visibilitychange',visibility);reduce.removeEventListener('change',stop);fine.removeEventListener('change',stop);},{once:true});
}
