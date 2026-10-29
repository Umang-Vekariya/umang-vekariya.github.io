// Content responds to the pointer without adding objects, layout, or scroll motion.
export function initContentHover(){
 const root=document.documentElement;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const precise=matchMedia('(hover: hover) and (pointer: fine)');
 const selectors=['.about-heading','.about-copy','.certification-details','.skill-group','.experience-item','.experience-grid>h2','.project-lead>h2','.section-heading>h2','.contact-grid'];
 const surfaces=[...document.querySelectorAll(selectors.join(','))];
 const headlines=document.querySelectorAll('.about-heading h2,.experience-grid>h2,.project-lead>h2,.section-heading>h2,.contact-grid h2');
 surfaces.forEach(el=>el.classList.add('hover-surface'));
 headlines.forEach(el=>el.classList.add('hover-headline'));
 let active=null,frame=0,pointer=null;
 const allowed=()=>precise.matches&&!reduced.matches&&!root.classList.contains('motion-off');
 function clear(){
  if(frame)cancelAnimationFrame(frame);frame=0;pointer=null;
  if(active){active.removeAttribute('data-hover-active');active.style.removeProperty('--hover-dx');active.style.removeProperty('--hover-dy');active=null;}
 }
 function paint(){
  frame=0;if(!active||!pointer||!allowed())return;
  const r=active.getBoundingClientRect();
  if(!r.width||!r.height){clear();return;}
  const x=Math.max(0,Math.min(r.width,pointer.x-r.left)),y=Math.max(0,Math.min(r.height,pointer.y-r.top));
  active.style.setProperty('--hover-x',x+'px');active.style.setProperty('--hover-y',y+'px');
  active.style.setProperty('--hover-dx',((x/r.width-.5)*7).toFixed(2)+'px');
  active.style.setProperty('--hover-dy',((y/r.height-.5)*5).toFixed(2)+'px');
  active.setAttribute('data-hover-active','');
 }
 for(const el of surfaces){
  el.addEventListener('pointermove',e=>{
   if(e.pointerType!=='mouse'||!allowed())return;
   if(active!==el){clear();active=el;}
   pointer={x:e.clientX,y:e.clientY};if(!frame)frame=requestAnimationFrame(paint);
  });
  el.addEventListener('pointerleave',()=>{if(active===el)clear();});
  el.addEventListener('pointercancel',clear);
 }
 addEventListener('portfolio-motion',clear);reduced.addEventListener('change',clear);precise.addEventListener('change',clear);
 addEventListener('scroll',clear,{passive:true});addEventListener('blur',clear);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
}
