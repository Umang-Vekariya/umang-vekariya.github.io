import {clamp,smooth} from './engineering-motion.js';
export const galleryCenter=[0,0,-65];
export const stations=Array.from({length:8},(_,i)=>{const angle=Math.PI*.5+i*Math.PI/4;return {angle,x:Math.cos(angle)*31,z:-65+Math.sin(angle)*27,yaw:Math.atan2(-Math.cos(angle),-Math.sin(angle))};});
export function mixShot(a,b,t){const p=smooth(0,1,t);return {position:a.position.map((v,i)=>v+(b.position[i]-v)*p),target:a.target.map((v,i)=>v+(b.target[i]-v)*p),fov:a.fov+(b.fov-a.fov)*p};}
export function stationShot(index,{portrait=false,phase=0,focus=false}={}){
 const s=typeof index==='number'?stations[index]:index,n=[-Math.cos(s.angle),-Math.sin(s.angle)],r=[n[1],-n[0]],distance=focus?(portrait?17:13):(portrait?29:21),offset=portrait?3:-2;
 return {position:[s.x+n[0]*distance+r[0]*offset,portrait?7.8:5.9,s.z+n[1]*distance+r[1]*offset],target:[s.x+r[0]*offset,portrait?1.8:5.3,s.z+r[1]*offset],fov:portrait?52:36};
}
export function spatialShot({chapter='home',progress=0,index=0,phase=0,portrait=false,galleryPortrait=portrait,compactHero=false}={}){
 const p=clamp(progress),start={position:[0,5.2,portrait||compactHero?26:19],target:[portrait?4.6:compactHero?1.5:0,portrait?8:5,0],fov:portrait?50:compactHero?40:36},arrival={position:[4.5,5.2,-3],target:[4.5,4.5,-18],fov:portrait?50:36};
 const person={position:[-9,5,-15],target:[-2,3.5,-25],fov:portrait?50:36},education={position:[9,7,-27],target:[0,4,-42],fov:portrait?50:36},overview={position:[0,34,-17],target:[0,1,-65],fov:galleryPortrait?58:48};
 if(chapter==='home')return mixShot(start,arrival,smooth(.12,1,p));
 if(chapter==='about')return mixShot(arrival,person,p);
 if(chapter==='education')return mixShot(person,education,p);
 if(chapter==='arrival')return mixShot(education,overview,p);
 if(chapter==='gallery'){const current=stationShot(index,{portrait:galleryPortrait,phase});if(index===0&&phase<.18)return mixShot(overview,current,smooth(0,.18,phase));if(phase>.72&&index<7){const a=stations[index].angle+smooth(.72,1,phase)*Math.PI/4;return stationShot({angle:a,x:Math.cos(a)*31,z:-65+Math.sin(a)*27},{portrait:galleryPortrait});}return current;}
 if(chapter==='contact')return {position:[-2,9,-15],target:[4.5,5.2,0],fov:portrait?50:36};
 return overview;
}
