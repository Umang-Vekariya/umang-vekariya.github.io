import {profile,projects,experiences,skills,certificates} from './portfolio-data.js?v=2';
import {projectStories} from './project-stories.js';
import {projectProof} from './project-proof.js';
import {demoContent} from './demo-content.js';
import {createDemoEngine} from './project-demos.js?v=5';
import {createProjectPreviews} from './project-previews.js?v=4';
import {titleFrame,elementFlight,clamp} from './engineering-motion.js?v=3';

const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)'),surfaces=['#c5cabc','#d2c8ad','#c2c6c1','#c5b8a5','#bbc7be','#d1c7b1','#c3b5a3','#c7c6b4'];
let motion=!reduced.matches,preview,activeId=null,phase=0,origin=null,flight=null,flightTicket=0,returnFocus=null,priorHash='',studioStarted=false,studyVisible=false,closeTicket=0,navigationFlight=null,navigationTicket=0;
root.dataset.sceneMode='none';root.classList.add('js-reveal');
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
function syncDemo(){engine.setProgress(phase,projectDialog.open&&!appDialog.open&&(studyVisible||projectDialog.classList.contains('demo-max')),motion);}
const studyObserver=new IntersectionObserver(entries=>{studyVisible=entries[0].isIntersecting;syncDemo();},{threshold:0});studyObserver.observe($('#demo-flat'));

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
function showProject(id,source=null,{historyEntry=true}={}){
 if(!projects.some(p=>p.id===id))return;closeTicket++;const already=projectDialog.open;
 if(!already){priorHash=location.hash.startsWith('#project-')?'#work':location.hash;returnFocus=document.activeElement;origin=source||$(`[data-project="${id}"] .tile-preview`);}else origin=$(`[data-project="${id}"] .tile-preview`);
 $$('dialog[open]').filter(d=>d!==projectDialog).forEach(d=>d.close());fillProject(id);if(!already)projectDialog.showModal();projectDialog.scrollTop=0;syncDemo();if(historyEntry)history.pushState({project:id},'',`#project-${id}`);
 if(already){if(motion)$('#case-cover').animate([{opacity:.2,transform:'scale(.985)'},{opacity:1,transform:'scale(1)'}],{duration:500,easing:'cubic-bezier(.22,1,.36,1)'});}else expandFrom(origin);
}
async function closeProject({historyEntry=true}={}){
 if(!projectDialog.open)return;const ticket=++closeTicket;cancelFlight();engine.setProgress(phase,false,motion);projectDialog.classList.remove('demo-max');$('#demo-fullscreen').setAttribute('aria-pressed','false');$('#demo-fullscreen').textContent='Expand display ↗';
 const to=origin?.getBoundingClientRect();
 if(motion&&to&&to.bottom>0&&to.top<innerHeight){projectDialog.scrollTo({top:0,behavior:'instant'});const from=$('#case-cover').getBoundingClientRect(),clone=document.createElement('div');clone.className='shared-image';clone.innerHTML=$('#case-cover').innerHTML;clone.style.cssText=`left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;--project-surface:${projectDialog.style.getPropertyValue('--project-surface')};`;document.body.append(clone);projectDialog.close();const animation=clone.animate([{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'},elementFlight(from,to)],{duration:550,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});try{await animation.finished;}catch{}clone.remove();}
 else projectDialog.close();if(ticket!==closeTicket)return;if(historyEntry)history.replaceState(null,'',priorHash||'#work');if(returnFocus?.isConnected&&returnFocus.getClientRects().length)returnFocus.focus({preventScroll:true});else $('#view-toggle').focus({preventScroll:true});
}
$('.case-live-jump').addEventListener('click',e=>{e.preventDefault();$('#interactive-study').scrollIntoView({behavior:motion?'smooth':'instant',block:'start'});});
$('#demo-steps').addEventListener('click',e=>{const b=e.target.closest('[data-demo-step]');if(b)setPhase(Number(b.dataset.demoStep));});
$('#case-next').addEventListener('click',e=>showProject(e.currentTarget.dataset.nextId));
$('#demo-fullscreen').addEventListener('click',()=>{const full=projectDialog.classList.toggle('demo-max');$('#demo-fullscreen').setAttribute('aria-pressed',String(full));$('#demo-fullscreen').textContent=full?'Return to project ↙':'Expand display ↗';syncDemo();});
projectDialog.addEventListener('cancel',e=>{e.preventDefault();if(projectDialog.classList.contains('demo-max'))$('#demo-fullscreen').click();else closeProject();});
projectDialog.addEventListener('close',()=>{studyVisible=false;engine.setProgress(phase,false,motion);$$('video',projectDialog).forEach(v=>v.pause());});
function launchApp(id){const config=demoContent.find(d=>d.id===id),p=projects.find(p=>p.id===id),url=id==='polyglot'?'apps/polyglot/':config?.app;if(!url)return;engine.setProgress(phase,false,motion);$('#app-title').textContent=p.name;$('#app-external').href=url;$('#app-status').textContent='Loading '+p.name+'…';const frame=document.createElement('iframe');frame.title=p.name+' — actual project';frame.src=url;frame.allow='fullscreen';frame.addEventListener('load',()=>$('#app-status').textContent='Project ready. Close to return to your place in the case study.');$('#app-mount').replaceChildren(frame);appDialog.showModal();}
appDialog.addEventListener('close',()=>{$('#app-mount').replaceChildren();syncDemo();});
addEventListener('portfolio-launch-app',e=>launchApp(e.detail.id));
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
function setMotion(value){motion=value;root.classList.toggle('motion-off',!value);$('#motion-toggle').setAttribute('aria-pressed',String(value));$('#motion-toggle span').textContent=value?'on':'off';dispatchEvent(new CustomEvent('portfolio-motion',{detail:{enabled:value}}));if(activeId)syncDemo();updateFrame();}
$('#motion-toggle').addEventListener('click',()=>setMotion(!motion));reduced.addEventListener('change',e=>setMotion(!e.matches));
let scrollFrame=0;
function updateFrame(){scrollFrame=0;const section=$('.hero-sequence'),progress=clamp(-section.getBoundingClientRect().top/Math.max(1,section.offsetHeight-innerHeight)),pose=titleFrame(progress,{portrait:innerWidth<760,motion});$('.hero-type').style.opacity=pose.typeOpacity;$('.hero-type').style.transform=`translateY(${pose.typeY}px)`;$('.hero-top').style.opacity=pose.typeOpacity;$('.hero-bottom').style.opacity=pose.typeOpacity;$('.hero-bottom').inert=pose.typeOpacity<.1;$('.passage-caption').style.opacity=pose.caption;$('.hero-sticky').style.setProperty('--passage-wash',pose.wash);const art=$('#hero-art'),shift=(innerWidth/2-(art.offsetLeft+art.offsetWidth/2))*smoothCenter(progress);art.style.transform=`translateX(${shift}px) scale(${pose.artScale})`;$('.header').classList.toggle('scrolled',scrollY>90);}
function smoothCenter(p){const t=clamp(p/.65);return t*t*(3-2*t);}
function queueFrame(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateFrame);}addEventListener('scroll',queueFrame,{passive:true});addEventListener('resize',queueFrame);setMotion(motion);
const labObserver=new IntersectionObserver(entries=>{if(!studioStarted&&entries.some(e=>e.isIntersecting)){studioStarted=true;import('./neural-studio.js?v=4').then(m=>m.initNeuralStudio()).catch(()=>$('#studio-insight').textContent='The experiment could not load. Refresh to try again.');labObserver.disconnect();}},{rootMargin:'200px'});labObserver.observe($('#lab'));
// The hero is the only WebGL scene. Deep links to the work or tool skip its load.
let formStarted=false;
function ensureForm(){
 if(formStarted||document.querySelector('dialog[open]'))return;
 const r=$('.hero-sequence').getBoundingClientRect();if(r.bottom<=0||r.top>=innerHeight)return;
 formStarted=true;formObserver.disconnect();
 if(navigator.connection?.saveData||new URL(location.href).searchParams.get('graphics')==='off'){$('#hero-art').dataset.fallback='true';return;}
 import('./engineering-form.bundle.js?v=3').then(m=>m.initForm()).catch(()=>$('#hero-art').dataset.fallback='true');
}
const formObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))ensureForm();},{rootMargin:'0px'});
requestAnimationFrame(()=>formObserver.observe($('.hero-sequence')));
$$('dialog').forEach(d=>d.addEventListener('close',()=>{preview?.resume();requestAnimationFrame(ensureForm);}));

function route(){const id=location.hash.startsWith('#project-')?location.hash.slice(9):null;if(id&&projects.some(p=>p.id===id)){if(!projectDialog.open||activeId!==id)showProject(id,null,{historyEntry:false});}else if(projectDialog.open)closeProject({historyEntry:false});}
addEventListener('popstate',route);addEventListener('hashchange',route);requestAnimationFrame(()=>{route();if(new URL(location.href).searchParams.get('view')==='quick')quick.showModal();});
// Ordinary section links retain native scrolling. Very long jumps are brief
// masked cuts, avoiding a fast-forward through unrelated chapters.
document.addEventListener('click',async e=>{
 const a=e.target.closest('a[href^="#"]');if(!a||a.closest('dialog')&&a.closest('dialog')!==commands)return;
 const id=a.getAttribute('href').slice(1)||'home',target=document.getElementById(id);if(!target)return;
 const distance=target.getBoundingClientRect().top;if(Math.abs(distance)<innerHeight*2||!motion)return;
 e.preventDefault();const ticket=++navigationTicket;navigationFlight?.cancel();$$('.navigation-cut').forEach(n=>n.remove());
 const cover=document.createElement('div');cover.className='navigation-cut';cover.setAttribute('aria-hidden','true');document.body.append(cover);
 try{
  navigationFlight=cover.animate([{transform:'translateY(100%)'},{transform:'translateY(0)'}],{duration:200,easing:'cubic-bezier(.65,0,.35,1)',fill:'forwards'});await navigationFlight.finished;
  if(ticket!==navigationTicket)return;target.scrollIntoView({behavior:'instant'});history.pushState(null,'','#'+id);
  navigationFlight=cover.animate([{transform:'translateY(0)'},{transform:'translateY(-100%)'}],{duration:440,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});await navigationFlight.finished;
 }catch{}finally{cover.remove();if(ticket===navigationTicket)navigationFlight=null;}
});

addEventListener('pagehide',()=>{engine.dispose();studyObserver.disconnect();formObserver.disconnect();labObserver.disconnect();reveal.disconnect();navigationFlight?.cancel();cancelFlight();},{once:true});
addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
