import {clamp,smooth} from './engineering-motion.js';
import {screenTransform} from './studio-reveal-motion.js';

export function initStudioFinale(onResize){
 const root=document.documentElement,consoleEl=document.querySelector('#neural-console'),track=document.createElement('div'),footer=document.querySelector('.footer'),insight=document.querySelector('#studio-insight');
 track.className='studio-reveal-track';const windowEl=document.createElement('div');windowEl.className='studio-screen-window';consoleEl.before(track);track.append(windowEl);windowEl.append(consoleEl);
 const cue=document.createElement('p');cue.className='studio-exit-cue';cue.textContent='KEEP SCROLLING / A DIFFERENT PERSPECTIVE';track.append(cue);
 let screen=null,pinned=false,enabled=true,resizeFrame=0,disposed=false,interacting=false;
 function measure(){
  const width=track.clientWidth;if(!width)return;if(pinned)consoleEl.style.width=width+'px';
  const height=consoleEl.offsetHeight,normalTop=Math.min(0,innerHeight-height-32),windowHeight=innerWidth<760?Math.min(height,innerHeight-140):height,top=innerWidth<760?108:normalTop;
  screen={left:track.getBoundingClientRect().left,top,width,height:windowHeight,normalTop,contentOffset:height-windowHeight,viewportWidth:innerWidth,viewportHeight:innerHeight};if(pinned){windowEl.style.width=width+'px';windowEl.style.height=windowHeight+'px';}
  track.style.height=(height+(enabled?innerHeight*1.65:0))+'px';track.style.setProperty('--exit-cue-top',height-26+'px');
 }
 function unpin(){if(!pinned)return;pinned=false;consoleEl.classList.remove('studio-in-space');consoleEl.style.width='';consoleEl.style.transform='';windowEl.classList.remove('is-pinned');windowEl.style.cssText='';consoleEl.inert=false;insight.setAttribute('aria-live','polite');}
 function update({motion=true,fallback=false}={}){
  const nextEnabled=motion&&!fallback;if(nextEnabled!==enabled){enabled=nextEnabled;if(!enabled)unpin();measure();}
  if(!screen)measure();if(!screen)return {active:false};
  const start=track.getBoundingClientRect().top+scrollY-screen.normalTop,progress=clamp((scrollY-start)/Math.max(1,innerHeight*1.65)),active=enabled&&scrollY>=start-1&&(!interacting||scrollY>start+innerHeight*.5);
  root.dataset.finale=active?'true':'false';root.style.setProperty('--finale-open',active?smooth(.01,.22,progress):0);
  cue.hidden=!enabled;cue.style.opacity=String(active?1-smooth(.02,.25,progress):1);
  if(active&&progress>.002){if(!pinned){pinned=true;consoleEl.classList.add('studio-in-space');consoleEl.style.width=screen.width+'px';windowEl.classList.add('is-pinned');windowEl.style.width=screen.width+'px';windowEl.style.height=screen.height+'px';windowEl.style.transform=`translate(${screen.left}px,${screen.top}px)`;}
   consoleEl.inert=progress>.02;insight.setAttribute('aria-live',progress>.02?'off':'polite');consoleEl.style.transform=screen.contentOffset?`translateY(${-screen.contentOffset*(1-smooth(.12,.82,progress))}px)`:'';windowEl.style.opacity=String(1-smooth(innerHeight*.4,innerHeight*.05,footer.getBoundingClientRect().top));
  }else unpin();
  return {active,progress,screen};
 }
 function project(points){if(!pinned||!screen)return;const matrix=screenTransform(points,screen.width,screen.height);if(matrix)windowEl.style.transform=`matrix3d(${matrix.join(',')})`;}
 function resized(){cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;if(disposed)return;measure();onResize?.();});}
 const focus=()=>{interacting=true;onResize?.();};consoleEl.addEventListener('focusin',focus);consoleEl.addEventListener('pointerdown',focus);
 const release=e=>{if(e.type==='touchmove'&&e.target.closest?.('#studio-canvas[data-drawing=true]'))return;if(e.type==='keydown'&&(!['PageDown','PageUp','Home','End','ArrowDown','ArrowUp',' '].includes(e.key)||e.target.closest?.('canvas,input,select')))return;interacting=false;onResize?.();};
 for(const name of ['wheel','touchmove','keydown'])addEventListener(name,release,{passive:true});
 const outside=e=>{if(!consoleEl.contains(e.target)){interacting=false;onResize?.();}};document.addEventListener('pointerdown',outside,{passive:true});
 const observer=new ResizeObserver(resized);observer.observe(consoleEl);addEventListener('resize',resized);measure();
 addEventListener('pagehide',()=>{disposed=true;observer.disconnect();consoleEl.removeEventListener('focusin',focus);consoleEl.removeEventListener('pointerdown',focus);for(const name of ['wheel','touchmove','keydown'])removeEventListener(name,release);document.removeEventListener('pointerdown',outside);removeEventListener('resize',resized);cancelAnimationFrame(resizeFrame);},{once:true});
 return {update,project};
}
