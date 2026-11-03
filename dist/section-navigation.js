let current=null,serial=0;
async function handoff(move){
 dispatchEvent(new CustomEvent('portfolio-cancel-display'));const root=document.documentElement,ticket=++serial;
 current?.getAnimations().forEach(a=>a.cancel());current?.remove();current=null;
 if(root.classList.contains('motion-off')){move();return;}
 const curtain=document.createElement('div');curtain.className='section-handoff';curtain.setAttribute('aria-hidden','true');document.body.append(curtain);current=curtain;
 try{await curtain.animate([{transform:'scaleY(0)'},{transform:'scaleY(1)'}],{duration:180,easing:'cubic-bezier(.45,0,.75,1)',fill:'forwards'}).finished;}catch{return;}
 if(ticket!==serial)return;move();curtain.style.transformOrigin='50% 0';
 try{await curtain.animate([{transform:'scaleY(1)'},{transform:'scaleY(0)'}],{duration:480,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'}).finished;}catch{}
 if(ticket===serial){curtain.remove();current=null;}
}
export function revealSection(id,{record=true}={}){
 const target=document.getElementById(id);if(!target)return;
 return handoff(()=>{if(record&&location.hash!=='#'+id)history.pushState(null,'','#'+id);target.scrollIntoView({behavior:'instant',block:'start'});});
}
export function revealPosition(top){return handoff(()=>window.scrollTo({top,behavior:'instant'}));}
