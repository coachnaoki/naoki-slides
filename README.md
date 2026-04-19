# naoki-slides

**台本を渡すだけで Google Slides が完成する、Naoki式 AI スライド自動生成テンプレート。**

naoki-blueprint（動画制作テンプレート）の姉妹プロジェクト。ライセンスIDは共通です。

---

## できること

- 自由テキストの台本を渡す → Claude が構成を設計 → **1分程度で Google Slides 完成**
- 17種類のプロ仕様スライドテンプレート（タイトル / 3カード / 対比 / ステップ / 統計 等）
- 見た目は HTML キャプチャ → Google Slides に画像として貼り付け
- 生徒自身の Google Drive に保存（Naoki のクォータを消費しない）

---

## 初回セットアップ（1回だけ）

### 1. リポジトリを取得

```bash
cd ~/Desktop/Cursor  # 任意のフォルダへ
git clone https://github.com/coachnaoki/naoki-slides.git
cd naoki-slides
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. ライセンス認証

naoki-blueprint と同じライセンスIDが使えます。

```bash
node scripts/validateLicense.mjs NK-XXXX-XXXX-XXXX
```

認証に成功すると `✓ {あなたの名前} さん、認証済みです` と表示されます。

### 4. GAS（Google Apps Script）のデプロイ

スライドを生徒自身の Google Drive に書き込むため、**各自 GAS をデプロイする必要があります**。

#### 手順

1. https://script.google.com/ にアクセス
2. 「新しいプロジェクト」を作成
3. `gas/コード.js` の中身を丸ごとコピー → GAS エディタに貼り付け
4. 「デプロイ」→「新しいデプロイ」→ 種類「ウェブアプリ」を選択
5. 「次のユーザーとして実行」=「自分」
6. 「アクセスできるユーザー」=「自分のみ」
7. 「デプロイ」ボタンを押す
8. 表示された **Web App URL** をコピー

### 5. 出力先の Google Slide を作成

1. https://slides.google.com/ で新しい空のプレゼンを作成
2. タイトルは何でもOK（例: `マイプレゼンテーション`）
3. URL から ID をコピー
   - 例: `https://docs.google.com/presentation/d/1ABCxyz.../edit` → `1ABCxyz...` の部分

### 6. `.env` ファイルを作成

naoki-slides ディレクトリ直下に `.env` ファイルを作成し、以下を記入：

```
GAS_WEBHOOK_URL=https://script.google.com/macros/s/XXXXXXXXXXXX/exec
GOOGLE_SLIDE_ID=1ABCxyz...
```

（ステップ4でコピーしたURL、ステップ5でコピーしたIDを貼る）

> `.env` は `.gitignore` で除外されるので、GitHubにはアップロードされません。

---

## プレゼン作成（毎回の作業）

### 1. 新しいプレゼンを作成

```bash
./新規スライド.sh
```

プレゼン名を聞かれるので入力（例: `tennis-camp-2026`）。
→ `presentations/tennis-camp-2026/` が作られます。

### 2. 台本を書く

`presentations/tennis-camp-2026/台本.md` を開いて自由に書く。
話し言葉・箇条書き・見出し混在でOK。

### 3. Claude Code でスキル起動

```bash
cd presentations/tennis-camp-2026
claude --dangerously-skip-permissions
```

Claude Code が立ち上がったら：

```
/slides-create
```

Claude が台本を解析 → スライド構成を設計 → 画像生成 → Google Slide 反映までを自動で行います。

### 4. 完成

Claude が Google Slide の URL を返すので、ブラウザで開いて確認。

---

## アップデート

テンプレートが更新されたら：

```bash
./アップデート.sh
```

あなたが作った `presentations/` と `.license` / `.env` は上書きされず安全です。

---

## ディレクトリ構成

```
naoki-slides/
├── .claude/skills/slides-create/   # メインスキル
├── .template-slides/               # 新規プレゼンの雛形
├── templates/slides.html           # 17種テンプレ（gas-slides由来）
├── scripts/                        # 台本解析・画像化・GAS送信
├── gas/                            # GAS本体（ユーザーがデプロイ）
├── presentations/                  # あなたのプレゼン（gitignore）
├── 新規スライド.sh
├── アップデート.sh
└── CLAUDE.md
```

---

## よくある質問

**Q. Google Slide上でテキストを編集できない**
A. 画像として貼り付けているため編集不可です。修正は `台本.md` を編集して再実行してください。

**Q. ライセンスIDを忘れた**
A. X で [@ai_skill_naoki](https://x.com/ai_skill_naoki) をフォロー → DM してください。

**Q. GASのデプロイでエラーが出る**
A. 「アクセスできるユーザー」を「自分のみ」にしたか確認してください。「全員」は避けてください（セキュリティリスク）。

**Q. 画像生成が重い/遅い**
A. 1回あたり10〜30秒程度。それ以上かかる場合は Puppeteer が止まっている可能性があります。Claude に相談してください。

---

## サポート

- X: [@ai_skill_naoki](https://x.com/ai_skill_naoki) （フォロー → DM）
- 姉妹プロジェクト: [naoki-blueprint](https://github.com/coachnaoki/naoki-blueprint)
