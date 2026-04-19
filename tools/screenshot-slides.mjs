#!/usr/bin/env node
/**
 * スライドJSONを slides.html に注入して Puppeteer で全スライドを画像化する。
 *
 * 使い方:
 *   node tools/screenshot-slides.mjs <presentation-dir>
 *
 * 入力:  <presentation-dir>/slide-data.json
 * 出力:  <presentation-dir>/output/slide_001.png ...
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";
import { randomBytes } from "crypto";
import puppeteer from "puppeteer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const TEMPLATE_PATH = join(ROOT, "templates", "slides.html");

const presentationDir = process.argv[2];
if (!presentationDir) {
  console.error("Usage: node tools/screenshot-slides.mjs <presentation-dir>");
  process.exit(1);
}

const absDir = resolve(presentationDir);
const dataPath = join(absDir, "slide-data.json");
const outputDir = join(absDir, "output");

if (!existsSync(dataPath)) {
  console.error(`❌ slide-data.json が見つかりません: ${dataPath}`);
  console.error("   先に generate-slide-data.mjs を実行してください。");
  process.exit(1);
}

const slideData = JSON.parse(readFileSync(dataPath, "utf-8"));
if (!Array.isArray(slideData) || slideData.length === 0) {
  console.error("❌ slide-data.json が空か、配列ではありません。");
  process.exit(1);
}

// output ディレクトリ準備（既存の slide_*.png はクリア）
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
for (const f of readdirSync(outputDir)) {
  if (/^slide_\d+\.png$/.test(f)) unlinkSync(join(outputDir, f));
}

// slides.html を読み、JSONを注入して一時ファイルに書き出す
let html = readFileSync(TEMPLATE_PATH, "utf-8");
const jsonText = JSON.stringify(slideData).replace(/<\/script>/g, "<\\/script>");
html = html.replace(
  /<script id="slide-data" type="application\/json">[\s\S]*?<\/script>/,
  `<script id="slide-data" type="application/json">${jsonText}</script>`
);

const tmpFile = join(tmpdir(), `naoki-slides-${randomBytes(6).toString("hex")}.html`);
writeFileSync(tmpFile, html);
const fileUrl = `file://${tmpFile}`;

console.log(`📦 スライド数: ${slideData.length}枚`);
console.log(`🚀 Puppeteer を起動中...`);

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });

  for (let i = 0; i < slideData.length; i++) {
    const slideNum = i + 1;
    await page.goto(`${fileUrl}?slide=${slideNum}`, { waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, 400)); // フォント読み込み安定待ち

    const outPath = join(outputDir, `slide_${String(slideNum).padStart(3, "0")}.png`);
    // slides.html の #stage (1280x720) のみキャプチャ
    const stage = await page.$("#stage");
    if (stage) {
      await stage.screenshot({ path: outPath });
    } else {
      await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 1280, height: 720 } });
    }
    console.log(`  ✓ ${slideNum}/${slideData.length}: slide_${String(slideNum).padStart(3, "0")}.png`);
  }

  console.log(`\n✅ 完了: ${slideData.length}枚の画像を ${outputDir} に出力しました`);
} finally {
  await browser.close();
  try { unlinkSync(tmpFile); } catch {}
}
