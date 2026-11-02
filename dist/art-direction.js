const root=document.documentElement,header=document.querySelector('.header');
// Match navigation contrast to the surface actually beneath it.
let frame=0;
function updateTone(){frame=0;const y=Math.min(100,innerHeight*.2);const paper=['#collection','#contact','#project-overview'].some(id=>{const r=document.querySelector(id).getBoundingClientRect();return r.top<=y&&r.bottom>y;})||document.querySelector('.footer').getBoundingClientRect().top<=y;header.dataset.tone=paper?'paper':'ink';}
function request(){if(!frame)frame=requestAnimationFrame(updateTone);}
addEventListener('scroll',request,{passive:true});addEventListener('resize',request);addEventListener('portfolio-view',request);request();
const reveal=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.dataset.reveal='visible';reveal.unobserve(e.target);}},{threshold:.08});
function watchTiles(){document.querySelectorAll('.project-tile:not([data-reveal])').forEach(tile=>{tile.dataset.reveal=root.classList.contains('motion-off')?'visible':'waiting';reveal.observe(tile);});}
new MutationObserver(watchTiles).observe(document.querySelector('#project-index'),{childList:true});watchTiles();
