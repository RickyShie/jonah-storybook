# ヨナのものがたり

幼年班 2-3-5「第五課 逃げた預言者」の、日本語ビジュアルノベルです。
Monogatari **2.8.0** の実際のエンジンで、文章・シーン・選択肢・履歴・保存を動かしています。

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

ビルドにはゲームの実行ファイル、WebP画像、アイコン、エンジンのライセンス、ゲーム内から開く教材PDFを含めます。元のPNG、開発サーバー、テスト、設定ファイルは含めません。生成先の `dist/` はGit管理対象外です。

### 公開用ファイルをローカルで確認

```sh
npm run build
npm run preview
```

http://localhost:4173 を開きます。`npm start` は従来どおり編集元のゲームを表示します。プレビューを終えるときは Ctrl+C を押してください。

ローカルと公開サイトは別のアドレスなので、ローカルのしおりは公開サイトには引き継がれません。初回アクセスには通信が必要です。サービスワーカーによるオフライン保存は行いません。

公式手順：[GitHub Pagesのカスタムワークフロー](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 内容と操作

- 原教材の6つの見出しに対応する、6枚の挿絵と短い文章。
- マタイ5:44、名前を唱える活動、物語の問いかけ。
- 理解を深める5つの選択問題と、最後の気持ちのふり返り。答えによって聖書の出来事は変わりません。
- クリック・スペース・右矢印で進み、左矢印または「もどる」で戻ります。
- 文字の途中で進めると全文を表示します。選択中は答えを選ぶまで進みません。
- 「あそび方」で文字サイズと表示方法を変更できます。
- 自動保存のつづきは表紙から。手動の「しおり」は独立した1枠に上書きされます。
- 保存は同じブラウザ・同じアドレスに限られます。ブラウザデータを消すと保存も消えます。
- 表紙の6枚の絵から、どの章からでも読めます。途中で章を変える際は確認があります。

## 編集

- `js/script.js`：本文・質問・分岐。`Chapter1`〜`Chapter6` が各話です。
- `js/chapters.js`：章名と表紙のカード。
- `js/main.js`：表紙の章カード、しおり、文字設定。
- `js/options.js`：Monogatari設定。
- `style/main.css`：画面デザインと端末幅への対応。
- `assets/scenes/`：元のPNGから作った軽量WebP。元PNGは変更していません。
- `scripts/build.mjs`：GitHub Pages用の静的ファイルを `dist/` に出力。
- `.github/workflows/pages.yml`：検証とGitHub Pagesへの自動デプロイ。
- `engine/`：公式リリースのMonogatari実行ファイルとMITライセンス。
- `jonah_lesson_modern_japanese.pdf`：参照した教材。そのまま保存しています。

`npm test` で物語のリンク、画像、両方の回答経路が同じ結末に達すること、および公開用ファイルがサイト直下・リポジトリ配下の両方で解決できることを検証できます。

## 教師向け

教師向けの説明は `docs/teacher-guide.md` を参照してください。
子どもに断食をさせる活動ではありません。魚の種類など、聖書が特定しない描写は断定しません。

## エンジンの出典

Monogatari 2.8.0 / MIT： https://github.com/Monogatari/Monogatari/releases/tag/v2.8.0
公式ドキュメント： https://monogatari.io/v2/
挿絵と教材の権利はそれぞれの権利者に帰属します。エンジンのライセンスは `engine/LICENSE` に同梱しています。
