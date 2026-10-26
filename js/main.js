'use strict';
(() => {
 const engine = monogatari;
 let ready = false, starting = false, toastTimer;
 const chapters = window.JONAH_CHAPTERS;
 const dialog = () => document.getElementById('book-dialog');
 const safeLocal = {
  get(key,fallback=null) {try {return JSON.parse(localStorage.getItem('jonah-book:'+key)) ?? fallback;} catch {return fallback;}},
  set(key,value) {try {localStorage.setItem('jonah-book:'+key,JSON.stringify(value));} catch {/* Reading preferences are optional. */}}
 };
 const visited = new Set();
 function toast(text) {
  const el=document.querySelector('.toast'); el.textContent=text; el.hidden=false;
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>{el.hidden=true;},3200);
 }
 function openDialog(title,html,kicker='ヨナのものがたり') {
  engine.autoPlay(false);
  document.getElementById('dialog-title').textContent=title;
  document.getElementById('dialog-kicker').textContent=kicker;
  document.getElementById('dialog-body').innerHTML=html;
  if(!dialog().open) dialog().showModal();
  dialog().scrollTop=0;
 }
 function chapterCard(ch) {
  return `<button class="chapter-card ${visited.has(ch.number)?'visited':''}" data-action="read-chapter" data-chapter="${ch.number}" aria-label="第${ch.number}話 ${ch.title}"><div class="chapter-thumb"><img src="${ch.image}" alt="" loading="lazy"></div><span class="number">0${ch.number}</span><strong>${ch.title}</strong><span class="card-arrow" aria-hidden="true">↗</span></button>`;
 }
 function paintCards() {
  document.getElementById('chapter-cards').innerHTML=chapters.map(chapterCard).join('');
 }
 function currentChapter() {
  const label=engine.state('label')||'Start';
  const match=/^Chapter([1-6])/.exec(label);
  return match?Number(match[1]):(['Reflection','Kind','Hard','Finish'].includes(label)?6:0);
 }
 function updateHUD() {
  const ch=currentChapter(), entry=chapters[ch-1];
  document.getElementById('chapter-count').textContent=ch?`第 ${ch} 話 ／ 全 6 話`:'ヨナ書 ／ 幼年班 第五課';
  document.getElementById('chapter-heading').textContent=entry?entry.heading:'はじめに ・ 聖句';
  document.getElementById('chapter-progress').style.width=(ch/6*100)+'%';
  const choices=!!document.querySelector('choice-container');
  const next=document.querySelector('[data-action="next-dialog"]');
  next.disabled=choices;
  next.setAttribute('aria-label',choices?'答えをえらんでください':'つぎの文章へ');
  if(ch&&!visited.has(ch)) {visited.add(ch);paintCards();}
 }
 async function startAt(label) {
  if(!ready || starting)return;
  starting=true;
  try {
   if(dialog().open)dialog().close();
   engine.autoPlay(false);
   await engine.resetGame();
   engine.state({label,step:0});
   await engine.runListener('start');
  } finally { starting=false; }
 }
 function helpDialog() {
  openDialog('自分のペースで読もう',`
   <p>「つぎへ」、スペースキー、右矢印で進みます。絵や文章を押しても進めます。「もどる」または左矢印で前へ。答えをえらぶときは、ボタンを押してください。</p>
   <p>ほかのお話を読みたいときは「表紙」にもどり、6枚の絵からえらんでください。えらんだお話のはじめから、すぐに読めます。</p>
   <label class="setting-row">文字の大きさ<select id="font-size" aria-label="文字の大きさ"><option value="normal">ふつう</option><option value="large">大きく</option></select></label>
   <label class="setting-row">文字の出かた<select id="type-mode" aria-label="文字の出かた"><option value="flow">ゆっくり</option><option value="instant">まとめて</option></select></label>
   <p>「動きを止める」で絵を静止できます。端末で動きを減らす設定をしている場合は、はじめから静止画になります。</p>
   <p>声に出して読んだり、おうちの人や先生といっしょに考えたりしてね。</p>
  `,'あそび方');
  const font=document.getElementById('font-size'), type=document.getElementById('type-mode');
  font.value=safeLocal.get('font','normal');type.value=safeLocal.get('type','flow');
  font.onchange=()=>{safeLocal.set('font',font.value);applyPreferences();};
  type.onchange=()=>{safeLocal.set('type',type.value);applyPreferences();};
 }
 function applyPreferences() {
  document.documentElement.style.setProperty('--dialog-size',safeLocal.get('font')==='large'?'27px':'');
  engine.setting('TypeAnimation',safeLocal.get('type','flow')!=='instant'&&!matchMedia('(prefers-reduced-motion: reduce)').matches);
 }
 engine.registerListener('noop',{callback:()=>true});
 engine.registerListener('begin',{callback:()=>startAt('Start')});
 engine.registerListener('read-chapter',{callback:(_e,el)=>startAt('Chapter'+el.data('chapter'))});
 engine.registerListener('game-help',{callback:helpDialog});
 engine.registerListener('home',{callback:async()=>{engine.autoPlay(false);await engine.showScreen('main');window.JonahMotion.sync();paintCards();}});
 engine.registerListener('next-dialog',{callback:async()=>{try{await engine.proceed({userInitiated:true});}catch{/* Choices deliberately block advancing. */}}});
 window.JonahBook={complete(){toast('ヨナの旅を、最後まで読みました。');}};
 Monogatari.$_ready(async()=>{
  paintCards();
  document.getElementById('close-dialog').onclick=()=>dialog().close();
  dialog().addEventListener('click',e=>{if(e.target===dialog()){const r=dialog().getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog().close();}});
  // Monogatari's global reading shortcuts must not advance behind an open dialog.
  document.addEventListener('keydown',e=>{
   if(dialog().open&&[' ','ArrowLeft','ArrowRight','Enter','h','s'].includes(e.key)){
    e.stopImmediatePropagation();
    if(e.key==='Enter'&&e.target.tagName==='BUTTON'){e.preventDefault();e.target.click();}
   }
  },true);
  await engine.init('#monogatari');
  window.JonahMotion.init(engine);
  window.JonahTransition.init(engine);
  ready=true;applyPreferences();
  document.querySelector('[data-action="begin"]').disabled=false;
  engine.on('didUpdateState',()=>updateHUD());
  engine.on('didRunAction',()=>updateHUD());
  new MutationObserver(()=>updateHUD()).observe(document.querySelector('game-screen'),{childList:true});
  // Disable the engine's save/load shortcuts; Escape opens reading help instead.
  engine.keyboardShortcut(['shift+s','shift+l'],()=>{});
  engine.keyboardShortcut('esc',()=>{
   if(dialog().open)dialog().close();
   else if(engine.global('playing'))helpDialog();
  });
  updateHUD();
 });
})();
