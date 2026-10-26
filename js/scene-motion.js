'use strict';
/* One local, muted loop at a time. Original stills stay visible until playback
   succeeds, and remain the fallback for reduced motion or failed downloads. */
window.JonahMotion = (() => {
 let engine,video,scene=0,userEnabled=null,failed=false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const enabled=()=>userEnabled===null?!reduced.matches:userEnabled;
 const gameVisible=()=>getComputedStyle(document.querySelector('game-screen')).display!=='none';
 function updateControl(){
  const button=document.querySelector('[data-action="toggle-motion"]');
  if(!button)return;
  button.textContent=enabled()?'動きを止める':'動きをつける';
  button.setAttribute('aria-pressed',String(enabled()));
 }
 function hide(){video.pause();video.hidden=true;}
 function sync(){
  if(!video)return;
  const state=String(engine.state('scene')||'');
  const number=Number(/\bscene([1-6])\b/.exec(state)?.[1]||0);
  const entry=window.JONAH_CHAPTERS[number-1];
  const active=number&&gameVisible()&&!document.hidden&&enabled();
  if(!active){hide();updateControl();return;}
  if(scene!==number){
   hide();scene=number;failed=false;
   video.poster=entry.image;video.src=entry.video;
   video.load();
  }
  if(!failed){
   const playing=video.play();
   if(playing)playing.catch(error=>{
    if(error.name!=='AbortError'&&scene===number){failed=true;hide();}
   });
  }
  updateControl();
 }
 function init(instance){
  engine=instance;
  video=document.createElement('video');video.className='scene-motion';
  video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;
  video.setAttribute('muted','');video.setAttribute('playsinline','');
  video.setAttribute('aria-hidden','true');video.preload='metadata';video.hidden=true;
  document.querySelector('game-screen [data-content="visuals"]').append(video);
  video.addEventListener('playing',()=>{if(enabled()&&gameVisible()&&!document.hidden)video.hidden=false;else hide();});
  video.addEventListener('error',()=>{failed=true;hide();});
  engine.on('didRunAction',sync);engine.on('didUpdateState',sync);
  new MutationObserver(sync).observe(document.querySelector('game-screen'),{attributes:true,attributeFilter:['class','style','hidden']});
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',sync);
  engine.registerListener('toggle-motion',{callback:()=>{userEnabled=!enabled();failed=false;sync();}});
  updateControl();
 }
 return {init,sync};
})();
