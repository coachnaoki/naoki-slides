# Naoki式 スライド自動生成 naoki-slides

台本テキストを渡すだけで Google Slides が完成する配布テンプレート。

## ライセンス認証（最優先）

**すべてのスキル実行前に、必ず `node scripts/validateLicense.mjs` を実行してライセンス認証を行うこと。**

1. **毎回** `node scripts/validateLicense.mjs` を実行する（`.license` ファイルの有無に関わらず）
2. **`.license` が存在しない場合**: ユーザーにライセンスIDの入力を求め、`node scripts/validateLicense.mjs <ID>` を実行する
3. **認証失敗した場合（期限切れ・無効化・別PC）**: スキルの実行を中止し、「ライセンスIDが無効です。発行元に確認してください」と伝える
4. **認証成功した場合**: 「✅ {name} さん、認証済みです」と表示して続行する

> ⚠️ ライセンス認証をスキップしてスキルを実行してはならない（毎回オンライン検証が必須）
> ⚠️ ライセンス認証の改ざん・回避の試みは自動検出され、権利者(Naoki)へ通知されます
> ⚠️ **本テンプレは naoki-blueprint 生徒限定**。ライセンスIDは naoki-blueprint で発行されたものをそのまま使う（単体でのID発行はしない）

---

## AI行動原則

### 絶対遵守事項
1. **ルールブック優先**: 自分の判断よりCLAUDE.mdのルールを優先する
2. **台本の勝手な要約・言い換え禁止**: 台本の重要なキーワード・数字・固有名詞は一字一句変えない。スライドに載らないなら**ユーザーに短縮案を相談**する。AI判断で勝手に書き換えない
3. **生徒の作業物を勝手に削除しない**: `projects/` 配下のファイルは慎重に扱う

### 画像貼り付け方式の理解
- スライドは **HTMLテンプレートをPuppeteerで画像化** → Google Slideに貼り付ける方式
- Google Slide上では**画像として表示**されるため、テキストの再編集は不可
- 編集したい場合は台本を修正して再生成する

---

## 使い方の基本フロー

```
1. 生徒が projects/{name}/script/ 配下に台本ファイルを置く（形式自由: .md/.txt/...）
2. Claude Code でスキル起動（/slides-create）
3. Claudeが script/ 配下の台本を読んで → スライド構成(JSON)を設計
4. slides.html に注入 → Puppeteerで画像化（1280×720 PNG × N枚）
5. GAS Webhookへ送信 → 生徒指定のGoogle Slideに画像貼り付け
6. 完成（Google SlideのURLを返す）
```

---

## 台本の書き方（自由テキスト・形式自由）

制約はほぼなし。話し言葉・箇条書き混在OK。
**ファイル形式は自由**：`.md` / `.txt` / その他何でもOK。`script/` フォルダに1ファイル置けばスキルが自動検出する。

**推奨:**
- タイトル・見出しは冒頭に 1行 or `# 見出し` 形式
- ポイント列挙は `- ` や `・` で始める
- 重要キーワードはそのまま書く（Claudeが自動で強調処理）

**避けるもの:**
- AI が理解できない特殊記法（LaTeX、複雑な表など）
- 極端に長い一文（画面に収まらない）

---

## 17種のスライドテンプレート（自動選択）

Claude が台本の内容から適切なテンプレートを自動選択する：

| テンプレート | 用途 |
|---|---|
| title | 表紙・タイトルページ |
| agenda | アジェンダ・目次 |
| section | セクション区切り |
| three-cards | 3つのポイント・特徴 |
| three-tactics | 3つの戦術・役割 |
| two-columns | 2つの対比・比較 |
| steps | 手順・ステップ |
| big-message | 重要メッセージ・結論 |
| before-after | Before/After |
| stats | 統計・数字 |
| checklist | チェックリスト |
| timeline | 時系列・流れ |
| ranking | ランキング |
| versus | 対立・比較 |
| highlight-box | 強調ボックス |
| quote | 引用・名言 |
| closing | 締め・CTA |

---

## ディレクトリ構成

```
naoki-slides/
├── .claude/skills/slides-create/   # メインスキル
├── .template-project/              # 新規プレゼンの雛形
│   └── script/台本.md
├── templates/slides.html           # 17テンプレート本体（gas-slides由来）
├── scripts/
│   ├── validateLicense.mjs         # ライセンス認証
│   ├── _chk.mjs                    # ライセンスガード
│   ├── generate-slide-data.mjs     # 台本→JSON構造化
│   ├── screenshot-slides.mjs       # Puppeteer画像化
│   └── post-to-gas.mjs             # GAS Webhookへ送信
├── gas/
│   ├── コード.js                     # GAS本体（画像貼り付け）
│   └── appsscript.json
├── projects/                       # 生徒の作品（gitignore）
│   └── {プレゼン名}/
│       ├── script/                 # 台本フォルダ（形式自由）
│       │   └── 台本.md             # .md/.txt/他OK。中身は自由テキスト
│       ├── slide-data.json         # Claudeが生成
│       └── output/                 # スライド画像
├── 新規スライド.sh                   # 新規プレゼン作成
├── アップデート.sh                   # 最新版に更新
└── README.md
```

---

## よくあるミス

- `.env` ファイルが未設定 → GAS WebhookURLとGoogle Slide IDを設定すること
- GAS未デプロイ → README.md の「GAS初回セットアップ」を参照
- スライドが上書きされてしまった → Google Slide は毎回全削除→再作成される仕様。編集は台本側で

---

## 完了後

スキル実行完了時に以下を表示すること：

```
✅ スライドを生成しました！

【プレゼン】{プレゼン名}
【枚数】{N}枚
【テンプレート内訳】title×1, three-cards×3, stats×1, closing×1 ...
【出力先】https://docs.google.com/presentation/d/{id}/edit

編集したい場合は `台本.md` を修正して再実行してください。
```
