// Opt-in, local inspection only. No analytics, storage, or network reporting.
export function startPerformanceAudit(){
 if(!new URL(location.href).searchParams.has('audit'))return;
 const data={environment:'browser session; not a physical-phone benchmark',viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,frames:0,frameIntervals:[],longTasks:0,layoutShift:0};
 const node=document.createElement('script');node.type='application/json';node.id='performance-audit';document.body.append(node);
 function publish(){const resources=performance.getEntriesByType('resource');data.resources=resources.map(r=>({path:new URL(r.name).pathname,transferBytes:r.transferSize,decodedBytes:r.decodedBodySize,durationMs:Math.round(r.duration)}));data.worldLoaded=resources.some(r=>r.name.includes('world.bundle'));data.loadedResourceBytes=resources.reduce((n,r)=>n+r.decodedBodySize,0);data.paints=performance.getEntriesByType('paint').map(p=>({name:p.name,ms:Math.round(p.startTime)}));data.longestFrameMs=Math.round(Math.max(0,...data.frameIntervals));const sorted=[...data.frameIntervals].sort((a,b)=>a-b);data.medianFrameMs=sorted.length?Math.round(sorted[Math.floor(sorted.length/2)]):null;node.textContent=JSON.stringify(data);}
 if('PerformanceObserver' in window){for(const type of ['longtask','layout-shift'])try{new PerformanceObserver(list=>{for(const e of list.getEntries()){if(type==='longtask')data.longTasks++;else if(!e.hadRecentInput)data.layoutShift+=e.value;}}).observe({type,buffered:true});}catch{}}
 let last=0;
 function frame(now){if(document.hidden){last=0;requestAnimationFrame(frame);return;}if(last)data.frameIntervals.push(now-last);last=now;data.frames++;if(data.frames%30===0)publish();if(data.frames<180)requestAnimationFrame(frame);else publish();}
 publish();requestAnimationFrame(frame);
}
