# 17種テンプレート プロパティ仕様

全スライドは `{ "type": "...", ...fields }` の形式。必須フィールドを欠くと表示が崩れる。
正確な実装は `templates/slides.html` の `render{Type}` 関数。不明な場合はそちらを直接読むこと。

## 目次

| # | type | 主用途 |
|---|---|---|
| 1 | [title](#1-title) | 表紙・タイトル |
| 2 | [agenda](#2-agenda) | 目次・今日話すこと |
| 3 | [section](#3-section) | 章扉（PART N） |
| 4 | [three-cards](#4-three-cards) | 3つのポイント |
| 5 | [three-tactics](#5-three-tactics) | 3つの役割・戦術 |
| 6 | [two-columns](#6-two-columns) | 2カラム対比 |
| 7 | [steps](#7-steps) | 縦ステップ |
| 8 | [big-message](#8-big-message) | 大メッセージ＋パネル |
| 9 | [closing](#9-closing) | 締め・サマリー |
| 10 | [quote](#10-quote) | 引用 |
| 11 | [before-after](#11-before-after) | ビフォーアフター |
| 12 | [stats](#12-stats) | 数字・統計 |
| 13 | [checklist](#13-checklist) | チェックリスト |
| 14 | [timeline](#14-timeline) | 時系列 |
| 15 | [ranking](#15-ranking) | ランキング |
| 16 | [versus](#16-versus) | VS対決 |
| 17 | [highlight-box](#17-highlight-box) | 結論強調 |

---

## 1. title

表紙。プレゼンの冒頭1枚目に必ず使う。

```json
{
  "type": "title",
  "icon": "fa-trophy",
  "title": "ダブルスで勝つための",
  "titleHighlight": "前衛の教科書",
  "titleSuffix": "",
  "subtitle": "知識と戦術で相手を圧倒する方法"
}
```

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| icon | string | ○ | FontAwesomeクラス（`fa-trophy` / `fa-rocket` 等） |
| title | string | ○ | 1行目。`\n` で改行可 |
| titleHighlight | string | △ | 2行目の黄色ハイライト部分 |
| titleSuffix | string | ✗ | 2行目ハイライト後の補助テキスト |
| subtitle | string | △ | サブタイトル（白枠に緑ボーダー） |

---

## 2. agenda

目次・今日話すこと。3〜5項目。

```json
{
  "type": "agenda",
  "label": "AGENDA",
  "title": "今日話す3つのこと",
  "titleUnderline": "3つ",
  "catchphrase": "10分で全部わかる",
  "items": [
    { "title": "前衛の役割",      "sub": "攻撃と守備の基本",     "icon": "fa-bullseye" },
    { "title": "ポジショニング",  "sub": "抜かれない立ち位置",   "icon": "fa-map-marker-alt" },
    { "title": "配球の選択",      "sub": "確実にポイントを取る", "icon": "fa-crosshairs" }
  ]
}
```

| フィールド | 説明 |
|---|---|
| label | 上部ラベル（デフォルト `AGENDA`） |
| titleUnderline | タイトル内で下線を引く部分 |
| items[].title | 項目タイトル（必須） |
| items[].sub | 補足説明（省略可） |
| items[].icon | 右端のアイコン（省略可、FontAwesome） |

**⚠ 注意:** `items[].number` は**使わない**。番号は自動で `01, 02, 03...` が振られる。<br>
**⚠ 注意:** 補足は `desc` ではなく **`sub`**。

---

## 3. section

章扉。PART番号＋章タイトル＋説明。

```json
{
  "type": "section",
  "number": 1,
  "label": "PART 01",
  "title": "前衛の役割",
  "titleUnderline": "役割",
  "description": "攻めと守りの切り替えがすべての起点"
}
```

- `label` を省略すると `PART {number}` が自動生成される。

---

## 4. three-cards

3つのポイントを並列で紹介する基本形。

```json
{
  "type": "three-cards",
  "title": "勝つための3要素",
  "titleHighlight": "3要素",
  "cards": [
    { "icon": "fa-bullseye", "title": "ポジショニング", "lines": ["抜かれない", "立ち位置の基本"] },
    { "icon": "fa-clock",    "title": "タイミング",     "lines": ["バレずに入る動き"] },
    { "icon": "fa-crosshairs","title": "プレイスメント","lines": ["確実にポイント化"] }
  ]
}
```

- `cards[].lines` は文字列配列（各要素が `<p>` として表示される）。

---

## 5. three-tactics

3つの役割カード。3枚目だけダーク反転して強調できる。

```json
{
  "type": "three-tactics",
  "title": "ダブルス戦術の型",
  "titleHighlight": "型",
  "catchphrase": "覚えるだけで勝率UP",
  "cards": [
    { "role": "守る",   "icon": "fa-shield-alt", "main": "ディフェンス",   "sub": "ミスを減らす",   "dark": false },
    { "role": "崩す",   "icon": "fa-bolt",       "main": "アタック",       "sub": "展開を作る",     "dark": false },
    { "role": "決める", "icon": "fa-trophy",     "main": "フィニッシュ",   "sub": "確実に取り切る", "dark": true  }
  ]
}
```

---

## 6. two-columns

左右2カラムの対比。バッジ色で色分けできる。

```json
{
  "type": "two-columns",
  "title": "独学 vs コーチング",
  "titleHighlight": "vs",
  "catchphrase": "3年で差がつく",
  "columns": [
    { "badge": "独学",   "badgeColor": "dark",  "borderColor": "dark",  "title": "自己流",    "items": ["時間がかかる","主観に頼る"] },
    { "badge": "指導下", "badgeColor": "green", "borderColor": "green", "title": "最短距離", "items": ["論理で理解","フィードバック"] }
  ]
}
```

`badgeColor` / `borderColor` は `"green"` / `"dark"` / `"white"`（白はデフォルト）。

---

## 7. steps

縦に並ぶステップ。3つ以上でコンパクト表示に切り替わる。

**⚠ 最大4項目まで**。5つ以上は縦にはみ出る（下のステップが切れる）。5項目以上になる場合は 2 枚に分割するか、似た手順をまとめて 4 項目以内に収める。

```json
{
  "type": "steps",
  "label": "STEP BY STEP",
  "title": "試合までの3ステップ",
  "titleUnderline": "3ステップ",
  "catchphrase": "順番が大事",
  "steps": [
    { "num": 1, "style": "green",     "icon": "fa-clipboard-check", "label": "準備",     "content": "ルーティンを<br>決める" },
    { "num": 2, "style": "gray",      "icon": "fa-eye",              "label": "実行",     "content": "判断を手放さない" },
    { "num": 3, "style": "highlight", "icon": "fa-pen",              "label": "振り返り", "content": "1本1本を言語化<br>する" }
  ]
}
```

| フィールド | 説明 |
|---|---|
| steps[].num | ステップ番号（背景に大きく表示） |
| steps[].style | `"green"`（通常）/ `"gray"`（補足）/ `"highlight"`（最重要） |
| steps[].icon | 左の円内アイコン（必須・FontAwesome） |
| steps[].label | ステップ名（小さく上に表示） |
| steps[].content | 内容（`<br>` で改行可） |

**⚠ 注意:** `icon` を省略すると左の円が空になる。

**✅ 推奨: 1行＋インライン font-size で大きく見せる**

steps が3つ以上だと `content` は自動で `text-4xl`（2.25rem）に縮小される。**`<br>` で2行にするより、短く書き換えて1行に収め、インライン span で font-size を上げた方が視認性が高い**（2行にすると縦が詰まって下のステップが切れやすい）。

```json
// ❌ 避ける: <br> で2行にする
{ "num": 1, "icon": "fa-bolt", "label": "準備",
  "content": "ルーティンを<br>決める" }

// ✅ 推奨: 1行に書き換え + font-size で強調
{ "num": 1, "style": "highlight", "icon": "fa-bolt", "label": "準備",
  "content": "<span style='font-size:3rem'>ルーティンを決める</span>" }
```

目安：`3rem`（控えめ）〜 `4rem`（強調）。**全ステップで同じサイズを適用する**こと（バラバラにするとバランスが崩れる）。長い文は助詞を削る等で短く書き換える（勝手な言い換えは禁止・ユーザー確認を取る）。

---

## 8. big-message

画面いっぱいの大メッセージ＋ダークなデータパネル（任意）。

```json
{
  "type": "big-message",
  "label": "KEY INSIGHT",
  "title": "根本原因は1つ",
  "titleUnderline": "1つ",
  "icon": "fa-lightbulb",
  "message": "練習量ではなく\n判断の質が伸びを決める",
  "panel": {
    "itemCols": 2,
    "items": [
      { "icon": "fa-arrow-trend-down", "label": "練習量重視", "sub": "3年で頭打ち" },
      { "icon": "fa-arrow-trend-up",   "label": "判断重視",   "sub": "3年で県代表" }
    ],
    "conclusion": { "icon": "fa-flag-checkered", "prefix": "だから", "main": "質を上げよう" }
  }
}
```

- `panel` は省略可。数値比較・結論を見せたい時だけ使う。
- `panel.items[].icon` は**必須**（省略すると円が空になる）。`panel.items[].sub` が補足テキスト（`value` という名前は使わない）。
- `panel.itemCols` は `2` か `3`（省略時は `3`）。**`itemCols: 2` にすると label が大きく（text-2xl）表示され、横にアイコン＋sub も並ぶ**。項目が少なく目立たせたい時は 2 を選ぶ。
- `itemCols: 3`（デフォルト）では `sub` は表示されず、アイコン上・ラベル（text-xl）下のコンパクト表示になる。

---

## 9. closing

締めのサマリー。プレゼンの最終枚。

```json
{
  "type": "closing",
  "icon": "fa-flag-checkered",
  "title": "今日のまとめ",
  "cards": [
    { "title": "ポジショニング", "desc": "抜かれない立ち位置の基本" },
    { "title": "タイミング",     "desc": "バレずに入る動き方" },
    { "title": "プレイスメント", "desc": "ポイントを取り切る配球" }
  ]
}
```

---

## 10. quote

引用・名言。出典アイコン付き。

```json
{
  "type": "quote",
  "quote": "継続は力なり",
  "sourceIcon": "fa-user",
  "source": "著名なコーチ"
}
```

---

## 11. before-after

変化・成長を見せる。右側（after）がダーク反転。

```json
{
  "type": "before-after",
  "title": "独学時代と今",
  "titleHighlight": "今",
  "before": { "label": "BEFORE", "icon": "fa-frown", "main": "B級1回戦負け", "sub": "15年停滞" },
  "after":  { "label": "AFTER",  "icon": "fa-smile", "main": "A級3連覇",     "sub": "1年で逆転" }
}
```

---

## 12. stats

大きな数字で統計を見せる。1〜3個推奨。

```json
{
  "type": "stats",
  "title": "数字で見る成果",
  "titleHighlight": "成果",
  "stats": [
    { "icon": "fa-chart-line", "number": "90",  "unit": "%",  "desc": "勝率UP" },
    { "icon": "fa-shield-alt", "number": "2.5", "unit": "倍", "desc": "守備範囲" },
    { "icon": "fa-trophy",     "number": "1",   "unit": "年", "desc": "A級到達" }
  ]
}
```

| フィールド | 説明 |
|---|---|
| stats[].icon | 円内のアイコン（必須・FontAwesome） |
| stats[].number | 数字（必須） |
| stats[].unit | 単位（%/倍/年 等） |
| stats[].desc | 下のラベル（必須） |

**⚠ 注意:** ラベルは `label` ではなく **`desc`**。アイコンが無いと円が空になる。

---

## 13. checklist

チェックリスト。`check: true` / `false` で ✅/❌。

```json
{
  "type": "checklist",
  "title": "前衛チェックリスト",
  "titleHighlight": "チェック",
  "items": [
    { "check": true,  "text": "ポジションを下げすぎない" },
    { "check": true,  "text": "相手の視線を見る" },
    { "check": false, "text": "何となくボレーする" }
  ]
}
```

---

## 14. timeline

時系列の流れ。最後の項目だけ緑で強調される。

```json
{
  "type": "timeline",
  "title": "1年の歩み",
  "titleHighlight": "1年",
  "events": [
    { "icon": "fa-seedling", "title": "入会",       "desc": "フォーム改造スタート" },
    { "icon": "fa-chart-line","title": "3ヶ月後",   "desc": "B級大会1勝" },
    { "icon": "fa-trophy",   "title": "1年後",     "desc": "A級優勝" }
  ]
}
```

---

## 15. ranking

ランキング。1位〜3位向け。

```json
{
  "type": "ranking",
  "title": "伸びない人ワースト3",
  "titleHighlight": "ワースト3",
  "items": [
    { "rank": 1, "title": "言語化しない",       "desc": "フィードバックが溜まらない" },
    { "rank": 2, "title": "感覚で練習する",     "desc": "再現性が低い" },
    { "rank": 3, "title": "動画を撮らない",     "desc": "主観と現実のズレに気付かない" }
  ]
}
```

---

## 16. versus

対決スライド。中央にVSバッジ。

```json
{
  "type": "versus",
  "title": "前衛 VS 後衛",
  "titleHighlight": "VS",
  "left":  { "label": "前衛", "icon": "fa-shield-alt", "main": "攻撃起点", "sub": "仕掛ける役" },
  "right": { "label": "後衛", "icon": "fa-running",    "main": "守備基盤", "sub": "支える役"   }
}
```

---

## 17. highlight-box

最重要メッセージ。ダーク背景のボックスで結論を強調。

```json
{
  "type": "highlight-box",
  "label": "CORE MESSAGE",
  "title": "結論",
  "titleUnderline": "結論",
  "message": "練習量ではなく\n判断の質を上げる",
  "sub": "それだけで人生変わる"
}
```

---

## 迷ったら

- 実装の正解は `templates/slides.html` の `render{Type}` 関数。
- プロパティ名のtypo → 画像化時に「undefined」と出るか、フィールドが白紙になる。
- 配列フィールド（cards / steps / items / events / stats）は**少なくとも2要素**入れる方が見た目が安定する。
