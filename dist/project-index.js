const root=document.documentElement,index=document.querySelector('#collection');
let frame=0;
function updateTone(){frame=0;const r=index.getBoundingClientRect();root.classList.toggle('index-in-view',r.top<=100&&r.bottom>100);}
function request(){if(!frame)frame=requestAnimationFrame(updateTone);}
addEventListener('scroll',request,{passive:true});addEventListener('resize',request);addEventListener('portfolio-view',request);request();
const reveal=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.dataset.reveal='visible';reveal.unobserve(e.target);}},{threshold:.08});
function watchTiles(){index.querySelectorAll('.project-tile:not([data-reveal])').forEach(tile=>{tile.dataset.reveal=root.classList.contains('motion-off')?'visible':'waiting';reveal.observe(tile);});}
new MutationObserver(watchTiles).observe(document.querySelector('#project-index'),{childList:true});watchTiles();
