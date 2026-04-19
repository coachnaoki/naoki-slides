# naoki-slides

**台本を渡すだけで Google Slides が完成する、Naoki式 AI スライド自動生成テンプレート。**

> ⚠️ **本テンプレは [naoki-blueprint](https://github.com/coachnaoki/naoki-blueprint) 生徒限定です。**
> ライセンスIDは naoki-blueprint で発行されたものをそのまま使います。新規にIDは発行しません。
> naoki-blueprint を未導入の方は、まず [naoki-blueprint](https://github.com/coachnaoki/naoki-blueprint) のセットアップを先にお願いします。

---

## できること

- 自由テキストの台本を渡す → Claude が構成を設計 → **1分程度で Google Slides 完成**
- 17種類のプロ仕様スライドテンプレート（タイトル / 3カード / 対比 / ステップ / 統計 等）
- 見た目は HTML キャプチャ → Google Slides に画像として貼り付け
- 生徒自身の Google Drive に保存（Naoki のクォータを消費しない）

---

## 初回セットアップ（5分）

### 1. リポジトリを取得

```bash
cd ~/Desktop/Cursor  # 任意のフォルダへ
git clone https://github.com/coachnaoki/naoki-slides.git
cd naoki-slides
npm install
```

### 2. ライセンス認証

**naoki-blueprint で発行されたライセンスID** を使います（新規IDは発行されません）。

```bash
node scripts/validateLicense.mjs NK-XXXX-XXXX-XXXX
```

認証に成功すると `✓ {あなたの名前} さん、認証済みです` と表示されます。

> 💡 ヒント: naoki-blueprint フォルダに `.license` ファイルが既に存在する場合、それを naoki-slides フォルダにコピーすれば認証ステップをスキップできます（同じPC前提）:
> ```bash
> cp ../naoki-blueprint/.license .
> ```

### 3. セットアップスクリプトを実行

```bash
./セットアップ.sh
```

対話形式で以下を案内します：
1. **Slideテンプレを自分のDriveにコピー**（Naoki提供のリンクをクリック）
   → スライドに紐づくGASも一緒にコピーされます
2. **コピーしたSlideを開き、「拡張機能」→「Apps Script」を選択**
3. **スクリプトエディタで「デプロイ」ボタンを1回押す** → URL取得
4. **URLとSlideIDを貼り付け** → `.env` が自動生成される

セットアップ完了後は `.env` が出来上がり、すぐにプレゼン作成を始められます。

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
├── gas/                            # GAS本体（参考・生徒はテンプレコピーで取得）
├── presentations/                  # あなたのプレゼン（gitignore）
├── 新規スライド.sh
├── セットアップ.sh
├── アップデート.sh
└── CLAUDE.md
```

---

## よくある質問

**Q. Google Slide上でテキストを編集できない**
A. 画像として貼り付けているため編集不可です。修正は `台本.md` を編集して再実行してください。

**Q. ライセンスIDを忘れた**
A. naoki-blueprint の `.license` ファイル内に保存されているので、そちらを確認してください（`cat ~/Desktop/Cursor/naoki-blueprint/.license | grep license_id`）。それでも不明な場合は X で [@ai_skill_naoki](https://x.com/ai_skill_naoki) をフォロー → DM してください。

**Q. naoki-blueprint を導入していないが、naoki-slides だけ使いたい**
A. 申し訳ありません、naoki-slides は naoki-blueprint 生徒限定で、単体でのライセンス発行は行っていません。

**Q. GASのデプロイでエラーが出る**
A. 「アクセスできるユーザー」を「自分のみ」にしたか確認してください。「全員」は避けてください（セキュリティリスク）。

**Q. デプロイ時に「承認されていないアプリ」と出る**
A. 「詳細」→「{プロジェクト名}（安全ではないページ）に移動」→ 許可 で進めてください。自分のスクリプトなので安全です。

**Q. 画像生成が重い/遅い**
A. 1回あたり10〜30秒程度。それ以上かかる場合は Puppeteer が止まっている可能性があります。Claude に相談してください。

**Q. 複数のプレゼンを作りたい**
A. `./新規スライド.sh` で何度でも作れます。すべて同じGoogle Slideに上書きされるので、分けたい場合は Google Drive 上で別名コピーしてから次を作ってください。

---

## サポート

- X: [@ai_skill_naoki](https://x.com/ai_skill_naoki) （フォロー → DM）
- 姉妹プロジェクト: [naoki-blueprint](https://github.com/coachnaoki/naoki-blueprint)
