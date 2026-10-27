import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const media={matches:true,addEventListener(){}};
const game={visible:true};let video;
const button={textContent:'',setAttribute(){}};
const listeners={};
const engine={scene:'show scene scene5 with fadeIn',state(){return this.scene;},on(){},registerListener(name,listener){listeners[name]=listener.callback;}};
const document={hidden:false,addEventListener(){},createElement(){
 const events={};video={hidden:true,paused:true,plays:0,events,setAttribute(){},load(){},play(){this.plays++;this.paused=false;return Promise.resolve();},pause(){this.paused=true;},addEventListener(name,fn){events[name]=fn;}};return video;
},querySelector(selector){
 if(selector==='game-screen')return game;
 if(selector.includes('toggle-motion'))return button;
 return {append(){}};
}};
const context=vm.createContext({window:{JONAH_CHAPTERS:Array.from({length:6},(_,i)=>({image:`scene-${i+1}.webp`,video:`scene-${i+1}.mp4`}))},document,matchMedia(){return media;},getComputedStyle(){return {display:game.visible?'block':'none'};},MutationObserver:class{observe(){}}});
vm.runInContext(readFileSync(new URL('../js/scene-motion.js',import.meta.url),'utf8'),context);
const motion=context.window.JonahMotion;motion.init(engine);motion.sync();
assert.equal(video.plays,0,'Reduced motion must not autoplay or download a movie');assert.equal(video.src,undefined);
listeners['toggle-motion']();assert.equal(video.src,'scene-5.mp4');assert.equal(video.paused,false);video.events.playing();assert.equal(video.hidden,false);
listeners['toggle-motion']();assert.equal(video.paused,true);assert.equal(video.hidden,true);
engine.scene='show scene scene6 with fadeIn';motion.sync();assert.equal(video.src,'scene-5.mp4','Disabled motion must not load the next video');
listeners['toggle-motion']();assert.equal(video.src,'scene-6.mp4');video.events.playing();assert.equal(video.hidden,false);
game.visible=false;motion.sync();assert.equal(video.paused,true);assert.equal(video.hidden,true);
game.visible=true;document.hidden=true;motion.sync();assert.equal(video.paused,true);
document.hidden=false;motion.sync();video.events.error();assert.equal(video.hidden,true,'A failed movie must expose the original still');assert.equal(video.paused,true);
const plays=video.plays;motion.sync();assert.equal(video.plays,plays,'Do not repeatedly retry a broken movie');
engine.scene='show scene scene1 with fadeIn';motion.sync();assert.equal(video.src,'scene-1.mp4');assert.equal(video.paused,false,'A failed chapter must not prevent the next chapter from playing');
engine.scene='show scene scene5rescue with fadeIn';motion.sync();
assert.equal(video.hidden,true,'Shoreline rescue must not display the fish-belly animation');
video.events.playing();assert.equal(video.hidden,true,'Late playback must not cover the rescue image');
engine.scene='show scene scene5 with fadeIn';motion.sync();video.events.playing();
assert.equal(video.hidden,false,'Returning to the fish restores its animation');
// Replaced artwork must never be covered by the obsolete Nineveh movie,
// including a late 'playing' event from the previous chapter.
context.window.JONAH_CHAPTERS[5]={image:'scene-6-warning.png'};
engine.scene='show scene scene6 with fadeIn';motion.sync();
assert.equal(video.hidden,true);assert.equal(video.paused,true);
video.events.playing();assert.equal(video.hidden,true,'A late event must not reveal old artwork');
engine.scene='show scene scene6repentance';motion.sync();
assert.equal(video.hidden,true,'Repentance keeps its separate still illustration');
console.log('PASS: reduced motion, explicit override, chapter switching, background pause, and video-error still fallback.');
