import {clamp,smooth} from './engineering-motion.js';

// A projective map, not an axis-aligned rectangle: the real HTML follows the
// physical display's four projected corners through a dolly and an orbit.
export function screenTransform(points,width,height){
 const source=[[0,0],[width,0],[width,height],[0,height]],rows=[];
 for(let i=0;i<4;i++){const [x,y]=source[i],{x:u,y:v}=points[i];rows.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]);}
 for(let c=0;c<8;c++){let pivot=c;for(let r=c+1;r<8;r++)if(Math.abs(rows[r][c])>Math.abs(rows[pivot][c]))pivot=r;
  [rows[c],rows[pivot]]=[rows[pivot],rows[c]];const d=rows[c][c];if(Math.abs(d)<1e-10)return null;for(let j=c;j<=8;j++)rows[c][j]/=d;
  for(let r=0;r<8;r++)if(r!==c){const k=rows[r][c];for(let j=c;j<=8;j++)rows[r][j]-=k*rows[c][j];}
 }
 const [a,b,c,d,e,f,g,h]=rows.map(row=>row[8]);return [a,d,0,g,b,e,0,h,0,0,1,0,c,f,0,1];
}


export function finaleDisplay(screen){
 const ratio=screen.width/Math.max(1,screen.height),width=screen.viewportWidth<760?Math.max(2.6,Math.min(7,13*ratio)):12,height=width/ratio;
 return {width,height,center:[-8,2+height/2,90.005]};
}
export function finaleShot(progress,screen){
 const {width,center}=finaleDisplay(screen),fov=38,f=screen.viewportHeight/(2*Math.tan(fov*Math.PI/360)),depth=f*width/screen.width;
 const x=center[0]-(screen.left+screen.width/2-screen.viewportWidth/2)*depth/f,y=center[1]+(screen.top+screen.height/2-screen.viewportHeight/2)*depth/f;
 const close={position:[x,y,center[2]+depth],target:[x,y,center[2]],fov};
 const wide=screen.viewportWidth<760?{position:[6,12,129],target:[-7,5,90],fov:48}:{position:[14,11,125],target:[0,5,90],fov:40};
 const t=smooth(.08,.91,clamp(progress));if(t===0)return close;if(t===1)return wide;
 // The reveal follows one deterministic, reversible dolly with a gentle arc.
 return {position:close.position.map((v,i)=>v+(wide.position[i]-v)*t+(i===1?Math.sin(t*Math.PI)*1.3:0)),target:close.target.map((v,i)=>v+(wide.target[i]-v)*t),fov:close.fov+(wide.fov-close.fov)*t};
}
