#!/usr/bin/env node
/**
 * 生成済み slide_*.png を 1列縦並びの preview.html にまとめ、ブラウザで自動オープン。
 *
 * 使い方:
 *   node scripts/generate-preview.mjs <presentation-dir>
 *
 * 出力: <presentation-dir>/preview.html
 */
import { writeFileSync, existsSync, readdirSync } from "fs";
import { resolve, join, basename } from "path";
import { execSync } from "child_process";
import { platform } from "os";

const presentationDir = process.argv[2];
if (!presentationDir) {
  console.error("Usage: node scripts/generate-preview.mjs <presentation-dir>");
  process.exit(1);
}

const absDir = resolve(presentationDir);
const outputDir = join(absDir, "output");
const presenName = basename(absDir);

if (!existsSync(outputDir)) {
  console.error(`❌ output/ が見つかりません: ${outputDir}`);
  console.error("   先に screenshot-slides.mjs で画像生成してください。");
  process.exit(1);
}

const images = readdirSync(outputDir)
  .filter(f => /^slide_\d+\.png$/.test(f))
  .sort();

if (images.length === 0) {
  console.error(`❌ slide_*.png が見つかりません: ${outputDir}`);
  process.exit(1);
}

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>${presenName} — プレビュー</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #1a1a1a; color: #fff;
    font-family: -apple-system, "Hiragino Sans", "Yu Gothic Medium", sans-serif;
    padding: 32px 16px;
  }
  .header {
    max-width: 1280px; margin: 0 auto 40px;
    text-align: center;
  }
  .header h1 {
    font-size: 28px; font-weight: 900; margin-bottom: 8px;
  }
  .header .count {
    color: #ccff00; font-size: 16px; font-weight: 700;
  }
  .header .hint {
    color: #aaa; font-size: 14px; margin-top: 16px; line-height: 1.8;
    padding: 16px; background: #252525; border-radius: 8px;
    max-width: 720px; margin-left: auto; margin-right: auto;
  }
  .grid {
    max-width: 1280px; margin: 0 auto;
    display: flex; flex-direction: column; gap: 20px;
  }
  .slide {
    background: #fff; border-radius: 8px; overflow: hidden;
    box-shadow: 0 8px 24px rgba(0,0,0,.4);
    position: relative;
  }
  .slide .num {
    position: absolute; top: 12px; left: 12px;
    background: rgba(18,18,18,.9); color: #ccff00;
    padding: 6px 14px; border-radius: 4px;
    font-weight: 900; font-size: 14px;
    z-index: 10; font-family: "SF Mono", monospace;
  }
  .slide img { display: block; width: 100%; height: auto; }
  @media (prefers-color-scheme: light) {
    body { background: #f5f5f5; color: #222; }
    .header .hint { background: #fff; color: #555; }
  }
</style>
</head>
<body>
  <div class="header">
    <h1>${presenName}</h1>
    <div class="count">全 ${images.length} 枚</div>
    <p class="hint">
      全スライドを確認して、問題なければ<br>
      Claude Code に「<strong>OK、Google Slideに反映して</strong>」と伝えてください。<br>
      修正したい場合は「<strong>○枚目の〜を直して</strong>」と伝えれば再生成します。
    </p>
  </div>
  <div class="grid">
${images.map((f, i) => `    <div class="slide">
      <div class="num">${String(i + 1).padStart(2, "0")} / ${images.length}</div>
      <img src="output/${f}" alt="slide ${i + 1}">
    </div>`).join("\n")}
  </div>
</body>
</html>`;

const outPath = join(absDir, "preview.html");
writeFileSync(outPath, html);
console.log(`✅ プレビュー生成: ${outPath}`);

// ブラウザで自動オープン（クロスプラットフォーム）
try {
  const cmd = platform() === "darwin" ? "open"
            : platform() === "win32"  ? "start ''"
            : "xdg-open";
  execSync(`${cmd} "${outPath}"`);
  console.log(`🌐 ブラウザで開きました`);
} catch (e) {
  console.log(`   手動で開く: open "${outPath}"`);
}
