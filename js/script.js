'use strict';
/* Source: jonah_lesson_modern_japanese.pdf. Questions never change the biblical events. */
const ruby = (word, reading) => `<ruby>${word}<rt>${reading}</rt></ruby>`;
const GOD = ruby('神様','かみさま');
const MEMORY_VERSE = 'v <span class="memory-verse">しかし、わたしはあなたがたに'+ruby('言','い')+'う。'+ruby('敵','てき')+'を'+ruby('愛','あい')+'し、'+ruby('迫害','はくがい')+'する'+ruby('者','もの')+'のために'+ruby('祈','いの')+'れ。</span><small class="verse-reference">マタイによる'+ruby('福音書','ふくいんしょ')+' 5'+ruby('章','しょう')+'44'+ruby('節','せつ')+'（'+ruby('口語訳','こうごやく')+'）</small>';
// Format displayed text only: never touch scene identifiers, jumps, or HTML attributes.
const highlightNames = text => text.split(/(<[^>]*>)/g).map(part => part.startsWith('<') ? part : part.replace(/ヨナ|ニネベ|タルシシ/g, name => '<strong class="story-name">'+name+'</strong>')).join('');

monogatari.assets('scenes', Object.fromEntries([1,2,3,4,5,6].map(i => [`scene${i}`, `scene-${i}.webp`])));
monogatari.assets('scenes', {scene5rescue:'scene-5-rescue.png',scene6:'scene-6-warning.png',scene6repentance:'scene-7-repentance.png'});
monogatari.characters({
 n:{name:'おはなし',color:'#315958'},
 q:{name:'いっしょに考えよう',color:'#9b5b31'},
 v:{name:'今日の聖句',color:'#9b5b31'}
});
const script = {};
function question(label, prompt, answers, next) {
 const options = {Dialog:'q '+prompt,Class:'reflection'};
 answers.forEach(([text,feedback],i) => {
  const dest = label+'Answer'+i;
  options['Answer'+i] = {Text:text,Do:'jump '+dest};
  script[dest] = ['q '+feedback,'jump '+next];
 });
 script[label] = [{Choice:options}];
}
script.Start = [
 'show scene scene1 with fadeIn',
 'n これは、ヨナという人のお話です。<br>絵を見ながら、いっしょに読んでみましょう。',
 'n ヨナは、'+GOD+'の言葉を人々に伝える人でした。<br>このような人を「'+ruby('預言者','よげんしゃ')+'」といいます。',
 'q みんなで「ヨナ」と、2回言ってみましょう。<br>つぎは「ヨナ よげんしゃ」と、2回言ってみましょう。',
 MEMORY_VERSE,
 'jump Chapter1'
];
script.Chapter1 = [
 'show scene scene1 with fadeIn',
 'n ある日、'+GOD+'はヨナに、ニネベという町へ行って、<br>神様の言葉を伝えるように言われました。',
 'n その町の人々は、悪いことをたくさんしていました。<br>悪いことをやめて、神様の言葉に従うことが大切でした。',
 'n 悪いことをやめて、神様の方へ心を向けることを、<br>「'+ruby('悔い改める','くいあらためる')+'」といいます。',
 'n けれども、ヨナは行きたくありませんでした。<br>ニネベの人々を、'+ruby('敵','てき')+'だと思っていたからです。',
 'n ヨナは、神様が、悔い改めた人をかわいそうに思い、<br>ゆるしてくださることを知っていました。',
 'n でも、ニネベの人たちがゆるされるのを、<br>ヨナは喜べませんでした。',
 'jump Chapter2'
];
script.Chapter2 = [
 'show scene scene2 with fadeIn',
 'n ヨナは、神様の言葉に従わず、船が集まる港へ行きました。<br>そこで、タルシシへ向かう船を見つけました。',
 'n ヨナはお金を払って、ニネベから遠くへ行く船に乗りました。<br>こうして、神様から逃げようとしたのです。',
 'n 船が進むと、ヨナは船の下の方で、<br>ぐっすり眠ってしまいました。',
 'jump Chapter2Question'
];
question('Chapter2Question',GOD+'は、ヨナがどこにいるか、わかるでしょうか？',[
 ['はい、わかります。','そうですね。神様は、何でも知っておられます。<br>遠くへ行っても、神様から逃げることはできません。'],
 ['遠い所なら、わからないかも。','ヨナは逃げようとしました。でも、神様は何でも知っておられます。<br>遠くにいるヨナのことも、知っておられました。']
],'Chapter2After');
script.Chapter2After = [
 'q ヨナが神様の言葉に従わないと、何が起こったでしょう？<br>絵を見ながら、考えてみましょう。',
 'n 神様は、ヨナがしたことを、そのままにはされませんでした。<br>つぎのお話を聞きましょう。','jump Chapter3'
];
script.Chapter3 = [
 'show scene scene3 with fadeIn',
 'n 神様は、海に強い風を起こされました。<br>大きな波が船にぶつかり、船はこわれそうになりました。',
 'n 船の人たちはこわくなり、それぞれ、自分が信じる神に「助けて」と祈りました。<br>荷物を海に投げて、船を軽くしました。<br>でも、あらしはやみませんでした。',
 'jump Chapter3Question'
];
question('Chapter3Question','このとき、船の下で眠っていたのは、だれでしょう？',[
 ['ヨナ','そう、ヨナです。船が大きくゆれる中でも、眠っていました。'],
 ['船長','船長ではなく、ヨナが眠っていました。<br>船長は、眠っているヨナのところへ行きました。']
],'Chapter3After');
script.Chapter3After = [
 'n 船長はヨナを起こして言いました。<br>「起きなさい。あなたの神に助けを求めてください。」',
 'n 「私たちを助けてくださるかもしれません。」<br>船長は、ヨナにそう呼びかけました。','jump Chapter4'
];
script.Chapter4 = [
 'show scene scene4 with fadeIn',
 'n 船の人たちは、だれのためにあらしが起きたのか、知りたいと思い、<br>くじを引きました。くじは、だれに当たったでしょう？',
 'n ヨナに当たりました。ヨナは言いました。<br>「私は、海と陸を造られた神様を信じています。」',
 'n ヨナは、神様の言葉に従わず、逃げてきたことも話しました。<br>人々は、とてもこわくなりました。海は、もっと荒れました。',
 'n ヨナは言いました。「私を海に投げ入れてください。<br>そうすれば、海は静かになります。このあらしは、私のために起きたのです。」',
 'n 人々は、ヨナを海に投げ入れたくありませんでした。<br>陸に戻ろうと、いっしょうけんめい船をこぎました。<br>でも、戻れませんでした。',
 'n そこで神様に祈り、ヨナを海に投げ入れました。',
 'jump Chapter4Question'
];
question('Chapter4Question','すると、海はどうなったでしょう？',[
 ['あらしがやみ、静かになった。','そうです。あらしがやみ、海は静かになりました。'],
 ['もっと荒れた。','あらしはやみました。<br>海は静かになったのです。']
],'Chapter4After');
script.Chapter4After = [
 'n 船の人たちは、'+ruby('真の神','まことのかみ')+'の大きな力を知り、神様をおそれ敬いました。<br>神様にささげ物をし、約束をしました。','jump Chapter5'
];
script.Chapter5 = [
 'show scene scene5 with fadeIn',
 'n ヨナは、深い海の中へ、しずんでいきました。<br>まわりは海の水でいっぱいです。苦しくなりました。',
 'q 海の水は、どんな味がするでしょう？<br>声に出して、答えてみましょう。',
 'n しょっぱいですね。<br>神様は、大きな魚を用意しておられました。',
 'n その魚が、ヨナをのみこみました。<br>ヨナは、魚のおなかの中に入ったのです。',
 'q ヨナは、どこにいるのでしょう？<br>絵を見て、指でさしてみましょう。',
 'n 大きな魚のおなかの中です。<br>暗い場所で、ヨナは困っていたことでしょう。',
 'q もし、みんながヨナだったら、どうするでしょう？<br>どうしたいか、お話ししてみましょう。',
 'n そんな所でも、ヨナの声を聞いてくださる方がいます。<br>神様です。',
 'jump Chapter5Question'
];
question('Chapter5Question','ヨナは、どうすればよいでしょう？',[
 ['神様に祈る。','そうですね。魚のおなかの中でも、神様に祈ることができます。'],
 ['何もできない。','ひとりぼっちに思えても、祈ることができます。<br>神様は、ヨナの祈りを聞いてくださいました。']
],'Chapter5After');
script.Chapter5After = [
 'n ヨナは、魚のおなかの中から神様に祈りました。<br>苦しいとき、神様を思い出して、助けを求めました。',
 'n そして、救ってくださる神様に「ありがとう」と祈りました。<br>神様との約束を守ろうとしました。',
 'n ヨナは、魚のおなかの中に、三日三晩、いました。<br>神様は、ヨナの祈りを聞いてくださいました。',
 'show scene scene5rescue with fadeIn',
 'n 神様は魚に命じ、ヨナを陸に吐き出させました。<br>ヨナの命を救ってくださったのです。',
 'n ヨナは、神様を信じて、助けを求めることの大切さを学びました。','jump Chapter6'
];
script.Chapter6 = [
 'show scene scene6 with fadeIn',
 'n 神様は、もう一度ヨナに、ニネベへ行って、<br>神様の言葉を伝えるように言われました。',
 'n 今度は、ヨナは神様の言葉に従って、ニネベへ行きました。<br>ニネベは、とても大きな町でした。',
 'n ヨナは町の中を歩き、四十日たつと町がほろびる、<br>という神様からの知らせを伝えました。',
 'n このまま悪いことを続けると、町がほろびる、という知らせです。<br>ニネベの人たちは、神様の言葉を信じました。',
 'show scene scene6repentance',
 'n 王様にも、その知らせが届きました。<br>王様は、りっぱな王の服をぬぎました。',
 'n 王様は、神様の前で、自分がまちがっていたことを認めました。',
 'n 王様と家来たちは、人々に言いました。<br>「'+ruby('断食','だんじき')+'をして、神様に祈りましょう。悪いことや、人を傷つけることをやめましょう。」',
 'n 「断食」とは、食べ物をとらないことです。<br>このときは、牛や羊などにも、えさや水をあげないように言われました。',
 'n 人々は、神様に「どうか、助けてください」と祈りました。<br>「ごめんなさい」と言うだけでなく、悪いことをやめました。<br>心も、することも変えたのです。',
 'jump Chapter6Question'
];
question('Chapter6Question','「悔い改める」とは、どうすることでしょう？',[
 ['悪いことをやめて、神様の方へ心を向ける。','そうですね。ニネベの人たちも、心も、することも変えました。'],
 ['「ごめんなさい」と言って、同じことを続ける。','「ごめんなさい」という言葉だけでなく、することも変えるのが大切です。<br>ニネベの人たちは、悪いことをやめました。']
],'Chapter6After');
script.Chapter6After = [
 'n 神様は、人々が悪いことをやめたのをご覧になり、<br>かわいそうに思ってくださいました。',
 'n そして、神様は、この町をほろぼすのをやめられました。',
 'n 神様は、悔い改める人を、あわれんでくださいます。<br>あわれむとは、かわいそうに思い、助けようとすることです。',
 'jump Reflection'
];
script.Reflection = [
 MEMORY_VERSE,
 'q 友だちが、まちがいを認めてあやまってきたら、<br>みんなは、どうしたいですか？',
 {Choice:{Dialog:'q 自分の気持ちを考えて、えらんでみましょう。',
  Kind:{Text:'ゆるして、仲よくしたい。',Do:'jump Kind'},
  Hard:{Text:'ゆるすのが、まだむずかしい。',Do:'jump Hard'}}}
];
script.Kind=['q 友だちのまちがいをゆるし、やさしくしていきたいですね。<br>神様の教えに従えるよう、お祈りしましょう。','jump Finish'];
script.Hard=['q ゆるすのがむずかしい気持ちも、神様にお話ししましょう。<br>やさしくできるように、神様に助けを求めて祈れます。','jump Finish'];
script.Finish = [
 'n 私たちも神様の言葉に従い、友だちのまちがいをゆるし、<br>自分の敵にも、愛をもって、やさしくしましょう。',
 function () { this.storage({finished:true}); window.JonahBook?.complete(); },
 'n これで、ヨナのものがたりはおしまいです。<br>おぼえていることを、先生やおうちの人と話してみましょう。',
 {Choice:{Dialog:'q いっしょに読んでくれて、ありがとう。',
  Cover:{Text:'表紙にもどる',Do:'end'},
  Read:{Text:'もう一度読む',Do:'jump Start'}}}
];
for (const lines of Object.values(script)) {
 for (let i=0;i<lines.length;i++) {
  const line=lines[i];
  if (typeof line==='string' && /^[nqv] /.test(line)) lines[i]=highlightNames(line);
  else if (line?.Choice) for (const [key, option] of Object.entries(line.Choice)) {
   if (key==='Dialog') line.Choice[key]=highlightNames(option);
   else if (option?.Text) option.Text=highlightNames(option.Text);
  }
 }
}
monogatari.script(script);
