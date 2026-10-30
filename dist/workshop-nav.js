import {workshopStations,stationMapPoint} from './workshop-layout.js';
export function initWorkshopNav(flow){
 const map=document.querySelector('#workshop-plan');
 if(!map)return;
 const route=workshopStations.map((_,i)=>{const p=stationMapPoint(i);return `${p.x},${p.y}`;}).join(' ');
 const diagram=document.createElementNS('http://www.w3.org/2000/svg','svg');diagram.setAttribute('viewBox','0 0 100 100');diagram.setAttribute('preserveAspectRatio','none');diagram.setAttribute('aria-hidden','true');
 const path=document.createElementNS('http://www.w3.org/2000/svg','polyline');path.setAttribute('points',route);diagram.append(path);map.append(diagram);
 for(const [i,s] of workshopStations.entries()){
  const point=stationMapPoint(i),button=document.createElement('button');button.type='button';button.className='workshop-pin';button.style.left=point.x+'%';button.style.top=point.y+'%';
  button.dataset.station=String(i);button.setAttribute('aria-label',`Visit station ${i+1}: ${s.name}`);button.setAttribute('aria-current',String(i===flow.projectIndex));
  const number=document.createElement('span');number.textContent=String(i+1).padStart(2,'0');
  const label=document.createElement('b');label.textContent=s.name;button.append(number,label);map.append(button);
  button.addEventListener('click',()=>{flow.selectProject(i);requestAnimationFrame(()=>{const target=matchMedia('(min-width:1001px)').matches?document.querySelector(`[data-demo-project="${i}"]`):document.querySelector('#project-select');target?.focus({preventScroll:true});});});
  for(const event of ['pointerenter','focus'])button.addEventListener(event,()=>dispatchEvent(new CustomEvent('portfolio-station-preview',{detail:{index:i}})));
  for(const event of ['pointerleave','blur'])button.addEventListener(event,()=>dispatchEvent(new CustomEvent('portfolio-station-preview',{detail:{index:-1}})));
 }
 document.querySelector('#workshop-start').addEventListener('click',()=>flow.selectProject(0));
 document.querySelector('#workshop-return').addEventListener('click',()=>{document.querySelector('#project-overview').scrollIntoView({behavior:document.documentElement.classList.contains('motion-off')?'instant':'smooth'});});
 addEventListener('portfolio-project',e=>{map.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-current',String(i===e.detail.index)));document.querySelector('#workshop-location').textContent=String(e.detail.index+1).padStart(2,'0')+' / '+workshopStations[e.detail.index].area;});
}
