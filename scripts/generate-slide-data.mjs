#!/usr/bin/env node
/**
 * 台本.md を JSON 化するヘルパースクリプト。
 *
 * 【重要】
 * このスクリプトは「叩き台」として最低限の構造変換だけを行う。
 * 本来の解析・テンプレート選定は Claude Code（/slides-create スキル）が行う。
 *
 * 使い方:
 *   node scripts/generate-slide-data.mjs <presentation-dir>
 *
 * 動作:
 *   - <presentation-dir>/slide-data.json が既に存在する → 何もせず終了（Claudeが作ったものを尊重）
 *   - 存在しない → 台本.md を最小限パースした雛形を出力（エラー回避用）
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, join } from "path";

const presentationDir = process.argv[2];
if (!presentationDir) {
  console.error("Usage: node scripts/generate-slide-data.mjs <presentation-dir>");
  process.exit(1);
}

const absDir = resolve(presentationDir);
const dataPath = join(absDir, "slide-data.json");
const scriptPath = join(absDir, "台本.md");

if (existsSync(dataPath)) {
  console.log(`✓ slide-data.json は既に存在します: ${dataPath}`);
  console.log("  Claude Code が生成したJSONをそのまま使用します。");
  process.exit(0);
}

if (!existsSync(scriptPath)) {
  console.error(`❌ 台本.md が見つかりません: ${scriptPath}`);
  process.exit(1);
}

// 最小限のフォールバック：台本の # 見出しから title スライド 1枚だけ作る
const script = readFileSync(scriptPath, "utf-8");
const firstHeading = script.split("\n").find(l => l.startsWith("# "));
const title = firstHeading ? firstHeading.replace(/^#\s+/, "").trim() : "タイトル";

const fallback = [
  {
    type: "title",
    icon: "fa-star",
    title: title,
    subtitle: "（Claude Code の /slides-create で本格生成してください）"
  }
];

writeFileSync(dataPath, JSON.stringify(fallback, null, 2));
console.log(`⚠ フォールバック用の slide-data.json を生成しました: ${dataPath}`);
console.log("   ちゃんとしたスライドを作るには Claude Code で /slides-create を実行してください。");
