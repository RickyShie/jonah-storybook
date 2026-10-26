import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const callbacks={},drawn=[],fades=[];
let enabled=true;
const visuals={clientWidth:1280,clientHeight:720,append(){}};
let overlay;
const video={hidden:false,readyState:4,videoWidth:1280,videoHeight:720};
class MockImage {naturalWidth=1672;naturalHeight=941;}
const context=vm.createContext({window:{JonahMotion:{isEnabled(){return enabled;}}},devicePixelRatio:1,Image:MockImage,
 document:{querySelector(selector){return selector.startsWith('video')?video:visuals;},createElement(){overlay={hidden:true,style:{},setAttribute(){},getContext(){return {fillRect(){},drawImage(source){drawn.push(source);}};},animate(_frames,options){fades.push(options);return {finished:Promise.resolve(),cancel(){}};}};return overlay;}}
});
vm.runInContext(readFileSync(new URL('../js/scene-transition.js',import.meta.url),'utf8'),context);
context.window.JonahTransition.init({on(name,fn){callbacks[name]=fn;}});
const event={detail:{action:{_statement:'show scene scene6repentance'}}};
callbacks.willRunAction(event);assert.equal(overlay.hidden,false);assert.equal(drawn.at(-1),video,'Crossfade must capture the currently displayed animation');
callbacks.didRunAction(event);assert.equal(fades.at(-1).duration,900);await Promise.resolve();assert.equal(overlay.hidden,true);
video.hidden=true;callbacks.willRevertAction(event);assert.ok(drawn.at(-1).src.endsWith('scene-6-repentance.webp'),'Rollback captures the second illustration');
callbacks.didRevertAction(event);await Promise.resolve();assert.equal(overlay.hidden,true);
enabled=false;const count=drawn.length;callbacks.willRunAction(event);callbacks.didRunAction(event);assert.equal(drawn.length,count,'Motion disabled must switch without a crossfade');
enabled=true;callbacks.willRunAction(event);callbacks.willRunAction({detail:{action:{_statement:'show scene scene1 with fadeIn'}}});assert.equal(overlay.hidden,true,'An interrupted transition must not cover a different chapter');
console.log('PASS: outgoing-video capture, reverse transition, reduced-motion setting, and interrupted chapter changes.');
