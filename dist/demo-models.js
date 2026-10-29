// Small, browser-local explanations. These do not impersonate the original backends.
export function interpolateRSSI(samples,x,y){
 let total=0,weights=0;
 for(const s of samples){const d=(x-s.x)**2+(y-s.y)**2;if(d<1e-8)return s.rssi;const w=1/d;total+=s.rssi*w;weights+=w;}
 return weights?total/weights:-100;
}
// The repository's predict_fast.py averages the three largest frame scores.
export function aggregateFrames(scores){if(scores.length<3)return {label:0,probability:0};const top=[...scores].sort((a,b)=>b-a).slice(0,3),probability=top.reduce((a,b)=>a+b,0)/3;return {label:probability>=.5?1:0,probability};}
export class Outbox{
 constructor(){this.online=false;this.items=[];}
 submit(hash){const previous=this.items.find(x=>x.hash===hash);if(previous)return {duplicate:true,item:previous};const item={id:this.items.length+1,hash,state:this.online?'verified':'queued'};this.items.push(item);return {duplicate:false,item};}
 connect(value){this.online=value;if(value)this.items.forEach(x=>x.state='verified');}
}
export class BookingQueue{
 constructor(capacity=2){this.capacity=capacity;this.booked=[];this.waiting=[];}
 join(name){if(this.booked.includes(name)||this.waiting.includes(name))return 'already joined';if(this.booked.length<this.capacity){this.booked.push(name);return 'booked';}this.waiting.push(name);return 'waitlisted';}
 cancel(name){const i=this.booked.indexOf(name);if(i>=0){this.booked.splice(i,1);const next=this.waiting.shift();if(next)this.booked.push(next);return next||null;}const q=this.waiting.indexOf(name);if(q>=0)this.waiting.splice(q,1);return null;}
}
export function fitMotion(points){
 const n=points.length;if(n<2)throw new Error('Two observations are required.');
 const mean=key=>points.reduce((s,p)=>s+p[key],0)/n,mt=mean('t'),mx=mean('x'),my=mean('y');
 const denominator=points.reduce((s,p)=>s+(p.t-mt)**2,0);if(!denominator)throw new Error('Observation times must differ.');
 const vx=points.reduce((s,p)=>s+(p.t-mt)*(p.x-mx),0)/denominator,vy=points.reduce((s,p)=>s+(p.t-mt)*(p.y-my),0)/denominator;
 return {vx,vy,predict:t=>({x:mx+vx*(t-mt),y:my+vy*(t-mt)})};
}
export function explainAction(scenario){
 if(scenario===2)return {label:'INSUFFICIENT CONTEXT',reason:'A recipient was proposed, but the user supplied no recipient.',permission:'REQUEST CLARIFICATION'};
 if(scenario===1)return {label:'MISALIGNED',reason:'The user asked for a draft. The proposal tries to send it.',permission:'DO NOT EXECUTE'};
 return {label:'ALIGNED',reason:'The proposal creates the requested draft without sending it.',permission:'DRAFT ONLY'};
}
