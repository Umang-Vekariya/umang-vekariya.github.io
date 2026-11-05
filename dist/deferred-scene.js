// One resource, requested once. Download and construction happen outside the
// opening path; a late result can never attach after the world is disposed.
export function createDeferredScene({load,mount,onReady=()=>{},onError=()=>{},defer=task=>new Promise((resolve,reject)=>{
 const run=()=>{try{resolve(task());}catch(error){reject(error);}};
 if(typeof requestIdleCallback==='function')requestIdleCallback(run,{timeout:1200});else setTimeout(run,0);
})}){
 let pending=null,resource=null,disposed=false,state='idle';
 function preload(){
  if(disposed)return Promise.resolve(null);if(pending)return pending;state='loading';
  pending=Promise.resolve().then(load).then(module=>defer(()=>{
   if(disposed)return null;resource=mount(module);state='ready';onReady(resource);return resource;
  })).catch(error=>{if(!disposed){state='failed';onError(error);}return null;});
  return pending;
 }
 return {preload,get ready(){return state==='ready'&&!disposed;},get state(){return disposed?'disposed':state;},dispose(){if(disposed)return;disposed=true;resource?.dispose();resource=null;}};
}
