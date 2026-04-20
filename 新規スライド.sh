#!/bin/bash

# 新しいプレゼンを作成するスクリプト

cd "$(dirname "$0")"

echo ""
echo "=== 新しいプレゼンを作成 ==="
echo ""

# プレゼン名
if [ -n "$1" ]; then
  PRESEN_NAME="$1"
else
  read -p "プレゼン名を入力してください（例: tennis-camp-2026）: " PRESEN_NAME
fi

if [ -z "$PRESEN_NAME" ]; then
  echo "プレゼン名が入力されませんでした。"
  exit 1
fi

if [ -d "projects/$PRESEN_NAME" ]; then
  echo "projects/$PRESEN_NAME は既に存在します。別の名前を指定してください。"
  exit 1
fi

mkdir -p projects
cp -r .template-project "projects/$PRESEN_NAME"

SCRIPT_FILE="projects/$PRESEN_NAME/script/台本.md"

echo ""
echo "=== 完成！ ==="
echo ""
echo "次のステップ:"
echo ""
echo "  1. Cursor のエディタで台本ファイルを開いて内容を貼り付ける"
echo "     $SCRIPT_FILE"
echo ""
echo "  2. Claude Code でスキル起動:"
echo "     cd projects/$PRESEN_NAME"
echo "     claude --dangerously-skip-permissions"
echo "     /slides-create"
echo ""
