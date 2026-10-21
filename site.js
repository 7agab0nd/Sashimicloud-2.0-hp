/* Event-driven only: no animation loop, library, analytics, or network request. */
(()=>{
 'use strict';
 const root=document.documentElement;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const mobile=matchMedia('(max-width: 600px)');
 const skyMenu=document.getElementById('atmosphere');
 const navMenu=document.getElementById('mobile-menu');
 const labels={day:['☼','Day','#344e68'],sunset:['◒','Sunset','#28223e'],night:['☾','Night','#0c1021']};
 let preference=root.dataset.preference||'auto';
 const autoSky=()=>{const h=new Date().getHours();return h>=7&&h<17?'day':h>=17&&h<20?'sunset':'night'};
 function applySky(){
  const sky=preference==='auto'?autoSky():preference;
  root.dataset.sky=sky;root.dataset.preference=preference;
  document.querySelector('.sky-icon').textContent=labels[sky][0];
  document.getElementById('sky-label').textContent=labels[sky][1];
  skyMenu.querySelector('summary').setAttribute('aria-label',`Sky: ${labels[sky][1]}${preference==='auto'?' (automatic)':''}. Choose atmosphere`);
  document.querySelector('meta[name="theme-color"]').content=labels[sky][2];
  document.querySelectorAll('input[name="sky"]').forEach(input=>{input.checked=input.value===preference});
 }
 applySky();
 skyMenu.addEventListener('change',event=>{
  if(event.target.name!=='sky'||!['auto','day','sunset','night'].includes(event.target.value))return;
  preference=event.target.value;try{localStorage.setItem('sashimicloud-sky',preference)}catch{}
  applySky();
  skyMenu.open=false;
 });
 // Refresh automatic light after crossing a local-time boundary, including resumed tabs.
 setInterval(()=>{if(preference==='auto'&&!document.hidden)applySky()},60000);
 window.addEventListener('storage',event=>{
  if(event.key==='sashimicloud-sky'){
   preference=['day','sunset','night'].includes(event.newValue)?event.newValue:'auto';applySky();
  }
 });
 const menus=[skyMenu,navMenu];
 for(const menu of menus){
  menu.addEventListener('toggle',()=>{if(menu.open)for(const other of menus)if(other!==menu)other.open=false});
 }
 document.addEventListener('click',event=>{for(const menu of menus)if(menu.open&&!menu.contains(event.target))menu.open=false});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')for(const menu of menus)if(menu.open){menu.open=false;menu.querySelector('summary').focus()}});
 navMenu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{navMenu.open=false}));
 matchMedia('(min-width: 801px)').addEventListener('change',event=>{if(event.matches)navMenu.open=false});
 // Bounded camera elevation. Near ridges descend farther than distant peaks.
 // Content height changes do not change the camera position at a given scroll offset.
 const properties={'--far-y':20,'--layer-y':55,'--ridge-y':100,'--near-y':170,'--cloud-y':30};
 let pending=false;
 function updateCamera(){
  pending=false;
  const progress=reduced.matches?0:1-Math.exp(-Math.max(0,window.scrollY)/1450);
  const scale=mobile.matches?.62:1;
  for(const [key,amount] of Object.entries(properties))root.style.setProperty(key,`${(progress*amount*scale).toFixed(2)}px`);
  root.style.setProperty('--view-shade',(progress*.25).toFixed(3));
 }
 function queueCamera(){if(!pending){pending=true;requestAnimationFrame(updateCamera)}}
 window.addEventListener('scroll',queueCamera,{passive:true});
 window.addEventListener('resize',queueCamera,{passive:true});
 reduced.addEventListener('change',updateCamera);updateCamera();
 document.addEventListener('visibilitychange',()=>{
  root.classList.toggle('paused',document.hidden);
  if(!document.hidden){if(preference==='auto')applySky();queueCamera()}
 });
 // Native buttons retain Enter/Space support; feedback has a separate live region.
 const cat=document.querySelector('.cat');const cloud=document.querySelector('.cloud-companion');
 const status=document.getElementById('companion-status');let catTimer,cloudTimer,statusTimer;let petCount=0;
 function announce(message){clearTimeout(statusTimer);status.textContent='';statusTimer=setTimeout(()=>{status.textContent=message},35)}
 cat?.addEventListener('click',()=>{
  const message=['mrrp.','prrr.','meow.'][petCount++%3];
  cat.querySelector('.cat-bubble').textContent=message;cat.classList.add('petted');
  clearTimeout(catTimer);catTimer=setTimeout(()=>cat.classList.remove('petted'),2100);announce(`The cat says ${message}`);
 });
 cloud?.addEventListener('click',()=>{
  cloud.classList.add('hello');clearTimeout(cloudTimer);cloudTimer=setTimeout(()=>cloud.classList.remove('hello'),1700);
  announce('The little cloud sparkles.');
 });
 // Deep links open an entry without building a separate Journal page prematurely.
 function openLinkedPost(){let id;try{id=decodeURIComponent(location.hash.slice(1))}catch{return}const post=document.getElementById(id);if(post?.classList.contains('post'))post.open=true}
 window.addEventListener('hashchange',openLinkedPost);openLinkedPost();
 document.querySelectorAll('.post').forEach(post=>post.addEventListener('toggle',()=>{
  post.querySelector('.post-read-note').textContent=post.open?'Select the title again to close.':'';
 }));
})();
