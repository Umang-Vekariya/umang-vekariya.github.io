import {createProjectPreviews} from './project-previews.js?v=2';

const preview=document.querySelector('.case-preview');
const controller=createProjectPreviews();
if(preview)controller.mountCase(preview,preview.dataset.preview);
document.querySelector('[data-copy-link]')?.addEventListener('click',async()=>{
 const status=document.querySelector('#share-status');
 try{await navigator.clipboard.writeText(location.origin+location.pathname);status.textContent='Project link copied.';}
 catch{status.textContent='Copy the address from your browser to share this project.';}
});
const links=[...document.querySelectorAll('.case-aside nav a')];

const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)links.forEach(a=>{if(a.hash==='#'+e.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});},{rootMargin:'-15% 0px -65%'});
document.querySelectorAll('.story-section').forEach(s=>observer.observe(s));
const mount=document.querySelector('#inline-demo'),frameMount=document.querySelector('#inline-demo-frame');
document.querySelectorAll('[data-open-demo]').forEach(button=>button.addEventListener('click',()=>{
 if(!frameMount.querySelector('iframe')){const frame=document.createElement('iframe');frame.title=document.querySelector('h1').textContent+' — actual project';frame.src=button.dataset.openDemo;frame.allow='fullscreen';frameMount.replaceChildren(frame);}
 mount.hidden=false;mount.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
}));
document.querySelector('[data-close-demo]')?.addEventListener('click',()=>{frameMount.replaceChildren();mount.hidden=true;document.querySelector('.real-demo-callout button')?.focus({preventScroll:true});});

if(new URL(location.href).searchParams.has('audit'))import('./performance-audit.js').then(m=>m.startPerformanceAudit());
