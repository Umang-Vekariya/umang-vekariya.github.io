export const profileStops=[
 {id:'person',label:'THE PERSON',name:'Always asking why',x:7,z:4},
 {id:'learning',label:'EDUCATION & TOOLKIT',name:'Learning by building',x:-7,z:5},
 {id:'experience',label:'BEYOND THE CLASSROOM',name:'Experience & direction',x:7,z:14}
];
export const profileEnd=2.65;
export function profileShot(index,{portrait=false,aspect=1.78,phase=0}={}){
 const s=profileStops[index],side=s.x<0?1:-1,distance=portrait?12.6:Math.min(12.6,Math.max(10.8,15/aspect));
 const center=s.z+side*(portrait?0:aspect<1.25?1.1:2.35);
 return {position:[s.x+side*(distance-Math.max(0,phase-index)*.15),portrait?.4:.7,center],target:[s.x,portrait?-.08:.1,center]};
}
export function profileAtProgress(progress){const phase=Math.max(0,Math.min(1,progress))*profileEnd;return {phase,index:Math.min(profileStops.length-1,Math.round(phase))};}
