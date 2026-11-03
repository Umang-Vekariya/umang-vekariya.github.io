import * as THREE from 'three';
import {workshopShot,workshopStations} from './workshop-layout.js';
import {profileRail} from './profile-layout.js';
export const motionTokens=Object.freeze({follow:.085,navigate:1.25,focus:.72,return:.8,bank:.045});
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const ease=v=>{const t=clamp(v);return t*t*t*(t*(t*6-15)+10);};
export function blendPose(a,b,t){const v=ease(t);return {position:a.position.map((x,i)=>x+(b.position[i]-x)*v),target:a.target.map((x,i)=>x+(b.target[i]-x)*v),roll:(a.roll||0)+((b.roll||0)-(a.roll||0))*v};}
const rails=new Map();
function rail(key,positions,targets,t){
 let pair=rails.get(key);if(!pair){if(rails.size>=96)rails.clear();pair=[positions,targets].map(points=>new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal',.5));rails.set(key,pair);}
 return {position:pair[0].getPoint(clamp(t)).toArray(),target:pair[1].getPoint(clamp(t)).toArray(),roll:0};
}
export function overviewPose(phase,options={}){const p=profileRail(phase,options);return {position:p.position.map((v,i)=>v-(i===2?18:0)),target:p.target.map((v,i)=>v-(i===2?18:0)),roll:0};}
export function openingPose(phase,options={}){
 const first=overviewPose(0,options),z=options.portrait?18.2:11.6,t=clamp(phase/2.6);
 const shot=rail('opening/'+!!options.portrait+'/'+(options.aspect||1.78).toFixed(3),[[0,.25,z],[-.8,.7,7.2],[.35,.5,.8],first.position],[[0,-.15,-.3],[0,.1,-3],[.2,.1,-10],first.target],t);
 shot.roll=options.motion===false?0:Math.sin(t*Math.PI*2)*(options.portrait?.008:.022);return shot;
}
export function galleryPose(index,options={}){
 const phase=clamp(options.phase||0,0,2.6),a=workshopShot(index,{...options,phase:Math.min(phase,2.05)});a.roll=0;
 if(options.portrait)a.target[1]-=.4;
 if(options.motion===false||index===workshopStations.length-1||phase<=2.05)return a;
 const b=workshopShot(index+1,{...options,phase:0});if(options.portrait)b.target[1]-=.4;
 const t=ease((phase-2.05)/.55),middle=a.position.map((v,i)=>(v+b.position[i])/2),look=a.target.map((v,i)=>(v+b.target[i])/2);
 // Lift clear of the display housings, then descend to exactly the next shot.
 const across=index===3;middle[0]=across?0:middle[0]+(index<4?2.8:-2.8);middle[1]+=options.portrait?.7:2.0;look[1]+=.35;if(across){middle[2]+=9;look[2]-=3;}
 const shot=rail(`gallery/${index}/${!!options.portrait}/${(options.aspect||1.78).toFixed(3)}`,[a.position,middle,b.position],[a.target,look,b.target],t);
 shot.roll=Math.sin(t*Math.PI)*(options.portrait?.012:motionTokens.bank)*(index<4?1:-1);return shot;
}
export function gatewayPose(phase,{portrait=false}={}){const t=ease(phase);return {position:[portrait?11:16,portrait?13:12,13-t*6],target:[0,-1,-28],roll:portrait?0:-.012*Math.sin(t*Math.PI)};}
function orientPose(a,b,t){
 const position=a.position.map((v,i)=>v+(b.position[i]-v)*t),up=new THREE.Vector3(0,1,0),from=new THREE.Vector3(...a.position),to=new THREE.Vector3(...b.position),at=new THREE.Vector3(...a.target),bt=new THREE.Vector3(...b.target);
 const qa=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(from,at,up)),qb=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(to,bt,up));qa.slerp(qb,t);
 const length=from.distanceTo(at)+(to.distanceTo(bt)-from.distanceTo(at))*t;
 return {position,target:new THREE.Vector3(0,0,-1).applyQuaternion(qa).multiplyScalar(length).add(new THREE.Vector3(...position)).toArray(),roll:(a.roll||0)+((b.roll||0)-(a.roll||0))*t};
}
function transit(a,b,t,small=false){const v=ease(t),shot=orientPose(a,b,v),lift=Math.sin(v*Math.PI)*(small?.18:Math.min(2.5,Math.hypot(...b.position.map((x,i)=>x-a.position[i]))*.09));shot.position[1]+=lift;shot.target[1]+=lift;shot.roll+=Math.sin(v*Math.PI)*(small?0:.025);return shot;}
export class CameraRig{
 constructor(camera){this.camera=camera;this.pose={position:camera.position.toArray(),target:[0,-.15,-.3],roll:0};this.started=false;this.trip=null;this.focus=null;this.focusDone=null;this.pending=false;this.speed=0;}
 navigate(){if(this.focus)return;this.trip={from:structuredClone(this.pose),elapsed:0,duration:motionTokens.navigate};}
 interrupt(){if(!this.focus)this.trip=null;}
 focusOn(pose,done){this.focus=pose;this.focusDone=done;this.trip={from:structuredClone(this.pose),elapsed:0,duration:motionTokens.focus,small:true};}
 release(){if(!this.focus)return;this.focus=null;this.focusDone=null;this.trip={from:structuredClone(this.pose),elapsed:0,duration:motionTokens.return,small:true};}
 update(goal,delta,{motion=true,pointer=[0,0],interactive=false}={}){
  const target=this.focus||goal;let desired=target,completion=null;this.speed=0;
  if(!motion){this.trip=null;this.pose=structuredClone(target);}
  else if(this.trip){const trip=this.trip;trip.elapsed+=Math.max(0,Math.min(delta,.05));desired=transit(trip.from,target,trip.elapsed/trip.duration,trip.small);this.pose=desired;if(trip.elapsed>=trip.duration){this.trip=null;if(this.focusDone){const done=this.focusDone;this.focusDone=null;completion=done;}}}
  else if(!this.started)this.pose=structuredClone(target);
  else {const alpha=1-Math.exp(-Math.max(0,delta)/motionTokens.follow);const previous=this.pose.position;this.pose=orientPose(this.pose,target,alpha);this.speed=Math.min(1,Math.hypot(...this.pose.position.map((v,i)=>v-previous[i]))/Math.max(.001,delta)/18);}
  if(!motion&&this.focusDone){const done=this.focusDone;this.focusDone=null;completion=done;}
  this.started=true;this.camera.position.set(...this.pose.position);const look=new THREE.Vector3(...this.pose.target);if(interactive&&motion&&!this.trip&&!this.focus){look.x+=pointer[0]*.09;look.y-=pointer[1]*.05;}this.camera.up.set(0,1,0);this.camera.lookAt(look);if(motion)this.camera.rotateZ(this.pose.roll||0);this.camera.updateMatrixWorld();completion?.();return this.pose;
 }
 get traveling(){return !!this.trip;}
}
