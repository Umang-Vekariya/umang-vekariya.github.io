export const profileStops=[
 {id:'person',label:'THE PERSON',name:'Always asking why',x:3,z:-1.2},
 {id:'learning',label:'EDUCATION & TOOLKIT',name:'Learning by building',x:3,z:-4.4},
 {id:'experience',label:'BEYOND THE CLASSROOM',name:'Experience & direction',x:3,z:-7.6}
];
export const profileEnd=2.65;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export function smoother(a,b,v){const t=clamp((v-a)/(b-a));return clamp(t*t*t*(t*(t*6-15)+10));}
export function profileWeight(index,phase){
 // Spatial installations crossfade throughout the move; the room never goes empty.
 return (index===0?1:smoother(index-.8,index-.2,phase))*(index===2?1:1-smoother(index+.2,index+.8,phase));
}
export function profilePlacement({portrait=false,aspect=1.78}={}){
 const distance=portrait?12.6:11.8,halfHeight=distance*Math.tan(35*Math.PI/360),halfWidth=halfHeight*aspect;
 const scale=portrait?Math.min(.44,halfWidth*1.75/6.8):Math.min(.82,halfWidth*.76/6.8);
 return {scale,x:portrait?0:3,y:portrait?2.03:.1,cameraX:portrait?0:3-halfWidth*.47,distance};
}
export function profileShot(index,{portrait=false,aspect=1.78}={}){
 const s=profileStops[index],fit=profilePlacement({portrait,aspect});
 return {position:[fit.cameraX,.4,s.z+fit.distance],target:[fit.cameraX,.1,s.z]};
}
export function profileRail(phase,options={}){
 const p=clamp(phase,0,profileEnd),segment=Math.min(1,Math.floor(p)),blend=smoother(segment+.2,segment+.8,p),a=profileShot(segment,options),b=profileShot(segment+1,options);
 return {position:a.position.map((v,i)=>v+(b.position[i]-v)*blend),target:a.target.map((v,i)=>v+(b.target[i]-v)*blend)};
}
export function profileAtProgress(progress){const phase=clamp(progress)*profileEnd;return {phase,index:Math.min(2,Math.round(phase))};}
export function profilePhaseAtScroll(y,anchors){
 let i=0;while(i<2&&y>=anchors[i+1])i++;
 if(i===2)return 2+clamp((y-anchors[2])/Math.max(1,anchors[2]-anchors[1]))*.65;
 return i+clamp((y-anchors[i])/Math.max(1,anchors[i+1]-anchors[i]));
}
