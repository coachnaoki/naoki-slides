#!/usr/bin/env node
/**
 * 生成したスライド画像をGAS Webhookへ送信し、指定Google Slideに貼り付ける。
 *
 * 使い方:
 *   node scripts/post-to-gas.mjs <presentation-dir>
 *
 * 前提:
 *   - <presentation-dir>/output/slide_001.png ... が存在すること
 *   - naoki-slides/.env に GAS_WEBHOOK_URL と GOOGLE_SLIDE_ID が設定されていること
 *
 * GASは画像のBase64配列を受け取り、指定Slideを全削除→画像を1枚ずつ貼り付ける。
 */
import { readFileSync, readdirSync, existsSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// .env を naoki-slidesルートから読む
dotenv.config({ path: join(ROOT, ".env") });

const presentationDir = process.argv[2];
if (!presentationDir) {
  console.error("Usage: node scripts/post-to-gas.mjs <presentation-dir>");
  process.exit(1);
}

const { GAS_WEBHOOK_URL, GOOGLE_SLIDE_ID } = process.env;
if (!GAS_WEBHOOK_URL || !GOOGLE_SLIDE_ID) {
  console.error("❌ .env に GAS_WEBHOOK_URL と GOOGLE_SLIDE_ID を設定してください。");
  console.error("   README.md の「初回セットアップ」参照。");
  process.exit(1);
}

const absDir = resolve(presentationDir);
const outputDir = join(absDir, "output");
if (!existsSync(outputDir)) {
  console.error(`❌ output/ フォルダが見つかりません: ${outputDir}`);
  console.error("   先に screenshot-slides.mjs を実行してください。");
  process.exit(1);
}

const imageFiles = readdirSync(outputDir)
  .filter(f => /^slide_\d+\.png$/.test(f))
  .sort();

if (imageFiles.length === 0) {
  console.error(`❌ slide_*.png が見つかりません: ${outputDir}`);
  process.exit(1);
}

console.log(`📦 画像数: ${imageFiles.length}枚`);
console.log(`🚀 GAS Webhookへ送信中... (${GAS_WEBHOOK_URL.slice(0, 50)}...)`);

const images = imageFiles.map(f => {
  const buf = readFileSync(join(outputDir, f));
  return { name: f, data: buf.toString("base64") };
});

const payload = {
  action: "sync",
  slideId: GOOGLE_SLIDE_ID,
  images,
};

try {
  const res = await fetch(GAS_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }

  if (!res.ok || json.error) {
    console.error(`❌ GAS エラー: ${json.error || text}`);
    process.exit(1);
  }

  const url = `https://docs.google.com/presentation/d/${GOOGLE_SLIDE_ID}/edit`;
  console.log(`\n✅ 完了！Google Slide に ${imageFiles.length}枚を反映しました`);
  console.log(`   ${url}`);
} catch (e) {
  console.error(`❌ ネットワークエラー: ${e.message}`);
  process.exit(1);
}
