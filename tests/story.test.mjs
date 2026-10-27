import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let story;const scenes={};
const context=vm.createContext({window:{},monogatari:{assets(type,data){if(type==='scenes')Object.assign(scenes,data);},characters(){},script(data){story=data;}}});
vm.runInContext(readFileSync(path.join(root,'js/script.js'),'utf8'),context);
for(const [label,lines] of Object.entries(story))for(const line of lines){
 const targets=typeof line==='string'?[line]:line?.Choice?Object.values(line.Choice).filter(v=>v?.Do).map(v=>v.Do):[];
 for(const target of targets)if(target.startsWith('jump '))assert.ok(story[target.slice(5)],`${label} links to missing label ${target}`);
}
for(const file of Object.values(scenes))assert.ok(existsSync(path.join(root,'assets/scenes',file)),`Missing artwork ${file}`);
const rescueLine=story.Chapter5After.findIndex(line=>typeof line==='string'&&line.startsWith('n 神様は魚に命じ、'));
assert.ok(rescueLine>0);
assert.equal(story.Chapter5After[rescueLine-1],'show scene scene5rescue with fadeIn');
assert.equal(scenes.scene5rescue,'scene-5-rescue.png');
function walk(answer){
 let label='Start',step=0,iterations=0;const shown=[],visited=[];
 while(++iterations<1000){
  const line=story[label][step++];assert.ok(line,`Unexpected end of label ${label}`);
  if(typeof line==='function')continue;
  if(typeof line==='object'){
   const choice=Object.values(line.Choice).filter(v=>v?.Do);
   const picked=label==='Finish'?choice[0]:choice[Math.min(answer,choice.length-1)];
   if(picked.Do==='end')return {shown,visited};
   label=picked.Do.slice(5);step=0;visited.push(label);continue;
  }
  if(line==='end')return {shown,visited};
  if(line.startsWith('jump ')){label=line.slice(5);step=0;visited.push(label);}
  const m=/^show scene (scene\d)/.exec(line);if(m&&!shown.includes(m[1]))shown.push(m[1]);
 }
 throw Error('Story cannot reach the cover');
}
for(const answer of [0,1]){
 const {shown,visited}=walk(answer);
 assert.deepEqual(shown,['scene1','scene2','scene3','scene4','scene5','scene6']);
 assert.ok(visited.includes('Finish'),'Every answer route must reach the same lesson ending');
 for(let i=1;i<=6;i++)assert.ok(visited.includes(`Chapter${i}`));
}
console.log(`PASS: ${Object.keys(story).length} labels, all links and six local scenes, both answer routes reach the complete lesson.`);

// Scripture is quoted exactly even though narration is simplified.
const plain=html=>html.replace(/<rt>.*?<\/rt>/g,'').replace(/<[^>]+>/g,'');
const exactVerse='しかし、わたしはあなたがたに言う。敵を愛し、迫害する者のために祈れ。';
for (const label of ['Start','Reflection']) {
 const verse=story[label].find(line=>typeof line==='string'&&line.startsWith('v '));
 const content=/<span class="memory-verse">(.*?)<\/span>/.exec(verse)?.[1];
 assert.ok(content, 'The complete verse needs its own reading layout');
 assert.equal(plain(content),exactVerse);
 assert.equal(/[一-龯]/.test(content.replace(/<ruby>.*?<\/ruby>/g,'')),false,'Every kanji group has furigana');
}
const cover=readFileSync(path.join(root,'index.html'),'utf8');
assert.equal(plain(/<blockquote>(.*?)<\/blockquote>/.exec(cover)[1]),exactVerse);
for (const name of ['ヨナ','ニネベ','タルシシ']) {
 assert.ok(Object.values(story).flat().some(line=>typeof line==='string'&&line.includes(`<strong class="story-name">${name}</strong>`)));
}
console.log('PASS: unchanged Scripture, complete verse readings, and highlighted names.');
