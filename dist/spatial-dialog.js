let owner=null,pending=null;
export async function presentSpatial(dialog,present){
 const root=document.documentElement;
 const canFly=root.dataset.cameraRig==='ready'&&root.dataset.sceneMode==='project'&&!root.classList.contains('quick-view')&&!root.classList.contains('motion-off')&&!document.querySelector('dialog[open]');
 const ticket={dialog};pending=ticket;owner=dialog;
 let rect=null;
 if(canFly)rect=await new Promise(resolve=>dispatchEvent(new CustomEvent('portfolio-focus-display',{detail:{resolve}})));
 if(pending!==ticket)return;if(rect?.cancelled){pending=null;owner=null;return;}
 pending=null;present();
 if(rect){const w=innerWidth,h=innerHeight,box=dialog.getBoundingClientRect();const top=Math.max(0,rect.top-box.top),left=Math.max(0,rect.left-box.left),right=Math.max(0,box.right-rect.right),bottom=Math.max(0,box.bottom-rect.bottom);dialog.animate([{clipPath:`inset(${top}px ${right}px ${bottom}px ${left}px round 8px)`,opacity:.5},{clipPath:'inset(0px 0px 0px 0px round 8px)',opacity:1}],{duration:540,easing:'cubic-bezier(.22,1,.36,1)'});dialog.dataset.spatialEntry='display';}
}
export function initSpatialDialogs(){
 addEventListener('portfolio-cancel-display',()=>{pending=null;owner=null;});
 document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('close',()=>{if(owner===dialog){owner=null;pending=null;dispatchEvent(new CustomEvent('portfolio-release-display'));}}));
 addEventListener('keydown',e=>{if(e.key==='Escape'&&pending){pending=null;owner=null;dispatchEvent(new CustomEvent('portfolio-release-display'));}});
}
