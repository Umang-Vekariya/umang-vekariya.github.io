import {interpolateRSSI,aggregateFrames,Outbox,BookingQueue} from './demo-models.js';
import {drawReconstruction} from './assets/replay-engine.js';

// One visible preview runs at a time. No backend, camera or model is called.
const ink='#e8e2d6',muted='#b9ab97',copper='#e18e6b',green='#9ec4af';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const cache=new Map();
async function json(path){if(!cache.has(path))cache.set(path,fetch(new URL(path,import.meta.url)).then(r=>{if(!r.ok)throw new Error('Preview record unavailable');return r.json();}).catch(e=>{cache.delete(path);throw e;}));return cache.get(path);}
const stages={wnams:['Position','Interpolate','Inspect'],deepfake:['Extract','Score','Aggregate'],'vit-vault':['Receive','Queue','Verify'],polyglot:['Write','Compile','Execute'],realityforge:['Calibrate','Segment','Respond'],'playable-replay':['Observe','Fit','Reconstruct'],'intent-lab':['Request','Check','Receipt'],clubsphere:['Book','Waitlist','Promote']};

function drawPreview(item,seconds){
 const {ctx:c,id,data}=item,t=seconds%10,step=Math.min(2,Math.floor(t/3.34));
 c.clearRect(0,0,800,480);c.fillStyle='#101111';c.fillRect(0,0,800,480);
 function text(s,x,y,size=24,color=ink,mono=false){c.fillStyle=color;c.font=`${mono?'400':'500'} ${size}px ${mono?'"IBM Plex Mono",monospace':'"DM Sans",sans-serif'}`;c.fillText(String(s),x,y);}
 function line(x,y,x2,y2,color='#6c594755',width=1){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();}
 function box(x,y,w,h,color='#1d1d1a',stroke='#8a705744'){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,5);c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
 function dot(x,y,r=5,color=copper){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
 function rows(lines,x,y,width=54){lines.forEach((s,i)=>text(String(s).slice(0,width),x,y+i*33,21,ink,true));}
 stages[id].forEach((s,i)=>{text(`0${i+1}`,30+i*254,39,15,i===step?copper:muted,true);text(s,62+i*254,40,20,i===step?ink:muted);line(30+i*254,58,242+i*254,58,i===step?copper:'#6c594744',i===step?2:1);});
 if(id==='wnams'){
  const samples=[{x:.17,y:.21,rssi:-45},{x:.76,y:.24,rssi:-58},{x:.63,y:.79,rssi:-72},{x:.30,y:.70,rssi:-52}].slice(0,t>4?4:3),x=32,y=85,w=506,h=340;
  box(x,y,w,h);if(step>0){if(item.heatmapKey!==samples.length){item.heatmapKey=samples.length;item.heatmap=document.createElement('canvas');item.heatmap.width=w;item.heatmap.height=h;const hc=item.heatmap.getContext('2d');for(let iy=0;iy<20;iy++)for(let ix=0;ix<30;ix++){const v=interpolateRSSI(samples,ix/29,iy/19),n=clamp((v+80)/40);hc.fillStyle=`rgb(${50+n*145},${47+n*65},${40+n*25})`;hc.fillRect(ix*w/30,iy*h/20,w/30+1,h/20+1);}}c.drawImage(item.heatmap,x,y);}
  for(const [a,b,a2,b2] of [[.33,0,.33,.42],[.33,.42,.75,.42],[.33,.65,.33,1],[.64,.42,.64,1],[.02,.65,.33,.65]])line(x+a*w,y+b*h,x+a2*w,y+b2*h,'#e8e2d6bb',3);
  samples.forEach((s,i)=>{const px=x+s.x*w,py=y+s.y*h;dot(px,py,7,ink);c.strokeStyle='#e8e2d655';c.beginPath();c.arc(px,py,15+(seconds*14+i*9)%30,0,Math.PI*2);c.stroke();});
  text('SIGNAL FIELD',570,119,17,copper,true);text(samples.length+' points',570,163,31);text('Synthetic survey',570,204,18,muted);samples.forEach((s,i)=>text(`${String(i+1).padStart(2,'0')}   ${s.rssi} dBm`,570,254+i*37,20,ink,true));
 }else if(id==='deepfake'){
  const scores=t<5?[.12,.14,.18,.22,.11,.16,.20,.10]:[.12,.78,.81,.39,.91,.27,.33,.66],r=aggregateFrames(scores),top=[...scores].sort((a,b)=>b-a).slice(0,3);
  scores.forEach((s,i)=>{const x=45+i*89,h=s*200*clamp((t%5)/1.3);box(x,92,69,238,'#1b1c19');box(x,330-h,69,h,step===2&&top.includes(s)?copper:'#b5a184',null);text(String(i+1).padStart(2,'0'),x+18,366,18,muted,true);});
  text(step===2?'TOP THREE → '+r.probability.toFixed(3):'8 SAMPLED FRAMES → EXAMPLE SCORES',45,416,25,step===2?ink:muted,true);
 }else if(id==='vit-vault'){
  const outbox=new Outbox();outbox.submit('sample-a');if(step>0)outbox.submit('sample-b');if(step===2)outbox.connect(true);
  text(step===2?'GATEWAY RECONNECTED':'GATEWAY OFFLINE',40,114,23,step===2?green:copper,true);
  ['LOCAL RECEIPT','DURABLE OUTBOX','CLOUD VERIFIED'].forEach((s,i)=>{box(40+i*253,160,214,195);text(`0${i+1}`,60+i*253,200,18,copper,true);text(i===0?'Received':i===1?'Queued':'Verified',60+i*253,250,29,i<=step?ink:muted);text(i===0?'Content accepted':i===1?outbox.items.length+' sample items':step===2?'2 sample items':'Awaiting sync',60+i*253,296,18,muted);if(i<2)text('→',264+i*253,258,29,copper);});
  text('Receipt ≠ cloud verification',40,412,26);text('In-memory explanation',40,446,18,muted);
 }else if(id==='polyglot'){
  box(30,86,425,350);box(475,86,295,350);text('mixed_demo.poly',49,122,19,copper,true);text(step===0?'OUTPUT':step===1?'COMPILER':'VM OUTPUT',497,122,19,copper,true);
  if(data){rows(data[0].source.split('\n').filter(Boolean).slice(0,8),49,165,29);const result=data[0].result;
   if(step===1)rows(['tokens','↓','typed IR','↓','bytecode'],497,167,18);else if(step===2)rows(String(result.stdout??result.output??'0\n1\n3\n6\n12\ndone').trim().split('\n').slice(0,7),497,167,18);else rows(['Ready to compile.','Six syntax families.','One semantic model.'],497,183,20);
  }else text('Loading compiler records…',49,190,24,muted);
 }else if(id==='realityforge'){
  const x=36,y=85,w=728,h=330;box(x,y,w,h,'#17201e');for(let i=1;i<12;i++)line(x+i*w/12,y,x+i*w/12,y+h,'#a5b29b19');for(let i=1;i<7;i++)line(x,y+i*h/7,x+w,y+i*h/7,'#a5b29b19');
  const bx=350+Math.sin(seconds*.55)*95,by=210+Math.cos(seconds*.45)*35;box(bx,by,110,74,'#98684d',copper);
  for(let i=0;i<34;i++){let px=x+((i*31+seconds*29)%w),py=y+25+(i*47)%(h-50);if(step>0&&px>bx-30&&px<bx+140&&py>by-30&&py<by+104)py=by-37-Math.sin(i)*13;dot(px,py,i===0?9:2.5,i===0?ink:green);}
  if(step>0){c.setLineDash([5,5]);box(bx-8,by-8,126,90,'#00000000',green);c.setLineDash([]);}text('SYNTHETIC DESK / OBSTACLE RESPONSE',36,453,19,muted,true);
 }else if(id==='playable-replay'){
  if(data){const {scene,replay,canvas}=data,count=scene.snapshots.length,frame=Math.min(count-1,Math.floor(seconds*scene.fps)%count),state=step===0?scene.snapshots[frame]:replay.states[Math.max(replay.seed_frame,frame)];
   drawReconstruction(canvas,scene,state);c.drawImage(canvas,30,80,498,332);text(step===0?'OBSERVED':'INFERRED MODEL',556,140,20,copper,true);text('Staggered',556,190,29);text('FRAME '+frame,556,241,19,muted,true);text('One observed seed.',556,298,18);text('Recorded controls.',556,330,18);text('No future resets.',556,362,18);text('Actual export · synthetic source footage',30,453,20,muted);
  }else text('Loading reconstruction…',40,225,28,muted);
 }else if(id==='intent-lab'){
  if(data){const run=data.runs[Math.floor(seconds/10)%data.runs.length],event=run.events[Math.min(run.events.length-1,step)];
   text(run.title,35,113,30);box(35,148,730,90);rows(run.request.match(/.{1,64}(?:\s|$)/g)||[run.request],55,183,64);
   box(35,264,340,154);box(395,264,370,154);text('PROPOSED ACTION',55,300,17,copper,true);text(event.action.name+'(…)',55,351,27,ink,true);text('PERMISSION / DECISION',415,300,17,copper,true);text(event.trusted_permission.toUpperCase()+' / '+event.decision.toUpperCase(),415,351,24,green,true);text('Recorded rehearsal · fictional tools',35,453,20,muted);
  }else text('Loading actual run records…',40,225,28,muted);
 }else{
  const q=new BookingQueue(2);q.join('Ada');q.join('Kai');if(step>0)q.join('Noor');if(step===2)q.cancel('Ada');
  text('SYSTEMS MEETUP',40,114,23,copper,true);text('2 seats / FIFO waitlist',40,151,22,muted);text('CONFIRMED',40,207,19,muted,true);text('WAITLIST',465,207,19,muted,true);
  q.booked.forEach((s,i)=>{box(40+i*195,235,175,145,'#24342c');text(s,60+i*195,291,35,ink);text('BOOKED',60+i*195,344,18,green,true);});q.waiting.forEach((s,i)=>{box(465,235+i*80,290,66);text('01  '+s,487,278+i*80,27);});if(step===2)text('Ada cancelled → Noor promoted',40,438,26,green);else text(step===1?'Noor waits until a seat is available.':'Both seats are now allocated.',40,438,24,muted);
 }
 item.el.dataset.previewStep=String(step);item.el.querySelectorAll('[data-case-stage]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.caseStage)===step)));
}

export function createProjectPreviews(){
 let items=[],current=null,caseItem=null,frame=0,last=0,motion=!document.documentElement.classList.contains('motion-off'),manual=false,caseVisible=true,caseObserver=null;
 const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{const item=items.find(i=>i.el===e.target);if(item)item.ratio=e.isIntersecting?e.intersectionRatio:0;});choose();},{threshold:[0,.25,.55,.8]});
 async function prepare(item){
  if(item.prepared)return;item.prepared=true;
  try{if(item.id==='polyglot')item.data=await json('assets/polyglot-walkthrough.json');else if(item.id==='intent-lab')item.data=await json('assets/intent-rehearsal.json');else if(item.id==='playable-replay'){const [scene,replay]=await Promise.all([json('apps/playable-replay/scene.json'),json('apps/playable-replay/replay.json')]);const canvas=document.createElement('canvas');canvas.width=scene.width;canvas.height=scene.height;item.data={scene,replay,canvas};}}
  catch{item.prepared=false;item.el.dataset.previewError='true';stop(item);return;}
  item.dataReady=true;drawPreview(item,item.seconds||0);if(current===item||caseItem===item)startLoop();
 }
 function make(el,id,button){const canvas=el.querySelector('canvas'),item={el,id,canvas,ctx:canvas.getContext('2d'),button,ratio:0,seconds:0,paused:false,data:null};canvas.width=800;canvas.height=480;return item;}
 function stop(item){if(!item)return;item.el.classList.remove('preview-playing');item.button?.setAttribute('aria-pressed','false');if(item.button)item.button.textContent='Play preview ↗';}
 function activate(item,user=false){if(current!==item){stop(current);current=item;manual=user;}if(!item||item.paused)return;if(!motion)item.seconds=6.8;item.el.classList.add('preview-playing');item.button?.setAttribute('aria-pressed','true');if(item.button)item.button.textContent='Pause preview Ⅱ';drawPreview(item,item.seconds);prepare(item);startLoop();}
 function choose(){if(caseItem||manual)return;const next=items.filter(i=>i.ratio>.25&&!i.paused&&!i.el.dataset.previewError).sort((a,b)=>b.ratio-a.ratio)[0];if(!motion||navigator.connection?.saveData||document.hidden||document.querySelector('dialog[open]')){stop(current);current=null;return;}if(next)activate(next);else{stop(current);current=null;}}
 function tick(now){frame=0;if(document.hidden)return;const item=caseItem||current;if(!item||item.paused||caseItem&&!caseVisible||(!caseItem&&document.querySelector('dialog[open]')))return;if(now-last<1000/30){frame=requestAnimationFrame(tick);return;}const dt=Math.min((now-last)/1000,.12);last=now;if(motion&&item.dataReady){item.seconds+=dt;drawPreview(item,item.seconds);}if(motion)frame=requestAnimationFrame(tick);}
 function startLoop(){if(!frame){last=performance.now();frame=requestAnimationFrame(tick);}}
 function refresh(){observer.disconnect();stop(current);current=null;manual=false;items=[...document.querySelectorAll('.tile-media[data-preview]')].map(el=>{const button=el.querySelector('.preview-toggle'),item=make(el,el.dataset.preview,button);observer.observe(el);button.addEventListener('click',()=>{if(current===item&&el.classList.contains('preview-playing')){item.paused=true;manual=false;stop(item);current=null;}else{item.paused=false;activate(item,true);}});el.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&motion&&!item.paused)activate(item,true);});el.addEventListener('pointerleave',()=>{manual=false;choose();});return item;});}
 addEventListener('portfolio-motion',e=>{motion=e.detail.enabled;if(!motion){if(frame)cancelAnimationFrame(frame);frame=0;stop(current);current=null;manual=false;if(caseItem)drawPreview(caseItem,6.8);}else{choose();if(caseItem)startLoop();}});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){if(caseItem||current&&manual)startLoop();else choose();}});
 return {refresh,mountCase(el,id){caseObserver?.disconnect();caseVisible=true;caseObserver=new IntersectionObserver(es=>{caseVisible=es[0].isIntersecting;if(caseVisible&&caseItem){prepare(caseItem);startLoop();}},{threshold:.05});caseObserver.observe(el);stop(current);current=null;manual=false;caseItem=make(el,id,null);caseItem.seconds=motion?0:6.8;caseItem.el.classList.add('preview-playing');const mounted=caseItem;el.querySelectorAll('[data-case-stage]').forEach(b=>b.addEventListener('click',()=>{mounted.seconds=Number(b.dataset.caseStage)*3.34+.2;mounted.paused=true;if(pause){pause.setAttribute('aria-pressed','true');pause.textContent='Play ↗';}drawPreview(mounted,mounted.seconds);}));const pause=el.querySelector('[data-case-pause]');if(pause){pause.textContent=motion?'Pause Ⅱ':'Play ↗';pause.setAttribute('aria-pressed',String(!motion));mounted.paused=!motion;pause.addEventListener('click',()=>{mounted.paused=!mounted.paused;pause.setAttribute('aria-pressed',String(mounted.paused));pause.textContent=mounted.paused?'Play ↗':'Pause Ⅱ';if(!mounted.paused){if(!motion){mounted.seconds=(mounted.seconds+3.34)%10;drawPreview(mounted,mounted.seconds);mounted.paused=true;pause.setAttribute('aria-pressed','true');pause.textContent='Next stage ↗';}else startLoop();}});}drawPreview(caseItem,caseItem.seconds);startLoop();},closeCase(){caseObserver?.disconnect();caseObserver=null;caseItem=null;manual=false;choose();}};
}
