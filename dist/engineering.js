import {initIdentity} from './identity-motion.js?v=1';
import {initStudioFinale} from './studio-finale.js?v=2';
import {profile,projects,experiences,skills,certificates} from './portfolio-data.js?v=2';
import {projectStories} from './project-stories.js';
import {projectProof} from './project-proof.js';
import {demoContent} from './demo-content.js';
import {createDemoEngine} from './project-demos.js?v=7';
import {createProjectPreviews} from './project-previews.js?v=5';
import {titleFrame,elementFlight,clamp} from './engineering-motion.js?v=5';

const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)'),surfaces=['#12338f','#0f2261','#163fb4','#10235f','#11327a','#1434a0','#0d2166','#193e9d'];
let motion=!reduced.matches,preview,activeId=null,phase=0,origin=null,flight=null,flightTicket=0,returnFocus=null,priorHash='',studioStarted=false,studyVisible=false,closeTicket=0,navigationFlight=null,navigationTicket=0,sectionScrollFrame=0;
let spatialController=null,worldStarted=false,worldBootReady=false,worldState={chapter:'home',progress:0,index:0,phase:0},galleryIndex=0,galleryStep=0,galleryVisible=false,galleryLive=false,manualStep=false,directMove=false;
if(navigator.connection?.saveData||new URL(location.href).searchParams.get('graphics')==='off')root.classList.add('spatial-fallback');
const galleryLiveProjects=new Set(),studioFinale=initStudioFinale(()=>queueFrame());
root.dataset.sceneMode='space';root.classList.add('js-reveal');
const reveal=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){e.target.classList.add('is-visible');reveal.unobserve(e.target);}},{rootMargin:'0px 0px -35px 0px',threshold:.05});
$$('.reveal').forEach(el=>reveal.observe(el));
$('#year').textContent=new Date().getFullYear();
$('#experience-list').innerHTML=experiences.map(e=>`<article class="experience-item"><p class="eyebrow">${esc(e.dates)}</p><h3>${esc(e.title)}</h3><p class="organization">${esc(e.organization)}</p><p>${esc(e.summary)}</p></article>`).join('');
$('#skills-grid').innerHTML=skills.map(g=>`<div class="skill-group"><h4>${esc(g.name.toUpperCase())}</h4><div class="skill-tags">${g.items.map(s=>`<span>${esc(s)}</span>`).join('')}</div></div>`).join('');
$('#certificate-list').innerHTML=certificates.map(c=>`<li>${esc(c)}</li>`).join('');
const skillTabs=$('#skill-tabs'),skillPanel=$('#skill-panel');
skillTabs.innerHTML=skills.map((g,i)=>`<button role="tab" id="skill-tab-${i}" aria-selected="${i===0}" aria-controls="skill-panel" tabindex="${i===0?0:-1}" data-skill="${i}">${esc(['Languages','Intelligence','Web & APIs','Infrastructure'][i])}</button>`).join('');
function selectSkill(i,focus=false){$$('[data-skill]').forEach((b,j)=>{b.setAttribute('aria-selected',String(j===i));b.tabIndex=j===i?0:-1;if(j===i&&focus)b.focus();});skillPanel.setAttribute('aria-labelledby','skill-tab-'+i);skillPanel.innerHTML=skills[i].items.map(v=>`<span>${esc(v)}</span>`).join('');if(motion)skillPanel.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'cubic-bezier(.22,1,.36,1)'});}
skillTabs.addEventListener('click',e=>{const b=e.target.closest('[data-skill]');if(b)selectSkill(Number(b.dataset.skill));});skillTabs.addEventListener('keydown',e=>{const index=Number(e.target.dataset.skill);if(!Number.isFinite(index))return;let i=index;if(e.key==='ArrowRight')i=(i+1)%4;else if(e.key==='ArrowLeft')i=(i+3)%4;else if(e.key==='Home')i=0;else if(e.key==='End')i=3;else return;e.preventDefault();selectSkill(i,true);});selectSkill(0);

function media(p){const evidence=projectStories[p.id].evidence[0];return evidence?`<img class="project-capture" src="${esc(evidence.poster||evidence.src)}" alt="${esc(evidence.alt)}" loading="lazy" decoding="async">`:`<div class="deepfake-art" role="img" aria-label="Diagram of sampled frame scores, illustrative values"><div class="frame-strip" data-score="0.12"></div><div class="frame-strip" data-score="0.78"></div><div class="frame-strip" data-score="0.81"></div><div class="frame-strip" data-score="0.39"></div></div>`;}
function renderIndex(filter='All'){
 $('#project-index').innerHTML=projects.filter(p=>filter==='All'||p.category===filter).map(p=>{const i=projects.indexOf(p),proof=projectProof[p.id],e=projectStories[p.id].evidence[0];return `<article class="project-tile" data-project="${p.id}" style="--project-surface:${surfaces[i]}"><div class="tile-media" data-preview="${p.id}"><button class="tile-preview" data-project-open="${p.id}" aria-label="Explore ${esc(p.name)}">${media(p)}<canvas class="project-preview-canvas" aria-hidden="true"></canvas><span class="tile-number">${String(i+1).padStart(2,'0')} / 08</span><span class="tile-open" aria-hidden="true">↗</span><span class="capture-type">${e?'FROM THE ACTUAL PROJECT':'ILLUSTRATIVE FRAME SCORES'}</span></button><button class="preview-toggle" aria-label="Play or pause ${esc(p.name)} preview" aria-pressed="false">Play preview ↗</button></div><div class="tile-meta"><p>${esc(p.kind)}<span>${esc(p.category)}</span></p><h4><button data-project-open="${p.id}">${esc(p.name)}<span>↗</span></button></h4><p class="tile-premise">${esc(p.short)}</p><div class="tile-stack">${p.stack.slice(0,3).map(s=>`<span>${esc(s)}</span>`).join('')}</div><a class="tile-details" href="/projects/${p.id}/">The story & evidence <span>↗</span></a></div></article>`;}).join('');preview?.refresh();
}
renderIndex();preview=createProjectPreviews({autoplay:false});preview.refresh();
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{$$('[data-filter]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));renderIndex(b.dataset.filter);}));
$('#quick-projects').innerHTML=projects.map((p,i)=>`<button data-project-open="${p.id}">${esc(p.name)}<span>${String(i+1).padStart(2,'0')} ↗</span></button>`).join('');
const projectDialog=$('#display-dialog'),appDialog=$('#app-dialog'),engine=createDemoEngine();
function syncDemo(){
 if(document.querySelector('dialog[open]')&&!projectDialog.open){engine.setProgress(phase,false,motion);return;}
 if(projectDialog.open){if(engine.projectId!==activeId)engine.setProject(activeId);engine.setProgress(phase,!appDialog.open&&(studyVisible||projectDialog.classList.contains('demo-max')),motion);}
 else if(galleryVisible){const id=projects[galleryIndex].id;if(engine.projectId!==id)engine.setProject(id);engine.setProgress(galleryStep,galleryLive||manualStep||galleryStep>0||root.classList.contains('spatial-fallback'),motion);}
 else engine.setProgress(0,false,motion);
}
const studyObserver=new IntersectionObserver(entries=>{studyVisible=entries[0].isIntersecting;syncDemo();},{threshold:0});studyObserver.observe($('#demo-flat'));

const gallery=$('#gallery');
$('#gallery-map').innerHTML=projects.map((p,i)=>`<button data-gallery-go="${i}"><span>${String(i+1).padStart(2,'0')}</span>${esc(p.name)}</button>`).join('');
$('#gallery-picker').innerHTML=projects.map((p,i)=>`<button data-gallery-go="${i}" aria-pressed="${i===0}">${esc(p.name)}</button>`).join('');
$('#gallery-select').innerHTML=projects.map((p,i)=>`<option value="${i}">${String(i+1).padStart(2,'0')} · ${esc(p.name)}</option>`).join('');
function galleryStepUI(){const config=demoContent[galleryIndex],step=config.steps[galleryStep];$('#gallery-step-title').textContent=step[1];$('#gallery-step-note').textContent=step[2];$$('[data-gallery-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.galleryStep)===galleryStep)));}
let galleryRendered=-1;
function renderGallery(i,force=false){
 if(galleryRendered===i&&!force){galleryStepUI();return;}galleryRendered=i;const p=projects[i],config=demoContent[i];
 $('#gallery-count').textContent=String(i+1).padStart(2,'0')+' / 08';$('#gallery-category').textContent=p.kind.toUpperCase();$('#gallery-title').textContent=p.name;$('#gallery-premise').textContent=p.short;$('#gallery-kind').textContent=config.kind;
 $('#gallery-select').value=String(i);$$('#gallery-picker [data-gallery-go]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.galleryGo)===i)));
 $('#gallery-steps').innerHTML=config.steps.map((t,j)=>`<button data-gallery-step="${j}" aria-pressed="${j===galleryStep}">0${j+1} ${esc(t[0])}</button>`).join('');
 if(!projectDialog.open){engine.setProject(p.id);engine.bindControls($('#gallery-controls'),{prefix:'gallery'});$('#gallery-status').textContent=projectProof[p.id].try;}galleryStepUI();
 $('#gallery-next-name').textContent=i===7?'NEXT: THE NEURAL STUDIO':'NEXT: '+projects[i+1].name.toUpperCase();$('#gallery-previous').disabled=i===0;
}
function selectGallery(i){const index=clamp(Number(i),0,7);manualStep=false;directMove=true;const range=gallery.offsetHeight-innerHeight;scrollTo({top:gallery.offsetTop+(index+.02)/8*range,behavior:'instant'});queueFrame();}
async function openGalleryProject(){const id=projects[galleryIndex].id;const rect=await spatialController?.focus();if(rect?.cancelled||id!==projects[galleryIndex].id)return;showProject(id,null,{spatialRect:rect});}
$('#gallery-details').addEventListener('click',openGalleryProject);
let screenPointer=null,screenDragged=false;
$('#world-display-hit').addEventListener('pointerdown',e=>{screenPointer={x:e.clientX,y:e.clientY};screenDragged=false;});
$('#world-display-hit').addEventListener('pointermove',e=>{if(screenPointer&&e.buttons&&Math.hypot(e.clientX-screenPointer.x,e.clientY-screenPointer.y)>6){galleryLive=true;syncDemo();queueFrame();spatialController?.pointer(e.clientX,e.clientY,screenDragged?'move':'down');screenDragged=true;}else if(engine.projectId==='playable-replay'&&engine.states['playable-replay'].control)spatialController?.pointer(e.clientX,e.clientY,'move');});
$('#world-display-hit').addEventListener('click',()=>{screenPointer=null;if(!screenDragged)openGalleryProject();screenDragged=false;});
$('#world-display-hit').addEventListener('pointercancel',()=>{screenPointer=null;screenDragged=false;});
addEventListener('portfolio-atlas-select',e=>{selectGallery(e.detail.index);history.replaceState(null,'','#gallery');});
$('#gallery-start').addEventListener('click',()=>selectGallery(0));$('#gallery-select').addEventListener('change',e=>selectGallery(e.target.value));
$('#gallery-next').addEventListener('click',()=>{if(galleryIndex===7){$('#lab').scrollIntoView({behavior:motion?'smooth':'instant'});return;}selectGallery(galleryIndex+1);});$('#gallery-previous').addEventListener('click',()=>selectGallery(galleryIndex-1));
document.addEventListener('click',e=>{const b=e.target.closest('[data-gallery-go]');if(b)selectGallery(b.dataset.galleryGo);if(e.target.closest('#gallery-index'))$('#collection').hidden=false;if(e.target.closest('#index-return')){e.preventDefault();selectGallery(galleryIndex);}const step=e.target.closest('[data-gallery-step]');if(step){galleryStep=Number(step.dataset.galleryStep);manualStep=true;galleryLive=true;galleryStepUI();syncDemo();queueFrame();}});
const flat=$('#gallery-fallback-canvas'),flatCtx=flat.getContext('2d');engine.subscribeFrames(canvas=>{if(galleryVisible&&root.classList.contains('spatial-fallback'))flatCtx.drawImage(canvas,0,0,1200,760);});
renderGallery(0);
function chapterState(){
 const y=scrollY,home=$('#home'),about=$('#about'),education=$('#education'),arrival=$('#work'),lab=$('#lab'),contact=$('#contact'),index=$('#collection');
 const phase=(node,end)=>clamp((y-node.offsetTop)/Math.max(1,end-node.offsetTop));
 if(y<about.offsetTop-innerHeight*.2)return {chapter:'home',progress:phase(home,home.offsetTop+home.offsetHeight-innerHeight),index:0,phase:0};
 if(y<education.offsetTop-innerHeight*.18)return {chapter:'about',progress:phase(about,education.offsetTop-innerHeight*.18),index:0,phase:0};
 if(y<arrival.offsetTop-innerHeight*.18)return {chapter:'education',progress:phase(education,arrival.offsetTop-innerHeight*.18),index:0,phase:0};
 if(y<gallery.offsetTop)return {chapter:'arrival',progress:phase(arrival,gallery.offsetTop),index:0,phase:0};
 if(y<gallery.offsetTop+gallery.offsetHeight-innerHeight*.25){const raw=clamp((y-gallery.offsetTop)/Math.max(1,gallery.offsetHeight-innerHeight))*8,i=Math.min(7,Math.floor(raw));return {chapter:'gallery',progress:0,index:i,phase:Math.min(.999,raw-i)};}
 if(!index.hidden&&y<lab.offsetTop-innerHeight*.25)return {chapter:'index',progress:0,index:galleryIndex,phase:0};
 if(y<contact.offsetTop-innerHeight*.4)return {chapter:'lab',progress:0,index:galleryIndex,phase:0};
 return {chapter:'contact',progress:phase(contact,contact.offsetTop+contact.offsetHeight-innerHeight),index:galleryIndex,phase:0};
}
function updateSpace(){worldState=chapterState();const finale=studioFinale.update({motion,fallback:root.classList.contains('spatial-fallback')});if(finale.active){worldState={chapter:'finale',progress:finale.progress,index:galleryIndex,phase:0,screen:finale.screen};startStudio();}galleryVisible=worldState.chapter==='gallery';root.dataset.spaceChapter=worldState.chapter;
 if(galleryVisible){if(worldState.index!==galleryIndex){if(galleryLive||manualStep||galleryStep>0)galleryLiveProjects.add(galleryIndex);galleryIndex=worldState.index;manualStep=false;galleryLive=galleryLiveProjects.has(galleryIndex);}if(!manualStep)galleryStep=Math.min(2,Math.floor(worldState.phase/.24));renderGallery(galleryIndex);}
 syncDemo();worldState.live=galleryLive||manualStep||galleryStep>0;spatialController?.update(worldState,{direct:directMove});directMove=false;if(worldBootReady)ensureWorld();
}

function setPhase(next){phase=clamp(next,0,2);const step=demoContent.find(d=>d.id===activeId).steps[phase];$('#demo-step-number').textContent=String(phase+1).padStart(2,'0')+' / '+step[0].toUpperCase();$('#demo-step-title').textContent=step[1];$('#demo-step-description').textContent=step[2];$$('[data-demo-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.demoStep)===phase)));syncDemo();}
function fillProject(id){
 const p=projects.find(p=>p.id===id),story=projectStories[id],proof=projectProof[id],config=demoContent.find(d=>d.id===id),i=projects.indexOf(p);activeId=id;
 projectDialog.style.setProperty('--project-surface',surfaces[i]);$('#case-label').textContent=String(i+1).padStart(2,'0')+' / '+p.name.toUpperCase();$('#case-category').textContent=p.kind.toUpperCase()+' / '+p.detailLabel.toUpperCase();$('#display-title').textContent=p.name;$('#case-premise').textContent=p.short;$('#case-summary').textContent=p.summary;$('#case-cover').innerHTML=media(p);$('#case-cover img')?.setAttribute('loading','eager');$('#case-facts').innerHTML=proof.facts.map(([v,l])=>`<div><strong>${esc(v)}</strong><span>${esc(l)}</span></div>`).join('');$('#full-case-link').href='/projects/'+id+'/';
 $('#case-story').innerHTML=[['01 / THE QUESTION',story.problem],['02 / THE WORK',story.contribution],['03 / THE DECISION',story.decision],['04 / THE RESULT',story.outcome]].map(([t,s])=>`<section><span>${t}</span><p>${esc(s)}</p></section>`).join('')+`<p class="case-scope">${esc(story.scope)}</p>`;
 $('#case-evidence').innerHTML=story.evidence.map(e=>`<figure>${e.type==='video'?`<video controls playsinline preload="none" poster="${e.poster}" aria-label="${esc(e.alt)}"><source src="${e.src}" type="video/webm"></video>`:`<a href="${e.src}" target="_blank" rel="noopener" aria-label="Open full-size capture of ${esc(p.name)}"><img src="${e.src}" alt="${esc(e.alt)}" loading="lazy" decoding="async"></a>`}<figcaption>${esc(e.caption)}</figcaption></figure>`).join('');
 $('#case-links').innerHTML=`<a href="/projects/${id}/">Full case study ↗</a>${config.source?`<a href="${config.source}" target="_blank" rel="noopener">View source ↗</a>`:''}${config.app||id==='polyglot'?`<button data-launch-project="${id}">Open the real project ↗</button>`:''}<a href="mailto:${profile.email}?subject=${encodeURIComponent('About '+p.name)}">Let’s talk about this ↗</a>`;
 $('#demo-kind').textContent=config.kind;$('#demo-steps').innerHTML=config.steps.map((s,i)=>`<button data-demo-step="${i}" aria-pressed="${i===0}">0${i+1} ${esc(s[0])}</button>`).join('');engine.setProject(id);engine.bindControls($('#demo-controls'));$('#demo-status').textContent=proof.try;setPhase(0);
 const next=projects[(i+1)%projects.length];$('#case-next').textContent=next.name+' ↗';$('#case-next').dataset.nextId=next.id;
}
function cancelFlight(){flightTicket++;flight?.cancel();flight=null;$$('.shared-image').forEach(el=>el.remove());$('#case-cover').style.opacity='';}
async function expandFrom(source){
 if(!source||!motion||!source.isConnected)return;
 cancelFlight();const ticket=flightTicket,from=source.getBoundingClientRect(),to=$('#case-cover').getBoundingClientRect();if(from.width<2||to.width<2||from.bottom<=0||from.top>=innerHeight)return;
 const clone=document.createElement('div');clone.className='shared-image';clone.innerHTML=source.innerHTML;clone.style.cssText=`left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;--project-surface:${getComputedStyle(source).getPropertyValue('--project-surface')};`;projectDialog.append(clone);$('#case-cover').style.opacity='0';if(motion)$('.case-content').animate([{opacity:0,transform:'translateY(35px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,delay:150,easing:'cubic-bezier(.22,1,.36,1)'});
 flight=clone.animate([{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'},elementFlight(from,to)],{duration:720,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
 try{await flight.finished;}catch{}if(ticket===flightTicket){$('#case-cover').style.opacity='';clone.remove();flight=null;}
}
function showProject(id,source=null,{historyEntry=true,spatialRect=null}={}){
 if(!projects.some(p=>p.id===id))return;closeTicket++;const already=projectDialog.open;
 if(!already){priorHash=location.hash.startsWith('#project-')?'#work':location.hash;returnFocus=document.activeElement;origin=source||$(`[data-project="${id}"] .tile-preview`);}else origin=$(`[data-project="${id}"] .tile-preview`);
 $$('dialog[open]').filter(d=>d!==projectDialog).forEach(d=>d.close());fillProject(id);if(!already)projectDialog.showModal();projectDialog.scrollTop=0;syncDemo();if(historyEntry)history.pushState({project:id},'',`#project-${id}`);
 if(already){if(motion)$('#case-cover').animate([{opacity:.2,transform:'scale(.985)'},{opacity:1,transform:'scale(1)'}],{duration:500,easing:'cubic-bezier(.22,1,.36,1)'});}else if(spatialRect&&motion){projectDialog.dataset.spatialEntry='true';const r=spatialRect;projectDialog.animate([{clipPath:`inset(${Math.max(0,r.top)}px ${Math.max(0,innerWidth-r.right)}px ${Math.max(0,innerHeight-r.bottom)}px ${Math.max(0,r.left)}px)`},{clipPath:'inset(0px 0px 0px 0px)'}],{duration:600,easing:'cubic-bezier(.22,1,.36,1)'});}else{delete projectDialog.dataset.spatialEntry;expandFrom(origin);}
}
async function closeProject({historyEntry=true}={}){
 if(!projectDialog.open)return;const ticket=++closeTicket;cancelFlight();engine.setProgress(phase,false,motion);projectDialog.classList.remove('demo-max');$('#demo-fullscreen').setAttribute('aria-pressed','false');$('#demo-fullscreen').textContent='Expand display ↗';
 const to=origin?.getBoundingClientRect();if(projectDialog.dataset.spatialEntry==='true'&&motion){const r=spatialController?.bounds();if(r){try{await projectDialog.animate([{clipPath:'inset(0px 0px 0px 0px)'},{clipPath:`inset(${Math.max(0,r.top)}px ${Math.max(0,innerWidth-r.right)}px ${Math.max(0,innerHeight-r.bottom)}px ${Math.max(0,r.left)}px)`}],{duration:400,easing:'cubic-bezier(.65,0,.35,1)'}).finished;}catch{}}delete projectDialog.dataset.spatialEntry;}
 if(motion&&to&&to.bottom>0&&to.top<innerHeight){projectDialog.scrollTo({top:0,behavior:'instant'});const from=$('#case-cover').getBoundingClientRect(),clone=document.createElement('div');clone.className='shared-image';clone.innerHTML=$('#case-cover').innerHTML;clone.style.cssText=`left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;--project-surface:${projectDialog.style.getPropertyValue('--project-surface')};`;document.body.append(clone);projectDialog.close();const animation=clone.animate([{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'},elementFlight(from,to)],{duration:550,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});try{await animation.finished;}catch{}clone.remove();}
 else projectDialog.close();if(ticket!==closeTicket)return;if(historyEntry)history.replaceState(null,'',priorHash||'#work');if(returnFocus?.isConnected&&returnFocus.getClientRects().length)returnFocus.focus({preventScroll:true});else $('#view-toggle').focus({preventScroll:true});
}
$('.case-live-jump').addEventListener('click',e=>{e.preventDefault();$('#interactive-study').scrollIntoView({behavior:motion?'smooth':'instant',block:'start'});});
$('#demo-steps').addEventListener('click',e=>{const b=e.target.closest('[data-demo-step]');if(b)setPhase(Number(b.dataset.demoStep));});
$('#case-next').addEventListener('click',e=>{const id=e.currentTarget.dataset.nextId;if(projectDialog.dataset.spatialEntry==='true'){selectGallery(projects.findIndex(p=>p.id===id));}showProject(id);});
$('#demo-fullscreen').addEventListener('click',()=>{const full=projectDialog.classList.toggle('demo-max');$('#demo-fullscreen').setAttribute('aria-pressed',String(full));$('#demo-fullscreen').textContent=full?'Return to project ↙':'Expand display ↗';syncDemo();});
projectDialog.addEventListener('cancel',e=>{e.preventDefault();if(projectDialog.classList.contains('demo-max'))$('#demo-fullscreen').click();else closeProject();});
projectDialog.addEventListener('close',()=>{studyVisible=false;spatialController?.release();renderGallery(galleryIndex,true);syncDemo();$$('video',projectDialog).forEach(v=>v.pause());});
function launchApp(id){const config=demoContent.find(d=>d.id===id),p=projects.find(p=>p.id===id),url=id==='polyglot'?'apps/polyglot/':config?.app;if(!url)return;engine.setProgress(phase,false,motion);$('#app-title').textContent=p.name;$('#app-external').href=url;$('#app-status').textContent='Loading '+p.name+'…';const frame=document.createElement('iframe');frame.title=p.name+' — actual project';frame.src=url;frame.allow='fullscreen';frame.addEventListener('load',()=>$('#app-status').textContent='Project ready. Close to return to your place in the case study.');$('#app-mount').replaceChildren(frame);appDialog.showModal();}
appDialog.addEventListener('close',()=>{$('#app-mount').replaceChildren();if(!projectDialog.open)spatialController?.release();syncDemo();});
addEventListener('portfolio-launch-app',async e=>{if(galleryVisible&&!projectDialog.open){const rect=await spatialController?.focus();if(rect?.cancelled)return;launchApp(e.detail.id);if(rect&&motion)appDialog.animate([{clipPath:`inset(${Math.max(0,rect.top)}px ${Math.max(0,innerWidth-rect.right)}px ${Math.max(0,innerHeight-rect.bottom)}px ${Math.max(0,rect.left)}px)`},{clipPath:'inset(0px 0px 0px 0px)'}],{duration:550,easing:'cubic-bezier(.22,1,.36,1)'});}else launchApp(e.detail.id);});
addEventListener('portfolio-demo-action',()=>{if(galleryVisible&&!projectDialog.open){galleryLive=true;syncDemo();queueFrame();}});
document.addEventListener('click',e=>{const open=e.target.closest('[data-project-open]');if(open)showProject(open.dataset.projectOpen,open.closest('.project-tile')?.querySelector('.tile-preview'));const launch=e.target.closest('[data-launch-project]');if(launch)launchApp(launch.dataset.launchProject);if(e.target.closest('[data-open-credentials]')){$('#quick-dialog').close();$('#credentials-dialog').showModal();}});
$$('dialog').forEach(dialog=>{$('.close-dialog',dialog)?.addEventListener('click',()=>dialog===projectDialog?closeProject():dialog.close());dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog===projectDialog?closeProject():dialog.close();});});
$('#profile-credentials').addEventListener('click',()=>$('#credentials-dialog').showModal());
const quick=$('#quick-dialog');$('#view-toggle').addEventListener('click',()=>quick.open?quick.close():quick.showModal());quick.addEventListener('close',()=>$('#view-toggle').setAttribute('aria-pressed','false'));quick.addEventListener('toggle',()=>$('#view-toggle').setAttribute('aria-pressed',String(quick.open)));
$('#copy-email').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(profile.email);$('#copy-status').textContent='Email copied.';}catch{$('#copy-status').textContent='Select the address to copy it.';}});
const menu=$('.mobile-menu'),toggle=$('.menu-toggle');
function setMenu(open){menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');root.classList.toggle('menu-open',open);$('#main').inert=open;$('.footer').inert=open;document.body.style.overflow=open?'hidden':'';if(open)$('a',menu).focus();}
toggle.addEventListener('click',()=>setMenu(menu.hidden));$$('a',menu).forEach(a=>a.addEventListener('click',()=>setMenu(false)));document.addEventListener('keydown',e=>{if(menu.hidden)return;if(e.key==='Escape'){setMenu(false);toggle.focus();}if(e.key==='Tab'){const items=[$('.menu-toggle'),...$$('a',menu)],i=items.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();items.at(-1).focus();}else if(!e.shiftKey&&i===items.length-1){e.preventDefault();items[0].focus();}}});
const commands=$('#command-dialog'),search=$('#command-search');
function filterCommands(){let count=0;$$('#command-results a').forEach(a=>{a.hidden=!a.dataset.search.includes(search.value.toLowerCase().trim());if(!a.hidden)count++;});$('#command-empty').hidden=count>0;}
function openCommands(){if(!menu.hidden)setMenu(false);commands.showModal();search.value='';filterCommands();search.focus();}
$('.quick-trigger').addEventListener('click',openCommands);search.addEventListener('input',filterCommands);$$('#command-results a').forEach(a=>a.addEventListener('click',()=>commands.close()));
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(commands.open)commands.close();else if(!$$('dialog[open]').length)openCommands();}if(!commands.open)return;const links=$$('#command-results a').filter(a=>!a.hidden),i=links.indexOf(document.activeElement);if(e.key==='ArrowDown'){e.preventDefault();links[(i+1)%links.length]?.focus();}else if(e.key==='ArrowUp'){e.preventDefault();if(i<=0)search.focus();else links[i-1]?.focus();}else if(e.key==='Enter'&&document.activeElement===search){e.preventDefault();links[0]?.click();}});
function setMotion(value){motion=value;if(!value)cancelSectionScroll();root.classList.toggle('motion-off',!value);$('#motion-toggle').setAttribute('aria-pressed',String(value));$('#motion-toggle span').textContent=value?'on':'off';dispatchEvent(new CustomEvent('portfolio-motion',{detail:{enabled:value}}));if(activeId)syncDemo();updateFrame();}
$('#motion-toggle').addEventListener('click',()=>setMotion(!motion));reduced.addEventListener('change',e=>setMotion(!e.matches));
let scrollFrame=0;
function updateFrame(){scrollFrame=0;const section=$('.hero-sequence'),progress=clamp(-section.getBoundingClientRect().top/Math.max(1,section.offsetHeight-innerHeight)),pose=titleFrame(progress,{portrait:innerWidth<760,motion});$('.hero-type').style.opacity=pose.typeOpacity;$('.hero-type').inert=pose.typeOpacity<.1;$('.hero-type').style.transform=`translateY(${pose.typeY}px)`;$('.hero-top').style.opacity=pose.typeOpacity;$('.hero-bottom').style.opacity=pose.typeOpacity;$('.hero-bottom').inert=pose.typeOpacity<.1;$('.passage-caption').style.opacity=pose.caption;$('.hero-sticky').style.setProperty('--passage-wash',pose.wash);const art=$('#hero-art'),shift=(innerWidth/2-(art.offsetLeft+art.offsetWidth/2))*smoothCenter(progress);art.style.transform=`translateX(${shift}px) scale(${pose.artScale})`;$('.header').classList.toggle('scrolled',scrollY>90);updateSpace();}
function smoothCenter(p){const t=clamp(p/.65);return t*t*(3-2*t);}
function queueFrame(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateFrame);}addEventListener('scroll',queueFrame,{passive:true});addEventListener('resize',queueFrame);setMotion(motion);initIdentity();
function startStudio(){if(studioStarted)return;studioStarted=true;import('./neural-studio.js?v=7').then(m=>m.initNeuralStudio()).catch(()=>$('#studio-insight').textContent='The experiment could not load. Refresh to try again.');}
const labObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){startStudio();labObserver.disconnect();}},{rootMargin:'200px'});labObserver.observe($('#lab'));
// One renderer owns the complete world and its eight real project displays.
function ensureWorld(){
 if(worldStarted||document.querySelector('dialog[open]')||['lab','index'].includes(worldState.chapter))return;
 worldStarted=true;formObserver.disconnect();
 if(navigator.connection?.saveData||new URL(location.href).searchParams.get('graphics')==='off'){root.classList.add('spatial-fallback');queueFrame();return;}
 import('./spatial-world.bundle.js?v=23').then(({initSpatialWorld})=>{spatialController=initSpatialWorld(engine,studioFinale,worldState);if(!spatialController){root.classList.add('spatial-fallback');queueFrame();}else spatialController.update(worldState);}).catch(error=>{console.error('Spatial gallery could not load',error);root.classList.add('spatial-fallback');queueFrame();});
}
const formObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))ensureWorld();},{rootMargin:'0px'});formObserver.observe($('#home'));worldBootReady=true;ensureWorld();
$$('dialog').forEach(d=>{d.addEventListener('toggle',()=>{if(d.open)spatialController?.release();syncDemo();});d.addEventListener('close',()=>{preview?.resume();requestAnimationFrame(()=>{ensureWorld();spatialController?.update(worldState);syncDemo();});});});

function route(){if(location.hash==='#collection')$('#collection').hidden=false;const id=location.hash.startsWith('#project-')?location.hash.slice(9):null;if(id&&projects.some(p=>p.id===id)){if(!projectDialog.open||activeId!==id)showProject(id,null,{historyEntry:false});}else if(projectDialog.open)closeProject({historyEntry:false});}
addEventListener('popstate',route);addEventListener('hashchange',route);requestAnimationFrame(()=>{route();if(new URL(location.href).searchParams.get('view')==='quick')quick.showModal();});
// A deliberate click-through opening; wheel, touch and keys always take over.
function cancelSectionScroll(){cancelAnimationFrame(sectionScrollFrame);sectionScrollFrame=0;}
$('.scroll-cue').addEventListener('click',e=>{
 if(!motion)return;e.preventDefault();cancelSectionScroll();const from=scrollY,to=$('#about').offsetTop,start=performance.now(),duration=Math.min(2400,1400+Math.abs(to-from)/2);
 function tick(now){const p=clamp((now-start)/duration),t=p*p*(3-2*p);scrollTo({top:from+(to-from)*t,behavior:'instant'});if(p<1)sectionScrollFrame=requestAnimationFrame(tick);else{sectionScrollFrame=0;history.pushState(null,'','#about');}}
 sectionScrollFrame=requestAnimationFrame(tick);
});
for(const event of ['wheel','touchstart','pointerdown'])addEventListener(event,cancelSectionScroll,{passive:true});
addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' ','Escape'].includes(e.key))cancelSectionScroll();});
// Ordinary section links retain native scrolling. Very long jumps are brief
// masked cuts, avoiding a fast-forward through unrelated chapters.
document.addEventListener('click',async e=>{
 if(e.defaultPrevented)return;cancelSectionScroll();const a=e.target.closest('a[href^="#"]');if(!a||a.closest('dialog')&&a.closest('dialog')!==commands)return;
 const id=a.getAttribute('href').slice(1)||'home',target=document.getElementById(id);if(!target)return;
 const distance=target.getBoundingClientRect().top;if(Math.abs(distance)<innerHeight*2||!motion)return;
 e.preventDefault();const ticket=++navigationTicket;navigationFlight?.cancel();$$('.navigation-cut').forEach(n=>n.remove());
 const cover=document.createElement('div');cover.className='navigation-cut';cover.setAttribute('aria-hidden','true');document.body.append(cover);
 try{
  navigationFlight=cover.animate([{transform:'translateY(100%)'},{transform:'translateY(0)'}],{duration:280,easing:'cubic-bezier(.65,0,.35,1)',fill:'forwards'});await navigationFlight.finished;
  if(ticket!==navigationTicket)return;target.scrollIntoView({behavior:'instant'});history.pushState(null,'','#'+id);
  navigationFlight=cover.animate([{transform:'translateY(0)'},{transform:'translateY(-100%)'}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});await navigationFlight.finished;
 }catch{}finally{cover.remove();if(ticket===navigationTicket)navigationFlight=null;}
});

addEventListener('pagehide',()=>{engine.dispose();studyObserver.disconnect();formObserver.disconnect();labObserver.disconnect();reveal.disconnect();navigationFlight?.cancel();cancelFlight();cancelSectionScroll();},{once:true});
addEventListener('pageshow',e=>{if(e.persisted)location.reload();});

addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('dialog[open]'))spatialController?.release();});
