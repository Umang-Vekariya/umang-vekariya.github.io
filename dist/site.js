import {initContentHover} from './content-hover.js?v=3';
import {projectProof} from './project-proof.js';
import {createProjectPreviews} from './project-previews.js?v=2';
import {projectStories} from './project-stories.js';
import {createFlow} from './flow.js?v=18';
import {initWorkshopNav} from './workshop-nav.js?v=1';
import {demoContent} from './demo-content.js';
import {createDemoEngine} from './project-demos.js';
import {profile,projects,experiences,skills,certificates} from './portfolio-data.js?v=2';
import {NeuralNetwork,createDataset} from './model.js';

const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reducedMotion)requestAnimationFrame(()=>document.querySelector('.uv-entrance')?.classList.add('uv-draw'));

let motionEnabled=!reducedMotion,artNumber=0;


// Each graphic is a diagram of the project, rather than a claimed product screenshot.
function projectArt(project){
  const id='art-'+(++artNumber),line='#e7b997',red='#ec654a';let content='';
  if(project.id==='realityforge'){content=`<path d="M60 228 158 57 530 98 457 267Z" fill="#18252a" stroke="#9eb4b155"/><g stroke="#758f9533">${Array.from({length:9},(_,i)=>`<path d="M${65+i*45} 228 ${160+i*40} 60"/>`).join('')}</g><path d="M224 148 275 115 343 140 292 181Z" fill="#ec654a33" stroke="#ec654a"/><path d="M205 145V176L292 217 344 179V140M292 181V217" fill="#e67b4422" stroke="#ec654a88"/>${Array.from({length:30},(_,i)=>`<circle cx="${104+(i*47)%357}" cy="${92+(i*31)%142}" r="${i%4===0?5:2}" fill="#9bbfb5" opacity=".7"/>`).join('')}`;}else if(project.visual==='signal'){
    content=`<g transform="translate(112 35)"><path d="M0 20 75 0 370 35 300 235 0 195Z" fill="#1b1715" stroke="${line}" stroke-opacity=".35"/><path d="M0 20 75 0 370 35 300 235 0 195Z" fill="url(#${id}-heat)"/><path d="M95 6 88 84 194 96 182 219M5 117 88 130 80 207M88 84 295 110 278 219M194 96 208 17M295 110 345 120" stroke="#dbc5ad" stroke-opacity=".5" stroke-width="2" fill="none"/><g fill="${red}" stroke="#ffd5ad" stroke-width="1.3"><circle cx="92" cy="87" r="5"/><circle cx="200" cy="147" r="5"/><circle cx="273" cy="62" r="5"/><circle cx="58" cy="164" r="5"/><circle cx="291" cy="166" r="5"/></g><g stroke="${red}" fill="none" opacity=".42"><circle cx="200" cy="147" r="22"/><circle cx="200" cy="147" r="44"/><circle cx="200" cy="147" r="69"/></g></g>`;
  }else if(project.visual==='vision'){
    content=`<g stroke="${line}" stroke-opacity=".33" fill="#191513">${[0,1,2].map((v,i)=>`<g transform="translate(${62+i*156} ${66-i*12})"><rect x="0" y="0" width="142" height="165" rx="2"/><path d="M44 127Q29 105 43 82Q30 42 70 32Q112 44 99 82Q114 106 94 127L107 150H30Z" fill="#7e6a5b33" stroke="#cdb39a44"/><path d="M48 66 71 56 93 66 85 97 57 97Z M48 66 57 97 71 80 93 66 M71 56 71 80 85 97" fill="none" stroke="${red}" stroke-opacity=".7"/><rect x="25" y="23" width="91" height="116" stroke="${red}" fill="none" stroke-opacity=".5"/><path d="M8 151H20M8 143H20M8 135H20" stroke="#e4c5a166"/></g>`).join('')}</g><path d="M213 148H224M368 137H379" stroke="${red}" stroke-width="1.5"/>`;
  }else if(project.visual==='vault'){
    content=`<g fill="#261a15" stroke="${line}" stroke-opacity=".48"><path d="M64 159 143 123 224 159 143 199Z"/><path d="M64 159V179L143 219V199M224 159V179L143 219"/><path d="M64 136 143 100 224 136 143 176Z"/><path d="M64 113 143 77 224 113 143 153Z"/><rect x="359" y="74" width="126" height="142" rx="5"/><path d="M359 112H485M359 151H485M359 190H485"/></g><path d="M226 148H276V108H326V148H354" fill="none" stroke="${red}" stroke-width="1.5" stroke-dasharray="5 5"/><g fill="${red}"><circle cx="279" cy="108" r="4"/><circle cx="338" cy="148" r="4"/></g><g stroke="${red}" stroke-width="2"><path d="M373 93H385M373 132H385M373 171H385"/></g><path d="M245 205H337M321 199 337 205 321 211" fill="none" stroke="${line}" stroke-opacity=".55"/>`;
  }else if(project.visual==='compiler'){
    content=`<g stroke="${line}" stroke-opacity=".3" fill="#1b1411"><rect x="54" y="60" width="144" height="165" rx="3"/><rect x="227" y="60" width="144" height="165" rx="3"/><rect x="400" y="60" width="144" height="165" rx="3"/></g><g stroke="${line}" stroke-opacity=".5" stroke-width="2">${[0,1,2,3,4,5,6].map((_,i)=>`<path d="M${73+(i%3)*7} ${89+i*17}H${172-(i%3)*13}"/>`).join('')}</g><g fill="none" stroke="${red}" stroke-opacity=".7"><path d="M299 94 264 134 282 180M299 94 333 134 314 180M264 134 248 180M333 134 348 180"/></g><g fill="${line}">${[[299,94],[264,134],[333,134],[248,180],[282,180],[314,180],[348,180]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4"/>`).join('')}</g><g fill="${red}" fill-opacity=".7">${Array.from({length:20},(_,i)=>`<rect x="${417+i%4*28}" y="${88+Math.floor(i/4)*24}" width="${i%3===0?8:18}" height="7" rx="1"/>`).join('')}</g><g stroke="${red}" stroke-opacity=".5"><path d="M204 142H220M377 142H393"/></g>`;
  }else if(project.visual==='replay'){
    content=`<rect x="85" y="40" width="430" height="225" rx="3" fill="#181310" stroke="${line}" stroke-opacity=".3"/><g>${Array.from({length:24},(_,i)=>`<rect x="${104+i%8*47}" y="${61+Math.floor(i/8)*21}" width="41" height="15" rx="1" fill="${i%3===0?red:'#9c7450'}" opacity="${.4+Math.floor(i/8)*.13}"/>`).join('')}</g><path d="M142 229 328 141 406 202 471 150" stroke="${red}" stroke-opacity=".6" stroke-dasharray="4 5" fill="none"/><rect x="249" y="239" width="85" height="6" rx="3" fill="#e0c29c"/><circle cx="327" cy="142" r="6" fill="#fae4c7"/>`;
  }else if(project.visual==='agent'){
    content=`<g fill="#1d1511" stroke="${line}" stroke-opacity=".4"><rect x="64" y="74" width="132" height="151" rx="4"/><rect x="234" y="74" width="132" height="151" rx="4"/><rect x="404" y="74" width="132" height="151" rx="4"/></g><g stroke="${line}" stroke-opacity=".5"><path d="M83 105H170M83 121H158M83 137H175M252 105H339M252 121H325M252 137H344"/></g><g stroke="${red}" stroke-width="1.5" fill="none"><path d="M203 150H226M373 150H396"/><circle cx="470" cy="148" r="31"/><path d="M456 148 467 160 486 136"/></g>`;
  }else{
    content=`<g fill="#241911" stroke="${line}" stroke-opacity=".45">${Array.from({length:9},(_,i)=>`<g transform="translate(${108+i%3*142} ${45+Math.floor(i/3)*76})"><rect width="101" height="55" rx="2"/><path d="M0 17H101"/><path d="M12 30H55M12 40H78" stroke-opacity=".3"/></g>`).join('')}</g><g stroke="${red}" stroke-opacity=".6" fill="none"><path d="M208 71H249M350 71H391M157 100V120M299 100V120M441 100V120M208 147H249M350 147H391M157 176V196M299 176V196M441 176V196"/></g>`;
  }
  return `<svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><radialGradient id="${id}-heat"><stop stop-color="#dd4f2699"/><stop offset=".45" stop-color="#b9693433"/><stop offset="1" stop-color="#c3833c00"/></radialGradient><linearGradient id="${id}-floor" x2="0" y2="1"><stop stop-color="#a7581b00"/><stop offset="1" stop-color="#a7581b16"/></linearGradient></defs><path d="M25 260 300 65 575 260Z" fill="url(#${id}-floor)"/><g stroke="#b9865120" fill="none"><path d="M0 260H600M40 280 300 67 560 280M110 280 300 67 490 280M181 280 300 67 419 280"/></g>${content}</svg>`;
}

$('#year').textContent=new Date().getFullYear();
$('#skills-grid').innerHTML=skills.map(group=>`<div class="skill-group"><h4>${escapeHTML(group.name.toUpperCase())}</h4><div class="skill-tags">${group.items.map(item=>`<span>${escapeHTML(item)}</span>`).join('')}</div></div>`).join('');
$('#experience-list').innerHTML=experiences.map(e=>`<article class="experience-item"><p class="eyebrow">${escapeHTML(e.dates)}</p><h3>${escapeHTML(e.title)}</h3><p class="organization">${escapeHTML(e.organization)}</p><p>${escapeHTML(e.summary||e.text)}</p></article>`).join('');
$('#certificate-list').innerHTML=certificates.map(c=>`<li>${escapeHTML(c)}</li>`).join('');

let previewController;
function renderIndex(filter='All'){
  $('#project-index').innerHTML=projects.filter(p=>filter==='All'||p.category===filter).map(p=>{
    const evidence=projectStories[p.id].evidence[0],proof=projectProof[p.id],config=demoContent.find(d=>d.id===p.id);
    return `<article class="project-tile" data-visual="${p.id}"><div class="tile-media" data-preview="${p.id}"><button class="tile-preview" data-show-demo="${p.id}" aria-label="Explore ${escapeHTML(p.name)} demonstration">${evidence?`<img class="project-capture" src="${evidence.poster||evidence.src}" alt="${escapeHTML(evidence.alt)}" loading="lazy" decoding="async">`:projectArt(p)}<canvas class="project-preview-canvas" aria-hidden="true"></canvas><span class="capture-type">${escapeHTML(proof.label)}</span><span class="preview-hint">Explore demonstration ↗</span><span class="tile-number">${String(projects.indexOf(p)+1).padStart(2,'0')} / 08</span></button><button class="preview-toggle" aria-label="Play or pause ${escapeHTML(p.name)} preview" aria-pressed="false">Play preview ↗</button></div><div class="tile-meta"><p>${escapeHTML(p.kind)}<span>${config.app||p.id==='polyglot'?'RUNNABLE DEMO':p.id==='intent-lab'?'RECORDED RUNS':'INTERACTIVE STUDY'}</span></p><h4><button data-show-demo="${p.id}">${escapeHTML(p.name)}<span>↗</span></button></h4><p class="tile-premise">${escapeHTML(p.short)}</p><p class="tile-preview-prompt">${escapeHTML(proof.try)}</p><div class="tile-stack">${p.stack.slice(0,3).map(x=>`<span>${escapeHTML(x)}</span>`).join('')}</div><a class="tile-details" href="/projects/${p.id}/">The story & evidence <span>↗</span></a></div></article>`;
  }).join('');
  previewController?.refresh();
}
renderIndex();
previewController=createProjectPreviews();previewController.refresh();
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{$$('[data-filter]').forEach(other=>other.setAttribute('aria-pressed',String(other===b)));renderIndex(b.dataset.filter);}));

let flow;
document.addEventListener('click',e=>{const button=e.target.closest('[data-open-project]');if(button)openProject(button.dataset.openProject);const demo=e.target.closest('[data-show-demo]');if(demo){if(document.documentElement.classList.contains('quick-view'))openProject(demo.dataset.showDemo);else flow.selectProject(projects.findIndex(p=>p.id===demo.dataset.showDemo));}const visit=e.target.closest('[data-visit-scene]');if(visit){projectDialog.close();setView('immersive',visit.dataset.visitScene);}const launch=e.target.closest('[data-launch-project]');if(launch)launchApp(launch.dataset.launchProject);});
const projectDialog=$('#project-dialog');projectDialog.addEventListener('close',()=>{$$('video',projectDialog).forEach(v=>v.pause());previewController.closeCase();});
function openProject(id){
  const p=projects.find(item=>item.id===id);if(!p)return;
  $('#detail-category').textContent=p.category.toUpperCase()+' / '+p.kind.toUpperCase();
  const story=projectStories[id],proof=projectProof[id],config=demoContent.find(d=>d.id===id),hasApp=id==='polyglot'||config.app;
  const evidence=story.evidence.map((e,i)=>`<figure class="case-evidence">${e.type==='video'?`<video controls playsinline preload="none" poster="${e.poster}" aria-label="${escapeHTML(e.alt)}"><source src="${e.src}" type="video/webm"></video>`:`<a href="${e.src}" target="_blank" rel="noopener" aria-label="Open full-size capture ${i+1}: ${escapeHTML(p.name)}"><img src="${e.src}" alt="${escapeHTML(e.alt)}" loading="lazy" decoding="async"><span>Open full-size capture ↗</span></a>`}<figcaption>${escapeHTML(e.caption)}</figcaption></figure>`).join('');
  $('#project-detail').innerHTML=`<p class="detail-status">${escapeHTML(p.detailLabel)} / ${escapeHTML(story.scene)}</p><h2 id="detail-title">${escapeHTML(p.name)}</h2><p class="case-premise">${escapeHTML(proof.title)}</p><div class="case-facts">${proof.facts.map(([value,label])=>`<div><strong>${escapeHTML(value)}</strong><span>${escapeHTML(label)}</span></div>`).join('')}</div><div class="case-action-bar"><a class="full-case-link" href="/projects/${id}/">Full case study <span>↗</span></a><button data-visit-scene="${id}">Explore this scene <span>↗</span></button>${hasApp?`<button data-launch-project="${id}">Open the real demo <span>↗</span></button>`:''}${config.source?`<a href="${config.source}" target="_blank" rel="noopener">View source <span>↗</span></a>`:''}</div><div class="detail-stack">${p.stack.map(t=>`<span>${escapeHTML(t)}</span>`).join('')}</div><div class="case-preview" data-preview="${id}"><div class="case-preview-toolbar"><span>${escapeHTML(proof.label)}</span><div role="group" aria-label="Preview stage"><button data-case-stage="0" aria-pressed="true">Input</button><button data-case-stage="1" aria-pressed="false">Process</button><button data-case-stage="2" aria-pressed="false">Result</button><button data-case-pause aria-pressed="false">Pause Ⅱ</button></div></div><canvas aria-label="${escapeHTML(p.name)} animated project walkthrough"></canvas><p>${escapeHTML(proof.try)}</p></div><section class="case-result"><span>WHAT IT DEMONSTRATES</span><p>${escapeHTML(proof.result)}</p></section><div class="case-story"><section><span>01 / THE PROBLEM</span><p>${escapeHTML(story.problem)}</p></section><section><span>02 / THE WORK</span><p>${escapeHTML(story.contribution)}</p></section><section><span>03 / THE DECISION</span><p>${escapeHTML(story.decision)}</p></section><section><span>04 / THE RESULT</span><p>${escapeHTML(story.outcome)}</p></section></div>${evidence?`<h3 class="detail-section-label">FROM THE ACTUAL PROJECT</h3><div class="case-evidence-gallery">${evidence}</div>`:''}<details class="case-architecture"><summary>Explore the architecture <span>+</span></summary><figure class="detail-illustration">${projectArt(p)}<figcaption>ARCHITECTURE ILLUSTRATION</figcaption></figure><div class="detail-flow">${p.architecture.map((s,i)=>`<span><b>0${i+1}</b>${escapeHTML(s)}</span>`).join('')}</div><ul class="detail-highlights">${p.highlights.map(item=>`<li>${escapeHTML(item)}</li>`).join('')}</ul></details><p class="case-scope"><b>Scope & evidence</b>${escapeHTML(story.scope)}</p><button class="case-next" data-open-project="${projects[(projects.indexOf(p)+1)%projects.length].id}"><span>CONTINUE EXPLORING</span><b>${escapeHTML(projects[(projects.indexOf(p)+1)%projects.length].name)} ↗</b></button><div class="detail-contact"><span>Curious about this project?</span><a href="mailto:${profile.email}?subject=${encodeURIComponent('About '+p.name)}">Let’s talk about it ↗</a></div>`;
  if(!projectDialog.open)projectDialog.showModal();projectDialog.scrollTop=0;previewController.mountCase($('.case-preview',projectDialog),id);
}
$$('dialog').forEach(dialog=>{
  $('.close-dialog',dialog).addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
});

const menu=$('.mobile-menu'),toggle=$('.menu-toggle');
function closeMenu(){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');}
toggle.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
$$('a',menu).forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();toggle.focus();}});

const commands=$('#command-dialog'),search=$('#command-search');
function filterCommands(){let count=0;$$('#command-results a').forEach(a=>{a.hidden=!a.dataset.search.includes(search.value.toLowerCase().trim());if(!a.hidden)count++;});$('#command-empty').hidden=count>0;}
function openCommands(){commands.showModal();search.value='';filterCommands();search.focus();}
$('.quick-trigger').addEventListener('click',openCommands);search.addEventListener('input',filterCommands);
$$('#command-results a').forEach(a=>a.addEventListener('click',()=>commands.close()));
document.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(commands.open)commands.close();else if(!$$('dialog[open]').length)openCommands();}
  if(!commands.open)return;const links=$$('#command-results a').filter(a=>!a.hidden),index=links.indexOf(document.activeElement);
  if(e.key==='ArrowDown'){e.preventDefault();links[(index+1)%links.length]?.focus();}
  if(e.key==='ArrowUp'){e.preventDefault();if(index<=0)search.focus();else links[index-1]?.focus();}
  if(e.key==='Enter'&&document.activeElement===search){e.preventDefault();links[0]?.click();}
});
$('#copy-email').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(profile.email);$('#copy-status').textContent='Email copied.';}catch{$('#copy-status').textContent='Select the email address above to copy it.';}});

const root=document.documentElement,hero=$('.hero');
let storedView='';try{storedView=sessionStorage.getItem('portfolio-view')||'';}catch{}
const requestedView=new URL(location.href).searchParams.get('view');const initialQuick=requestedView==='quick'||(!requestedView&&!location.hash.startsWith('#project-')&&storedView==='quick');root.classList.toggle('quick-view',initialQuick);
function setMotion(value){motionEnabled=value;root.classList.toggle('motion-off',!value);$('#motion-toggle').setAttribute('aria-pressed',String(value));$('#motion-toggle span').textContent=value?'on':'off';dispatchEvent(new CustomEvent('portfolio-motion',{detail:{enabled:value}}));}
$('#motion-toggle').addEventListener('click',()=>setMotion(!motionEnabled));setMotion(motionEnabled);
const demoEngine=createDemoEngine();
flow=createFlow(projects,escapeHTML,demoEngine);
initWorkshopNav(flow);
$('#profile-credentials').addEventListener('click',()=>$('#credentials-dialog').showModal());
let immersiveScroll=0;
function updateViewButton(){const quick=root.classList.contains('quick-view');$('#view-toggle').setAttribute('aria-pressed',String(quick));$('#view-toggle').innerHTML=(quick?'Immersive view':'Quick view')+' <span>↗</span>';}
function setView(view,projectId=null){const quick=view==='quick',wasQuick=root.classList.contains('quick-view');if(quick&&!wasQuick)immersiveScroll=scrollY;root.classList.toggle('quick-view',quick);try{sessionStorage.setItem('portfolio-view',quick?'quick':'immersive');}catch{}const url=new URL(location.href);if(quick){url.searchParams.set('view','quick');url.hash='';}else url.searchParams.delete('view');history.replaceState(null,'',url);updateViewButton();dispatchEvent(new CustomEvent('portfolio-view'));requestAnimationFrame(()=>{if(quick)window.scrollTo({top:0,behavior:'instant'});else if(projectId)flow.selectProject(projects.findIndex(p=>p.id===projectId));else window.scrollTo({top:immersiveScroll,behavior:'instant'});});}
$('#view-toggle').addEventListener('click',()=>setView(root.classList.contains('quick-view')?'immersive':'quick'));$$('[data-set-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.setView)));updateViewButton();
$$('a[href="#lab"]').forEach(a=>a.addEventListener('click',e=>{if(root.classList.contains('quick-view')){e.preventDefault();setView('immersive');requestAnimationFrame(()=>$('#lab').scrollIntoView({behavior:motionEnabled?'smooth':'instant'}));}}));
const appDialog=$('#app-dialog');
function launchApp(id){const p=projects.find(p=>p.id===id),config=demoContent.find(d=>d.id===id),url=id==='polyglot'?'apps/polyglot/':config?.app;if(!url)return;$$('dialog[open]').forEach(d=>d.close());$('#app-title').textContent=p.name;$('#app-external').href=url;$('#app-status').textContent='Loading '+p.name+'…';const frame=document.createElement('iframe');frame.title=p.name+' — actual project';frame.src=url;frame.allow='fullscreen';frame.addEventListener('load',()=>{$('#app-status').textContent='Project ready. Close this view to return to the same place in the story.';});$('#app-mount').replaceChildren(frame);appDialog.showModal();}
appDialog.addEventListener('close',()=>$('#app-mount').replaceChildren());
addEventListener('portfolio-launch-app',e=>launchApp(e.detail.id));
$('#demo-details').addEventListener('click',()=>openProject(projects[flow.projectIndex].id));
let scrollFrame=false;
function updateProgress(){const range=document.documentElement.scrollHeight-innerHeight;root.style.setProperty('--scroll',String(range>0?scrollY/range:0));scrollFrame=false;}
addEventListener('scroll',()=>{if(!scrollFrame){scrollFrame=true;requestAnimationFrame(updateProgress);}},{passive:true});updateProgress();


// Real browser-based neural-network experiment.
function initLearningLab(){
  const canvas=$('#decision-canvas'),ctx=canvas.getContext('2d'),lossCanvas=$('#loss-canvas'),lossContext=lossCanvas.getContext('2d');if(!ctx||!lossContext)return;
  const heatCanvas=document.createElement('canvas');heatCanvas.width=90;heatCanvas.height=75;const heatContext=heatCanvas.getContext('2d'),heatImage=heatContext.createImageData(90,75);
  let dataset='circles',points=createDataset(dataset),network=new NeuralNetwork(42),epoch=0,running=false,visible=false,lastDraw=0,history=[],w=0,h=0,modelSeed=42,rate=.03;
  function resize(){const r=canvas.parentElement.getBoundingClientRect(),d=Math.min(devicePixelRatio,1.5);w=r.width;h=r.height;canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);const lr=lossCanvas.getBoundingClientRect();lossCanvas.width=lr.width*d;lossCanvas.height=lr.height*d;lossContext.setTransform(d,0,0,d,0,0);render();drawLoss();}
  function updateMetrics(){const metrics=network.evaluate(points);$('#epoch-value').textContent=String(epoch).padStart(4,'0');$('#loss-value').textContent=metrics.loss.toFixed(4);$('#accuracy-value').textContent=Math.round(metrics.accuracy*100)+'%';history.push(metrics.loss);if(history.length>250)history.shift();drawLoss();}
  function drawLoss(){const rect=lossCanvas.getBoundingClientRect(),cw=rect.width,ch=rect.height;lossContext.clearRect(0,0,cw,ch);lossContext.strokeStyle='#b8c6a211';lossContext.lineWidth=1;for(let i=1;i<4;i++){lossContext.beginPath();lossContext.moveTo(0,ch*i/4);lossContext.lineTo(cw,ch*i/4);lossContext.stroke();}if(history.length<2)return;const max=Math.max(.1,...history);lossContext.beginPath();history.forEach((value,i)=>{const x=i/(history.length-1)*cw,y=ch-5-value/max*(ch-10);i?lossContext.lineTo(x,y):lossContext.moveTo(x,y);});lossContext.strokeStyle='#ee4e3b';lossContext.lineWidth=1.5;lossContext.stroke();}
  function render(){
    if(!w||!h)return;
    for(let iy=0;iy<75;iy++){for(let ix=0;ix<90;ix++){const x=((ix/89*w-42)/(w-84))*2-1,y=1-((iy/74*h-42)/(h-84))*2,p=network.forward(x,y),i=(iy*90+ix)*4;heatImage.data[i]=Math.round(31+p*64);heatImage.data[i+1]=Math.round(34-p*15);heatImage.data[i+2]=Math.round(35-p*14);heatImage.data[i+3]=255;}}
    heatContext.putImageData(heatImage,0,0);ctx.drawImage(heatCanvas,0,0,w,h);ctx.strokeStyle='#c8d6af12';ctx.lineWidth=.5;
    for(let i=1;i<10;i++){ctx.beginPath();ctx.moveTo(w*i/10,0);ctx.lineTo(w*i/10,h);ctx.stroke();ctx.beginPath();ctx.moveTo(0,h*i/10);ctx.lineTo(w,h*i/10);ctx.stroke();}
    const pad=42;for(const point of points){const x=pad+(point.x+1)*.5*(w-pad*2),y=pad+(1-point.y)*.5*(h-pad*2);ctx.beginPath();ctx.arc(x,y,3.1,0,Math.PI*2);ctx.fillStyle=point.label?'#f06b54':'#e5e8d5';ctx.fill();ctx.strokeStyle=point.label?'#4b2117':'#26321c';ctx.lineWidth=1.3;ctx.stroke();}
  }
  function setRunning(value){running=value;$('#train-button').innerHTML=value?'<span>Ⅱ</span> PAUSE TRAINING':'<span>▶</span> '+(epoch?'RESUME TRAINING':'TRAIN THE MODEL');$('#train-button').classList.toggle('training',value);$('#surface-status').textContent=value?'LEARNING IN REAL TIME':epoch?'TRAINING PAUSED':'AWAITING TRAINING';$('#lab-status').textContent=(value?'TRAINING':epoch?'PAUSED':'READY')+' / 200 TRAINING SAMPLES';}
  function reset(){network=new NeuralNetwork(++modelSeed);epoch=0;history=[];setRunning(false);updateMetrics();render();}
  $('#train-button').addEventListener('click',()=>setRunning(!running));$('#reset-model').addEventListener('click',reset);
  $$('[data-dataset]').forEach(b=>b.addEventListener('click',()=>{dataset=b.dataset.dataset;points=createDataset(dataset,42);$$('[data-dataset]').forEach(o=>o.setAttribute('aria-pressed',String(o===b)));reset();}));
  $('#learning-rate').addEventListener('input',e=>{rate=Number(e.target.value)*.01;$('#learning-rate-value').textContent=rate.toFixed(3);});
  new ResizeObserver(resize).observe(canvas.parentElement);new IntersectionObserver(e=>{visible=e[0].isIntersecting;}).observe(canvas.closest('.learning-lab'));
  function frame(time){if(running&&visible&&!document.hidden){for(let n=0;n<3;n++){network.trainEpoch(points,rate);epoch++;}if(time-lastDraw>150){lastDraw=time;updateMetrics();render();}if(epoch>=5000){setRunning(false);updateMetrics();render();$('#surface-status').textContent='5000 EPOCHS / EXPERIMENT COMPLETE';}}requestAnimationFrame(frame);}
  resize();updateMetrics();requestAnimationFrame(frame);
}
let labStarted=false;const labEntry=new IntersectionObserver(entries=>{if(!labStarted&&entries.some(e=>e.isIntersecting)){labStarted=true;initLearningLab();labEntry.disconnect();}},{rootMargin:'250px'});labEntry.observe(document.querySelector('#lab'));
if(new URL(location.href).searchParams.has('audit'))import('./performance-audit.js').then(m=>m.startPerformanceAudit());
let worldPromise;function ensureWorld(){if(root.classList.contains('quick-view')||worldPromise)return;worldPromise=new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))).then(()=>import('./world.bundle.js?v=22')).then(({initWorld})=>initWorld(demoEngine)).catch(error=>{console.error('Portfolio scene could not start:',error);root.classList.add('world-fallback');});}addEventListener('portfolio-view',ensureWorld);ensureWorld();

initContentHover();
