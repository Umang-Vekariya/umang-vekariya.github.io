import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {NeuralNetwork} from '../dist/model.js';
import {makeExperiment,noisyExamples} from '../dist/neural-studio.js';

test('backpropagation matches numerical gradients in both hidden layers and the output',()=>{
 const point={x:.3,y:-.7,label:1},rate=1e-4,epsilon=1e-5;
 for(const [key,row,column] of [['w1',1,0],['w2',2,1],['w3',2],['b3']]){
  const n=new NeuralNetwork(19,3);
  const get=()=>column!==undefined?n[key][row][column]:row!==undefined?n[key][row]:n[key];
  const set=v=>{if(column!==undefined)n[key][row][column]=v;else if(row!==undefined)n[key][row]=v;else n[key]=v;};
  const before=get();set(before+epsilon);const plus=n.evaluate([point]).loss;set(before-epsilon);const minus=n.evaluate([point]).loss;set(before);
  n.trainEpoch([point],rate);const analytical=(before-get())/rate,numerical=(plus-minus)/(2*epsilon);
  assert.ok(Math.abs(analytical-numerical)<1e-6,`${key}: ${analytical} vs ${numerical}`);
 }
});

test('all patterns cover both classes and train on data independent of the unseen set',()=>{
 for(const pattern of ['circles','moons','spiral']){
  const {training,testing}=makeExperiment(pattern);
  assert.equal(training.length,120);assert.equal(testing.length,80);
  for(const label of [0,1]){assert.equal(training.filter(p=>p.label===label).length,60);assert.equal(testing.filter(p=>p.label===label).length,40);}
  const seen=new Set(training.map(p=>`${p.x},${p.y}`));assert.ok(testing.every(p=>!seen.has(`${p.x},${p.y}`)));
  const n=new NeuralNetwork(43,6),before=n.evaluate(testing);
  for(let i=0;i<250;i++)n.trainEpoch(training,.025);
  const after=n.evaluate(testing);assert.ok(after.loss<before.loss*.5,pattern+' did not learn');assert.ok(after.accuracy>=.9,pattern+' does not generalize');
 }
 assert.deepEqual(makeExperiment('blank'),{training:[],testing:[]});
});

test('worker snapshots preserve exact inference at every offered network size',()=>{
 for(const width of [3,6,10]){
  const n=new NeuralNetwork(8,width),d=makeExperiment('circles');for(let i=0;i<5;i++)n.trainEpoch(d.training,.025);
  const copy=new NeuralNetwork(99,width);copy.restore(n.snapshot());
  for(const p of d.testing){assert.equal(n.forward(p.x,p.y),copy.forward(p.x,p.y));for(const layer of [1,2])assert.equal(n.activation(p.x,p.y,layer,0),copy.activation(p.x,p.y,layer,0));}
  assert.throws(()=>new NeuralNetwork(99,width+1).restore(n.snapshot()),/widths/);
 }
 assert.deepEqual(new NeuralNetwork().evaluate([]),{loss:null,accuracy:null});
});

test('test noise is repeatable, preserves labels and never mutates training or test examples',()=>{
 const d=makeExperiment(),original=JSON.stringify(d),noisy=noisyExamples(d.testing,.35);
 assert.deepEqual(noisy,noisyExamples(d.testing,.35));assert.equal(JSON.stringify(d),original);
 assert.ok(noisy.some((p,i)=>p.x!==d.testing[i].x));assert.ok(noisy.every((p,i)=>p.label===d.testing[i].label&&Math.abs(p.x)<=1&&Math.abs(p.y)<=1));
 assert.deepEqual(noisyExamples(d.testing,0),d.testing);
});

test('worker resets discard the old training run and do not train while offscreen',async()=>{
 const url=new URL('../dist/neural-worker.js',import.meta.url).href;
 const boot=`import {parentPort} from 'node:worker_threads';globalThis.self=globalThis;globalThis.postMessage=m=>parentPort.postMessage(m);await import(${JSON.stringify(url)});parentPort.on('message',data=>self.onmessage({data}));`;
 const worker=new Worker(new URL('data:text/javascript,'+encodeURIComponent(boot)));
 const waitFor=predicate=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>{worker.off('message',listen);reject(new Error('Worker response timed out'));},3000);function listen(m){if(predicate(m)){clearTimeout(timer);worker.off('message',listen);resolve(m);}}worker.on('message',listen);});
 try{
  let response=waitFor(m=>m.version===1);worker.postMessage({type:'reset',version:1,seed:43,width:6,points:makeExperiment().training});assert.equal((await response).epoch,0);
  worker.postMessage({type:'visible',version:1,visible:false});response=waitFor(m=>m.version===1&&m.running);worker.postMessage({type:'run',version:1,running:true});assert.equal((await response).epoch,0);
  response=waitFor(m=>m.version===2);worker.postMessage({type:'reset',version:2,seed:44,width:3,points:[]});const fresh=await response;assert.equal(fresh.epoch,0);assert.equal(fresh.running,false);assert.equal(fresh.state.width,3);
  response=waitFor(m=>m.version===2);worker.postMessage({type:'run',version:2,running:true});const empty=await response;assert.equal(empty.running,false);assert.equal(empty.epoch,0);
 }finally{await worker.terminate();}
});
