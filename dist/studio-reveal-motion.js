import {clamp,smooth} from './engineering-motion.js';

// A projective map, not an axis-aligned rectangle: the real HTML follows the
// physical display's four projected corners through the seated pullback.
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
 const ratio=screen.width/Math.max(1,screen.height),width=Math.min(8.42,5.24*ratio),height=width/ratio;
 return {width,height,center:[-4.7,10.9,90.04],yaw:.12};
}
export function contactDisplay(){return {width:8.66,height:5.4125,center:[4.7,10.9,90.04],yaw:-.12};}
export function displayCorners(display){
 const {center:[cx,cy,cz],width,height,yaw=0}=display;
 return [[-.5,.5],[.5,.5],[.5,-.5],[-.5,-.5]].map(([x,y])=>[cx+x*width*Math.cos(yaw),cy+y*height,cz-x*width*Math.sin(yaw)]);
}
export function finaleShot(progress,screen,outro=0){
 const display=finaleDisplay(screen),{width,center,yaw}=display,fov=38,f=screen.viewportHeight/(2*Math.tan(fov*Math.PI/360)),depth=f*width/screen.width;
 const dx=-(screen.left+screen.width/2-screen.viewportWidth/2)*depth/f,dy=(screen.top+screen.height/2-screen.viewportHeight/2)*depth/f;
 const close={position:[center[0]+dx*Math.cos(yaw)+depth*Math.sin(yaw),center[1]+dy,center[2]-dx*Math.sin(yaw)+depth*Math.cos(yaw)],target:[center[0]+dx*Math.cos(yaw),center[1]+dy,center[2]-dx*Math.sin(yaw)],fov};
 const portrait=screen.viewportWidth<760,turn=smooth(.53,.98,progress),seat={position:[.2,12.8,104.2],target:[portrait?-4.7+9.4*turn:1.05*turn,portrait?10.2:9.3,90.2],fov:portrait?68:50};
 const t=smooth(.06,.86,clamp(progress));if(t===0)return close;if(t===1)return seat;
 return {position:close.position.map((v,i)=>v+(seat.position[i]-v)*t),target:close.target.map((v,i)=>v+(seat.target[i]-v)*t),fov:close.fov+(seat.fov-close.fov)*t};
}
