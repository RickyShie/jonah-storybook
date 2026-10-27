'use strict';
/* Reading preferences only: changing the layout never advances the story. */
window.JonahReadingLayout = (() => {
 const key='jonah-book:reading-layout';
 const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
 function init(){
  const root=document.documentElement,game=document.querySelector('game-screen');
  const divider=document.getElementById('reading-divider');
  const controls=document.getElementById('font-controls');
  const slider=document.getElementById('reading-font');
  const output=document.getElementById('reading-font-value');
  let saved={};try{saved=JSON.parse(localStorage.getItem(key))||{};}catch{}
  let font=Number.isFinite(saved.font)?clamp(saved.font,16,40):(matchMedia('(max-width:700px)').matches?20:23);
  let ratio=Number.isFinite(saved.ratio)?clamp(saved.ratio,.15,.8):null;
  const persist=()=>{try{localStorage.setItem(key,JSON.stringify({font,ratio}));}catch{}};
  function limits(){
   const height=game.clientHeight;
   const header=game.querySelector('.game-header').getBoundingClientRect().height;
   const footer=game.querySelector('.reading-controls').getBoundingClientRect().height;
   const max=Math.max(100,height-header-footer-45);
   return {height,footer,min:Math.min(130,max),max};
  }
  function render(){
   root.style.setProperty('--reading-font-size',font+'px');
   slider.value=String(font);output.value=font+'px';
   slider.setAttribute('aria-valuetext',font+'ピクセル');
   const {height,min,max}=limits();
   if(ratio!==null&&height>0)game.style.setProperty('--reading-panel-height',clamp(ratio*height,min,max)+'px');
   else game.style.removeProperty('--reading-panel-height');
   const panel=game.querySelector('text-box').getBoundingClientRect().height;
   divider.setAttribute('aria-valuemin',String(Math.round(min)));
   divider.setAttribute('aria-valuemax',String(Math.round(max)));
   divider.setAttribute('aria-valuenow',String(Math.round(panel)));
   divider.setAttribute('aria-valuetext','文章の高さ '+Math.round(panel)+'ピクセル');
  }
  function setHeight(height){const bounds=limits();ratio=clamp(height,bounds.min,bounds.max)/bounds.height;render();persist();}
  slider.addEventListener('input',()=>{font=clamp(Number(slider.value),16,40);render();persist();});
  document.getElementById('reset-reading').addEventListener('click',()=>{
   font=matchMedia('(max-width:700px)').matches?20:23;ratio=null;render();persist();
  });
  let dragging=false;
  divider.addEventListener('pointerdown',event=>{
   if(event.button!==0)return;
   event.preventDefault();event.stopPropagation();dragging=true;
   divider.setPointerCapture(event.pointerId);divider.classList.add('dragging');
  });
  divider.addEventListener('pointermove',event=>{
   if(!dragging)return;
   const {footer}=limits();setHeight(game.getBoundingClientRect().bottom-footer-event.clientY);
  });
  const finish=()=>{dragging=false;divider.classList.remove('dragging');};
  divider.addEventListener('pointerup',finish);divider.addEventListener('pointercancel',finish);divider.addEventListener('lostpointercapture',finish);
  divider.addEventListener('keydown',event=>{
   const {min,max}=limits(),height=game.querySelector('text-box').getBoundingClientRect().height;
   if(event.key==='ArrowUp')setHeight(height+20);
   else if(event.key==='ArrowDown')setHeight(height-20);
   else if(event.key==='Home')setHeight(min);
   else if(event.key==='End')setHeight(max);
   else return;
   event.preventDefault();
  });
  // Prevent Monogatari's global advance/back shortcuts on reading controls.
  for(const el of [divider,controls])for(const type of ['click','pointerup','keydown','keyup'])el.addEventListener(type,event=>event.stopPropagation());
  const observer=new ResizeObserver(render);
  observer.observe(game);observer.observe(game.querySelector('text-box'));
  render();
 }
 return {init};
})();
