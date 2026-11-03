import {revealSection,revealPosition} from './section-navigation.js?v=3';
export function initLabMotion(){
 document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(!link||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||document.documentElement.classList.contains('quick-view'))return;const id=link.hash.slice(1);if(!id&&scrollY>innerHeight*2.5){event.preventDefault();history.pushState(null,'',location.pathname+location.search);revealPosition(0);return;}if(!['lab','collection','contact','project-overview'].includes(id))return;event.preventDefault();revealSection(id);});
 const root=document.documentElement,precise=matchMedia('(hover:hover) and (pointer:fine)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const allowed=()=>precise.matches&&!reduced.matches&&!root.classList.contains('motion-off');
 const magnetic=[...document.querySelectorAll('.view-toggle,.header-resume,#workshop-start,.profile-enter,.contact-links>a')];
 for(const button of magnetic){button.classList.add('lab-magnetic');button.addEventListener('pointermove',e=>{if(!allowed())return;const r=button.getBoundingClientRect();button.style.setProperty('--magnet-x',`${Math.max(-4,Math.min(4,(e.clientX-r.left-r.width/2)*.07))}px`);button.style.setProperty('--magnet-y',`${Math.max(-3,Math.min(3,(e.clientY-r.top-r.height/2)*.08))}px`);});button.addEventListener('pointerleave',()=>{button.style.setProperty('--magnet-x','0px');button.style.setProperty('--magnet-y','0px');});}
 addEventListener('portfolio-motion',()=>magnetic.forEach(b=>{b.style.setProperty('--magnet-x','0px');b.style.setProperty('--magnet-y','0px');}));
 const descriptions=['Python, C++, Java and JavaScript — languages used across my projects.','TensorFlow, OpenCV and MediaPipe — learning from images and interaction.','React, FastAPI, SQL and Docker — building the systems around an idea.'];
 const buttons=[...document.querySelectorAll('[data-toolkit]')],note=document.querySelector('#toolkit-note');
 function select(index){buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));if(note)note.textContent=descriptions[index];dispatchEvent(new CustomEvent('portfolio-toolkit',{detail:{index}}));}
 buttons.forEach((button,index)=>{button.addEventListener('click',()=>select(index));button.addEventListener('focus',()=>select(index));button.addEventListener('pointerenter',()=>{if(precise.matches)select(index);});});
 // A real model view: thickness = weight magnitude; color = sign/activation.
 const canvas=document.querySelector('#studio-live-network'),ctx=canvas?.getContext('2d');let latest=null;
 function paint(){if(!ctx||!latest)return;const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,1.5);if(!r.width||!r.height)return;canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,r.width,r.height);
  const {weights,activations}=latest,counts=activations.map(a=>a.length),point=(l,i)=>[20+l*(r.width-40)/3,15+(i+.5)*(r.height-30)/counts[l]];
  for(let l=0;l<3;l++)for(let a=0;a<counts[l];a++)for(let b=0;b<counts[l+1];b++){const weight=weights[l][b][a],p=point(l,a),q=point(l+1,b);ctx.strokeStyle=weight>=0?`rgba(166,202,185,${Math.min(.5,.05+Math.abs(weight)*.13)})`:`rgba(219,151,113,${Math.min(.5,.05+Math.abs(weight)*.13)})`;ctx.lineWidth=Math.min(1.4,.4+Math.abs(weight)*.15);ctx.beginPath();ctx.moveTo(...p);ctx.bezierCurveTo(p[0]+30,p[1],q[0]-30,q[1],...q);ctx.stroke();}
  for(let l=0;l<4;l++)for(let i=0;i<counts[l];i++){const value=activations[l][i];ctx.beginPath();ctx.arc(...point(l,i),3.1+Math.min(1,Math.abs(value))*1.7,0,Math.PI*2);ctx.fillStyle=value>=0?'#d8af8c':'#9fc7b7';ctx.globalAlpha=.45+Math.min(1,Math.abs(value))*.55;ctx.fill();ctx.globalAlpha=1;}
  document.querySelector('#studio-live-caption').textContent=`Live weights & activations · epoch ${latest.epoch} · at (${latest.x.toFixed(2)}, ${latest.y.toFixed(2)})`;
 }
 addEventListener('portfolio-neural-state',e=>{latest=e.detail;paint();});if(canvas)new ResizeObserver(paint).observe(canvas);
 const menu=document.querySelector('.mobile-menu'),toggle=document.querySelector('.menu-toggle');
 new MutationObserver(()=>{const open=!menu.hidden;root.classList.toggle('lab-menu-open',open);document.querySelector('main').inert=open;document.querySelector('.footer').inert=open;}).observe(menu,{attributes:true,attributeFilter:['hidden']});
 document.addEventListener('keydown',e=>{if(e.key!=='Tab'||menu.hidden)return;const items=[toggle,...menu.querySelectorAll('a')],i=items.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();items.at(-1).focus();}else if(!e.shiftKey&&(i<0||i===items.length-1)){e.preventDefault();toggle.focus();}});
}
