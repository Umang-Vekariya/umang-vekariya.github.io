import {storyAtProgress,storyProgress} from './story-model.js';
import {projectStories} from './project-stories.js';
import {demoContent} from './demo-content.js';
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const smooth=(a,b,n)=>{const t=clamp((n-a)/(b-a));return t*t*(3-2*t);};
export function createFlow(projects,escapeHTML,engine){
 const root=document.documentElement,intro=document.querySelector('.journey'),work=document.querySelector('#work');
 const labels=['THE BEGINNING','THE PERSON','WHAT DRAWS ME IN'];
 const panels=[...intro.querySelectorAll('.chapter')];
 document.querySelector('#gallery-dots').innerHTML=labels.map((name,i)=>`<button data-intro-step="${i}" aria-label="${['Identity','About Umang','Interests'][i]}" aria-pressed="${i===0}"><span>0${i}</span><i></i></button>`).join('');
 document.querySelector('#project-picker').innerHTML=projects.map((p,i)=>`<button data-demo-project="${i}" aria-label="Show ${escapeHTML(p.name)} demonstration" aria-pressed="${i===0}"><span>${String(i+1).padStart(2,'0')}</span><b>${escapeHTML(p.name)}</b></button>`).join('');
 document.querySelector('#project-select').innerHTML=projects.map((p,i)=>`<option value="${i}">${String(i+1).padStart(2,'0')} / ${escapeHTML(p.name)}</option>`).join('');
 let introPhase=0,projectPhase=0,index=0,lastIntro=-1,lastStep=-1,frame=0,motion=!root.classList.contains('motion-off'),mode='intro';
 root.classList.add('sequence-ready');
 function bounds(el){const r=el.getBoundingClientRect();return {top:r.top,start:r.top+scrollY,bottom:r.bottom,range:Math.max(1,r.height-innerHeight)};}
 function goTo(chapter){const b=bounds(intro);window.scrollTo({top:b.start+clamp(chapter/2.6)*b.range,behavior:motion?'smooth':'instant'});}
 function goToStep(step,behavior=motion?'smooth':'instant'){const b=bounds(work);window.scrollTo({top:b.start+storyProgress(index,step,projects.length)*b.range,behavior});}
 function selectProject(next,scroll=true){
  index=(next+projects.length)%projects.length;const p=projects[index],c=demoContent[index];lastStep=-1;
  document.querySelector('#demo-title').textContent=p.name;document.querySelector('#demo-category').textContent=p.kind.toUpperCase();document.querySelector('#demo-summary').textContent=p.summary;
  document.querySelector('#demo-kind').textContent=projectStories[p.id].scene.toUpperCase()+' / '+c.kind;document.querySelector('#project-count').textContent=`${String(index+1).padStart(2,'0')} / 08`;
  document.querySelectorAll('[data-demo-project]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.demoProject)===index)));
  document.querySelector('#project-select').value=String(index);
  const source=document.querySelector('#demo-source');source.hidden=!c.source;if(c.source)source.href=c.source;else source.removeAttribute('href');
  document.querySelector('#demo-steps').innerHTML=c.steps.map((s,i)=>`<button data-demo-step="${i}" aria-pressed="${i===0}"><span>0${i+1}</span><b>${escapeHTML(s[0])}</b><i></i></button>`).join('');
  document.querySelectorAll('[data-demo-step]').forEach(b=>b.addEventListener('click',()=>goToStep(Number(b.dataset.demoStep))));
  engine.setProject(p.id);engine.bindControls(document.querySelector('#demo-controls'));
  work.dataset.project=String(index);dispatchEvent(new CustomEvent('portfolio-project',{detail:{index,id:p.id}}));
  document.querySelector('#project-ghost').textContent=String(index+1).padStart(2,'0');document.querySelector('#demo-premise').textContent=p.short;document.querySelector('#demo-next-label').textContent=index===projects.length-1?'To the playground':'Next project';work.style.setProperty('--project-order',index);
  if(motion){document.querySelector('#demo-copy').getAnimations().forEach(a=>a.cancel());document.querySelector('#demo-copy').animate([{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration:550,easing:'cubic-bezier(.16,1,.3,1)'});}
  if(scroll){history.replaceState(null,'','#project-'+p.id);projectPhase=0;goToStep(0,'instant');}request();
 }
 function update(){
  frame=0;if(root.classList.contains('quick-view')){mode='none';root.dataset.sceneMode='none';root.style.setProperty('--scene-exit','0');document.querySelector('.journey-controls').inert=true;document.querySelector('.projects-sticky').inert=true;engine.setProgress(projectPhase,false,motion);dispatchEvent(new CustomEvent('portfolio-progress',{detail:{mode:'none',phase:0,index,motion}}));return;}const ib=bounds(intro),wb=bounds(work);
  const it=clamp((scrollY-ib.start)/ib.range)*2.6,story=storyAtProgress((scrollY-wb.start)/wb.range,projects.length),pt=story.phase;
  if(story.index!==index&&wb.top<innerHeight*.6){selectProject(story.index,false);projectPhase=pt;}
  introPhase=motion?introPhase+(it-introPhase)*.15:it;projectPhase=motion?projectPhase+(pt-projectPhase)*.15:pt;
  if(Math.abs(it-introPhase)<.002)introPhase=it;if(Math.abs(pt-projectPhase)<.002)projectPhase=pt;
  mode=wb.top<innerHeight*.6&&wb.bottom>0?'project':ib.bottom>0&&ib.top<innerHeight?'intro':'none';
  const chapter=Math.min(2,Math.max(0,Math.round(introPhase)));
  for(const panel of panels){const n=Number(panel.dataset.chapter),d=introPhase-n,incoming=n===0?1:smooth(-.62,-.18,d),outgoing=n===2?1:1-smooth(.2,.62,d);panel.style.setProperty('--chapter-opacity',String(motion?incoming*outgoing:Number(chapter===n)));panel.style.setProperty('--chapter-y',`${motion?clamp(-d,-1,1)*48:0}px`);const inert=chapter!==n||mode!=='intro';if(inert&&panel.contains(document.activeElement))document.querySelector('.journey-next').focus({preventScroll:true});panel.inert=inert;panel.setAttribute('aria-hidden',String(inert));}
  if(lastIntro!==chapter){lastIntro=chapter;intro.dataset.chapter=String(chapter);document.querySelector('#chapter-number').textContent=String(chapter).padStart(2,'0');document.querySelector('#chapter-name').textContent=labels[chapter];document.querySelector('#scene-spec-label').textContent=chapter===0?'FORM / IDENTITY':chapter===1?'PERSON / CURIOSITY':'FOCUS / ENGINEERING';document.querySelector('#scene-spec-number').textContent='UV—'+String(chapter+1).padStart(3,'0');document.querySelectorAll('[data-intro-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.introStep)===chapter)));document.querySelector('.journey-next').setAttribute('aria-label',chapter===2?'Continue to my profile':'Next introduction chapter');}
  const step=Math.min(2,Math.max(0,Math.round(projectPhase)));
  if(lastStep!==step){if(motion&&lastStep>=0&&mode==='project')document.querySelector('.demo-stage-detail').animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:380,easing:'cubic-bezier(.2,.7,.2,1)'});lastStep=step;const s=demoContent[index].steps[step];document.querySelector('#demo-step-number').textContent=`0${step+1} / ${s[0].toUpperCase()}`;document.querySelector('#demo-step-title').textContent=s[1];document.querySelector('#demo-step-description').textContent=s[2];document.querySelectorAll('[data-demo-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.demoStep)===step)));}
  document.querySelector('.journey-controls').inert=mode!=='intro';document.querySelector('.projects-sticky').inert=mode!=='project';
  const projectEntry=smooth(innerHeight*.65,innerHeight*.08,wb.top),projectExit=smooth(0,innerHeight*.65,wb.bottom);
  work.style.setProperty('--project-entry',String(projectEntry));
  const exit=mode==='intro'?1-smooth(2.25,2.6,introPhase):mode==='project'?projectEntry*projectExit:0;
  intro.style.setProperty('--journey-progress',introPhase/2.6);intro.style.setProperty('--scene-exit',String(mode==='intro'?exit:0));root.style.setProperty('--scene-exit',String(exit));root.dataset.sceneMode=mode;
  work.style.setProperty('--demo-progress',(index+clamp(projectPhase/2.6))/projects.length);work.style.setProperty('--chapter-progress',projectPhase/2.6);work.style.setProperty('--step-opacity',String(motion?1-.45*smooth(.15,.5,Math.abs(projectPhase-Math.round(projectPhase))):1));
  intro.dataset.phase=introPhase.toFixed(3);work.dataset.phase=projectPhase.toFixed(3);
  engine.setProgress(projectPhase,mode==='project',motion);
  dispatchEvent(new CustomEvent('portfolio-progress',{detail:{mode,phase:mode==='project'?projectPhase:introPhase,index,motion,transition:Math.max(0,(projectPhase-2.3)/.3)}}));
  if(Math.abs(it-introPhase)>.002||Math.abs(pt-projectPhase)>.002)frame=requestAnimationFrame(update);
 }
 function request(){if(!frame)frame=requestAnimationFrame(update);}
 addEventListener('portfolio-view',request);addEventListener('scroll',request,{passive:true});addEventListener('resize',()=>{if(mode==='project')goToStep(projectPhase,'instant');request();});addEventListener('portfolio-motion',e=>{motion=e.detail.enabled;request();});
 document.querySelectorAll('[data-go-chapter]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();goTo(Number(a.dataset.goChapter));}));
 document.querySelectorAll('[data-intro-step]').forEach(b=>b.addEventListener('click',()=>goTo(Number(b.dataset.introStep))));
 document.querySelector('.journey-next').addEventListener('click',()=>{if(lastIntro===2)document.querySelector('#about').scrollIntoView({behavior:motion?'smooth':'instant'});else goTo(lastIntro+1);});
 document.querySelector('.journey-controls').addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();goTo(clamp(lastIntro+(e.key==='ArrowRight'?1:-1),0,2));}});
 document.querySelectorAll('[data-demo-project]').forEach(b=>b.addEventListener('click',()=>selectProject(Number(b.dataset.demoProject))));
 document.querySelector('#project-select').addEventListener('change',e=>selectProject(Number(e.target.value)));
 document.querySelector('#project-picker').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();selectProject(index+(e.key==='ArrowRight'?1:-1));document.querySelector(`[data-demo-project="${index}"]`).focus({preventScroll:true});}});
 addEventListener('portfolio-demo-action',e=>{const id=e.detail.id;if(['deepfake','playable-replay','intent-lab'].includes(id))goToStep(2);else if(['realityforge','wnams'].includes(id)&&projectPhase<.8)goToStep(1);});
 document.querySelector('#demo-previous').addEventListener('click',()=>selectProject(index-1));document.querySelector('#demo-next').addEventListener('click',()=>{if(index===projects.length-1)document.querySelector('#lab').scrollIntoView({behavior:motion?'smooth':'instant'});else selectProject(index+1);});
 const revealNodes=[...document.querySelectorAll('.collection-title,.project-row,.about-grid,.skills-heading,.skills-grid,.certification-details,.experience-grid,.project-lead,.lab-section .section-heading,.learning-lab,.contact-grid,.section-label')];
 const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('flow-in');observer.unobserve(e.target);}}),{threshold:.1});revealNodes.forEach(el=>{el.classList.add('flow-reveal');observer.observe(el);});
 const activeNav=[...document.querySelectorAll('.desktop-nav a')],navObserver=new IntersectionObserver(es=>{for(const e of es){if(!e.isIntersecting)continue;const id=['journey','about','experience'].includes(e.target.id)?'#about':e.target.id==='work'||e.target.id==='project-overview'?'#work':e.target.id==='collection'?'#work':'#lab';activeNav.forEach(a=>a.setAttribute('aria-current',String(a.hash===id)));}},{rootMargin:'-20% 0px -55%'});['journey','about','experience','project-overview','work','collection','lab'].forEach(id=>navObserver.observe(document.getElementById(id)));
 document.querySelectorAll('a[href="#work"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();if(root.classList.contains('quick-view')){document.querySelector('#collection').scrollIntoView({behavior:motion?'smooth':'instant'});return;}history.replaceState(null,'','#work');selectProject(0);history.replaceState(null,'','#work');}));
 selectProject(0,false);const hashIndex=projects.findIndex(p=>location.hash==='#project-'+p.id);if(hashIndex>=0&&!root.classList.contains('quick-view'))requestAnimationFrame(()=>selectProject(hashIndex));
 addEventListener('hashchange',()=>{const n=projects.findIndex(p=>location.hash==='#project-'+p.id);if(n>=0)selectProject(n);});request();
 return {goTo,selectProject,goToStep,get projectIndex(){return index;}};
}
