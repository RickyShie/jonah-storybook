'use strict';
(() => {
 const engine = monogatari;
 let ready = false, saveTimer, toastTimer, saveQueue = Promise.resolve();
 const chapters = window.JONAH_CHAPTERS;
 const dialog = () => document.getElementById('book-dialog');
 const safeLocal = {
  get(key,fallback=null) {try {return JSON.parse(localStorage.getItem('jonah-book:'+key)) ?? fallback;} catch {return fallback;}},
  set(key,value) {try {localStorage.setItem('jonah-book:'+key,JSON.stringify(value));} catch {/* Game saves report failures separately. */}}
 };
 const visited = new Set(safeLocal.get('visited',[]));
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
  if(ch&&!visited.has(ch)) {visited.add(ch);safeLocal.set('visited',[...visited]);paintCards();}
 }
 async function saveBookmark(manual=false) {
  if(!engine.global('playing'))return;
  saveQueue=saveQueue.catch(()=>{}).then(async()=>{
   // Separate fixed slots keep the explicit bookmark and automatic resume independent.
   await engine.saveTo(manual?'SaveLabel':'AutoSaveLabel',1,manual?'自分のしおり':'つづきから');
   document.getElementById('resume').hidden=false;
  });
  try {await saveQueue;if(manual)toast('しおりをはさみました。ここから、また読めます。');}
  catch(err){console.error('Bookmark could not be saved',err);if(manual)toast('しおりを保存できませんでした。ブラウザの保存設定を確認してください。');}
 }
 async function startAt(label) {
  if(!ready)return;
  clearTimeout(saveTimer);
  if(dialog().open)dialog().close();
  await saveQueue.catch(()=>{});
  await engine.resetGame();
  engine.state({label,step:0});
  await engine.runListener('start');
 }
 async function resume() {
  if(!ready)return;
  try {
   const exists=await engine.Storage.get('JonahAuto_1').catch(()=>null);
   if(!exists?.game){toast('まだ、つづきのしおりはありません。');return;}
   if(dialog().open)dialog().close();
   await engine.loadFromSlot('JonahAuto_1');
   await engine.run(engine.label()[engine.state('step')]);
   updateHUD();
  } catch(err){console.error(err);toast('しおりを開けませんでした。もくじから、お話をえらべます。');}
 }
 function chaptersDialog() {
  openDialog('どのお話を読む？','<p>はじめからでも、好きなところからでも。</p><div class="chapter-grid">'+chapters.map(chapterCard).join('')+'</div>','もくじ ／ 全6話');
 }
 function teacherDialog() {
  openDialog('先生・保護者の方へ',`
   <p>第五課「逃げた預言者」の改訂PDFをもとにした、6〜9歳向けの読み聞かせ教材です。目安は10〜15分。問いかけのところで、子どもの言葉をゆっくり聞いてください。</p>
   <h3>この課で学ぶこと</h3><ol><li>ヨナが神様の命令から逃げたために、神様の罰を受けたことを知る。</li><li>神様が正しいとされることを行う。</li><li>友だちのまちがいをゆるす。</li></ol>
   <h3>聖句</h3><p>「しかし、わたしはあなたがたに言う。敵を愛し、迫害する者のために祈れ。」（マタイ5:44、口語訳）。冒頭で、この課の聖句を読みます。</p>
   <h3>読み進め方</h3><p>文章や絵をクリックするか、「つぎへ」、スペースキー、右矢印キーで進みます。文字が流れている間は、1回押すと全文を表示します。「もどる」または左矢印で前へ。答えを選ぶ画面では、選んでから進みます。</p>
   <p>「しおりをはさむ」は手動保存です。自動保存もあり、表紙の「つづきから読む」で再開できます。保存は、このブラウザ・このアドレスで行われます。</p>
   <h3>教材と聖書本文の区別</h3><div class="teacher-note">選択肢は理解とふり返りのためのものです。聖書の出来事や結末を変える分岐はありません。得点や失敗の罰もありません。絵の切り抜き表現や光、服装などは挿絵上の表現です。聖書は魚の種類や内部の様子を特定していません。</div>
   <p>原文にあった、ニネベの偶像をすべて壊した、以後一度も攻撃しなかった等の断定は、改訂PDFと同様に加えていません。ヨナ書4章の続きは、この教材の範囲には加えていません。</p>
   <p>あらしはこの物語の出来事です。すべての災難が本人の罪への罰だという一般則としては扱わないでください。断食や家畜への命令は当時の物語の説明で、児童に実行させる課題ではありません。</p>
   <h3>資料</h3><p><a href="jonah_lesson_modern_japanese.pdf" target="_blank" rel="noopener">もとの改訂教材PDFを開く ↗</a><br>聖書範囲：ヨナ書。挿絵：プロジェクト内の6点。エンジン：Monogatari 2.8.0（MIT）。</p>
  `,'授業の手引き');
 }
 function helpDialog() {
  openDialog('自分のペースで読もう',`
   <p>「つぎへ」、スペースキー、右矢印で進みます。絵や文章を押しても進めます。「もどる」または左矢印で前へ。答えをえらぶときは、ボタンを押してください。</p>
   <p>「しおりをはさむ」で、今の場所を残せます。自動保存のつづきは、表紙から開けます。</p>
   <label class="setting-row">文字の大きさ<select id="font-size" aria-label="文字の大きさ"><option value="normal">ふつう</option><option value="large">大きく</option></select></label>
   <label class="setting-row">文字の出かた<select id="type-mode" aria-label="文字の出かた"><option value="flow">ゆっくり</option><option value="instant">まとめて</option></select></label>
   <p>声に出して読んだり、おうちの人や先生といっしょに考えたりしてね。</p>
  `,'あそび方');
  const font=document.getElementById('font-size'), type=document.getElementById('type-mode');
  font.value=safeLocal.get('font','normal');type.value=safeLocal.get('type','flow');
  font.onchange=()=>{safeLocal.set('font',font.value);applyPreferences();};
  type.onchange=()=>{safeLocal.set('type',type.value);applyPreferences();};
 }
 function decorateSaves() {
  document.querySelectorAll('load-screen button.top').forEach(el=>el.setAttribute('aria-label','お話にもどる'));
  document.querySelectorAll('save-slot').forEach(el=>{
   el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label','このしおりから読む：'+(el.getAttribute('name')||'しおり'));
  });
  document.querySelectorAll('save-slot button[data-delete]').forEach(el=>el.setAttribute('aria-label','このしおりを消す'));
 }
 function applyPreferences() {
  document.documentElement.style.setProperty('--dialog-size',safeLocal.get('font')==='large'?'27px':'');
  engine.setting('TypeAnimation',safeLocal.get('type','flow')!=='instant'&&!matchMedia('(prefers-reduced-motion: reduce)').matches);
 }
 function confirmRestart(label) {
  if(engine.global('playing')) {
   openDialog('ここから読む？','<p>今の場所は自動のしおりに残して、えらんだお話のはじめから読みます。</p><button class="primary" data-action="confirm-chapter" data-label="'+label+'">ここから読む →</button>','お話をえらぶ');
  } else startAt(label);
 }
 engine.registerListener('noop',{callback:()=>true});
 engine.registerListener('begin',{callback:()=>confirmRestart('Start')});
 engine.registerListener('confirm-chapter',{callback:async(_e,el)=>{await saveBookmark();await startAt(el.data('label'));}});
 engine.registerListener('read-chapter',{callback:(_e,el)=>confirmRestart('Chapter'+el.data('chapter'))});
 engine.registerListener('resume',{callback:resume});
 engine.registerListener('chapters',{callback:chaptersDialog});
 engine.registerListener('teacher',{callback:teacherDialog});
 engine.registerListener('game-help',{callback:helpDialog});
 engine.registerListener('home',{callback:async()=>{clearTimeout(saveTimer);await saveBookmark();engine.autoPlay(false);await engine.showScreen('main');paintCards();}});
 engine.registerListener('quick-save',{callback:()=>saveBookmark(true)});
 engine.registerListener('next-dialog',{callback:async()=>{try{await engine.proceed({userInitiated:true});}catch{/* Choices deliberately block advancing. */}}});
 window.JonahBook={complete(){safeLocal.set('finished',true);toast('ヨナの旅を、最後まで読みました。');}};
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
  ready=true;applyPreferences();
  document.querySelector('[data-action="begin"]').disabled=false;
  const auto=await engine.Storage.get('JonahAuto_1').catch(()=>null);
  document.getElementById('resume').hidden=!auto?.game;
  engine.on('didUpdateState',()=>updateHUD());
  engine.on('didRunAction',()=>{
   updateHUD();clearTimeout(saveTimer);
   if(engine.global('playing'))saveTimer=setTimeout(()=>saveBookmark(),400);
  });
  engine.on('didLoadGame',()=>updateHUD());
  new MutationObserver(()=>updateHUD()).observe(document.querySelector('game-screen'),{childList:true});
  new MutationObserver(decorateSaves).observe(document.querySelector('load-screen'),{childList:true,subtree:true});
  document.querySelector('load-screen').addEventListener('keydown',e=>{
   if(e.target.matches('save-slot')&&['Enter',' '].includes(e.key)){e.preventDefault();e.target.click();}
  });
  decorateSaves();updateHUD();
 });
})();
