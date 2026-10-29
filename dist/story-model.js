const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
// One chronological track: each project owns an equal span and three stages.
export function storyAtProgress(progress,count){
 const position=clamp(progress,0,1)*count,index=Math.min(count-1,Math.floor(position));
 return {index,phase:clamp((position-index)*2.8-.15,0,2.6)};
}
export function storyProgress(index,phase,count){return (clamp(index,0,count-1)+(clamp(phase,0,2.6)+.15)/2.8)/count;}
