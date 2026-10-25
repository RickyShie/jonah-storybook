/* Monogatari 2.8.0. All engine and illustration files are local. */
'use strict';
monogatari.settings({Name:'Jonah Storybook 2-3-5',Version:'1.0.0',Label:'Start',Slots:6,
 MultiLanguage:false,LanguageSelectionScreen:false,ShowMainScreen:true,Preload:true,
 ServiceWorkers:false,AutoSave:0,SaveLabel:'JonahSave',AutoSaveLabel:'JonahAuto',
 TypeAnimation:true,InstantText:true,NarratorTypeAnimation:true,Orientation:'any',
 ForceAspectRatio:'None',AllowRollback:true,Skip:0,Screenshots:false,
 Storage:{Adapter:'LocalStorage',Store:'JonahLesson',Endpoint:''},
 AssetsPath:{root:'assets',scenes:'scenes',characters:'characters',images:'images',music:'music',sounds:'sounds',voices:'voices',videos:'videos',icons:'icons',ui:'ui',gallery:'gallery'}
});
monogatari.preferences({Language:'日本語',TextSpeed:35,AutoPlaySpeed:6});
monogatari.storage({chapter:0,finished:false});
monogatari.translation('日本語',{
 Load:'しおりを開く',LoadSlots:'自分のしおり',LoadAutoSaveSlots:'自動のしおり',
 NoSavedGames:'まだ、しおりはありません。',NoAutoSavedGames:'自動のしおりはありません。',
 Close:'閉じる',Back:'もどる',Delete:'消す',Cancel:'やめる',OK:'はい',Overwrite:'上書きする',
 SlotDeletion:'このしおりを消しますか？',SlotOverwrite:'このしおりに上書きしますか？',
 Loading:'お話の準備中',LoadingMessage:'絵を読み込んでいます。',Save:'しおりをはさむ'
});
