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

if [ -d "presentations/$PRESEN_NAME" ]; then
  echo "presentations/$PRESEN_NAME は既に存在します。別の名前を指定してください。"
  exit 1
fi

mkdir -p presentations
cp -r .template-slides "presentations/$PRESEN_NAME"

echo ""
echo "=== 完成！ ==="
echo ""
echo "次のステップ:"
echo "  cd presentations/$PRESEN_NAME"
echo "  claude --dangerously-skip-permissions"
echo "  /slides-create"
echo ""
echo "台本は presentations/$PRESEN_NAME/台本.md に書き込んでください。"
echo ""
