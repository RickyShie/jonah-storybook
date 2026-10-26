# ヨナのものがたり

幼年班 2-3-5「第五課 逃げた預言者」の、日本語ビジュアルノベルです。
Monogatari **2.8.0** の実際のエンジンで、文章・シーン・選択肢・履歴を動かしています。

## 起動

Node.js 18以降が必要です。追加パッケージのインストールは不要です。

- Mac：`Start.command` をダブルクリックすると、ローカルサーバーとブラウザが開きます。
- または、このフォルダで `npm start` を実行し、http://localhost:4173 を開きます。
- 終了するときは、起動したターミナルで Ctrl+C を押します。

`index.html` の直接ダブルクリックではなく、上記の方法で開いてください。
ゲーム本体、画像、スタイルはすべて同梱。外部CDNは使いません。ローカル起動ではインターネット接続は不要です。

## GitHub Pagesで公開

1. このプロジェクトをGitHubリポジトリにプッシュします。`engine/`、`assets/scenes/`、`assets/favicon.svg`、教材PDFもコミットしてください。
2. リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にします。
3. 既にプッシュ済みの場合は、**Actions → Check and deploy GitHub Pages → Run workflow** を既定ブランチで実行します。それ以降は既定ブランチへのプッシュで自動更新されます。
4. ワークフローが成功したら、**Settings → Pages** またはワークフローの `github-pages` 環境に表示されるURLを開きます。

GitHub上にNode.jsサーバーを常駐させる必要はありません。GitHub Actionsが `npm test` と `npm run build` を実行し、`dist/` の静的ファイルを公開します。プルリクエストや既定以外のブランチでは検証だけを行います。

URLは通常 `https://<ユーザー名>.github.io/<リポジトリ名>/` です。画像・スクリプト・PDFへの参照はすべて相対パスのため、リポジトリ名の変更や独自ドメインにも対応します。`<base href="/">` や `/assets/...` のようなサイトルートを前提とするパスは追加しないでください。

ビルドにはゲームの実行ファイル、6本のMP4動画、WebP静止画、アイコン、エンジンのライセンス、ゲーム内から開く教材PDFを含めます。元のPNG、アニメーション制作用のレイヤー、開発サーバー、テスト、設定ファイルは含めません。生成先の `dist/` はGit管理対象外です。

### 公開用ファイルをローカルで確認

```sh
npm run build
npm run preview
```

http://localhost:4173 を開きます。`npm start` は従来どおり編集元のゲームを表示します。プレビューを終えるときは Ctrl+C を押してください。

初回アクセスには通信が必要です。サービスワーカーによるオフライン保存は行いません。

公式手順：[GitHub Pagesのカスタムワークフロー](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 内容と操作

- 原教材の6つの見出しに対応する、6つの静かなループ動画と短い文章。元の挿絵も静止画として保持しています。
- 読書画面の「動きを止める」で静止画に切り替えられます。端末の「視差効果を減らす」等の設定も尊重します。
- マタイ5:44、名前を唱える活動、物語の問いかけ。
- 理解を深める5つの選択問題と、最後の気持ちのふり返り。答えによって聖書の出来事は変わりません。
- クリック・スペース・右矢印で進み、左矢印または「もどる」で戻ります。
- 文字の途中で進めると全文を表示します。選択中は答えを選ぶまで進みません。
- 「あそび方」で文字サイズと表示方法を変更できます。
- 表紙の6枚の絵から、どの章からでも読めます。絵をクリックすると、その章のはじめからすぐに読めます。保存・読み込み・再開機能はありません。

## 編集

- `js/script.js`：本文・質問・分岐。`Chapter1`〜`Chapter6` が各話です。
- `js/chapters.js`：章名と表紙のカード。
- `js/main.js`：表紙の章カード、直接の章移動、文字設定。
- `js/scene-motion.js`：現在の章の動画だけを再生。非表示時は停止し、再生できない場合は元の静止画を表示。
- `assets/videos/`：12秒・24fps・1280×720の無音H.264 MP4ループ。
- `assets/animation-sources/`：動画再生成用の背景・透明キャラクターレイヤー（公開ビルドには含めません）。
- `js/options.js`：Monogatari設定。
- `style/main.css`：画面デザインと端末幅への対応。
- `assets/scenes/`：元のPNGから作った軽量WebP。元PNGは変更していません。
- `scripts/build.mjs`：GitHub Pages用の静的ファイルを `dist/` に出力。
- `.github/workflows/pages.yml`：検証とGitHub Pagesへの自動デプロイ。
- `engine/`：公式リリースのMonogatari実行ファイルとMITライセンス。
- `jonah_lesson_modern_japanese.pdf`：参照した教材。そのまま保存しています。

`npm test` で物語のリンク、画像、両方の回答経路が同じ結末に達すること、および公開用ファイルがサイト直下・リポジトリ配下の両方で解決できることを検証できます。

## アニメーションの再生成（必要なときだけ）

通常の起動・テスト・GitHub Pagesへの公開にはPythonやFFmpegは不要です。完成済みのMP4をそのまま配信します。

動画を作り直す場合は、Pythonの仮想環境で `pip install -r scripts/requirements-animation.txt` を実行してから `python scripts/render-scenes.py` を実行します。特定の章だけなら、例えば `python scripts/render-scenes.py 5`。この処理は `assets/videos/` の対象MP4を置き換えます。

これはLive2Dモデルではなく、承認済みの試作に合わせたレイヤー式のアニメーション映像です。画像レイヤーは組み込みの画像生成ツールで元のイラストから制作しました。プロンプトは `docs/animation-prompts.json` に記録しています。第五話は承認済み試作のレイヤーをそのまま使用しています。

## 教師向け

教師向けの説明は `docs/teacher-guide.md` を参照してください。
子どもに断食をさせる活動ではありません。魚の種類など、聖書が特定しない描写は断定しません。

## エンジンの出典

Monogatari 2.8.0 / MIT： https://github.com/Monogatari/Monogatari/releases/tag/v2.8.0
公式ドキュメント： https://monogatari.io/v2/
挿絵と教材の権利はそれぞれの権利者に帰属します。エンジンのライセンスは `engine/LICENSE` に同梱しています。
