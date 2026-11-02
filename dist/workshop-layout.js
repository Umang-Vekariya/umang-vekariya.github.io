// One physical address per project. The floor plan, camera, and displays share it.
export const workshopStations = [
 {id:'wnams',name:'WNAMS',area:'SIGNAL FIELD',x:-7,z:-13},
 {id:'deepfake',name:'Deepfake Detection',area:'FRAME OBSERVATORY',x:-7,z:-25},
 {id:'vit-vault',name:'VIT Vault',area:'RESILIENCE STACK',x:-7,z:-37},
 {id:'polyglot',name:'PolyGlot',area:'COMPILER WORKBENCH',x:-7,z:-49},
 {id:'realityforge',name:'RealityForge',area:'RESPONSIVE DESK',x:7,z:-49},
 {id:'playable-replay',name:'PlayableReplay',area:'RECONSTRUCTION ARCADE',x:7,z:-37},
 {id:'intent-lab',name:'Intent Lab',area:'DECISION GATES',x:7,z:-25},
 {id:'clubsphere',name:'ClubSphere',area:'CAMPUS CONSTELLATION',x:7,z:-13}
];
export function stationMapPoint(index){const s=workshopStations[index];return {x:s.x<0?36:64,y:20+(-s.z-13)/36*60};}
export function workshopShot(index,{portrait=false,phase=0,aspect=1.78}={}){
 const s=workshopStations[index],side=s.x<0?1:-1,distance=portrait?12.6:Math.min(12.6,Math.max(10.6,14.8/aspect));
 const center=s.z+side*(portrait?0:aspect<1.25?1.1:2.35);
 return {position:[s.x+side*(distance-phase*.15),portrait?.4:.7,center],target:[s.x,portrait?.32:.1,center]};
}

// The outgoing scroll span carries the camera to the next station. At the
// boundary both stations resolve to the same pose, in either scroll direction.
export function workshopTravel(index,options={}){
 const phase=options.phase??0,shot=workshopShot(index,options);
 if(options.motion===false||index>=workshopStations.length-1||phase<=2.15)return shot;
 const t=Math.max(0,Math.min(1,(phase-2.15)/.45));
 const ease=t*t*t*(t*(t*6-15)+10),next=workshopShot(index+1,{...options,phase:0});
 return {position:shot.position.map((v,i)=>v+(next.position[i]-v)*ease+(i===1?Math.sin(ease*Math.PI)*.65:0)),target:shot.target.map((v,i)=>v+(next.target[i]-v)*ease)};
}
