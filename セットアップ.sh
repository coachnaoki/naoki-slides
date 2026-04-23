#!/bin/bash

# naoki-slides セットアップスクリプト
# 対話的に .env（GAS WebhookURL と Google Slide ID）を生成する

cd "$(dirname "$0")"

echo ""
echo "=================================="
echo "  naoki-slides セットアップ"
echo "=================================="
echo ""

# --- 既存 .env の確認 ---
if [ -f .env ]; then
  echo "⚠  .env が既に存在します。現在の中身:"
  echo ""
  cat .env | sed 's|=.*|=***|'
  echo ""
  read -p "上書きしますか？ [y/N]: " yn
  if [ "$yn" != "y" ] && [ "$yn" != "Y" ]; then
    echo "中止しました。"
    exit 0
  fi
fi

# ==========================================
# Step 1: Google Slide の準備
# ==========================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 1: Google Slide の準備"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  以下のリンクをブラウザで開き、「コピーを作成」を押してください："
echo ""
echo "  👉 https://docs.google.com/presentation/d/1aW6bd7VtedxV7KpfWQrbd4d0CH8m1BsbXje1bpOKoQA/copy"
echo ""
echo "  コピー後、開いたSlideのURL をコピーしてここに貼り付けてください。"
echo "  例: https://docs.google.com/presentation/d/1ABCxyz.../edit"
echo ""
read -p "  Slide URL: " slide_url

# URL から Slide ID を抽出
slide_id=$(echo "$slide_url" | sed -n 's|.*/presentation/d/\([^/?]*\).*|\1|p')
if [ -z "$slide_id" ] || [ ${#slide_id} -lt 20 ]; then
  echo ""
  echo "❌ Slide ID が抽出できませんでした。URL を確認してもう一度実行してください。"
  echo "   正しい例: https://docs.google.com/presentation/d/1ABCxyz.../edit"
  exit 1
fi

echo ""
echo "  ✅ Slide ID: $slide_id"

# ==========================================
# Step 2: GAS の準備（Slideに紐づくスクリプトを開いてデプロイ）
# ==========================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 2: Google Apps Script のデプロイ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Step 1でコピーしたSlideには、書き込み用のGASスクリプトが"
echo "  最初から埋め込まれています。以下の手順でデプロイしてください:"
echo ""
echo "    1. Step 1 でコピーしたSlideを開いたまま、"
echo "       上部メニュー「拡張機能」→「Apps Script」をクリック"
echo "       → 新しいタブでスクリプトエディタが開きます"
echo ""
echo "    2. 画面右上の「デプロイ」ボタン → 「新しいデプロイ」"
echo "    3. 歯車アイコン → 「ウェブアプリ」を選択"
echo "    4. 次のユーザーとして実行: 「自分」"
echo "    5. アクセスできるユーザー: 「全員」"
echo "       ⚠ 必ず「全員」にする。「自分のみ」だと CLI から叩けません"
echo "       （URLは推測困難なのでセキュリティ上は問題ありません）"
echo "    6. 「デプロイ」ボタンを押す"
echo "    7. 初回は承認ダイアログが出る:"
echo "       「詳細」→「{プロジェクト名}（安全ではないページ）に移動」→ 許可"
echo "    8. 表示された「ウェブアプリ URL」をコピー"
echo ""
read -p "  GAS Web App URL: " gas_url

if [[ "$gas_url" != https://script.google.com/macros/* ]]; then
  echo ""
  echo "❌ GAS Web App URL の形式が正しくありません。"
  echo "   正しい例: https://script.google.com/macros/s/AKfycbz.../exec"
  exit 1
fi

echo ""
echo "  ✅ GAS URL: ${gas_url:0:60}..."

# ==========================================
# .env を作成
# ==========================================
cat > .env << EOF
# naoki-slides 設定（セットアップ.sh で自動生成）
GAS_WEBHOOK_URL=$gas_url
GOOGLE_SLIDE_ID=$slide_id
EOF

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ セットアップ完了！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  次のステップ:"
echo ""
echo "  1. 新規プレゼンを作成:"
echo "     ./新規スライド.sh"
echo ""
echo "  2. Claude Code でスキル起動:"
echo "     cd projects/<プレゼン名>"
echo "     claude --dangerously-skip-permissions"
echo "     /slides-create"
echo ""
echo "  ※ ライセンス認証は /slides-create 実行時に自動で処理されます"
echo ""
