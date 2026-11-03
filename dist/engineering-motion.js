export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
// A single reversible scroll parameter; no timed flight competes with it.
export function titleFrame(progress,{portrait=false,tablet=false,motion=true}={}){
 const p=motion?clamp(progress):0,push=smooth(.14,.96,p);
 return {camera:[.18*(1-push),.12*(1-push),(tablet?11.4:portrait?9.1:7.9)*(1-push)-1.5*push],target:[0,0,-5],morph:smooth(.08,.65,p),rotation:[.34*(1-push),-.53*(1-push),-.21*(1-push)],typeOpacity:1-smooth(.10,.62,p),typeY:-70*push,caption:smooth(.62,.78,p)*(1-smooth(.9,1,p)),wash:smooth(.82,1,p),artScale:1+push*.5};
}
export function elementFlight(from,to){
 // Resize a single image frame instead of stretching its image pixels.
 return {left:`${to.left}px`,top:`${to.top}px`,width:`${to.width}px`,height:`${to.height}px`};
}

// Longer routes and turns receive more time, without delaying small controls.
export function journeyDuration(distance,angle=0){return clamp(1500+Math.max(0,distance)*30+Math.max(0,angle)*240,1700,3200);}

export function journeyArc(distance,t){return clamp((distance-30)*.25,0,16)*Math.sin(Math.PI*clamp(t));}
