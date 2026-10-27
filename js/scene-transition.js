'use strict';
/* Capture the outgoing scene, then dissolve it over Monogatari's new scene.
   This also handles rollback without a flash, including outgoing video frames. */
window.JonahTransition = (() => {
 const statement='show scene scene6repentance';
 function init(engine){
  const visuals=document.querySelector('game-screen [data-content="visuals"]');
  const overlay=document.createElement('canvas');overlay.className='scene-crossfade';
  overlay.hidden=true;overlay.setAttribute('aria-hidden','true');visuals.append(overlay);
  const ctx=overlay.getContext('2d');
  const before=new Image(),after=new Image();
  before.src='assets/scenes/scene-6-warning.png';after.src='assets/scenes/scene-7-repentance.png';
  let animation=null;
  const matches=event=>event.detail?.action?._statement===statement;
  function capture(reverse){
   animation?.cancel();animation=null;overlay.hidden=true;
   if(!window.JonahMotion.isEnabled())return;
   const video=document.querySelector('video.scene-motion');
   const image=reverse?after:before;
   const source=video&&!video.hidden&&video.readyState>=2?video:image;
   const iw=source.videoWidth||source.naturalWidth,ih=source.videoHeight||source.naturalHeight;
   if(!iw||!ih)return; // The still image remains a safe fallback if not decoded.
   const dpr=Math.min(devicePixelRatio||1,2);
   overlay.width=Math.round(visuals.clientWidth*dpr);overlay.height=Math.round(visuals.clientHeight*dpr);
   ctx.fillStyle='#122f35';ctx.fillRect(0,0,overlay.width,overlay.height);
   const scale=Math.min(overlay.width/iw,overlay.height/ih);
   ctx.drawImage(source,(overlay.width-iw*scale)/2,(overlay.height-ih*scale)/2,iw*scale,ih*scale);
   overlay.style.opacity='1';overlay.hidden=false;
  }
  function dissolve(){
   if(overlay.hidden)return;
   animation=overlay.animate([{opacity:1},{opacity:0}],{duration:900,easing:'ease-in-out',fill:'forwards'});
   const current=animation;
   current.finished.then(()=>{if(animation===current){overlay.hidden=true;animation=null;}},()=>{});
  }
  engine.on('willRunAction',event=>{
   if(matches(event))capture(false);
   else if(String(event.detail?.action?._statement||'').startsWith('show scene ')){animation?.cancel();animation=null;overlay.hidden=true;}
  });
  engine.on('didRunAction',event=>{if(matches(event))dissolve();});
  engine.on('willRevertAction',event=>{if(matches(event))capture(true);});
  engine.on('didRevertAction',event=>{if(matches(event))dissolve();});
 }
 return {init};
})();
