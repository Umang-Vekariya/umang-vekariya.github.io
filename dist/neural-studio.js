import {NeuralNetwork,createDataset,randomGenerator} from './model.js?v=2';

export function makeExperiment(pattern='circles',seed=42){
 if(pattern==='blank')return {training:[],testing:[]};
 // Independent draws from the same generator, balanced within both classes.
 return {training:createDataset(pattern,seed).filter((_,i)=>i%5<3),testing:createDataset(pattern,seed+2909).filter((_,i)=>i%5>=3)};
}
export function noisyExamples(points,amount,seed=803){
 const rng=randomGenerator(seed);
 return points.map(p=>({...p,x:Math.max(-1,Math.min(1,p.x+(rng()*2-1)*amount)),y:Math.max(-1,Math.min(1,p.y+(rng()*2-1)*amount))}));
}
export function initNeuralStudio(){
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const canvas=$('#studio-canvas'),ctx=canvas.getContext('2d'),loss=$('#studio-loss'),lc=loss.getContext('2d'),wires=$('#studio-wires'),wc=wires.getContext('2d');
 if(!ctx||!lc||!wc)return;
 const worker=new Worker(new URL('./neural-worker.js?v=1',import.meta.url),{type:'module'});
 const heat=document.createElement('canvas');heat.width=128;heat.height=128;const hc=heat.getContext('2d'),image=hc.createImageData(128,128),fieldValues=new Float32Array(128*128);
 let pattern='spiral',data=makeExperiment('spiral'),testing=data.testing,network=new NeuralNetwork(42,6),seed=42,version=0,epoch=0,running=false,visible=false,stage='learn',width=6,rate=.025,tool='probe',showTest=false,noise=0,selected=null,w=0,h=0,probe={x:0,y:0,active:false},lastPoint=null,drawing=false,strokeStart=0,strokes=[],features=[],history=[],lastHistoryEpoch=-1,queued=false,workerFailed=false;
 const palette={a:[174,211,194],b:[231,151,115]};
 const percentage=v=>v===null?'—':Math.round(v*100)+'%';
 function send(type,extra={}){worker.postMessage({type,version,...extra});}
 function announce(message){const el=$('#studio-insight');if(el.textContent!==message)el.textContent=message;}
 function status(){
  $('#studio-train').innerHTML=running?'Pause learning <span>Ⅱ</span>':epoch>=3000?'Train again <span>↶</span>':epoch?'Continue learning <span>↗</span>':'Start learning <span>↗</span>';
  $('#studio-train').setAttribute('aria-pressed',String(running));
  $('#studio-status').textContent=workerFailed?'Training unavailable':running?'Learning in real time':epoch>=3000?'Training complete':epoch?'Paused · ready to explore':'Ready to learn';
 }
 function updateMetrics(record=false){
  const train=network.evaluate(data.training),test=network.evaluate(testing);
  $('#studio-learn-accuracy').textContent=percentage(train.accuracy);$('#studio-train-accuracy').textContent=percentage(train.accuracy);$('#studio-test-accuracy').textContent=percentage(test.accuracy);$('#studio-epoch').textContent=String(epoch).padStart(4,'0');$('#studio-sample-count').textContent=(showTest?testing.length:data.training.length)+(showTest?' unseen examples':' examples');
  if(record&&epoch!==lastHistoryEpoch){history.push({epoch,train:train.loss,test:test.loss});lastHistoryEpoch=epoch;if(history.length>180)history.shift();}
  drawLoss();
  // Update interpretation sparingly; live metrics themselves are not live regions.
  if(record&&epoch>0&&epoch%25<4&&!selected){
   if(noise>0&&testing.length)announce('The unseen examples have added noise. The training data is unchanged; compare the two scores to see the effect.');
   else if(!testing.length)announce('Your own data is training. There is no independent test set for a drawing; training accuracy alone does not tell us how well it generalizes.');
   else if(train.accuracy-test.accuracy>.12)announce('The gap matters: it knows the training examples better than the unseen ones. Try a smaller network, or add examples in the regions it misses.');
   else if(test.accuracy>.95)announce('It is getting the unseen examples right. Reveal them, then add test noise to find the limits of that decision boundary.');
  }
 }
 function dimensions(c,context){const r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,1.5);c.width=Math.max(1,Math.round(r.width*d));c.height=Math.max(1,Math.round(r.height*d));context.setTransform(d,0,0,d,0,0);return r;}
 function resize(){const r=dimensions(canvas,ctx);w=r.width;h=r.height;dimensions(loss,lc);dimensions(wires,wc);schedule();}
 function pointToPixel(p){const pad=38;return [pad+(p.x+1)*.5*(w-pad*2),pad+(1-p.y)*.5*(h-pad*2)];}
 function pixelToPoint(x,y){const pad=38;return {x:Math.max(-1,Math.min(1,(x-pad)/(w-pad*2)*2-1)),y:Math.max(-1,Math.min(1,1-(y-pad)/(h-pad*2)*2))};}
 function render(){
  if(!w||!h)return;
  ctx.fillStyle='#0c171c';ctx.fillRect(0,0,w,h);
  for(let iy=0;iy<128;iy++)for(let ix=0;ix<128;ix++){
   const x=ix/127*2-1,y=1-iy/127*2,raw=selected?network.activation(x,y,selected.layer,selected.index):network.forward(x,y),p=selected?(raw+1)/2:raw,confidence=Math.abs(p-.5)*2,ixy=iy*128+ix,i=ixy*4;
   fieldValues[ixy]=p;
   for(let k=0;k<3;k++){const col=palette.a[k]*(1-p)+palette.b[k]*p;image.data[i+k]=Math.round([14,25,29][k]+col*(.035+.25*confidence));}image.data[i+3]=255;
  }
  hc.putImageData(image,0,0);ctx.imageSmoothingEnabled=true;ctx.drawImage(heat,38,38,w-76,h-76);
  ctx.lineWidth=.6;ctx.strokeStyle='#bbd8ce0c';for(let i=0;i<=8;i++){const v=38+i/8*(w-76),u=38+i/8*(h-76);ctx.beginPath();ctx.moveTo(v,38);ctx.lineTo(v,h-38);ctx.moveTo(38,u);ctx.lineTo(w-38,u);ctx.stroke();}
  // Interpolate the p=0.5 contour between samples so the boundary stays smooth.
  if(!selected){
   const dx=(w-76)/127,dy=(h-76)/127;ctx.beginPath();
   for(let iy=0;iy<127;iy++)for(let ix=0;ix<127;ix++){
    const x=38+ix*dx,y=38+iy*dy;
    const values=[fieldValues[iy*128+ix],fieldValues[iy*128+ix+1],fieldValues[(iy+1)*128+ix+1],fieldValues[(iy+1)*128+ix]];
    const corners=[[x,y],[x+dx,y],[x+dx,y+dy],[x,y+dy]],crossings=[];
    for(let a=0;a<4;a++){const b=(a+1)%4;if((values[a]>=.5)===(values[b]>=.5))continue;const t=(.5-values[a])/(values[b]-values[a]);crossings.push([corners[a][0]+t*(corners[b][0]-corners[a][0]),corners[a][1]+t*(corners[b][1]-corners[a][1])]);}
    if(crossings.length===2){ctx.moveTo(...crossings[0]);ctx.lineTo(...crossings[1]);}
    else if(crossings.length===4){const same=(values[0]>=.5)===(values.reduce((a,b)=>a+b,0)/4>=.5),pairs=same?[[0,1],[2,3]]:[[0,3],[1,2]];for(const [a,b] of pairs){ctx.moveTo(...crossings[a]);ctx.lineTo(...crossings[b]);}}
   }
   ctx.strokeStyle='#ddd9c48c';ctx.lineWidth=1;ctx.stroke();
  }
  const samples=showTest?testing:data.training;
  for(const p of samples){const [x,y]=pointToPixel(p);ctx.beginPath();ctx.arc(x,y,showTest?3.5:2.8,0,Math.PI*2);ctx.fillStyle=p.label?'#e9a17d':'#bfdbcc';ctx.strokeStyle=p.label?'#e9a17d':'#bfdbcc';ctx.lineWidth=showTest?1.35:1;
   if(showTest)ctx.stroke();else{ctx.fill();ctx.strokeStyle='#101b20';ctx.stroke();}
   if(showTest&&(network.forward(p.x,p.y)>=.5?1:0)!==p.label){ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.strokeStyle='#e49a7944';ctx.lineWidth=1;ctx.stroke();}
  }
  if(probe.active){const [x,y]=pointToPixel(probe);ctx.setLineDash([3,4]);ctx.strokeStyle='#e0e0c16b';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x,38);ctx.lineTo(x,h-38);ctx.moveTo(38,y);ctx.lineTo(w-38,y);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.strokeStyle='#eee7db';ctx.stroke();}
  updateProbe();drawNetwork();
 }
 function updateProbe(){
  $('#studio-probe').hidden=!probe.active;
  const p=network.forward(probe.x,probe.y);
  $('#studio-output').textContent=Math.round(p*100)+'%';$('#studio-output').title='Probability of class B at the selected position';
  const values=[[probe.x,probe.y],network.h1,network.h2,[p]];
  features.forEach(f=>{const activation=values[f.layer][f.index];f.el.style.borderColor=activation>=0?'#b3d2c388':'#e49a7988';});
  if(probe.active){$('#studio-probe').firstElementChild.textContent=`x ${probe.x.toFixed(2)} · y ${probe.y.toFixed(2)}`;$('#studio-probe').lastElementChild.textContent=`Class ${p>=.5?'B':'A'} · ${Math.round(Math.max(p,1-p)*100)}% confidence`;}
 }
 function colorFeature(value){const t=(value+1)/2;return palette.a.map((a,i)=>Math.round(a*(1-t)+palette.b[i]*t));}
 function drawNetwork(){
  const r=wires.getBoundingClientRect();if(!r.width||!r.height)return;wc.clearRect(0,0,r.width,r.height);
  const layers=[$$('#studio-network .studio-input'),features.filter(f=>f.layer===1).map(f=>f.el),features.filter(f=>f.layer===2).map(f=>f.el),[$('#studio-output')]];
  const center=e=>{const b=e.getBoundingClientRect();return [b.x-r.x+b.width/2,b.y-r.y+b.height/2];};
  for(let l=0;l<3;l++)for(let j=0;j<layers[l].length;j++)for(let k=0;k<layers[l+1].length;k++){
   const weight=l===0?network.w1[k][j]:l===1?network.w2[k][j]:network.w3[j],a=center(layers[l][j]),b=center(layers[l+1][k]);
   const chosen=selected&&(selected.layer===l&&selected.index===j||selected.layer===l+1&&selected.index===k),opacity=Math.min(.42,.04+Math.abs(weight)*.10)*(selected&&!chosen ? .35 : 1);
   wc.strokeStyle=weight>=0?`rgba(179,210,195,${opacity})`:`rgba(228,154,121,${opacity})`;wc.lineWidth=chosen?1.3:.7;wc.beginPath();wc.moveTo(...a);wc.bezierCurveTo(a[0]+22,a[1],b[0]-22,b[1],...b);wc.stroke();
  }
  for(const f of features){const im=f.ctx.createImageData(16,16);for(let y=0;y<16;y++)for(let x=0;x<16;x++){const value=network.activation(x/15*2-1,1-y/15*2,f.layer,f.index),c=colorFeature(value),i=(y*16+x)*4;im.data[i]=c[0]*.6;im.data[i+1]=c[1]*.6;im.data[i+2]=c[2]*.6;im.data[i+3]=255;}f.ctx.putImageData(im,0,0);}
 }
 function drawLoss(){
  const r=loss.getBoundingClientRect(),ch=r.height,cw=r.width;if(!cw||!ch)return;lc.clearRect(0,0,cw,ch);lc.lineWidth=.6;lc.strokeStyle='#b5d2c719';for(let i=1;i<4;i++){lc.beginPath();lc.moveTo(0,ch*i/4);lc.lineTo(cw,ch*i/4);lc.stroke();}
  if(history.length<2)return;const max=Math.max(.2,...history.flatMap(v=>[v.train||0,v.test||0]));
  for(const [key,color] of [['train','#e49a79'],['test','#b3d2c3']]){lc.beginPath();let started=false;history.forEach((v,i)=>{if(v[key]===null)return;const x=i/(history.length-1)*cw,y=ch-3-v[key]/max*(ch-6);started?lc.lineTo(x,y):lc.moveTo(x,y);started=true;});lc.strokeStyle=color;lc.lineWidth=1.4;lc.stroke();}
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;render();});}}
 function inspect(layer,index){selected=selected?.layer===layer&&selected.index===index?null:{layer,index};features.forEach(f=>f.el.setAttribute('aria-pressed',String(selected?.layer===f.layer&&selected?.index===f.index)));$('#studio-show-output').hidden=!selected;$('#studio-field-label').textContent=selected?`Layer ${layer} · Neuron ${index+1}`:showTest?'Unseen examples':'Prediction field';$('#studio-neuron-hint').textContent=selected?`Layer ${layer}, neuron ${index+1}: mint means negative activation; copper means positive. The pattern changes as it learns.`:'Each window shows one learned feature.';schedule();}
 function setStage(next){
  if(!['learn','inspect','challenge'].includes(next))return;
  finishStroke();if(next==='challenge'&&running)setRunning(false);stage=next;$('#neural-console').dataset.stage=stage;
  $$('[data-studio-stage]').forEach(tab=>{const active=tab.dataset.studioStage===stage;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;$('#studio-pane-'+tab.dataset.studioStage).hidden=!active;});
  $('#studio-teaching').hidden=stage!=='learn';
  if(selected)inspect(selected.layer,selected.index);
  probe.active=false;
  showTest=stage==='challenge'&&testing.length>0;$('#studio-test').setAttribute('aria-pressed',String(showTest));
  $('#studio-field-label').textContent=showTest?'Unseen examples':'Prediction field';
  $('#studio-test-note').textContent=testing.length?'Hollow dots are unseen examples. A halo marks a wrong prediction.':'Your drawing has no separate test set. Choose a starting pattern in Learn to compare unseen examples.';
  $('#studio-test').disabled=!testing.length;$('#studio-test').hidden=!testing.length;$('#studio-noise').disabled=!testing.length;$('#studio-pane-challenge .studio-test-controls').hidden=!testing.length;
  if(stage!=='learn')setTool('probe');
  announce(stage==='inspect'?(running?'Features update as the model learns. Select a neuron to explore its response.':'Select a neuron to explore its response.'):stage==='challenge'?(testing.length?'Training is paused. Add noise to see where the learned pattern breaks.':'This drawing has no independent test set. Choose a starting pattern in Learn to try the test.'):epoch?'Your examples and learned weights are preserved.': 'Start learning to see the boundary change.');
  updateMetrics();resize();
 }
 function buildNetwork(){features=[];for(const layer of [1,2]){const parent=$('#studio-layer-'+layer);parent.replaceChildren();for(let index=0;index<width;index++){const el=document.createElement('button'),c=document.createElement('canvas');el.type='button';el.className='studio-neuron';el.setAttribute('aria-label',`Inspect layer ${layer}, neuron ${index+1}`);el.setAttribute('aria-pressed','false');c.width=c.height=16;c.setAttribute('aria-hidden','true');el.append(c);el.addEventListener('click',()=>inspect(layer,index));parent.append(el);features.push({layer,index,el,ctx:c.getContext('2d')});}}$('#studio-network').dataset.width=String(width);$('#studio-architecture').textContent=`2 → ${width} → ${width} → 1`;}
 function setRunning(value){
  if(workerFailed)return;
  if(value&&(!data.training.some(p=>p.label===0)||!data.training.some(p=>p.label===1))){announce('Give it both classes first. Draw a few examples of A, then add some of B.');return;}
  if(value&&epoch>=3000){announce('This run reached 3000 epochs. Reset the model to try a fresh initialization.');return;}
  running=value;status();send('run',{running});if(value)announce('Learning from your examples. Open Inspect to look inside, or Challenge to test the pattern.');
 }
 function reset({rebuild=false}={}){version++;epoch=0;running=false;history=[];lastHistoryEpoch=-1;network=new NeuralNetwork(++seed,width);selected=null;if(rebuild)buildNetwork();features.forEach(f=>f.el.setAttribute('aria-pressed','false'));$('#studio-show-output').hidden=true;$('#studio-field-label').textContent=showTest?'Unseen examples':'Prediction field';$('#studio-neuron-hint').textContent='Each window shows one learned feature.';send('reset',{seed,width,points:data.training});send('rate',{rate});send('visible',{visible:visible&&!document.hidden});status();updateMetrics(true);schedule();}
 function loadPattern(next){pattern=next;data=makeExperiment(pattern);testing=noisyExamples(data.testing,noise);strokes=[];$('#studio-undo').disabled=true;showTest=false;$('#studio-test').setAttribute('aria-pressed','false');$('#studio-test').disabled=!testing.length;$('#studio-noise').disabled=!testing.length;$('#studio-pattern').value=pattern;reset();setStage('learn');setTool(pattern==='blank'?'0':'probe');announce(pattern==='blank'?'A blank canvas. Draw examples of both classes, then start learning. There is no unseen accuracy for your drawing until you provide an independent test set.':'A fresh pattern and independent unseen examples. Start learning, then reveal the unseen data to check whether it learned the rule.');}
 function setTool(next){tool=next;$$('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tool===tool)));canvas.dataset.drawing=String(tool!=='probe');$('#studio-field-help').textContent=tool==='probe'?'Choose a class to add examples. Probe lets you explore predictions.':`Draw class ${tool==='0'?'A':'B'}. Arrow keys move; Space adds a point. On touch, choose Probe to scroll.`;}
 function addPoint(p){if(showTest){showTest=false;$('#studio-test').setAttribute('aria-pressed','false');if(!selected)$('#studio-field-label').textContent='Prediction field';}if(data.training.length>=500){announce('The canvas has 500 examples. Undo a stroke or choose a fresh pattern to make more room.');return;}data.training.push({...p,label:Number(tool)});lastPoint={...p};history=[];lastHistoryEpoch=-1;updateMetrics();schedule();}
 function finishStroke(){if(!drawing)return;drawing=false;if(data.training.length>strokeStart){strokes.push(strokeStart);$('#studio-undo').disabled=false;send('samples',{points:data.training});announce('Examples added. Start learning to update the boundary with your changes.');}lastPoint=null;}
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;const b=canvas.getBoundingClientRect();probe={...pixelToPoint(e.clientX-b.left,e.clientY-b.top),active:true};if(tool!=='probe'){e.preventDefault();setRunning(false);strokeStart=data.training.length;drawing=true;canvas.setPointerCapture(e.pointerId);addPoint(probe);}schedule();});
 canvas.addEventListener('pointermove',e=>{const b=canvas.getBoundingClientRect();probe={...pixelToPoint(e.clientX-b.left,e.clientY-b.top),active:true};if(drawing&&(!lastPoint||Math.hypot(probe.x-lastPoint.x,probe.y-lastPoint.y)>.065))addPoint(probe);else schedule();});canvas.addEventListener('pointerup',finishStroke);canvas.addEventListener('pointercancel',finishStroke);canvas.addEventListener('lostpointercapture',finishStroke);canvas.addEventListener('pointerleave',()=>{if(!drawing){probe.active=false;schedule();}});
 canvas.addEventListener('keydown',e=>{const dirs={ArrowLeft:[-.06,0],ArrowRight:[.06,0],ArrowUp:[0,.06],ArrowDown:[0,-.06]};if(dirs[e.key]){e.preventDefault();probe={x:Math.max(-1,Math.min(1,probe.x+dirs[e.key][0])),y:Math.max(-1,Math.min(1,probe.y+dirs[e.key][1])),active:true};schedule();}else if((e.key===' '||e.key==='Enter')&&tool!=='probe'){e.preventDefault();setRunning(false);strokeStart=data.training.length;drawing=true;addPoint(probe);finishStroke();}});
 $$('[data-studio-stage]').forEach((tab,index,tabs)=>{
  tab.addEventListener('click',()=>setStage(tab.dataset.studioStage));
  tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();tabs[next].focus();setStage(tabs[next].dataset.studioStage);});
 });
 for(const id of ['#studio-advanced','#studio-history'])$(id).addEventListener('toggle',resize);
 $('#studio-train').addEventListener('click',()=>{if(epoch>=3000)reset();setRunning(!running);});$('#studio-reset').addEventListener('click',()=>{reset();announce('The weights are fresh. Your examples and test set are preserved.');});
 $('#studio-pattern').addEventListener('change',e=>loadPattern(e.target.value));$$('[data-tool]').forEach(b=>b.addEventListener('click',()=>setTool(b.dataset.tool)));
 $('#studio-undo').addEventListener('click',()=>{if(!strokes.length)return;setRunning(false);data.training.splice(strokes.pop());$('#studio-undo').disabled=!strokes.length;history=[];lastHistoryEpoch=-1;send('samples',{points:data.training});updateMetrics();schedule();announce('Last stroke removed. Continue learning with the remaining examples.');});
 $('#studio-width').addEventListener('change',e=>{width=Number(e.target.value);reset({rebuild:true});resize();announce('Network resized with fresh weights. Start learning to compare its capacity on the same data.');});
 $('#studio-rate').addEventListener('input',e=>{rate=Number(e.target.value)*.01;$('#studio-rate-value').textContent=rate.toFixed(3);send('rate',{rate});});
 $('#studio-test').addEventListener('click',()=>{showTest=!showTest;$('#studio-test').setAttribute('aria-pressed',String(showTest));$('#studio-field-label').textContent=selected?`Layer ${selected.layer} · Neuron ${selected.index+1}`:showTest?'Unseen examples':'Prediction field';announce(showTest?'Hollow dots are independent examples, never used for training. The extra ring marks a wrong prediction. Add test noise below to challenge the rule.':'Showing the training examples again. Filled dots are the examples used to update the network.');updateMetrics();schedule();});
 $('#studio-noise').addEventListener('input',e=>{setRunning(false);noise=Number(e.target.value)/100;$('#studio-noise-value').textContent=e.target.value+'%';testing=noisyExamples(data.testing,noise);showTest=true;$('#studio-test').setAttribute('aria-pressed','true');if(!selected)$('#studio-field-label').textContent='Unseen examples';history=[];lastHistoryEpoch=-1;updateMetrics(true);schedule();announce('Only the unseen examples moved. The model and training data have not changed; watch what happens to unseen accuracy.');});
 $('#studio-show-output').addEventListener('click',()=>{if(selected)inspect(selected.layer,selected.index);});$('#studio-output').addEventListener('click',()=>{if(selected)inspect(selected.layer,selected.index);else{probe.active=true;schedule();announce('The output is the model’s probability of class B at the cursor. Move the cursor to ask a different question.');}});
 worker.onmessage=({data:message})=>{if(message.version!==version)return;network.restore(message.state);epoch=message.epoch;running=message.running;status();updateMetrics(true);schedule();};
 worker.onerror=()=>{workerFailed=true;running=false;status();$('#studio-train').disabled=true;announce('Training could not start in this browser. The field is still interactive; refresh to retry.');};
 new ResizeObserver(resize).observe($('#studio-workspace')||$('#neural-console'));
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;send('visible',{visible:visible&&!document.hidden});if(visible)schedule();},{threshold:.02}).observe($('#neural-console'));
 document.addEventListener('visibilitychange',()=>send('visible',{visible:visible&&!document.hidden}));
 buildNetwork();reset();setStage('learn');
}
