import {interpolateRSSI,aggregateFrames,Outbox,BookingQueue,fitMotion,explainAction} from './demo-models.js';
import {ReplaySession,drawReconstruction} from './assets/replay-engine.js';
import {demoContent} from './demo-content.js';
const C={bg:'#04091c',panel:'#0b1c4b',ink:'#edf3ff',muted:'#99b3e8',line:'#2446a2',red:'#7198ff',green:'#d4ff35'};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export function createDemoEngine(){
 const canvas=document.createElement('canvas');const renderScale=typeof innerWidth==='number'&&innerWidth<=760?1.25:1.5;canvas.width=1200*renderScale;canvas.height=760*renderScale;canvas.setAttribute('aria-label','Interactive project demonstration');document.querySelector('#demo-flat').append(canvas);
 const ctx=canvas.getContext('2d');ctx.setTransform(renderScale,0,0,renderScale,0,0);const outbox=new Outbox(),bookings=new BookingQueue(2);
 const states={wnams:{samples:[{x:.18,y:.2,rssi:-45},{x:.78,y:.26,rssi:-58},{x:.62,y:.8,rssi:-72}],cursor:{x:.5,y:.5},version:0},deepfake:{sample:0},'vit-vault':{outbox,version:1},polyglot:{examples:null,index:0,loading:false},realityforge:{x:.52,y:.48,ball:{x:.15,y:.3,vx:.14,vy:.11}},'playable-replay':{session:null,scene:null,replay:null,loading:false,accumulator:0,control:false,paddle:.5,ball:{x:.27,y:.64,vx:.16,vy:-.24},hits:0,bricks:Array(28).fill(true)},'intent-lab':{scenario:0,runs:null,loading:false},clubsphere:{bookings,next:0}};
 const gameCanvas=document.createElement('canvas');gameCanvas.width=768;gameCanvas.height=512;
 const displayDialog=document.querySelector('#display-dialog');
 let revision=0,dirty=true,animationFrame=0,disposed=false;const frameListeners=new Set(),projectListeners=new Set();
 function animated(){
  if(projectId==='playable-replay'){const s=states[projectId];return Boolean(s.session&&(motion||(s.control&&s.session.playing)));}
  return motion&&((projectId==='realityforge'&&phase>.9)||(projectId==='vit-vault'&&states['vit-vault'].outbox.items.length>0));
 }
 function schedule(){if(!disposed&&active&&!document.hidden&&!animationFrame&&(dirty||animated()))animationFrame=requestAnimationFrame(draw);}
 let projectId='wnams',frameProjectId=null,phase=0,active=false,motion=true,last=0,time=0,lastDraw=0,disposedControls=[];
 const scoreSets=[[.12,.14,.18,.22,.11,.16,.2,.1],[.12,.78,.81,.39,.91,.27,.33,.66]];
 const fixture=Array.from({length:10},(_,i)=>({t:i,x:.12+i*.065,y:.8-i*.041})),fit=fitMotion(fixture.slice(0,6));
 function text(t,x,y,size=26,color=C.ink,mono=false){ctx.fillStyle=color;ctx.font=`${mono?'400':'500'} ${size}px ${mono?'"IBM Plex Mono", monospace':'"DM Sans", sans-serif'}`;ctx.fillText(String(t),x,y);}
 function rect(x,y,w,h,fill=C.panel,stroke=C.line,r=8){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}}
 function line(x1,y1,x2,y2,color=C.line,width=2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
 function dot(x,y,r=6,color=C.red){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
 function wrap(t,x,y,max=430,size=25,color=C.muted){let row='',dy=0;ctx.font=`400 ${size}px "DM Sans",sans-serif`;for(const word of String(t).split(' ')){const next=row+word+' ';if(ctx.measureText(next).width>max&&row){text(row,x,y+dy,size,color);row=word+' ';dy+=size*1.5;}else row=next;}text(row,x,y+dy,size,color);return y+dy;}
 function tag(t,x,y,color=C.red){rect(x,y-24,ctx.measureText(t).width+34,34,'#1c2022',color,3);text(t,x+12,y,18,color,true);}
 function base(name,label){ctx.fillStyle=C.bg;ctx.fillRect(0,0,1200,760);text(name.toUpperCase(),40,57,28,C.ink,true);text(label,40,100,18,C.muted,true);line(40,123,1160,123);text(['01 / INPUT','02 / PROCESS','03 / RESULT'][Math.min(2,Math.round(phase))],900,58,18,C.red,true);line(40,705,1160,705);text(demoContent.find(d=>d.id===projectId).kind,40,738,15,C.muted,true);dot(1130,731,4,C.green);}
 function status(message){dirty=true;const node=document.querySelector('#demo-status');if(node)node.textContent=message;const gallery=document.querySelector('#gallery-status');if(gallery)gallery.textContent=message;schedule();}
 function loadPoly(){const s=states.polyglot;if(s.examples||s.loading)return;s.loading=true;fetch('./assets/polyglot-walkthrough.json').then(r=>{if(!r.ok)throw new Error();return r.json();}).then(v=>{s.examples=v;s.loading=false;status('Actual compiler records loaded.');}).catch(()=>{s.loading=false;status('Compiler records could not load. The full IDE is available below.');});}
 function loadIntent(){const s=states['intent-lab'];if(s.runs||s.loading)return;s.loading=true;fetch('./assets/intent-rehearsal.json').then(r=>{if(!r.ok)throw new Error();return r.json();}).then(d=>{s.runs=d.runs;s.loading=false;status('Four actual local agent runs loaded. Recorded 27 October 2026.');}).catch(()=>{s.loading=false;status('Recorded runs could not load. Please reload.');});}
 function loadReplay(){const s=states['playable-replay'];if(s.session||s.loading)return;s.loading=true;Promise.all(['scene','replay'].map(n=>fetch('./apps/playable-replay/'+n+'.json').then(r=>{if(!r.ok)throw new Error();return r.json();}))).then(([scene,replay])=>{s.scene=scene;s.replay=replay;s.session=new ReplaySession(scene,replay);s.loading=false;status('Actual exported scene, observed tracks and inferred physics loaded.');}).catch(()=>{s.loading=false;status('Reconstruction could not load. Open the complete demo to retry.');});}
 function drawSignal(){
  const s=states.wnams;base('WNAMS','SAMPLE SURVEY / IDW COVERAGE EXPLANATION');
  rect(40,155,310,510);text('Survey points',65,199,27);text('x / y / signal',65,232,18,C.muted,true);
  s.samples.slice(-7).forEach((p,i)=>{const y=280+i*48;dot(78,y-7,5);text(`${p.x.toFixed(2)}  ${p.y.toFixed(2)}`,98,y,19,C.ink,true);text(`${p.rssi} dBm`,247,y,17,C.red,true);});
  const x=390,y=155,w=770,h=510;rect(x,y,w,h,'#111719');
  if(phase>.35){ctx.save();ctx.globalAlpha=clamp((phase-.35)*1.8);for(let iy=0;iy<26;iy++)for(let ix=0;ix<40;ix++){const v=interpolateRSSI(s.samples,ix/39,iy/25),n=clamp((v+85)/45);ctx.fillStyle=`rgb(${Math.round(23+n*189)},${Math.round(74+n*181)},${Math.round(255-n*202)})`;ctx.fillRect(x+ix*w/40,y+iy*h/26,w/40+1,h/26+1);}ctx.restore();}
  for(let i=1;i<6;i++){line(x+w*i/6,y,x+w*i/6,y+h,'#b2b7b71a',1);line(x,y+h*i/6,x+w,y+h*i/6,'#b2b7b71a',1);}
  ctx.strokeStyle='#eee8d8a0';ctx.lineWidth=4;ctx.strokeRect(x+30,y+30,w-60,h-60);line(x+w*.4,y+30,x+w*.4,y+h*.55,'#eee8d8a0',4);line(x+w*.4,y+h*.55,x+w-30,y+h*.55,'#eee8d8a0',4);
  s.samples.forEach((p,i)=>{dot(x+p.x*w,y+p.y*h,9,C.ink);text(i+1,x+p.x*w+15,y+p.y*h-12,20,C.ink,true);});
  if(phase>1.3){const v=interpolateRSSI(s.samples,s.cursor.x,s.cursor.y);rect(755,590,380,52,'#101315e8');text(`ESTIMATE ${v.toFixed(1)} dBm`,778,624,25,C.ink,true);}
 }
 function drawDeepfake(){
  const s=states.deepfake,scores=scoreSets[s.sample],r=aggregateFrames(scores);base('Deepfake Detector','SOURCE-VERIFIED PIPELINE / ILLUSTRATIVE FRAME SCORES');
  scores.forEach((v,i)=>{const x=45+i*141;rect(x,168,125,175);ctx.strokeStyle='#566369';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x+62,235,30,39,0,0,Math.PI*2);ctx.stroke();line(x+45,227,x+53,227,C.ink,3);line(x+72,227,x+80,227,C.ink,3);ctx.strokeRect(x+21,183,83,108);text(`F${i+1}`,x+14,324,18,C.muted,true);if(phase>.6){rect(x,363,125,177,'#12191c');const top=[...scores].sort((a,b)=>b-a)[2];const selected=v>=top;ctx.fillStyle=selected&&phase>1.3?C.red:'#78898c';ctx.fillRect(x+43,505-v*120,38,v*120);text(v.toFixed(2),x+27,532,20,selected?C.red:C.ink,true);}});
  if(phase<.7)wrap('Eight sampled frames → face crop when detected → 128 × 128 input',55,413,1000,31,C.ink);
  if(phase>.9){text('TOP THREE MEAN',50,610,20,C.muted,true);text(r.probability.toFixed(3),50,655,37,C.ink,true);text('THRESHOLD 0.500',360,610,20,C.muted,true);text(r.label?'EXAMPLE: FAKE':'EXAMPLE: REAL',360,655,32,r.label?C.red:C.green,true);wrap('Example values only. No trained model is running on this board.',785,603,350,23,C.muted);}
 }
 function drawVault(){
  const s=states['vit-vault'];base('VIT Vault',s.outbox.online?'GATEWAY ONLINE / LOCAL SIMULATION':'INTERNET OFFLINE / LOCAL SIMULATION');
  const boxes=[['STUDENT',50],['LAN GATEWAY',440],['CLOUD VERIFY',830]];
  boxes.forEach(([name,x],i)=>{rect(x,180,320,140);text(name,x+26,225,24,C.ink,true);text(i===0?'sample submission':i===1?'receipt + outbox':s.outbox.online?'connected':'unavailable',x+26,280,20,i===2&&!s.outbox.online?C.red:C.muted,true);});
  line(370,250,430,250,C.red,3);line(760,250,820,250,s.outbox.online?C.green:'#2446a2',3);
  if(s.outbox.items.length){const x=370+((time*.2)%1)*420;dot(x,250,7,s.outbox.online?C.green:C.red);}
  text('RECEIPT',60,383,18,C.muted,true);text('SHA-256 CONTENT DIGEST',280,383,18,C.muted,true);text('STATE',930,383,18,C.muted,true);
  s.outbox.items.slice(-4).forEach((v,i)=>{const y=430+i*55;line(50,y+18,1150,y+18);text(`#${String(v.id).padStart(3,'0')}`,60,y,24,C.ink,true);text(v.hash.slice(0,30)+'…',280,y,19,C.muted,true);text(v.state.toUpperCase(),930,y,20,v.state==='verified'?C.green:C.red,true);});
  if(!s.outbox.items.length)wrap('Submit a sample while offline. Reconnect to synchronize it.',60,455,960,34,C.ink);
 }
 function drawPoly(){
  const s=states.polyglot;base('PolyGlot','REPLAY OF ACTUAL COMPILER RECORDS / OPEN THE IDE TO EDIT & RUN');
  if(!s.examples){loadPoly();text('Loading verified compiler output…',70,260,32);return;}
  const e=s.examples[s.index],r=e.result,st=r.stages||{};rect(40,155,540,510);text(e.file,65,198,24,C.red,true);
  e.source.split('\n').slice(0,15).forEach((t,i)=>text(t.slice(0,36),65,244+i*26,19,C.ink,true));
  rect(610,155,550,510);const current=Math.round(phase);
  if(current===0){text('SIX SYNTAX FAMILIES',640,206,23,C.ink,true);wrap('A restricted educational language with a shared parser, type system and VM.',640,270,470,30);text('SOURCE STAYS IN THE BROWSER',640,490,19,C.red,true);wrap('The included IDE runs the actual Python compiler through Pyodide.',640,540,470,26);}
  if(current===1){text(r.ok?'COMPILATION SUCCEEDED':'STOPPED BY SEMANTICS',640,206,23,r.ok?C.green:C.red,true);const counts=[['Tokens',st.tokens?.length||0],['Syntax recognitions',st.recognition?.length||0],['IR functions',Object.keys(st.ir||{}).length],['Bytecode available',r.artifact?'yes':'no']];counts.forEach(([k,v],i)=>{text(k,640,270+i*55,24,C.muted);text(v,1060,270+i*55,24,C.ink,true);});if(!r.ok)wrap(r.diagnostics?.[0]?.message||'Compilation blocked.',640,540,470,24,C.red);}
  if(current===2){text('ACTUAL VM OUTPUT',640,206,23,C.ink,true);(r.output||'(execution blocked)').split('\n').slice(0,10).forEach((t,i)=>text(t,645,270+i*34,26,r.ok?C.green:C.red,true));text(r.ok?'VERIFIED LOCAL RUN':'NO INVALID PROGRAM EXECUTED',640,625,18,C.muted,true);}
 }
 function drawReality(dt){
  const s=states.realityforge;base('RealityForge','SYNTHETIC DESK / INTERACTIVE COLLISION SKETCH');
  const x=55,y=160,w=1090,h=510;rect(x,y,w,h,'#132024');for(let i=0;i<=10;i++){line(x+i*w/10,y,x+i*w/10,y+h,'#52666d33',1);line(x,y+i*h/10,x+w,y+i*h/10,'#52666d33',1);}
  [[x+20,y+20],[x+w-20,y+20],[x+20,y+h-20],[x+w-20,y+h-20]].forEach(([a,b],i)=>{dot(a,b,6,C.ink);text(i+1,a+12,b+8,18,C.ink,true);});
  if(phase>.3){ctx.fillStyle='#174aff40';ctx.beginPath();ctx.ellipse(x+s.x*w,y+s.y*h,100,75,-.2,0,Math.PI*2);ctx.fill();ctx.strokeStyle=C.red;ctx.lineWidth=3;ctx.stroke();text('SYNTHETIC OBSTACLE',x+s.x*w-115,y+s.y*h-100,18,C.red,true);}
  if(phase>.9){for(let i=0;i<45;i++){const px=(i*.137+time*.04)%1,py=.15+(i%8)*.1,dx=px-s.x,dy=py-s.y,d=Math.hypot(dx,dy);dot(x+(px+(d<.18?Math.sign(dx)*(.18-d):0))*w,y+py*h,3,'#99c2bd');}
   const b=s.ball;if(motion){b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.x<.03||b.x>.97)b.vx*=-1;if(b.y<.04||b.y>.96)b.vy*=-1;const dx=b.x-s.x,dy=b.y-s.y;if(Math.hypot(dx,dy)<.14){const angle=Math.atan2(dy,dx);b.vx=Math.cos(angle)*.18;b.vy=Math.sin(angle)*.18;b.x=s.x+Math.cos(angle)*.145;b.y=s.y+Math.sin(angle)*.145;}}dot(x+b.x*w,y+b.y*h,10,C.ink);}
 }
 function drawReplay(dt){
  const s=states['playable-replay'];base('PlayableReplay',s.control?'ACTUAL RECONSTRUCTION / PLAYER TAKEOVER':'ACTUAL EXPORT / SYNTHETIC SOURCE FOOTAGE');
  if(!s.session){loadReplay();text('Loading the reconstructed world…',65,255,31);return;}
  const session=s.session,scene=s.scene;
  if(!s.control){const frame=Math.max(s.replay.seed_frame,Math.floor(time*scene.fps)%scene.frame_count);session.seek(frame);const view=phase>.6?'model':'observed';if(session.mode!==view)session.setView(view);}
  else if(motion||s.control){s.accumulator+=dt;while(s.accumulator>=1/60){session.tick(s.paddle*scene.width);s.accumulator-=1/60;}}
  const state=session.display();drawReconstruction(gameCanvas,scene,state);ctx.drawImage(gameCanvas,45,160,777,518);
  rect(846,160,310,518);text('RECONSTRUCTION',867,203,19,C.muted,true);text(s.control?'YOU CONTROL':phase>.6?'INFERRED MODEL':'OBSERVED STATES',867,244,20,C.green,true);
  const stats=[['SOURCE','Staggered fixture'],['SOURCE FRAME',String(session.frame+1)+' / '+scene.frame_count],['BRICKS LEFT',state?.alive_brick_ids?.length??'—'],['PHYSICS',scene.physics_hz+' Hz'],['MANUAL TIME',s.control?(state.elapsed||0).toFixed(2)+' s':'—']];stats.forEach(([k,v],i)=>{text(k,867,300+i*62,15,C.muted,true);text(v,867,326+i*62,21,C.ink,true);});
  if(s.control&&state.status!=='running'){if(s.lastStatus!==state.status){s.lastStatus=state.status;status(state.status==='won'?'All bricks cleared in your reconstructed branch.':'Branch ended. Reset, then take control to try again.');}rect(160,340,550,90,'#101315ee');text(state.status==='won'?'ALL BRICKS CLEARED':'BRANCH ENDED — RESET TO RETRY',190,392,24,C.ink,true);}
 }
 function drawIntent(){
  const s=states['intent-lab'];base('Intent Lab','RECORDED QWEN3-4B + V5 CHECKER / 27 OCT 2026');
  if(!s.runs){loadIntent();text('Loading actual agent run records…',65,250,30);return;}
  const r=s.runs[s.scenario];rect(40,155,535,515);rect(600,155,560,515);
  text(r.title,65,198,27,C.red);text('ORIGINAL USER REQUEST',65,244,18,C.muted,true);wrap(r.request,65,287,475,25,C.ink);
  text('MODEL-GENERATED PLAN',65,450,18,C.muted,true);r.model_generated_plan.steps.slice(0,3).forEach((a,i)=>text(a.name+'(...)',65,495+i*34,24,C.green,true));
  if(phase<.5){text('BEFORE EXTERNAL CONTENT',630,205,21,C.muted,true);wrap('The task defines the plan. Email content cannot grant permission to send or attach a file.',630,285,485,32,C.ink);}
  else if(phase<1.5){text('ACTUAL PROPOSALS & CHECKS',630,205,21,C.muted,true);r.events.slice(0,3).forEach((e,i)=>{const y=268+i*117;text(e.action.name,630,y,27,C.ink,true);text(e.assessment.predicted_label.toUpperCase(),630,y+35,19,C.green,true);text('PERMISSION '+e.trusted_permission.toUpperCase()+' / '+e.decision.toUpperCase(),630,y+66,17,C.muted,true);});}
  else {text('ACTUAL FINAL ANSWER',630,205,21,C.muted,true);wrap(r.state.answer,630,265,480,29,C.ink);text('MOCK SEND RECEIPTS: '+r.state.outbox.length,630,485,22,C.green,true);text('REAL EMAILS SENT: 0',630,532,22,C.green,true);text('RECORDED RUN / '+r.elapsed_seconds.toFixed(2)+' s',630,605,19,C.muted,true);}
 }
 function drawClubs(){
  const s=states.clubsphere;base('ClubSphere','TWO-SEAT EVENT / IN-MEMORY FIFO TRANSACTION EXPLANATION');
  const cols=[['EVENT',45],['CONFIRMED',430],['WAITLIST / FIFO',815]];
  cols.forEach(([name,x])=>{rect(x,170,340,445);text(name,x+25,215,22,C.ink,true);});
  text('Systems meetup',70,285,27);text('CAPACITY 02',70,350,23,C.muted,true);text(`SEATS ${s.bookings.booked.length} / 2`,70,420,31,C.red,true);
  s.bookings.booked.forEach((n,i)=>{rect(455,255+i*90,290,65,'#20332c');text(n,480,298+i*90,28,C.green);});
  s.bookings.waiting.forEach((n,i)=>{text(String(i+1).padStart(2,'0'),840,293+i*72,22,C.red,true);text(n,905,293+i*72,27);});
  line(385,390,420,390,C.green,3);line(770,390,805,390,C.red,3);
  if(phase>1.3)text('CANCEL A SEAT → PROMOTE THE EARLIEST WAITING STUDENT',65,666,20,C.muted,true);
 }
 function draw(now){animationFrame=0;if(!active||document.hidden||(document.querySelector('dialog[open]')&&!displayDialog.open)||(!dirty&&!animated()))return;
  if(!dirty&&now-lastDraw<1000/30-.5){schedule();return;}const dt=last?Math.min((now-last)/1000,.05):1/30;last=now;lastDraw=now;if(motion)time+=dt;
  if(projectId==='wnams')drawSignal();else if(projectId==='deepfake')drawDeepfake();else if(projectId==='vit-vault')drawVault();else if(projectId==='polyglot')drawPoly();else if(projectId==='realityforge')drawReality(dt);else if(projectId==='playable-replay')drawReplay(dt);else if(projectId==='intent-lab')drawIntent();else drawClubs();revision++;frameProjectId=projectId;dirty=false;frameListeners.forEach(fn=>fn(canvas));schedule();
 }
 async function action(){
  if(projectId==='wnams'){const s=states.wnams;s.version++;const x=.1+((s.version*37)%80)/100,y=.1+((s.version*23)%80)/100;s.samples.push({x,y,rssi:Math.round(-43-42*Math.hypot(x-.18,y-.2))});status(`Sample ${s.samples.length} added. Heatmap updated.`);}
  else if(projectId==='deepfake'){states.deepfake.sample^=1;status('Example score set changed. Aggregation recalculated.');}
  else if(projectId==='vit-vault'){const s=states['vit-vault'],bytes=new TextEncoder().encode('sample assignment version '+s.version),digest=await crypto.subtle.digest('SHA-256',bytes),hash=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join(''),r=s.outbox.submit(hash);status(r.duplicate?'Duplicate content: existing receipt retained.':`Receipt ${r.item.id}: ${r.item.state}.`);}
  else if(projectId==='polyglot'){const s=states.polyglot;if(s.examples){s.index=(s.index+1)%s.examples.length;status('Showing actual run: '+s.examples[s.index].file);}}
  else if(projectId==='realityforge'){const s=states.realityforge;s.x=.25+(s.x>.5?0:.4);s.y=.35+(s.y<.5?.25:0);status('Synthetic obstacle moved. The simulation responds.');}
  else if(projectId==='playable-replay'){const s=states['playable-replay'];if(!s.session){loadReplay();return;}if(s.control){s.session.returnToFootage();s.control=false;status('Returned to the actual recorded observations.');}else{if(!s.scene.snapshots[s.session.frame]?.takeover_ready)s.session.seek(s.scene.snapshots.findIndex(f=>f.takeover_ready));s.session.takeover();s.lastStatus=null;s.control=true;s.accumulator=0;status('You control the actual reconstructed paddle. Move over the display or use the slider.');}}
  else if(projectId==='intent-lab'){const s=states['intent-lab'];if(s.runs){s.scenario=(s.scenario+1)%s.runs.length;status('Actual recorded run: '+s.runs[s.scenario].title);}}
  else {const s=states.clubsphere,name=['Ada','Kai','Noor','Mira','Leo'][s.next%5];s.next++;status(`${name}: ${s.bookings.join(name)}.`);}
 }
 function bindControls(root,{prefix='demo'}={}){
  disposedControls.forEach(fn=>fn());disposedControls=[];
  const c=demoContent.find(x=>x.id===projectId),app=projectId==='polyglot'?'apps/polyglot/':c.app,liveLabel=projectId==='polyglot'?'Open real IDE':projectId==='realityforge'?'Enter playground':'Play full demo';root.innerHTML=`${app?`<button class="demo-launch" id="${prefix}-launch">${liveLabel}<span>↗</span></button>`:''}<button class="${app?'demo-secondary':'demo-action'}" id="${prefix}-action">${c.action}${app?'':'<span>↗</span>'}</button><button class="demo-secondary" id="${prefix}-secondary">${projectId==='vit-vault'?(states['vit-vault'].outbox.online?'Go offline':'Reconnect'):projectId==='clubsphere'?'Cancel first seat':'Reset'}</button>${projectId==='playable-replay'?`<label class="demo-slider-label">Paddle<input id="${prefix}-paddle" type="range" min="10" max="90" value="50" aria-label="Paddle position"></label>`:''}`;
  root.querySelector('#'+prefix+'-launch')?.addEventListener('click',()=>dispatchEvent(new CustomEvent('portfolio-launch-app',{detail:{id:projectId}})));

  root.querySelector('#'+prefix+'-action').addEventListener('click',()=>{action().then(()=>dispatchEvent(new CustomEvent('portfolio-demo-action',{detail:{id:projectId}}))).catch(()=>status('The demonstration could not update. Please reset it.'));});
  root.querySelector('#'+prefix+'-secondary').addEventListener('click',()=>{
   if(projectId==='vit-vault'){const s=states['vit-vault'];s.outbox.connect(!s.outbox.online);root.querySelector('#'+prefix+'-secondary').textContent=s.outbox.online?'Go offline':'Reconnect';status(s.outbox.online?'Connection restored. Queued submissions verified.':'Offline. New submissions stay in the local queue.');}
   else if(projectId==='clubsphere'){const s=states.clubsphere,promoted=s.bookings.cancel(s.bookings.booked[0]);status(promoted?`${promoted} promoted from the front of the waitlist.`:'Seat cancelled.');}
   else {reset();status('Demonstration reset.');}
  });
  const slider=root.querySelector('#'+prefix+'-paddle');slider?.addEventListener('input',()=>{const s=states['playable-replay'];if(!s.control)action();s.paddle=Number(slider.value)/100;});
 }
 function reset(){if(projectId==='wnams'){states.wnams.samples=states.wnams.samples.slice(0,3);states.wnams.version=0;}else if(projectId==='deepfake')states.deepfake.sample=0;else if(projectId==='polyglot')states.polyglot.index=0;else if(projectId==='realityforge')states.realityforge.x=.52;else if(projectId==='playable-replay'){const s=states['playable-replay'];if(s.session?.mode==='manual')s.session.returnToFootage();s.control=false;s.accumulator=0;s.hits=0;s.bricks=Array(28).fill(true);s.ball={x:.27,y:.64,vx:.16,vy:-.24};}else if(projectId==='intent-lab')states['intent-lab'].scenario=0;}
 function pointer(u,v,type){if(!['wnams','realityforge','playable-replay'].includes(projectId))return;dirty=true;schedule();if(projectId==='wnams'){states.wnams.cursor={x:clamp((u*1200-390)/770),y:clamp(((1-v)*760-155)/510)};if(type==='down'){const p=states.wnams.cursor;states.wnams.samples.push({...p,rssi:Math.round(-43-42*Math.hypot(p.x-.18,p.y-.2))});status('Survey point placed on the display.');}}else if(projectId==='realityforge'){states.realityforge.x=clamp((u*1200-55)/1090,.1,.9);states.realityforge.y=clamp(((1-v)*760-160)/510,.1,.9);}else if(projectId==='playable-replay'&&states['playable-replay'].control)states['playable-replay'].paddle=clamp((u*1200-45)/777,.05,.95);}
 canvas.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect();pointer((e.clientX-r.left)/r.width,1-(e.clientY-r.top)/r.height,'down');});canvas.addEventListener('pointermove',e=>{if(!e.buttons&&projectId!=='playable-replay')return;const r=canvas.getBoundingClientRect();pointer((e.clientX-r.left)/r.width,1-(e.clientY-r.top)/r.height,'move');});
 const visibility=()=>{if(document.hidden){cancelAnimationFrame(animationFrame);animationFrame=0;}else schedule();};document.addEventListener('visibilitychange',visibility);
 return {canvas,states,subscribeFrames(fn){frameListeners.add(fn);return ()=>frameListeners.delete(fn);},subscribeProjectChange(fn){projectListeners.add(fn);return ()=>projectListeners.delete(fn);},setProject(id){if(id!==projectId)projectListeners.forEach(fn=>fn(projectId,id));projectId=id;if(id==='polyglot')loadPoly();if(id==='playable-replay')loadReplay();if(id==='intent-lab')loadIntent();status('Scroll through the three stages, then try the controls.');},setProgress(p,on,m){const next=clamp(p,0,2);if(next!==phase||on!==active||m!==motion)dirty=true;phase=next;active=on;motion=m;if(!active){cancelAnimationFrame(animationFrame);animationFrame=0;}else schedule();},dispose(){disposed=true;frameListeners.clear();projectListeners.clear();cancelAnimationFrame(animationFrame);document.removeEventListener('visibilitychange',visibility);disposedControls.forEach(fn=>fn());},bindControls,pointer,get revision(){return revision;},get frameProjectId(){return frameProjectId;},get projectId(){return projectId;}};
}
