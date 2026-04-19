---
name: slides-create
description: 台本テキストからGoogle Slidesを自動生成するnaoki-slides専用スキル。台本の内容を解析して17種類のプロ仕様テンプレート（title/three-cards/steps/stats/checklist/timeline/ranking 等）から最適なものを自動選択し、Puppeteerで画像化してGAS経由で生徒指定のGoogle Slideに反映する。ユーザーが「スライド作って」「スライド生成」「プレゼン作って」「Google Slideにして」「slides-create」と言ったら、明示的にスキル名を言わなくても必ず起動する。presentations/ 配下で作業している時や、台本.mdがあるプロジェクト内ではスライド生成の意図を示唆するあらゆる発言で優先起動する。
argument-hint: [projects配下のプレゼンフォルダ名（省略可・現在ディレクトリから自動検出）]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(node *), Bash(npm *), Bash(ls *), Bash(cat *), Bash(pwd *), Bash(open *)
---

<!-- LICENSE_GUARD: DO NOT REMOVE -->
> **認証必須**: このスキルの開始前に `node tools/_chk.mjs` を実行。exit code が 0 以外なら即中止し「ライセンスが無効です。権利者にお問い合わせください」と伝える。（詳細は CLAUDE.md の「ライセンス認証」セクション参照）

# slides-create: 台本→Google Slides 自動生成

台本.md を読み、17種のテンプレートから最適なものを自動選択してGoogle Slideを完成させる。

## 全体フロー（6ステップ）

```
Step 1. ライセンス認証 & 前提チェック
Step 2. 台本.md を読み、video-context に相当するプレゼン目的を把握
Step 3. テンプレート自動選択＋SLIDE_SCRIPT形式のJSON生成
Step 4. Puppeteerで画像化（tools/screenshot-slides.mjs）
Step 5. 📸 プレビュー生成＆ブラウザ表示（tools/generate-preview.mjs）
        → ユーザー目視確認「OKなら反映して」「○枚目を直して」
Step 6. ユーザーOKなら GAS経由でGoogle Slideに反映（tools/post-to-gas.mjs）
```

**重要**: Step 5 のプレビュー確認は必須。GAS送信は取り消しが面倒（Slide全削除→再作成）なので、必ず事前確認を挟む。

---

## Step 1. ライセンス認証 & 前提チェック

### 1-A. ライセンス認証

**認証フロー（順に試す・自動化可能な部分は自動でやる）**

```bash
# Step 1: まず通常チェック
node tools/_chk.mjs
```

exit 0 → OK。次へ。

exit 非0 の場合は以下を順に試す：

```bash
# Step 2: naoki-blueprint から自動コピーを試みる
node tools/find-license.mjs

# Step 3: コピー成功したら再度チェック
node tools/_chk.mjs
```

それでも失敗する場合はユーザーに「naoki-blueprintのライセンスIDを教えてください（例: NK-XXXX-XXXX-XXXX）」と聞き、以下を実行：

```bash
node tools/validateLicense.mjs NK-XXXX-XXXX-XXXX
```

最終的にも失敗したら「ライセンスが無効です。権利者にお問い合わせください」と伝えてスキルを中止する。

### 1-B. .env の設定確認

```bash
[ -f .env ] && grep -q "GAS_WEBHOOK_URL" .env && grep -q "GOOGLE_SLIDE_ID" .env && echo "OK" || echo "NG"
```

`NG` の場合、ユーザーに以下を伝える：

> `.env` ファイルが未設定、またはキーが足りません。
> README.md の「初回セットアップ」の GAS デプロイ → .env 作成 を完了してから再実行してください。

### 1-C. プレゼンフォルダの特定

```bash
pwd  # 今どこにいるか確認
```

- 現在ディレクトリが `projects/{name}/` 配下 → そのフォルダを使う
- `naoki-slides/` ルートにいる → ユーザーに「どのプレゼンですか？」と聞く（`ls projects/` で候補提示）
- `projects/` フォルダ自体がない or 空 → 「まず `./新規スライド.sh` でプレゼンを作成してください」と案内

プレゼンフォルダが確定したら、以降 `PRESEN_DIR` として扱う（例: `projects/テスト`）。

台本ファイルは `$PRESEN_DIR/script/` フォルダ内に置かれる。**ファイル形式は自由**（`.md` / `.txt` / `.rtf` / `.docx` のテキスト化 / その他どんな拡張子でもOK）。スキルは `script/` 配下の最初の読み取り可能なテキストファイルを自動で検出する。

### 1-D. 依存パッケージ確認

```bash
[ -d node_modules ] || npm install
```

`node_modules/` がなければ install。

---

## Step 2. 台本を読む

### 2-A. 台本ファイルを検出

`$PRESEN_DIR/script/` 配下のファイルを一覧して、最初のテキストファイルを台本として使う。

```bash
ls "$PRESEN_DIR/script/"
```

- **1ファイルだけ** → それを台本として使う（拡張子は `.md` / `.txt` / 何でもOK）
- **複数ファイルある** → ユーザーに「どのファイルを台本として使いますか？」と聞く
- **空 or フォルダ自体がない** → 「`$PRESEN_DIR/script/` に台本ファイルを置いてから再実行してください」と伝えて中止

検出したファイルパスを `SCRIPT_FILE` として扱う。

### 2-B. 中身を読む

```bash
cat "$SCRIPT_FILE"
```

### 読み取るべきこと

1. **プレゼンの目的・対象者**（明記されていれば抽出、なければ推測）
2. **全体構成**（章立て・ポイント数）
3. **数字・固有名詞・キーワード**（強調すべき要素）
4. **温度感**（ロジカル / 熱量高め / 優しい 等）

### 台本が空／雛形のままの場合

`.template-project/script/台本.md` のままの雛形テキスト（「ここにプレゼンのタイトルを書く」等）が残っている場合は、ユーザーに「台本に内容を書いてから再実行してください」と伝えて中止する。

---

## Step 3. SLIDE_SCRIPT を生成

ここがこのスキルの本体。**Claudeが台本を読んで 17種のテンプレから最適なものを選ぶ**。

### 3-A. テンプレート選択の判断基準（優先）

| 場面 | テンプレート |
|---|---|
| プレゼン全体のタイトル | `title`（1回目・冒頭） |
| 章の区切り | `section`（PART番号付き） |
| 今日話すこと・目次 | `agenda` |
| 3つのポイントを並列で紹介 | `three-cards` or `three-tactics` |
| 2つを対比・比較 | `two-columns` or `versus` |
| 時系列・手順 | `steps` or `timeline` |
| 変化・改善を見せたい | `before-after` |
| 大事な数字・統計 | `stats` |
| チェックしてほしいポイント | `checklist` |
| 順位付け・ランキング | `ranking` |
| 名言・引用 | `quote` |
| 強調・結論 | `big-message` or `highlight-box` |
| 最後のまとめ・CTA | `closing` |

### 3-B. 構成の鉄則

1. **冒頭は必ず `title`** — プレゼンの顔
2. **3枚に1枚は視覚変化** — 同じテンプレを連続で3枚以上使わない（退屈防止）
3. **stats は1プレゼンに最大2回** — 多用すると単調
4. **最後は `closing`** — アクションを促す
5. **1プレゼン 8〜15枚を目安**（短すぎても長すぎても集中が切れる）

### 3-C. 各テンプレートのプロパティ仕様

17種すべての正確なプロパティ構造は **必ず `references/templates.md` を読んで確認する**。
例：`title` には `icon/title/titleHighlight/titleSuffix/subtitle`、`stats` には `title/stats[{number, unit, label}]` 等、フィールドが厳密に決まっている。

誤ったキー名で JSON を作ると画像化時にフィールドが表示されず白紙になるため、references を毎回確認する習慣をつける。

### 3-D. テキスト記述ルール（必読）

全テンプレート共通の改行・ハイライト・文字数ルールは **`references/style-rules.md` に集約**。

特に重要な点：
- **1項目最大2行**
- **改行直前に「、」「。」を置かない**
- **単語の途中で改行しない**
- **改行タグは `<br>` or `\n` がテンプレごとに異なる**（templates.md 参照）
- **黄色マーカーは `<span style='background:#CCFF00'>...</span>`**

### 3-E. JSONを書き出す

構成が固まったら `$PRESEN_DIR/slide-data.json` に書き出す。

```bash
# 例
cat > "$PRESEN_DIR/slide-data.json" << 'EOF'
[
  { "type": "title", "icon": "fa-trophy", "title": "ダブルスで勝つための", "titleHighlight": "前衛の教科書", "subtitle": "..." },
  { "type": "agenda", "label": "AGENDA", "title": "今日話す3つのこと", "items": [...] },
  ...
]
EOF
```

実際は Write ツールでJSONファイルを作成する（Bashヒアドキュメントはエスケープが面倒）。

### 3-F. ユーザーに構成案を見せて承認を取る（必須）

画像化の前に、**構成案をテキストで提示してユーザーの承認を得る**。数十秒の Puppeteer 処理を無駄にしないため。

```
【スライド構成案】（全N枚）
1. title         — タイトル: 「ダブルスで勝つための前衛の教科書」
2. agenda        — 今日話す3つのこと
3. section       — PART 01: 前衛の役割
4. three-cards   — ポジショニング / タイミング / プレイスメント
5. stats         — 成功率 +30% / 守備範囲 1.5倍 / …
6. ...
N. closing       — 今すぐ実践しよう

このまま進めますか？（修正があれば指示してください）
```

ユーザーが OK と言うまで JSON を確定しない。修正指示があれば構成を差し替える。

---

## Step 4. 画像化（Puppeteer）

```bash
node tools/screenshot-slides.mjs "$PRESEN_DIR"
```

出力: `$PRESEN_DIR/output/slide_001.png ... slide_NNN.png`（1280×720、@2x解像度）

### 失敗時の対処
- `Cannot find module 'puppeteer'` → `npm install` 実行
- Puppeteerがタイムアウト → フォント読み込みが遅い可能性。`--waitUntil=networkidle2` に変える or 待ち時間を延ばす（tools/screenshot-slides.mjs を Edit）
- 画像が白紙 → JSONのキー名ミス。`references/templates.md` と照合

---

## Step 5. プレビュー生成＆ユーザー確認（必須）

```bash
node tools/generate-preview.mjs "$PRESEN_DIR"
```

動作:
- `$PRESEN_DIR/preview.html` が自動生成される
- ブラウザが自動でオープンして**全スライドを1列縦並びで表示**
- ユーザーが全スライドを目視確認

### ユーザーへの呼びかけ

```
プレビューをブラウザで開きました！
全{N}枚を確認して、次のいずれかで教えてください:
  ✅ 「OK、Google Slideに反映して」
  🔄 「○枚目の〜を直して」
  🔄 「○枚目と○枚目のテンプレを入れ替えて」
```

ユーザーの指示を待つ：
- **OK** → Step 6 へ
- **修正指示** → 指定された修正を slide-data.json に反映 → Step 4 からやり直し（画像再生成→プレビュー再生成）
- **やり直し**（構成ごと変えたい）→ Step 3 からやり直し

### 失敗時の対処
- プレビューが開かない → `open "$PRESEN_DIR/preview.html"` を手動実行
- 画像が404になる → 相対パス `output/slide_NNN.png` が存在するか確認

---

## Step 6. GAS経由でGoogle Slideに反映

```bash
node tools/post-to-gas.mjs "$PRESEN_DIR"
```

このスクリプトが：
1. `.env` から `GAS_WEBHOOK_URL` と `GOOGLE_SLIDE_ID` を読む
2. `output/slide_*.png` を Base64 化して配列で POST
3. GAS が指定 Google Slide の既存スライドを全削除 → 画像を1枚ずつ貼り付け
4. 完成URLを返す

### 失敗時の対処
- `❌ .env に GAS_WEBHOOK_URL と GOOGLE_SLIDE_ID を設定してください` → Step 1-B へ戻る
- `❌ ネットワークエラー` → GAS WebApp URL が正しいか確認、アクセス権限「自分のみ」になっているか確認
- GAS エラー → ユーザーに `.env` の `GAS_WEBHOOK_URL` を再デプロイ URL に更新してもらう

---

## 完了報告

以下フォーマットでユーザーに報告：

```
✅ スライドを生成しました！

【プレゼン】{プレゼンフォルダ名}
【枚数】{N}枚
【テンプレート内訳】
  - title × 1
  - agenda × 1
  - three-cards × 2
  - stats × 1
  - closing × 1
  ...
【出力先】https://docs.google.com/presentation/d/{id}/edit

編集したい場合は `script/` 内の台本ファイルを修正して再実行してください。
```

---

## 全体のコツ

### 台本に書かれていないことは勝手に足さない

AI が「この方が盛り上がる」と判断してキャッチコピーや数字を捏造するのは禁止。
台本にない表現を追加する必要がある場合は、**ユーザーに質問してから**足す。

### スライド1枚 = メッセージ1つ

1枚に情報を詰め込みすぎない。迷ったら分割する。

### 長い文は短く切る

台本にある1文が30文字を超えていたら、スライドでは区切る。句読点・助詞で自然に分割。

### 編集不可の制約を意識

Google Slide上では画像として表示されるため、後からテキスト修正できない。
**初回で完成度を上げる意識**で構成を組む。

---

## 参考ファイル

- `references/templates.md` — 17種テンプレートの詳細プロパティ仕様（テンプレ選択時に必ず参照）
- `references/style-rules.md` — テキスト記述ルール・改行・ハイライト書式

## 関連スクリプト

- `tools/screenshot-slides.mjs` — Puppeteer画像化（直接呼ぶだけ）
- `tools/post-to-gas.mjs` — GAS送信（直接呼ぶだけ）
- `tools/_chk.mjs` — ライセンス毎回チェック
